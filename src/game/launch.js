import { startLocal, remoteEngine } from './engines.js'
import { startRun } from '../data/api.js'
import { LEADERBOARD_MODES } from '../config.js'

const NAME_ERRORS = ['taken', 'badUsername']

export async function launchRun({ mode, lang, params, date }) {
    if (!LEADERBOARD_MODES.includes(mode)) {
        const local = await startLocal({ mode, lang, params, date })
        return { ...local, ranked: false, notice: null }
    }

    try {
        const view = await startRun(mode, lang)
        return { view, engine: remoteEngine(view.runId), ranked: true, notice: null }
    } catch (error) {
        const local = await startLocal({ mode, lang, params, date })
        return { ...local, ranked: false, notice: NAME_ERRORS.includes(error.code) ? 'game.nameTaken' : 'game.offline' }
    }
}
