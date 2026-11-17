// Tiny server of the global leaderboard: it keeps the best score of every player, for each mode and language.
// Scores are stored in a JSON file, read and written on each request (a few players, so it is enough).
import express from 'express'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { PORT, DATA_FILE, MODES, LANGUAGES, DEFAULT_LANGUAGE, LIMITS } from './config.js'

// File content: { classic: [{ username, lang, score, tries, playedAt }, ...], daily: [...], ... }
// (daily results also have the day of the word; older results may have no tries or no language)
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
const langOf = (result) => result.lang ?? DEFAULT_LANGUAGE

// Best score first; on a tie, the player who got it first
const byScore = (a, b) => b.score - a.score || a.playedAt.localeCompare(b.playedAt)

const app = express()
app.use(express.json())

// How many players found today's word in a language (only won games are sent, so every daily result is a player
// who found it)
app.get('/api/daily/count/:lang', (req, res) => {
    const { lang } = req.params
    if (!LANGUAGES.includes(lang)) return res.status(400).json({ error: 'Unknown language' })

    const found = (loadScores().daily ?? []).filter((p) => p.day === today() && langOf(p) === lang)
    res.json({ count: found.length })
})

// The best players of a mode in a language (daily: only the players of today's word)
app.get('/api/scores/:lang/:mode', (req, res) => {
    const { lang, mode } = req.params
    if (!LANGUAGES.includes(lang)) return res.status(400).json({ error: 'Unknown language' })
    if (!MODES.includes(mode)) return res.status(400).json({ error: 'Unknown mode' })

    let players = (loadScores()[mode] ?? []).filter((p) => langOf(p) === lang)
    if (mode === 'daily') players = players.filter((p) => p.day === today())

    res.json(players.sort(byScore).slice(0, LIMITS.topPlayers))
})

// A player sends a score: it only counts if it beats his previous best in that mode and language
// (for the daily mode: that day)
app.post('/api/scores', (req, res) => {
    const { mode, score } = req.body
    const lang = req.body.lang ?? DEFAULT_LANGUAGE
    const username = String(req.body.username ?? '').trim()
    const tries = req.body.tries ?? null // tries used on the last word of the run
    const words = req.body.words ?? null // words found in the run: the score is the total of all of them

    if (!LANGUAGES.includes(lang)) return res.status(400).json({ error: 'Unknown language' })
    if (!MODES.includes(mode)) return res.status(400).json({ error: 'Unknown mode' })
    if (!Number.isInteger(score) || score <= 0 || score > LIMITS.maxScore) return res.status(400).json({ error: 'Bad score' })
    if (tries !== null && (!Number.isInteger(tries) || tries < 1 || tries > LIMITS.maxTries)) return res.status(400).json({ error: 'Bad tries' })
    if (words !== null && (!Number.isInteger(words) || words < 0 || words > LIMITS.maxWords)) return res.status(400).json({ error: 'Bad words' })
    if (username.length === 0 || username.length > LIMITS.maxUsername) return res.status(400).json({ error: 'Bad username' })

    const scores = loadScores()
    const players = scores[mode] ?? []
    const day = mode === 'daily' ? today() : undefined
    const player = players.find((p) => p.username === username && langOf(p) === lang && p.day === day)
    const result = { username, lang, score, tries, words, day, playedAt: new Date().toISOString() }

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
