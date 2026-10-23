import { describe, expect, it } from 'vitest'
import { fixedLetters, requiredCounts, missingLetters, mergeRow } from './locked.js'

describe('locked mode', () => {
    it('locks the letters found at their place', () => {
        expect(fixedLetters(['CRATE'], 'CRANE')).toEqual(['C', 'R', 'A', null, 'E'])
    })

    it('requires the letters found at another place', () => {
        // SPEED against ABIDE: one E and the D are in the word
        expect(requiredCounts(['SPEED'], 'ABIDE')).toEqual({ E: 1, D: 1 })
    })

    it('lists what a guess still lacks', () => {
        const required = { E: 1, D: 1 }
        expect(missingLetters('ABIDE', required)).toEqual([])
        expect(missingLetters('XXXXX', required)).toEqual(['E', 'D'])
    })

    it('puts the typed letters in the free places, around the locked ones', () => {
        const fixed = ['C', null, null, null, 'E']
        expect(mergeRow(fixed, 'RAN', 5)).toBe('CRANE')
        expect(mergeRow(fixed, 'R', 5)).toBe('CR  E')
    })
})
