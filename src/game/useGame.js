import { useCallback, useEffect, useMemo, useState } from 'react'
import roundScore from './score.js'
import evaluate from './evaluate.js'
import { fixedLetters, requiredCounts, missingLetters, mergeRow } from './locked.js'

// Typing logic on top of the state owned by Home: letters are appended, Backspace removes one,
// Enter submits a full-length guess that is in the word list of the game.
// Every guess is played on all the grids at once; the game is won when every answer was found.
// Returns what the screen needs:
// - status, and onKey(key) shared by the real keyboard and the virtual one (a letter, 'Backspace' or 'Enter')
// - row: the line being typed, as displayed (in locked mode it includes the locked letters, ' ' = empty)
// - fixed: the locked letters of that line, required: the letters it still must use (the ones already
//   placed on the line are not listed)
// - feedback: { n, row, text, alert, pulse }: n increases each time a word is refused (to shake the line);
//   alert/pulse: the player tried to submit without the required letters (to flash them)
export default function useGame({ mode, answers, words, guesses, setGuesses, guess, setGuess, setScore, maxTries }) {
    const validWords = useMemo(() => new Set(words), [words])
    const wordLength = answers[0]?.length
    const won = answers.length > 0 && answers.every((a) => guesses.includes(a))
    const status = answers.length === 0 ? 'idle' : won ? 'won' : guesses.length >= maxTries ? 'lost' : 'playing'

    const locked = mode === 'locked' && answers.length > 0
    const fixed = useMemo(() => (locked ? fixedLetters(guesses, answers[0]) : []), [locked, guesses, answers])
    const requiredByLetter = useMemo(() => (locked ? requiredCounts(guesses, answers[0]) : {}), [locked, guesses, answers])
    const typedLength = wordLength - fixed.filter(Boolean).length // letters the player types on this line
    const row = locked ? mergeRow(fixed, guess, wordLength) : guess
    const required = missingLetters(row.replace(/ /g, ''), requiredByLetter)
    const missingRequired = required.length > 0

    const [feedback, setFeedback] = useState({ n: 0, row: -1, text: '', alert: false, pulse: 0 })

    const onKey = useCallback((key) => {
        if (status !== 'playing') return

        const refuse = (text) => setFeedback((f) => ({ n: f.n + 1, row: guesses.length, text }))
        const clearText = () => setFeedback((f) => (f.text || f.alert ? { ...f, text: '', alert: false } : f))

        if (key === 'Backspace') {
            clearText()
            setGuess(guess.slice(0, -1))
        } else if (key === 'Enter') {
            if (guess.length !== typedLength) return refuse('Not enough letters')
            if (!validWords.has(row)) return refuse('Not in the word list')
            if (locked && missingRequired) {
                // no message: the "must use" letters flash instead
                return setFeedback((f) => ({ ...f, alert: true, pulse: f.pulse + 1 }))
            }
            const next = [...guesses, row]
            setGuesses(next)
            setGuess('')
            clearText()
            console.log(answers.map((a) => evaluate(row, a)))
            console.log(answers)
            if (answers.every((a) => next.includes(a))) setScore((s) => s + roundScore(next.length, maxTries))
        } else if (/^[a-zA-Z]$/.test(key) && guess.length < typedLength) {
            clearText()
            setGuess(guess + key.toUpperCase())
        }
    }, [status, answers, typedLength, locked, row, missingRequired, guesses, guess, maxTries, validWords, setGuesses, setGuess, setScore])

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
