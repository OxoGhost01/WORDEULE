import { useCallback, useEffect, useMemo } from 'react'
import roundScore from './score.js'
import evaluate from './evaluate.js'

// Typing logic on top of the state owned by Home: letters are appended, Backspace removes one,
// Enter submits a full-length guess that is in the word list of the game.
// Every guess is played on all the grids at once; the game is won when every answer was found.
// Returns the status and onKey(key), shared by the real keyboard and the virtual one:
// key is a letter, 'Backspace' or 'Enter'.
export default function useGame({ answers, words, guesses, setGuesses, guess, setGuess, setScore, maxTries }) {
    const validWords = useMemo(() => new Set(words), [words])
    const wordLength = answers[0]?.length
    const won = answers.length > 0 && answers.every((a) => guesses.includes(a))
    const status = answers.length === 0 ? 'idle' : won ? 'won' : guesses.length >= maxTries ? 'lost' : 'playing'

    const onKey = useCallback((key) => {
        if (status !== 'playing') return

        if (key === 'Backspace') {
            setGuess(guess.slice(0, -1))
        } else if (key === 'Enter') {
            if (guess.length !== wordLength || !validWords.has(guess)) return
            const next = [...guesses, guess]
            setGuesses(next)
            setGuess('')
            console.log(answers.map((a) => evaluate(guess, a)))
            console.log(answers)
            if (answers.every((a) => next.includes(a))) setScore((s) => s + roundScore(next.length, maxTries))
        } else if (/^[a-zA-Z]$/.test(key) && guess.length < wordLength) {
            setGuess(guess + key.toUpperCase())
        }
    }, [status, answers, wordLength, guesses, guess, maxTries, validWords, setGuesses, setGuess, setScore])

    useEffect(() => {
        function onKeyDown(e) {
            if (e.ctrlKey || e.metaKey || e.altKey) return
            onKey(e.key)
        }

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [onKey])

    return { status, onKey }
}
