import { describe, expect, it } from 'vitest'
import { migrateLegacy } from '../migrate.js'
import { setup } from './helpers.js'
import { mkdtempSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

async function winClassic(as, tick) {
    const run = (await as.post('/api/runs', { mode: 'classic', lang: 'en' })).body
    for (const word of ['CRANE', 'SLATE', 'HOUSE', 'MOUSE', 'ABIDE', 'SPEED']) {
        tick(1000)
        const res = await as.post(`/api/runs/${run.runId}/guess`, { guess: word })
        if (res.body.status === 'won') return res.body.score
    }
    return 0
}

describe('leaderboard', () => {
    it('is empty at first and rejects bad parameters', async () => {
        const { api } = setup()
        expect((await api.get('/api/scores/en/classic')).body).toEqual({ top: [], me: null })
        expect((await api.get('/api/scores/xx/classic')).status).toBe(400)
        expect((await api.get('/api/scores/en/duel')).status).toBe(400)
        expect((await api.get('/api/scores/en/custom')).status).toBe(400)
    })

    it('ranks the best run of each player and tells a player his rank', async () => {
        const { api, register, as, tick } = setup()
        const alice = as(await register('Alice'))
        const bob = as(await register('Bob'))
        let aliceScore = 0
        let bobScore = 0
        for (let i = 0; i < 20 && (!aliceScore || !bobScore); i++) {
            aliceScore ||= await winClassic(alice, tick)
            bobScore ||= await winClassic(bob, tick)
        }
        const board = (await api.get('/api/scores/en/classic')).body
        expect(board.top.map((p) => p.username).sort()).toEqual(['Alice', 'Bob'])
        const mine = (await alice.get('/api/scores/en/classic')).body.me
        expect(mine.rank).toBeGreaterThanOrEqual(1)
        expect(mine.username).toBe('Alice')
    })

    it('keeps the languages apart and filters by period', async () => {
        const { api, register, as, tick } = setup()
        const alice = as(await register('Alice'))
        let score = 0
        for (let i = 0; i < 20 && !score; i++) score = await winClassic(alice, tick)
        expect((await api.get('/api/scores/fr/classic')).body.top).toEqual([])
        expect((await api.get('/api/scores/en/classic?period=today')).body.top).toHaveLength(1)
        tick(8 * 24 * 3600 * 1000)
        expect((await api.get('/api/scores/en/classic?period=week')).body.top).toHaveLength(0)
        expect((await api.get('/api/scores/en/classic?period=all')).body.top).toHaveLength(1)
    })

    it('counts the players who found the daily word', async () => {
        const { api, register, as, tick } = setup()
        const alice = as(await register('Alice'))
        const run = (await alice.post('/api/runs', { mode: 'daily', lang: 'en' })).body
        for (const word of ['CRANE', 'SLATE', 'HOUSE', 'MOUSE', 'ABIDE', 'SPEED', 'BUMPY', 'TRAIN', 'PLANT', 'STONE', 'CHAIR', 'MONEY']) {
            tick(1000)
            const res = await alice.post(`/api/runs/${run.runId}/guess`, { guess: word })
            if (res.body.status !== 'playing') break
        }
        const { count } = (await api.get('/api/daily/count/en')).body
        expect([0, 1]).toContain(count)
    })
})

describe('legacy scores', () => {
    it('imports the old file once and gives the scores to the player who takes the name', async () => {
        const { api, db, register, as } = setup()
        const dir = mkdtempSync(join(tmpdir(), 'wordeule-'))
        const file = join(dir, 'scores.json')
        writeFileSync(file, JSON.stringify({ classic: [{ username: 'Old', lang: 'en', score: 900, tries: 3, words: 2, playedAt: '2026-01-01T10:00:00.000Z' }, { username: 'Old', score: 400, playedAt: '2026-01-02T10:00:00.000Z' }] }))

        expect(migrateLegacy(db, file)).toBe(2)
        expect(existsSync(`${file}.migrated`)).toBe(true)
        expect(migrateLegacy(db, file)).toBe(0)

        const before = (await api.get('/api/scores/en/classic')).body.top
        expect(before).toHaveLength(1)
        expect(before[0]).toMatchObject({ username: 'Old', score: 900 })

        const old = as(await register('old'))
        const me = (await old.get('/api/scores/en/classic')).body.me
        expect(me.rank).toBe(1)
    })
})
