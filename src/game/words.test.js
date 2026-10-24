import { describe, expect, it } from 'vitest'
import { pickAnswers, randomWords } from './words.js'

describe('pickAnswers', () => {
    const dictionary = ['CRANE', 'THE', 'CAT', 'HOUSE', 'MOUSE']

    it('keeps the common words of the right length, without accents', () => {
        const common = ['crane', 'xyzzy', 'the', 'cat', 'house']
        expect(pickAnswers(common, dictionary, 5).pool).toEqual(['CRANE', 'HOUSE'])
        expect(pickAnswers(common, dictionary, 3).pool).toEqual(['CAT', 'THE'])
    })

    it('drops the common words that are not in the dictionary', () => {
        expect(pickAnswers(['crane', 'xyzzy'], dictionary, 5).pool).not.toContain('XYZZY')
    })

    it('finds a French word written with accents, and remembers how it is written', () => {
        const result = pickAnswers(['été', 'école', 'chat'], ['ETE', 'ECOLE', 'CHAT'], 5)
        expect(result.pool).toEqual(['ECOLE'])
        expect(result.display).toEqual({ ECOLE: 'ÉCOLE' })
    })

    it('keeps the most frequent spelling when two words only differ by their accents', () => {
        // "ou" comes before "où" in the list: it is the most frequent
        const result = pickAnswers(['ou', 'où'], ['OU'], 2)
        expect(result.display).toEqual({ OU: 'OU' })
    })
})

describe('randomWords', () => {
    it('picks different words', () => {
        const picked = randomWords(['A', 'B', 'C', 'D', 'E'], 4)
        expect(picked).toHaveLength(4)
        expect(new Set(picked).size).toBe(4)
    })
})
