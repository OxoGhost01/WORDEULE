import { describe, expect, it } from 'vitest'
import { fakeBank, setup } from './helpers.js'

const slowBank = {
    listsFor: (lang) => async (length) => {
        await new Promise((resolve) => setTimeout(resolve, 15))
        return fakeBank.listsFor(lang)(length)
    },
}

async function start(as, mode, lang = 'en') {
    const res = await as.post('/api/runs', { mode, lang })
    return res.body
}

const guess = (as, run, word) => as.post(`/api/runs/${run.runId}/guess`, { guess: word })

describe('runs', () => {
    it('needs a token', async () => {
        const { api } = setup()
        expect((await api.post('/api/runs').send({ mode: 'classic', lang: 'en' })).status).toBe(401)
        const bad = await api.post('/api/runs').set('Authorization', 'Bearer nope').send({ mode: 'classic', lang: 'en' })
        expect(bad.status).toBe(401)
    })

    it('refuses an unknown mode or language, and custom', async () => {
        const { register, as } = setup()
        const user = as(await register('Alice'))
        expect((await user.post('/api/runs', { mode: 'custom', lang: 'en' })).status).toBe(400)
        expect((await user.post('/api/runs', { mode: 'classic', lang: 'es' })).status).toBe(400)
        expect((await user.post('/api/runs', { mode: 'duel', lang: 'en' })).status).toBe(400)
    })

    it('never sends the answers while the round is played', async () => {
        const { register, as } = setup()
        const user = as(await register('Alice'))
        const run = await start(user, 'classic')
        expect(run.revealed).toBeNull()
        expect(JSON.stringify(run)).not.toMatch(/answers/)
        expect(run).toMatchObject({ wordLength: 5, maxTries: 6, grids: 1, status: 'playing', rows: [] })
    })

    it('colors a guess, then refuses words that are not in the list or too short', async () => {
        const { register, as, tick } = setup()
        const user = as(await register('Alice'))
        const run = await start(user, 'classic')
        tick(1000)
        const ok = await guess(user, run, 'crane')
        expect(ok.status).toBe(200)
        expect(ok.body.rows[0].results[0]).toHaveLength(5)
        tick(1000)
        expect((await guess(user, run, 'ZZZZZ')).body.error).toBe('notInList')
        tick(1000)
        expect((await guess(user, run, 'CAT')).body.error).toBe('wrongLength')
        tick(1000)
        expect((await guess(user, run, 42)).status).toBe(422)
    })

    it('limits how fast guesses can be sent', async () => {
        const { register, as, tick } = setup()
        const user = as(await register('Alice'))
        const run = await start(user, 'classic')
        tick(1000)
        expect((await guess(user, run, 'CRANE')).status).toBe(200)
        expect((await guess(user, run, 'SLATE')).status).toBe(429)
        tick(300)
        expect((await guess(user, run, 'SLATE')).status).toBe(200)
    })

    it('computes the score itself and reveals the answer at the end', async () => {
        const { register, as, tick } = setup()
        const user = as(await register('Alice'))
        const run = await start(user, 'classic')
        let last
        for (const word of ['CRANE', 'SLATE', 'HOUSE', 'MOUSE', 'ABIDE', 'SPEED', 'BUMPY', 'TRAIN', 'PLANT', 'STONE', 'CHAIR', 'MONEY']) {
            tick(1000)
            last = await guess(user, run, word)
            if (last.body.status !== 'playing') break
        }
        expect(last.body.status).toBe('won')
        expect(last.body.revealed.answers).toEqual(['ABIDE'])
        expect(last.body.score).toBe(200)
        tick(1000)
        expect((await guess(user, run, 'CRANE')).status).toBe(409)
    })

    it("refuses to play someone else's run", async () => {
        const { register, as, tick } = setup()
        const alice = as(await register('Alice'))
        const bob = as(await register('Bob'))
        const run = await start(alice, 'classic')
        tick(1000)
        expect((await guess(bob, run, 'CRANE')).status).toBe(404)
    })

    it('goes on to the next word after a win and not after a loss', async () => {
        const { register, as, tick } = setup()
        const user = as(await register('Alice'))
        const run = await start(user, 'classic')
        expect((await user.post(`/api/runs/${run.runId}/next`, {})).status).toBe(409)

        for (const word of ['CRANE', 'SLATE', 'HOUSE', 'MOUSE', 'ABIDE']) {
            tick(1000)
            await guess(user, run, word)
        }
        const next = await user.post(`/api/runs/${run.runId}/next`, {})
        expect(next.status).toBe(200)
        expect(next.body.rows).toEqual([])
        expect(next.body.score).toBe(200)
    })

    it('keeps one daily run per player and day, and resumes it', async () => {
        const { register, as, tick } = setup()
        const user = as(await register('Alice'))
        const first = await start(user, 'daily')
        tick(1000)
        await guess(user, first, 'CRANE')
        const again = await start(user, 'daily')
        expect(again.runId).toBe(first.runId)
        expect(again.rows).toHaveLength(1)
        tick(24 * 3600 * 1000)
        const nextDay = await start(user, 'daily')
        expect(nextDay.runId).not.toBe(first.runId)
    })

    it('gives the same daily word to every player', async () => {
        const { register, as, tick } = setup()
        const alice = as(await register('Alice'))
        const bob = as(await register('Bob'))
        const a = await start(alice, 'daily')
        const b = await start(bob, 'daily')
        const answers = []
        for (const [user, run] of [[alice, a], [bob, b]]) {
            let res
            for (const word of ['CRANE', 'SLATE', 'HOUSE', 'MOUSE', 'ABIDE', 'SPEED']) {
                tick(1000)
                res = await guess(user, run, word)
            }
            answers.push(res.body.revealed.answers[0])
        }
        expect(answers[0]).toBe(answers[1])
    })

    it('enforces the locked-mode rules on the server', async () => {
        const { register, as, tick } = setup()
        const user = as(await register('Alice'))
        const run = await start(user, 'locked')
        let codes = []
        for (const word of ['CRANE', 'SLATE', 'HOUSE', 'MOUSE', 'ABIDE', 'SPEED', 'BUMPY', 'TRAIN']) {
            tick(1000)
            const res = await guess(user, run, word)
            if (res.status === 422) codes.push(res.body.error)
            if (res.body.status && res.body.status !== 'playing') break
        }
        expect(codes.every((code) => ['lockedLetters', 'mustUse'].includes(code))).toBe(true)
    })

    it('does not let parallel guesses probe the answer for free', async () => {
        const { register, as, tick } = setup({ bank: slowBank })
        const user = as(await register('Alice'))
        const run = await start(user, 'classic')
        tick(1000)
        const words = ['CRANE', 'SLATE', 'HOUSE', 'MOUSE', 'ABIDE', 'SPEED', 'BUMPY', 'TRAIN']
        const replies = await Promise.all(words.map((word) => guess(user, run, word)))
        expect(replies.filter((reply) => reply.status === 200)).toHaveLength(1)
        expect(replies.filter((reply) => reply.status === 429)).toHaveLength(words.length - 1)
        tick(1000)
        const next = await guess(user, run, 'SLATE')
        expect(next.body.rows).toHaveLength(2)
    })

    it('gives a single daily run to parallel starts', async () => {
        const { register, as } = setup({ bank: slowBank })
        const user = as(await register('Alice'))
        const replies = await Promise.all(Array.from({ length: 5 }, () => user.post('/api/runs', { mode: 'daily', lang: 'en' })))
        expect(replies.every((reply) => reply.status === 200)).toBe(true)
        expect(new Set(replies.map((reply) => reply.body.runId)).size).toBe(1)
    })

    it('starts the blitz clock once the words are ready', async () => {
        const { register, as, clock } = setup()
        const user = as(await register('Alice'))
        const run = await start(user, 'blitz')
        expect(run.deadline).toBe(clock.time + 90_000)
    })

    it('shows the target word in reverse mode only', async () => {
        const { register, as } = setup()
        const user = as(await register('Alice'))
        const reverse = await start(user, 'reverse')
        expect(reverse.target).toHaveLength(5)
        expect((await start(user, 'classic')).target).toBeNull()
    })

    it('stops a blitz run when the clock is out', async () => {
        const { register, as, tick } = setup()
        const user = as(await register('Alice'))
        const run = await start(user, 'blitz')
        expect(run.deadline).toBeGreaterThan(0)
        tick(95_000)
        const res = await guess(user, run, 'CRANE')
        expect(res.status).toBe(409)
        expect(res.body.error).toBe('timeUp')
    })

    it('starts survival with 4 letters and reverse with a pattern', async () => {
        const { register, as } = setup()
        const user = as(await register('Alice'))
        expect((await start(user, 'survival')).wordLength).toBe(4)
        const reverse = await start(user, 'reverse')
        expect(reverse.pattern).toHaveLength(5)
        expect(reverse.maxTries).toBe(1)
    })
})

describe('failures', () => {
    it('answers with a server error instead of crashing when the word lists are missing', async () => {
        const broken = { listsFor: () => async () => { throw new Error('no lists') } }
        const { register, as } = setup({ bank: broken })
        const user = as(await register('Alice'))
        const res = await user.post('/api/runs', { mode: 'classic', lang: 'en' })
        expect(res.status).toBe(500)
        expect(res.body).toEqual({ error: 'server' })
    })
})
