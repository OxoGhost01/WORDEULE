import { startLocal } from './engines.js'

export async function launchRun({ mode, lang, params, date }) {
    const { engine, view } = await startLocal({ mode, lang, params, date })
    return { engine, view, ranked: false, notice: null }
}
