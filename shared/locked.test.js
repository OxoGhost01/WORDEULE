import { describe, expect, it } from 'vitest'
import evaluate from './evaluate.js'
import { fixedLetters, lockedError, mergeRow, missingLetters, requiredCounts } from './locked.js'

const row = (guess, word) => ({ guess, results: [evaluate(guess, word)] })

describe('locked mode', () => {
    it('locks the letters found at their place', () => {
        expect(fixedLetters([row('CRATE', 'CRANE')], 5)).toEqual(['C', 'R', 'A', null, 'E'])
    })

    it('requires the letters found at another place', () => {
        expect(requiredCounts([row('SPEED', 'ABIDE')])).toEqual({ E: 1, D: 1 })
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

    it('refuses a guess that moves a locked letter or forgets a required one', () => {
        const rows = [row('CRATE', 'CRANE')]
        expect(lockedError(rows, 'CRANE')).toBeNull()
        expect(lockedError(rows, 'BRAKE')).toBe('lockedLetters')
        expect(lockedError([row('SPEED', 'ABIDE')], 'ABIDE')).toBeNull()
        expect(lockedError([row('SPEED', 'ABIDE')], 'XXXXX')).toBe('mustUse')
    })
})
