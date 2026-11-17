import { describe, expect, it } from 'vitest'
import evaluate, { allSolved, gridSolved, letterStatuses, shownRows } from './evaluate.js'

const row = (guess, word) => ({ guess, results: [evaluate(guess, word)] })

describe('evaluate', () => {
    it('marks every letter correct when the guess is the word', () => {
        expect(evaluate('CRANE', 'CRANE')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct'])
    })

    it('marks every letter absent when none is in the word', () => {
        expect(evaluate('BUMPY', 'CRANE')).toEqual(['absent', 'absent', 'absent', 'absent', 'absent'])
    })

    it('colors only one copy of a letter that is twice in the guess but once in the word', () => {
        expect(evaluate('SPEED', 'ABIDE')).toEqual(['absent', 'absent', 'present', 'absent', 'present'])
    })

    it('gives the only copy of a letter to the green one first', () => {
        expect(evaluate('EERIE', 'CRANE')).toEqual(['absent', 'absent', 'present', 'absent', 'correct'])
    })

    it('colors every copy of a letter that is twice in the word', () => {
        expect(evaluate('LLAMA', 'ALLOY')).toEqual(['present', 'correct', 'present', 'absent', 'absent'])
    })
})

describe('letterStatuses', () => {
    it('keeps the best status of each letter', () => {
        expect(letterStatuses([row('SPEED', 'ABIDE')], 0)).toEqual({ S: 'absent', P: 'absent', E: 'present', D: 'present' })
    })
})

describe('shownRows', () => {
    it('ignores the rows played after the word was found', () => {
        const rows = [row('AAAAA', 'CRANE'), row('CRANE', 'CRANE'), row('ZZZZZ', 'CRANE')]
        expect(shownRows(rows, 0)).toHaveLength(2)
    })
})

describe('solved grids', () => {
    it('finds a solved grid among several', () => {
        const rows = [{ guess: 'CRANE', results: [evaluate('CRANE', 'CRANE'), evaluate('CRANE', 'HOUSE')] }]
        expect(gridSolved(rows, 0)).toBe(true)
        expect(gridSolved(rows, 1)).toBe(false)
        expect(allSolved(rows, 2)).toBe(false)
    })
})
