import request from 'supertest'
import { createApp } from '../app.js'
import { openDb } from '../db.js'
import { buildLists } from '../../shared/words.js'

export const WORDS = ['CRANE', 'SLATE', 'HOUSE', 'MOUSE', 'ABIDE', 'SPEED', 'BUMPY', 'TRAIN', 'PLANT', 'STONE', 'CHAIR', 'MONEY']
export const FOUR = ['CATS', 'DOGS', 'BIRD', 'FISH']
export const SIX = ['PLANET', 'ORANGE']

const sources = { 4: FOUR, 5: WORDS, 6: SIX }
const lower = (list) => list.map((word) => word.toLowerCase())

export const fakeBank = {
    listsFor: () => async (length) => {
        const source = sources[length] ?? SIX
        return buildLists(source, lower(source), length)
    },
}

export const HIGH_LIMITS = {
    read: { windowMs: 60_000, limit: 10_000 },
    play: { windowMs: 60_000, limit: 10_000 },
    start: { windowMs: 60_000, limit: 10_000 },
    register: { windowMs: 60_000, limit: 10_000 },
}

export function setup({ limits = HIGH_LIMITS, start = Date.UTC(2026, 0, 7, 12), bank = fakeBank } = {}) {
    const clock = { time: start }
    const db = openDb(':memory:')
    const app = createApp({ db, bank, secret: 'test-secret', now: () => clock.time, limits })
    const api = request(app)

    async function register(username) {
        const res = await api.post('/api/players').send({ username })
        return res.body.token
    }

    const as = (token) => ({
        get: (path) => api.get(path).set('Authorization', `Bearer ${token}`),
        post: (path, body) => api.post(path).set('Authorization', `Bearer ${token}`).send(body),
        patch: (path, body) => api.patch(path).set('Authorization', `Bearer ${token}`).send(body),
    })

    const tick = (ms) => { clock.time += ms }

    return { api, db, clock, register, as, tick }
}
