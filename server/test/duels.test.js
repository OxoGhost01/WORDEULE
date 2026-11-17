import { describe, expect, it } from 'vitest'
import { setup } from './helpers.js'

const WORDS = ['CRANE', 'SLATE', 'HOUSE', 'MOUSE', 'ABIDE', 'SPEED', 'BUMPY', 'TRAIN', 'PLANT', 'STONE', 'CHAIR', 'MONEY']

async function playOut(user, runId, tick) {
    let last
    for (const word of WORDS) {
        tick(1000)
        last = await user.post(`/api/runs/${runId}/guess`, { guess: word })
        if (last.body.status !== 'playing') break
    }
    return last.body
}

describe('duels', () => {
    it('lets a second player join and refuses a third', async () => {
        const { register, as } = setup()
        const alice = as(await register('Alice'))
        const bob = as(await register('Bob'))
        const carol = as(await register('Carol'))

        const created = await alice.post('/api/duels', { lang: 'en' })
        expect(created.status).toBe(201)
        expect(created.body.code).toHaveLength(6)

        const joined = await bob.post(`/api/duels/${created.body.code}/join`, {})
        expect(joined.status).toBe(200)
        expect(joined.body.rows).toEqual([])
        expect((await bob.post(`/api/duels/${created.body.code}/join`, {})).body.runId).toBe(joined.body.runId)
        expect((await carol.post(`/api/duels/${created.body.code}/join`, {})).status).toBe(403)
        expect((await bob.post('/api/duels/NOPE00/join', {})).status).toBe(404)
    })

    it('gives both players the same secret word', async () => {
        const { register, as, tick } = setup()
        const alice = as(await register('Alice'))
        const bob = as(await register('Bob'))
        const created = (await alice.post('/api/duels', { lang: 'en' })).body
        const joined = (await bob.post(`/api/duels/${created.code}/join`, {})).body
        const a = await playOut(alice, created.runId, tick)
        const b = await playOut(bob, joined.runId, tick)
        expect(a.revealed.answers).toEqual(b.revealed.answers)
    })

    it('hides the other result until the player has finished', async () => {
        const { register, as, tick } = setup()
        const alice = as(await register('Alice'))
        const bob = as(await register('Bob'))
        const created = (await alice.post('/api/duels', { lang: 'en' })).body
        const joined = (await bob.post(`/api/duels/${created.code}/join`, {})).body

        await playOut(alice, created.runId, tick)
        const early = (await bob.get(`/api/duels/${created.code}`)).body
        const alicePart = early.players.find((p) => p.username === 'Alice')
        expect(alicePart.finished).toBe(true)
        expect(alicePart.tries).toBeUndefined()
        expect(early.winner).toBeNull()

        await playOut(bob, joined.runId, tick)
        const done = (await bob.get(`/api/duels/${created.code}`)).body
        expect(done.players.every((p) => p.tries !== undefined)).toBe(true)
        expect(done.winner).not.toBeNull()
        expect(JSON.stringify(done)).not.toMatch(/word/i)
    })

    it('keeps outsiders out', async () => {
        const { register, as } = setup()
        const alice = as(await register('Alice'))
        const dan = as(await register('Dan'))
        const created = (await alice.post('/api/duels', { lang: 'en' })).body
        expect((await dan.get(`/api/duels/${created.code}`)).status).toBe(403)
    })

    it('expires after a week', async () => {
        const { register, as, tick } = setup()
        const alice = as(await register('Alice'))
        const bob = as(await register('Bob'))
        const created = (await alice.post('/api/duels', { lang: 'en' })).body
        tick(8 * 24 * 3600 * 1000)
        expect((await bob.post(`/api/duels/${created.code}/join`, {})).status).toBe(410)
    })
})
