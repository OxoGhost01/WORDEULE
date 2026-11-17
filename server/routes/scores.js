import { Router } from 'express'
import { dayKey } from '../../shared/daily.js'
import { LANGUAGE_IDS, LEADERBOARD_MODES } from '../../shared/rules.js'
import { LIMITS } from '../config.js'

const DAY_MS = 86_400_000

export function periodStart(period, time) {
    const dayStart = Math.floor(time / DAY_MS) * DAY_MS
    if (period === 'today') return dayStart
    if (period === 'week') {
        const sinceMonday = (new Date(dayStart).getUTCDay() + 6) % 7
        return dayStart - sinceMonday * DAY_MS
    }
    return 0
}

export default function scoresRouter({ db, auth, limiters, now }) {
    const router = Router()

    const best = db.prepare(`
        SELECT * FROM (
            SELECT r.player_id, COALESCE(p.username, r.legacy_name) AS username, r.score, r.words, r.tries, r.updated_ms,
                   ROW_NUMBER() OVER (
                       PARTITION BY COALESCE(CAST(r.player_id AS TEXT), 'u:' || r.legacy_name)
                       ORDER BY r.score DESC, r.updated_ms ASC
                   ) AS position
            FROM runs r LEFT JOIN players p ON p.id = r.player_id
            WHERE r.mode = ? AND r.lang = ? AND r.score > 0 AND r.updated_ms >= ? AND (? IS NULL OR r.day = ?)
        ) WHERE position = 1
        ORDER BY score DESC, updated_ms ASC`)

    const dailyCount = db.prepare(`SELECT COUNT(DISTINCT player_id) AS count FROM runs
        WHERE mode = 'daily' AND lang = ? AND day = ? AND status = 'won'`)

    const entry = (row) => ({ username: row.username, score: row.score, words: row.words, tries: row.tries, playedAt: new Date(row.updated_ms).toISOString() })

    router.get('/daily/count/:lang', limiters.read, (req, res) => {
        const { lang } = req.params
        if (!LANGUAGE_IDS.includes(lang)) return res.status(400).json({ error: 'badLanguage' })
        res.json({ count: dailyCount.get(lang, dayKey(new Date(now()))).count })
    })

    router.get('/scores/:lang/:mode', limiters.read, auth.optional, (req, res) => {
        const { lang, mode } = req.params
        if (!LANGUAGE_IDS.includes(lang)) return res.status(400).json({ error: 'badLanguage' })
        if (!LEADERBOARD_MODES.includes(mode)) return res.status(400).json({ error: 'badMode' })

        const time = now()
        const period = mode === 'daily' ? 'today' : ['today', 'week', 'all'].includes(req.query.period) ? req.query.period : 'all'
        const day = mode === 'daily' ? dayKey(new Date(time)) : null
        const players = best.all(mode, lang, mode === 'daily' ? 0 : periodStart(period, time), day, day)

        const mine = req.player ? players.findIndex((row) => row.player_id === req.player.id) : -1
        res.json({
            top: players.slice(0, LIMITS.topPlayers).map(entry),
            me: mine === -1 ? null : { rank: mine + 1, ...entry(players[mine]) },
        })
    })

    return router
}
