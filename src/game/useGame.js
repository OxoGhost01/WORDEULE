import { useCallback, useEffect, useMemo, useState } from 'react'
import roundScore, { scoreMultiplier } from './score.js'
import evaluate from './evaluate.js'
import { fixedLetters, requiredCounts, missingLetters, mergeRow } from './locked.js'

// Rules and typing of a game, working on the state of Home (the `game` object).
// Returns the status (idle, playing, won, lost), onKey for both keyboards, and what the grid needs to display.
export default function useGame({ mode, answers, words, guesses, setGuesses, guess, setGuess, setScore, maxTries }) {
    const validWords = useMemo(() => new Set(words), [words]) // a Set to check a word quickly
    const wordLength = answers[0]?.length
    // won when every grid's word has been found
    const won = answers.length > 0 && answers.every((a) => guesses.includes(a))
    const status = answers.length === 0 ? 'idle' : won ? 'won' : guesses.length >= maxTries ? 'lost' : 'playing'

    const locked = mode === 'locked' && answers.length > 0
    const fixed = useMemo(() => (locked ? fixedLetters(guesses, answers[0]) : []), [locked, guesses, answers]) // locked mode: the letters already guessed
    const requiredByLetter = useMemo(() => (locked ? requiredCounts(guesses, answers[0]) : {}), [locked, guesses, answers])
    const typedLength = wordLength - fixed.filter(Boolean).length // letters the player types on this line
    const row = locked ? mergeRow(fixed, guess, wordLength) : guess // the line where the player types
    const required = missingLetters(row.replace(/ /g, ''), requiredByLetter)
    const missingRequired = required.length > 0

    const [feedback, setFeedback] = useState({ n: 0, row: -1, text: '', alert: false, pulse: 0 }) // n increases each time a word is refused (to shake the line); alert/pulse: the player tried to submit without the required letters (to flash them)

    const onKey = useCallback((key) => {
        if (status !== 'playing') return

        // refuse a word: shake the line and show a message
        const refuse = (text) => setFeedback((f) => ({ n: f.n + 1, row: guesses.length, text }))
        const clearText = () => setFeedback((f) => (f.text || f.alert ? { ...f, text: '', alert: false } : f))

        if (key === 'Backspace') {
            clearText()
            setGuess(guess.slice(0, -1))
        } else if (key === 'Enter') {
            // the word must be complete, then a real word
            if (guess.length !== typedLength) return refuse('Not enough letters')
            if (!validWords.has(row)) return refuse('Not in the word list')
            if (locked && missingRequired) { 
                // logic specific to the locked mode
                // no message: the "must use" letters flash instead
                return setFeedback((f) => ({ ...f, alert: true, pulse: f.pulse + 1 }))
            }
            // accepted: it is played on every grid
            const next = [...guesses, row]
            setGuesses(next)
            setGuess('')
            clearText()
            // all words found: points depend on the number of tries and on the difficulty of the mode
            if (answers.every((a) => next.includes(a))) {
                setScore((s) => s + roundScore(next.length, maxTries, scoreMultiplier(mode, wordLength, answers.length)))
            }
        } else if (/^[a-zA-Z]$/.test(key) && guess.length < typedLength) {
            clearText()
            setGuess(guess + key.toUpperCase())
        }
    }, [status, mode, wordLength, answers, typedLength, locked, row, missingRequired, guesses, guess, maxTries, validWords, setGuesses, setGuess, setScore])

    // real keyboard: every key goes to onKey (the virtual keyboard calls it too)
    useEffect(() => {
        function onKeyDown(e) {
            if (e.ctrlKey || e.metaKey || e.altKey) return
            onKey(e.key)
        }

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [onKey])

    return { status, onKey, row, fixed, required, feedback }
}
