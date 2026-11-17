import { Router } from 'express'
import { GuessError, nextRound, runView, startRun, submitGuess, expireIfLate } from '../../shared/run.js'
import { dayKey } from '../../shared/daily.js'
import { GUESS_MIN_INTERVAL_MS, LANGUAGE_IDS, LEADERBOARD_MODES } from '../../shared/rules.js'

const CONFLICT_ERRORS = new Set(['finished', 'timeUp', 'cannotContinue'])

export function respond(res, id, run, time = Date.now()) {
    res.json({ runId: id, serverNow: time, ...runView(run) })
}

export default function runsRouter({ store, bank, seed, auth, limiters, now }) {
    const router = Router()

    function ownedRun(req, res) {
        const row = store.find(req.params.id)
        if (!row || row.player_id !== req.player.id) {
            res.status(404).json({ error: 'notFound' })
            return null
        }
        return { row, run: store.load(row) }
    }

    router.post('/', auth.required, limiters.start, async (req, res) => {
        const { mode, lang } = req.body
        if (!LEADERBOARD_MODES.includes(mode)) return res.status(400).json({ error: 'badMode' })
        if (!LANGUAGE_IDS.includes(lang)) return res.status(400).json({ error: 'badLanguage' })

        const time = now()
        const day = mode === 'daily' ? dayKey(new Date(time)) : null

        if (day) {
            const existing = store.findDaily(req.player.id, lang, day)
            if (existing) {
                const run = store.load(existing)
                expireIfLate(run, time)
                return respond(res, existing.id, run, time)
            }
        } else {
            store.endActive(req.player.id, mode, lang, time)
        }

        const run = await startRun({ mode, lang, getLists: bank.listsFor(lang), seed, date: new Date(time), now: time })
        const id = store.create(run, { playerId: req.player.id, day, now: time })
        respond(res, id, run, time)
    })

    router.post('/:id/guess', auth.required, limiters.play, async (req, res) => {
        const found = ownedRun(req, res)
        if (!found) return
        const { row, run } = found

        const time = now()
        if (time - row.last_guess_ms < GUESS_MIN_INTERVAL_MS) return res.status(429).json({ error: 'tooFast' })

        const guess = typeof req.body.guess === 'string' ? req.body.guess.toUpperCase() : ''
        try {
            await submitGuess(run, guess, { getLists: bank.listsFor(run.lang), now: time })
        } catch (error) {
            if (!(error instanceof GuessError)) throw error
            store.save(row.id, run, time, row.last_guess_ms)
            return res.status(CONFLICT_ERRORS.has(error.code) ? 409 : 422).json({ error: error.code })
        }
        store.save(row.id, run, time, time)
        respond(res, row.id, run, time)
    })

    router.post('/:id/next', auth.required, limiters.play, async (req, res) => {
        const found = ownedRun(req, res)
        if (!found) return
        const { row, run } = found

        const time = now()
        try {
            await nextRound(run, { getLists: bank.listsFor(run.lang), seed, date: new Date(time), now: time })
        } catch (error) {
            if (!(error instanceof GuessError)) throw error
            store.save(row.id, run, time, row.last_guess_ms)
            return res.status(409).json({ error: error.code })
        }
        store.save(row.id, run, time, row.last_guess_ms)
        respond(res, row.id, run, time)
    })

    return router
}
