// Tiny server of the global leaderboard: it keeps the best score of every player, for each mode.
// Scores are stored in a JSON file, read and written on each request (a few players, so it is enough).
import express from 'express'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const PORT = 3000
const DATA_FILE = process.env.DATA_FILE ?? './data/scores.json'
const MODES = ['daily', 'classic', 'hardcore', 'locked'] // custom is not here: its difficulty changes, so scores can't be compared

// File content: { classic: [{ username, score, playedAt }, ...], daily: [...], ... }
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

const app = express()
app.use(express.json())

// The 50 best players of a mode
app.get('/api/scores/:mode', (req, res) => {
    const { mode } = req.params
    if (!MODES.includes(mode)) return res.status(400).json({ error: 'Unknown mode' })

    const best = (loadScores()[mode] ?? [])
        .sort((a, b) => b.score - a.score)
        .slice(0, 50)
    res.json(best)
})

// A player sends a score: it only counts if it beats his previous best in that mode
app.post('/api/scores', (req, res) => {
    const { mode, score } = req.body
    const username = String(req.body.username ?? '').trim()

    if (!MODES.includes(mode)) return res.status(400).json({ error: 'Unknown mode' })
    if (!Number.isInteger(score) || score <= 0 || score > 100000) return res.status(400).json({ error: 'Bad score' })
    if (username.length === 0 || username.length > 24) return res.status(400).json({ error: 'Bad username' })

    const scores = loadScores()
    const players = scores[mode] ?? []
    const player = players.find((p) => p.username === username)

    if (!player) {
        players.push({ username, score, playedAt: new Date().toISOString() })
    } else if (score > player.score) {
        player.score = score
        player.playedAt = new Date().toISOString()
    }

    scores[mode] = players
    saveScores(scores)
    res.status(201).json({ ok: true })
})

app.listen(PORT, () => console.log(`Leaderboard server on port ${PORT}`))
