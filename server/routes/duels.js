import { Router } from 'express'
import { randomInt } from 'node:crypto'
import { startRun, runView, expireIfLate } from '../../shared/run.js'
import { randomWord } from '../../shared/words.js'
import { DUEL, GAME_MODES, LANGUAGE_IDS } from '../../shared/rules.js'
import { respond } from './runs.js'
import { handle } from '../lock.js'

const DAY_MS = 86_400_000

const duration = (row) => row.updated_ms - (JSON.parse(row.state).firstGuessAt ?? row.started_ms)

const finished = (row) => row.status === 'won' || row.status === 'lost'

function compare(a, b) {
    if ((a.status === 'won') !== (b.status === 'won')) return a.status === 'won' ? -1 : 1
    return a.tries - b.tries || duration(a) - duration(b)
}

export default function duelsRouter({ db, store, bank, rng, auth, limiters, now }) {
    const router = Router()
    const insert = db.prepare('INSERT INTO duels (code, lang, word, created_by, created_ms) VALUES (?, ?, ?, ?, ?)')
    const byCode = db.prepare('SELECT * FROM duels WHERE code = ?')
    const nameOf = db.prepare('SELECT username FROM players WHERE id = ?')

    const newCode = () => Array.from({ length: DUEL.codeLength }, () => DUEL.codeAlphabet[randomInt(DUEL.codeAlphabet.length)]).join('')

    function liveDuel(req, res) {
        const duel = byCode.get(String(req.params.code ?? '').toUpperCase())
        if (!duel) {
            res.status(404).json({ error: 'notFound' })
            return null
        }
        if (now() - duel.created_ms > DUEL.expireDays * DAY_MS) {
            res.status(410).json({ error: 'expired' })
            return null
        }
        return duel
    }

    async function createRunFor(duel, playerId) {
        const time = now()
        const run = await startRun({ mode: 'duel', lang: duel.lang, getLists: bank.listsFor(duel.lang), answer: duel.word, now: time })
        const id = store.create(run, { playerId, now: time, duelCode: duel.code })
        return { id, run }
    }

    router.post('/', auth.required, limiters.start, handle(async (req, res) => {
        const { lang } = req.body
        if (!LANGUAGE_IDS.includes(lang)) return res.status(400).json({ error: 'badLanguage' })

        const lists = await bank.listsFor(lang)(GAME_MODES.duel.wordLength)
        const word = randomWord(lists.pool, rng)
        let code = newCode()
        while (byCode.get(code)) code = newCode()

        insert.run(code, lang, word, req.player.id, now())
        const duel = byCode.get(code)
        const { id, run } = await createRunFor(duel, req.player.id)
        res.status(201).json({ code, runId: id, serverNow: now(), ...runView(run) })
    }))

    router.post('/:code/join', auth.required, limiters.start, handle(async (req, res) => {
        const duel = liveDuel(req, res)
        if (!duel) return

        const runs = store.forDuel(duel.code)
        const mine = runs.find((row) => row.player_id === req.player.id)
        if (mine) return respond(res, mine.id, store.load(mine), now())
        if (runs.length >= 2) return res.status(403).json({ error: 'full' })

        try {
            const { id, run } = await createRunFor(duel, req.player.id)
            respond(res, id, run, now())
        } catch (error) {
            const again = store.forDuel(duel.code).find((row) => row.player_id === req.player.id)
            if (!again || !/UNIQUE/.test(error.message)) throw error
            respond(res, again.id, store.load(again), now())
        }
    }))

    router.get('/:code', auth.required, limiters.read, (req, res) => {
        const duel = liveDuel(req, res)
        if (!duel) return

        const runs = store.forDuel(duel.code)
        const mine = runs.find((row) => row.player_id === req.player.id)
        if (!mine) return res.status(403).json({ error: 'notInDuel' })

        for (const row of runs) {
            const run = store.load(row)
            if (expireIfLate(run, now())) store.save(row.id, run, now(), row.last_guess_ms)
        }

        const seeAll = finished(mine)
        const usernames = new Map(runs.map((row) => [row.player_id, nameOf.get(row.player_id).username]))
        const players = runs.map((row) => {
            const base = { username: usernames.get(row.player_id), me: row.player_id === req.player.id, finished: finished(row) }
            if (!(seeAll || base.me) || !base.finished) return base
            return { ...base, outcome: row.status, tries: row.tries, ms: duration(row) }
        })

        let winner = null
        const done = runs.filter(finished)
        if (seeAll && runs.length === 2 && done.length === 2) {
            const [first, second] = [...done].sort(compare)
            winner = compare(first, second) === 0 ? 'draw' : usernames.get(first.player_id)
        }

        res.json({ code: duel.code, lang: duel.lang, players, winner })
    })

    return router
}
