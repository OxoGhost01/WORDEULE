import { Router } from 'express'
import { createHash, randomBytes } from 'node:crypto'
import { USERNAME } from '../../shared/rules.js'

export const hashToken = (token) => createHash('sha256').update(token).digest('hex')

export function cleanUsername(raw) {
    if (typeof raw !== 'string') return null
    const name = raw.normalize('NFKC').trim()
    if (name.length === 0 || name.length > USERNAME.maxLength || !USERNAME.pattern.test(name)) return null
    return name
}

export function createAuth(db) {
    const byToken = db.prepare('SELECT id, username FROM players WHERE token_hash = ?')

    function find(req) {
        const header = req.get('authorization') ?? ''
        const token = header.startsWith('Bearer ') ? header.slice(7) : ''
        return token ? byToken.get(hashToken(token)) : undefined
    }

    return {
        required(req, res, next) {
            const player = find(req)
            if (!player) return res.status(401).json({ error: 'unauthorized' })
            req.player = player
            next()
        },
        optional(req, res, next) {
            req.player = find(req)
            next()
        },
    }
}

export default function playersRouter({ db, auth, limiters, now }) {
    const router = Router()
    const insert = db.prepare('INSERT INTO players (token_hash, username, created_ms) VALUES (?, ?, ?)')
    const claimLegacy = db.prepare(`UPDATE runs SET player_id = ?, legacy_name = NULL
        WHERE player_id IS NULL AND legacy_name = ? COLLATE NOCASE`)
    const rename = db.prepare('UPDATE players SET username = ? WHERE id = ?')

    router.post('/', limiters.register, (req, res) => {
        const username = cleanUsername(req.body.username)
        if (!username) return res.status(400).json({ error: 'badUsername' })

        const token = randomBytes(32).toString('base64url')
        try {
            const { lastInsertRowid } = insert.run(hashToken(token), username, now())
            claimLegacy.run(lastInsertRowid, username)
        } catch (error) {
            if (/UNIQUE/.test(error.message)) return res.status(409).json({ error: 'taken' })
            throw error
        }
        res.status(201).json({ token, username })
    })

    router.get('/me', auth.required, (req, res) => res.json({ username: req.player.username }))

    router.patch('/me', auth.required, (req, res) => {
        const username = cleanUsername(req.body.username)
        if (!username) return res.status(400).json({ error: 'badUsername' })
        try {
            rename.run(username, req.player.id)
        } catch (error) {
            if (/UNIQUE/.test(error.message)) return res.status(409).json({ error: 'taken' })
            throw error
        }
        res.json({ username })
    })

    return router
}
