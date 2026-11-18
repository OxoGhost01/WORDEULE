import { describe, expect, it } from 'vitest'
import { GuessError, canContinue, expireIfLate, nextRound, runView, startRun, submitGuess } from './run.js'
import { buildLists } from './words.js'

const WORDS = ['CRANE', 'SLATE', 'HOUSE', 'MOUSE', 'ABIDE', 'SPEED', 'BUMPY', 'TRAIN', 'PLANT', 'STONE']
const SMALL = ['CATS', 'DOGS', 'BIRD', 'FISH']
const LONG = ['CATALOG', 'PLANETS']
const lists = {
    5: buildLists(WORDS, WORDS.map((w) => w.toLowerCase()), 5),
    4: buildLists(SMALL, SMALL.map((w) => w.toLowerCase()), 4),
    7: buildLists(LONG, LONG.map((w) => w.toLowerCase()), 7),
}
const getLists = async (length) => lists[length] ?? buildLists(LONG, LONG.map((w) => w.toLowerCase()), 10)

const rngFrom = (values) => {
    let i = 0
    return () => values[i++ % values.length]
}

async function newRun(mode, extra = {}) {
    return startRun({ mode, lang: 'en', getLists, rng: rngFrom([0.05]), seed: 1, date: new Date('2026-01-01T00:00:00Z'), ...extra })
}

const ctx = { getLists, rng: rngFrom([0.05]) }

describe('classic run', () => {
    it('scores a won round by the tries used and lets the run go on', async () => {
        const run = await newRun('classic')
        const answer = run.state.answers[0]
        await submitGuess(run, answer, ctx)
        expect(run.status).toBe('won')
        expect(run.score).toBe(600)
        expect(run.words).toBe(1)
        expect(canContinue(run)).toBe(true)
        await nextRound(run, ctx)
        expect(run.status).toBe('playing')
        expect(run.state.rows).toHaveLength(0)
        expect(run.score).toBe(600)
    })

    it('ends the run after the last try', async () => {
        const run = await newRun('classic')
        const wrong = WORDS.find((w) => w !== run.state.answers[0])
        for (let i = 0; i < 6; i++) await submitGuess(run, wrong, ctx)
        expect(run.status).toBe('lost')
        expect(canContinue(run)).toBe(false)
        await expect(nextRound(run, ctx)).rejects.toMatchObject({ code: 'cannotContinue' })
    })

    it('refuses a word that is not in the list or has the wrong length', async () => {
        const run = await newRun('classic')
        await expect(submitGuess(run, 'ZZZZZ', ctx)).rejects.toMatchObject({ code: 'notInList' })
        await expect(submitGuess(run, 'CAT', ctx)).rejects.toMatchObject({ code: 'wrongLength' })
        expect(run.state.rows).toHaveLength(0)
    })

    it('refuses a guess once the round is over', async () => {
        const run = await newRun('classic')
        await submitGuess(run, run.state.answers[0], ctx)
        await expect(submitGuess(run, 'CRANE', ctx)).rejects.toBeInstanceOf(GuessError)
    })

    it('never shows the answers while the round is played', async () => {
        const run = await newRun('classic')
        expect(runView(run).revealed).toBeNull()
        await submitGuess(run, run.state.answers[0], ctx)
        expect(runView(run).revealed.answers).toEqual(run.state.answers)
    })
})

describe('hardcore run', () => {
    it('plays every guess on four grids and wins when all are found', async () => {
        const run = await newRun('hardcore')
        expect(run.state.grids).toBe(4)
        for (const answer of run.state.answers) await submitGuess(run, answer, ctx)
        expect(run.status).toBe('won')
        expect(run.score).toBe(Math.round((9 - 4 + 1) * 100 * 4))
    })
})

describe('locked run', () => {
    it('refuses a guess that moves a found letter and accepts the word', async () => {
        const run = await newRun('locked', { answer: 'HOUSE' })
        await submitGuess(run, 'MOUSE', ctx)
        await expect(submitGuess(run, 'STONE', ctx)).rejects.toMatchObject({ code: 'lockedLetters' })
        await submitGuess(run, 'HOUSE', ctx)
        expect(run.status).toBe('won')
    })
})

describe('survival run', () => {
    it('makes the word longer after every win', async () => {
        const run = await newRun('survival')
        expect(run.state.wordLength).toBe(4)
        await submitGuess(run, run.state.answers[0], ctx)
        await nextRound(run, ctx)
        expect(run.state.wordLength).toBe(5)
    })
})

describe('blitz run', () => {
    it('adds time after a win and goes on after a loss', async () => {
        const start = 1_000_000
        const run = await newRun('blitz', { now: start })
        expect(run.deadline).toBe(start + 90_000)
        await submitGuess(run, run.state.answers[0], { ...ctx, now: start + 1000 })
        expect(run.deadline).toBe(start + 105_000)
        await nextRound(run, { ...ctx, now: start + 2000 })
        const wrong = WORDS.find((w) => w !== run.state.answers[0])
        for (let i = 0; i < 6; i++) await submitGuess(run, wrong, { ...ctx, now: start + 3000 })
        expect(run.status).toBe('lost')
        expect(canContinue(run)).toBe(true)
    })

    it('stops the run when the clock is out', async () => {
        const start = 1_000_000
        const run = await newRun('blitz', { now: start })
        await expect(submitGuess(run, 'CRANE', { ...ctx, now: start + 92_000 })).rejects.toMatchObject({ code: 'timeUp' })
        expect(run.status).toBe('over')
    })

    it('allows a short grace after the deadline', async () => {
        const start = 1_000_000
        const run = await newRun('blitz', { now: start })
        expect(expireIfLate(run, start + 90_500)).toBe(false)
    })
})

describe('reverse run', () => {
    it('shows the target word with a pattern, and wins with another word that gives it', async () => {
        const run = await newRun('reverse')
        expect(runView(run).target).toBe(run.state.answers[0])
        const { pattern, answers } = run.state
        expect(pattern.filter((s) => s !== 'absent').length).toBeGreaterThanOrEqual(2)
        expect(pattern.every((s) => s === 'correct')).toBe(false)
        const solution = WORDS.find((w) => w !== answers[0] && lists[5].valid.has(w) && JSON.stringify(pattern) === JSON.stringify(runPattern(w, answers[0])))
        expect(solution).toBeDefined()
        await submitGuess(run, solution, ctx)
        expect(run.status).toBe('won')
        expect(run.score).toBe(100)
    })

    it('loses on the first wrong word', async () => {
        const run = await newRun('reverse')
        const wrong = WORDS.find((w) => JSON.stringify(runPattern(w, run.state.answers[0])) !== JSON.stringify(run.state.pattern))
        await submitGuess(run, wrong, ctx)
        expect(run.status).toBe('lost')
        expect(run.state.rows).toHaveLength(1)
    })
})

describe('blitz clock', () => {
    it('starts after the word lists are loaded', async () => {
        let loaded = false
        const slow = async (length) => {
            await new Promise((resolve) => setTimeout(resolve, 20))
            loaded = true
            return getLists(length)
        }
        const before = Date.now()
        const run = await startRun({ mode: 'blitz', lang: 'en', getLists: slow, rng: rngFrom([0.05]) })
        expect(loaded).toBe(true)
        expect(run.deadline).toBeGreaterThanOrEqual(before + 20 + 90_000)
    })
})

describe('daily run', () => {
    it('picks the same word for the same seed and day and does not continue', async () => {
        const a = await newRun('daily')
        const b = await newRun('daily')
        expect(a.state.answers).toEqual(b.state.answers)
        await submitGuess(a, a.state.answers[0], ctx)
        expect(canContinue(a)).toBe(false)
    })
})

function runPattern(guess, target) {
    const result = Array(guess.length).fill('absent')
    const rest = {}
    for (let i = 0; i < target.length; i++) {
        if (guess[i] === target[i]) result[i] = 'correct'
        else rest[target[i]] = (rest[target[i]] ?? 0) + 1
    }
    for (let i = 0; i < guess.length; i++) {
        if (result[i] !== 'correct' && rest[guess[i]] > 0) {
            result[i] = 'present'
            rest[guess[i]]--
        }
    }
    return result
}
