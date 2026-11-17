import { describe, expect, it } from 'vitest'
import { buildLists, parseCommonWords, parseDictionary, pickAnswers, randomWords } from './words.js'

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

describe('parsers', () => {
    it('keeps the plain words of a dictionary, without accents or duplicates', () => {
        expect(parseDictionary(['été', 'ETE', "l'eau", 'chat'])).toEqual(['CHAT', 'ETE'])
    })

    it('reads the first token of each line, up to the limit', () => {
        expect(parseCommonWords('the 100\nof 90\nand 80', 2)).toEqual(['the', 'of'])
    })
})

describe('buildLists', () => {
    it('gives the valid words and the pool of one length', () => {
        const lists = buildLists(['CRANE', 'HOUSE', 'CAT'], ['house', 'cat'], 5)
        expect(lists.words).toEqual(['CRANE', 'HOUSE'])
        expect(lists.valid.has('CRANE')).toBe(true)
        expect(lists.pool).toEqual(['HOUSE'])
    })

    it('fails when no word has this length', () => {
        expect(() => buildLists(['CAT'], ['cat'], 5)).toThrow()
    })
})
