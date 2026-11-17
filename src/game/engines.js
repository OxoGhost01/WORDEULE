import { GuessError, nextRound, runView, startRun, submitGuess } from '../../shared/run.js'
import { listsLoader } from './words.js'
import { DAILY } from '../config.js'

export function localEngine(run, lang) {
    const getLists = listsLoader(lang)
    const rng = Math.random

    return {
        ranked: false,
        view: () => runView(run),
        async submit(guess) {
            try {
                await submitGuess(run, guess, { getLists })
            } catch (error) {
                if (error instanceof GuessError) throw error
                throw new GuessError('connection')
            }
            return runView(run)
        },
        async next() {
            await nextRound(run, { getLists, rng })
            return runView(run)
        },
    }
}

export async function startLocal({ mode, lang, params, date }) {
    const run = await startRun({
        mode,
        lang,
        params,
        getLists: listsLoader(lang),
        seed: DAILY.seed,
        date,
    })
    const engine = localEngine(run, lang)
    return { engine, view: runView(run) }
}
