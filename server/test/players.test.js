import { describe, expect, it } from 'vitest'
import { setup } from './helpers.js'

describe('players', () => {
    it('registers a player and returns a token', async () => {
        const { api } = setup()
        const res = await api.post('/api/players').send({ username: 'Alice' })
        expect(res.status).toBe(201)
        expect(res.body.token).toHaveLength(43)
    })

    it('refuses a name that is taken, whatever its case', async () => {
        const { api } = setup()
        await api.post('/api/players').send({ username: 'Alice' })
        const res = await api.post('/api/players').send({ username: 'aLICE' })
        expect(res.status).toBe(409)
    })

    it('refuses empty, long and strange names', async () => {
        const { api } = setup()
        for (const username of ['', '   ', 'x'.repeat(25), '<b>hi</b>', '\u0000bad', 42, undefined]) {
            const res = await api.post('/api/players').send({ username })
            expect(res.status).toBe(400)
        }
    })

    it('answers a missing or broken body without crashing', async () => {
        const { api } = setup()
        expect((await api.post('/api/players')).status).toBe(400)
        const broken = await api.post('/api/players').set('Content-Type', 'application/json').send('{oops')
        expect(broken.status).toBe(400)
        const big = await api.post('/api/players').send({ username: 'a', pad: 'x'.repeat(5000) })
        expect(big.status).toBe(413)
    })

    it('renames the player and keeps the name unique', async () => {
        const { api, register, as } = setup()
        const token = await register('Alice')
        await register('Bob')
        expect((await as(token).patch('/api/players/me', { username: 'Bob' })).status).toBe(409)
        const res = await as(token).patch('/api/players/me', { username: 'Alicia' })
        expect(res.body.username).toBe('Alicia')
        expect((await api.get('/api/players/me')).status).toBe(401)
    })

    it('limits the registrations of one address', async () => {
        const { api } = setup({ limits: { read: { windowMs: 60000, limit: 100 }, play: { windowMs: 60000, limit: 100 }, start: { windowMs: 60000, limit: 100 }, register: { windowMs: 60000, limit: 2 } } })
        await api.post('/api/players').send({ username: 'A1' })
        await api.post('/api/players').send({ username: 'A2' })
        expect((await api.post('/api/players').send({ username: 'A3' })).status).toBe(429)
    })

    it('has no endpoint to post a score', async () => {
        const { api } = setup()
        const res = await api.post('/api/scores').send({ mode: 'classic', score: 100000, username: 'cheater' })
        expect(res.status).toBe(404)
    })
})
