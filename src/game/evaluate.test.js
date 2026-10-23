import { describe, expect, it } from 'vitest'
import evaluate, { letterStatuses, shownGuesses } from './evaluate.js'

describe('evaluate', () => {
    it('marks every letter correct when the guess is the word', () => {
        expect(evaluate('CRANE', 'CRANE')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct'])
    })

    it('marks every letter absent when none is in the word', () => {
        expect(evaluate('BUMPY', 'CRANE')).toEqual(['absent', 'absent', 'absent', 'absent', 'absent'])
    })

    // duplicate in the guess, one copy in the word: only one E can be yellow
    it('colors only one copy of a letter that is twice in the guess but once in the word', () => {
        expect(evaluate('SPEED', 'ABIDE')).toEqual(['absent', 'absent', 'present', 'absent', 'present'])
    })

    // the green E at the end has priority over the E's at the start
    it('gives the only copy of a letter to the green one first', () => {
        expect(evaluate('EERIE', 'CRANE')).toEqual(['absent', 'absent', 'present', 'absent', 'correct'])
    })

    // duplicate in the word: both L's of ALLOY can be found
    it('colors every copy of a letter that is twice in the word', () => {
        expect(evaluate('LLAMA', 'ALLOY')).toEqual(['present', 'correct', 'present', 'absent', 'absent'])
    })
})

describe('letterStatuses', () => {
    it('keeps the best status of each letter', () => {
        // E is yellow once and black once in SPEED: it stays yellow
        expect(letterStatuses(['SPEED'], 'ABIDE')).toEqual({ S: 'absent', P: 'absent', E: 'present', D: 'present' })
    })
})

describe('shownGuesses', () => {
    it('ignores the guesses played after the word was found', () => {
        expect(shownGuesses(['AAAAA', 'CRANE', 'ZZZZZ'], 'CRANE')).toEqual(['AAAAA', 'CRANE'])
    })
})
