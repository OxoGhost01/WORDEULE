import { randomUUID } from 'node:crypto'

export function createRunStore(db) {
    const insertRun = db.prepare(`INSERT INTO runs
        (id, player_id, mode, lang, day, state, status, score, words, tries, started_ms, updated_ms, duel_code)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    const updateRun = db.prepare(`UPDATE runs
        SET state = ?, status = ?, score = ?, words = ?, tries = ?, updated_ms = ?, last_guess_ms = ?
        WHERE id = ?`)
    const byId = db.prepare('SELECT * FROM runs WHERE id = ?')
    const daily = db.prepare("SELECT * FROM runs WHERE player_id = ? AND mode = 'daily' AND lang = ? AND day = ? AND state != '{}'")
    const endActive = db.prepare(`UPDATE runs SET status = 'over', updated_ms = ?
        WHERE player_id = ? AND mode = ? AND lang = ? AND status IN ('playing', 'won', 'lost')`)

    return {
        create(run, { playerId, day = null, now, duelCode = null }) {
            const id = randomUUID()
            insertRun.run(id, playerId, run.mode, run.lang, day, JSON.stringify(run), run.status, run.score, run.words, run.tries, now, now, duelCode)
            return id
        },
        find: (id) => byId.get(id),
        findDaily: (playerId, lang, day) => daily.get(playerId, lang, day),
        forDuel: (code) => db.prepare('SELECT * FROM runs WHERE duel_code = ? ORDER BY started_ms').all(code),
        load: (row) => JSON.parse(row.state),
        save(id, run, now, lastGuessMs) {
            updateRun.run(JSON.stringify(run), run.status, run.score, run.words, run.tries, now, lastGuessMs, id)
        },
        endActive: (playerId, mode, lang, now) => endActive.run(now, playerId, mode, lang),
    }
}
