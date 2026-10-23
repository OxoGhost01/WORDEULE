// Tiny server of the global leaderboard: it keeps the best score of every player, for each mode.
// Scores are stored in a JSON file, read and written on each request (a few players, so it is enough).
import express from 'express'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { PORT, DATA_FILE, MODES, LIMITS } from './config.js'

// File content: { classic: [{ username, score, tries, playedAt }, ...], daily: [...], ... }
// (daily results also have the day of the word; older results may have no tries)
function loadScores() {
    try {
        return JSON.parse(readFileSync(DATA_FILE, 'utf8'))
    } catch {
        return {} // no file yet
    }
}

function saveScores(scores) {
    mkdirSync(dirname(DATA_FILE), { recursive: true })
    writeFileSync(DATA_FILE, JSON.stringify(scores))
}

const today = () => new Date().toISOString().slice(0, 10) // UTC, like the daily word

// Best score first; on a tie, the player who got it first
const byScore = (a, b) => b.score - a.score || a.playedAt.localeCompare(b.playedAt)

const app = express()
app.use(express.json())

// How many players found today's word (only won games are sent, so every daily result is a player who found it)
app.get('/api/daily/count', (req, res) => {
    const found = (loadScores().daily ?? []).filter((p) => p.day === today())
    res.json({ count: found.length })
})

// The best players of a mode (daily: only the players of today's word)
app.get('/api/scores/:mode', (req, res) => {
    const { mode } = req.params
    if (!MODES.includes(mode)) return res.status(400).json({ error: 'Unknown mode' })

    let players = loadScores()[mode] ?? []
    if (mode === 'daily') players = players.filter((p) => p.day === today())

    const best = [...players].sort(byScore).slice(0, LIMITS.topPlayers)
    res.json(best)
})

// A player sends a score: it only counts if it beats his previous best in that mode
// (for the daily mode: that day)
app.post('/api/scores', (req, res) => {
    const { mode, score } = req.body
    const username = String(req.body.username ?? '').trim()
    const tries = req.body.tries ?? null // tries used on the word that gave the score

    if (!MODES.includes(mode)) return res.status(400).json({ error: 'Unknown mode' })
    if (!Number.isInteger(score) || score <= 0 || score > LIMITS.maxScore) return res.status(400).json({ error: 'Bad score' })
    if (tries !== null && (!Number.isInteger(tries) || tries < 1 || tries > LIMITS.maxTries)) return res.status(400).json({ error: 'Bad tries' })
    if (username.length === 0 || username.length > LIMITS.maxUsername) return res.status(400).json({ error: 'Bad username' })

    const scores = loadScores()
    const players = scores[mode] ?? []
    const day = mode === 'daily' ? today() : undefined
    const player = players.find((p) => p.username === username && p.day === day)
    const result = { username, score, tries, day, playedAt: new Date().toISOString() }

    if (!player) {
        players.push(result)
    } else if (score > player.score) {
        Object.assign(player, result) // better score
    }

    scores[mode] = players
    saveScores(scores)
    res.status(201).json({ ok: true })
})

app.listen(PORT, () => console.log(`Leaderboard server on port ${PORT}`))
