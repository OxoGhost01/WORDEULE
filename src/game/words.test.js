import { describe, expect, it } from 'vitest'
import { pickAnswers, randomWords } from './words.js'

describe('pickAnswers', () => {
    const common = ['CRANE', 'XYZZY', 'THE', 'CAT', 'HOUSE']
    const dictionary = ['CRANE', 'THE', 'CAT', 'HOUSE', 'MOUSE']

    it('keeps the common words of the right length', () => {
        expect(pickAnswers(common, dictionary, 5)).toEqual(['CRANE', 'HOUSE'])
        expect(pickAnswers(common, dictionary, 3)).toEqual(['THE', 'CAT'])
    })

    it('drops the common words that are not in the dictionary', () => {
        expect(pickAnswers(common, dictionary, 5)).not.toContain('XYZZY')
    })
})

describe('randomWords', () => {
    it('picks different words', () => {
        const picked = randomWords(['A', 'B', 'C', 'D', 'E'], 4)
        expect(picked).toHaveLength(4)
        expect(new Set(picked).size).toBe(4)
    })
})
