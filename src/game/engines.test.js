import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildLists } from '../../shared/words.js'

const WORDS = ['CRANE', 'SLATE', 'HOUSE', 'MOUSE', 'ABIDE']

vi.mock('./words.js', () => ({
    listsLoader: () => async (length) => buildLists(WORDS, WORDS.map((w) => w.toLowerCase()), length),
}))

const { startLocal, remoteEngine } = await import('./engines.js')

afterEach(() => vi.unstubAllGlobals())

describe('localEngine', () => {
    it('plays a round from the colored rows', async () => {
        const { engine, view } = await startLocal({ mode: 'classic', lang: 'en' })
        expect(view.rows).toEqual([])
        const next = await engine.submit('CRANE')
        expect(next.rows).toHaveLength(1)
        expect(next.rows[0].results[0]).toHaveLength(5)
    })

    it('refuses a word that is not in the list', async () => {
        const { engine } = await startLocal({ mode: 'classic', lang: 'en' })
        await expect(engine.submit('ZZZZZ')).rejects.toMatchObject({ code: 'notInList' })
    })

    it('goes on to the next word after a win', async () => {
        const { engine, view } = await startLocal({ mode: 'classic', lang: 'en' })
        let state = view
        for (const word of WORDS) {
            state = await engine.submit(word)
            if (state.status === 'won') break
        }
        expect(state.status).toBe('won')
        const next = await engine.next()
        expect(next.status).toBe('playing')
        expect(next.score).toBe(state.score)
    })
})

describe('remoteEngine', () => {
    function stubFetch(status, body) {
        vi.stubGlobal('fetch', vi.fn(async () => ({ ok: status < 400, status, json: async () => body })))
    }

    it('returns the view sent by the server', async () => {
        stubFetch(200, { rows: [], status: 'playing' })
        const engine = remoteEngine('abc')
        expect(await engine.submit('CRANE')).toMatchObject({ status: 'playing' })
    })

    it('turns a rule error into a game error', async () => {
        stubFetch(422, { error: 'notInList' })
        await expect(remoteEngine('abc').submit('ZZZZZ')).rejects.toMatchObject({ code: 'notInList' })
    })

    it('reports a connection problem when the server is down', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('network') }))
        await expect(remoteEngine('abc').submit('CRANE')).rejects.toMatchObject({ code: 'connection' })
    })

    it('reports a connection problem on a server error', async () => {
        stubFetch(500, { error: 'server' })
        await expect(remoteEngine('abc').next()).rejects.toMatchObject({ code: 'connection' })
    })
})
