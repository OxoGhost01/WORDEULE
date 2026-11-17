import express from 'express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { createHash } from 'node:crypto'
import { RATE_LIMITS, TRUST_PROXY } from './config.js'
import { createRunStore } from './store.js'
import playersRouter, { createAuth } from './routes/players.js'
import runsRouter from './routes/runs.js'
import scoresRouter from './routes/scores.js'
import duelsRouter from './routes/duels.js'

export const seedFromSecret = (secret) => createHash('sha256').update(secret).digest().readInt32LE(0)

export function createApp({ db, bank, secret, now = Date.now, rng = Math.random, limits = RATE_LIMITS, log = false }) {
    const app = express()
    app.set('trust proxy', TRUST_PROXY)
    app.disable('x-powered-by')
    app.use(helmet())
    app.use(express.json({ limit: '2kb' }))
    app.use((req, res, next) => {
        req.body ??= {}
        next()
    })

    if (log) {
        app.use((req, res, next) => {
            const started = Date.now()
            res.on('finish', () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`))
            next()
        })
    }

    const limiter = ({ windowMs, limit }) => rateLimit({ windowMs, limit, standardHeaders: true, legacyHeaders: false, message: { error: 'tooManyRequests' } })
    const limiters = {
        read: limiter(limits.read),
        play: limiter(limits.play),
        start: limiter(limits.start),
        register: limiter(limits.register),
    }

    const auth = createAuth(db)
    const store = createRunStore(db)
    const seed = seedFromSecret(secret)
    const deps = { db, store, bank, seed, rng, auth, limiters, now }

    app.use('/api/players', playersRouter(deps))
    app.use('/api/runs', runsRouter(deps))
    app.use('/api/duels', duelsRouter(deps))
    app.use('/api', scoresRouter(deps))

    app.use('/api', (req, res) => res.status(404).json({ error: 'notFound' }))

    app.use((error, req, res, next) => {
        void next
        if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'badJson' })
        if (error.type === 'entity.too.large') return res.status(413).json({ error: 'tooLarge' })
        console.error(error)
        res.status(500).json({ error: 'server' })
    })

    return app
}
