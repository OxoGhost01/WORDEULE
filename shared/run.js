import evaluate, { allSolved, isCorrect } from './evaluate.js'
import { lockedError } from './locked.js'
import roundScore, { scoreMultiplier } from './score.js'
import { getDailyWord } from './daily.js'
import { randomWord, randomWords } from './words.js'
import { BLITZ, GAME_MODES, REVERSE, SURVIVAL } from './rules.js'

export class GuessError extends Error {
    constructor(code) {
        super(code)
        this.code = code
    }
}

const rulesOf = (run) => run.params ?? GAME_MODES[run.mode]

export function roundLength(run) {
    if (run.mode === 'survival') return Math.min(SURVIVAL.startLength + run.words, SURVIVAL.maxLength)
    return rulesOf(run).wordLength
}

function pickPattern(target, words, rng) {
    for (let attempt = 0; attempt < REVERSE.searchLimit; attempt++) {
        const guess = randomWord(words, rng)
        if (guess === target) continue
        const pattern = evaluate(guess, target)
        if (!isCorrect(pattern) && pattern.filter((status) => status !== 'absent').length >= REVERSE.minHints) return pattern
    }
    throw new Error('No pattern found')
}

async function createRound(run, { getLists, rng, seed, date, answer }) {
    const rules = rulesOf(run)
    const wordLength = roundLength(run)
    const lists = await getLists(wordLength)

    let answers
    if (answer) answers = [answer]
    else if (run.mode === 'daily') answers = [getDailyWord(lists.pool, seed, date)]
    else if (run.mode === 'reverse') answers = [randomWord(lists.pool, rng)]
    else answers = randomWords(lists.pool, rules.grids, rng)

    const state = {
        wordLength,
        maxTries: rules.maxTries,
        grids: answers.length,
        answers,
        display: Object.fromEntries(answers.map((word) => [word, lists.display[word] ?? word])),
        rows: [],
    }
    if (run.mode === 'reverse') state.pattern = pickPattern(answers[0], lists.words, rng)
    return state
}

export async function startRun({ mode, lang, params, getLists, rng = Math.random, seed = 0, date = new Date(), answer, now }) {
    const run = { mode, lang, params: params ?? null, status: 'playing', score: 0, words: 0, tries: 0, number: 1, deadline: null, state: null }
    run.state = await createRound(run, { getLists, rng, seed, date, answer })
    if (mode === 'blitz') run.deadline = (now ?? Date.now()) + BLITZ.startSeconds * 1000
    return run
}

function settle(run) {
    const { state, mode } = run
    const last = state.rows[state.rows.length - 1]
    const won = mode === 'reverse' ? last.results[0].join() === state.pattern.join() : allSolved(state.rows, state.grids)

    if (won) {
        run.status = 'won'
        run.words++
        run.tries = state.rows.length
        run.score += roundScore(state.rows.length, state.maxTries, scoreMultiplier(mode, state.wordLength, state.grids))
        if (mode === 'blitz') run.deadline += BLITZ.bonusSeconds * 1000
    } else if (state.rows.length >= state.maxTries) {
        run.status = 'lost'
        run.tries = state.rows.length
    }
}

export function expireIfLate(run, now) {
    if (run.deadline !== null && run.status !== 'over' && now > run.deadline + BLITZ.graceMs) run.status = 'over'
    return run.status === 'over'
}

export async function submitGuess(run, guess, { getLists, now = Date.now() }) {
    if (expireIfLate(run, now)) throw new GuessError('timeUp')
    if (run.status !== 'playing') throw new GuessError('finished')

    const { state } = run
    if (guess.length !== state.wordLength || !/^[A-Z]+$/.test(guess)) throw new GuessError('wrongLength')

    const lists = await getLists(state.wordLength)
    if (!lists.valid.has(guess)) throw new GuessError('notInList')

    if (run.mode === 'locked') {
        const error = lockedError(state.rows, guess)
        if (error) throw new GuessError(error)
    }

    state.rows.push({ guess, results: state.answers.map((answer) => evaluate(guess, answer)) })
    settle(run)
}

export function canContinue(run) {
    if (run.status === 'won') return rulesOf(run).endless ?? true
    return run.mode === 'blitz' && run.status === 'lost'
}

export async function nextRound(run, ctx) {
    const now = ctx.now ?? Date.now()
    if (expireIfLate(run, now)) throw new GuessError('timeUp')
    if (!canContinue(run)) throw new GuessError('cannotContinue')
    run.number++
    run.status = 'playing'
    run.state = await createRound(run, { ...ctx, answer: undefined })
}

export function runView(run) {
    const { state } = run
    return {
        mode: run.mode,
        lang: run.lang,
        status: run.status,
        score: run.score,
        words: run.words,
        number: run.number,
        deadline: run.deadline,
        wordLength: state.wordLength,
        maxTries: state.maxTries,
        grids: state.grids,
        rows: state.rows,
        pattern: state.pattern ?? null,
        target: run.mode === 'reverse' ? state.display[state.answers[0]] : null,
        revealed: run.status === 'playing' ? null : { answers: state.answers, display: state.display },
    }
}
