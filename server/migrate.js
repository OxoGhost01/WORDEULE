import { existsSync, readFileSync, renameSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { DEFAULT_LANGUAGE, LEADERBOARD_MODES } from '../shared/rules.js'

export function migrateLegacy(db, file) {
    if (!existsSync(file)) return 0

    let scores
    try {
        scores = JSON.parse(readFileSync(file, 'utf8'))
    } catch {
        return 0
    }

    const insert = db.prepare(`INSERT INTO runs
        (id, legacy_name, mode, lang, day, state, status, score, words, tries, started_ms, updated_ms)
        VALUES (?, ?, ?, ?, ?, '{}', 'over', ?, ?, ?, ?, ?)`)

    let count = 0
    db.exec('BEGIN')
    for (const mode of LEADERBOARD_MODES) {
        for (const result of scores[mode] ?? []) {
            const playedMs = Date.parse(result.playedAt) || 0
            insert.run(randomUUID(), result.username, mode, result.lang ?? DEFAULT_LANGUAGE, result.day ?? null, result.score, result.words ?? null, result.tries ?? null, playedMs, playedMs)
            count++
        }
    }
    db.exec('COMMIT')

    renameSync(file, `${file}.migrated`)
    return count
}
