import { describe, expect, it } from 'vitest'
import { normalize } from './text.js'

describe('normalize', () => {
    it('removes the accents and uppercases', () => {
        expect(normalize('été')).toBe('ETE')
        expect(normalize('français')).toBe('FRANCAIS')
        expect(normalize('où')).toBe('OU')
    })

    it('keeps a word without accent as it is, in uppercase', () => {
        expect(normalize('crane')).toBe('CRANE')
    })

    it('lets the other characters show, so a word with a hyphen can be refused', () => {
        expect(normalize('porte-clés')).toBe('PORTE-CLES')
    })
})
