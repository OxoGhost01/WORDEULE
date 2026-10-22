import { useEffect, useState } from 'react'
import Game from '../components/game.jsx'
import Countdown from '../components/countdown.jsx'
import { loadWords } from '../game/words.js'
import roundScore from '../game/score.js'
import { getDailyWord, getDailyProgress, saveDailyProgress, todayKey } from '../data/storage.js'

const WORD_LENGTH = 5
const MAX_TRIES = 6

export default function Daily({ game }) {
    const { mode, answers, guesses, maxTries, start, setGuesses, setScore } = game
    const [error, setError] = useState('')
    const [ready, setReady] = useState(false) // today's game is loaded (and restored if already started)
    const [alreadyDone, setAlreadyDone] = useState(false) // finished before this visit: result already saved

    // load the words and start today's game, restoring the guesses if it was already started
    useEffect(() => {
        let cancelled = false // the page may be left before the word is loaded
        loadWords(WORD_LENGTH)
            .then((words) => {
                if (cancelled) return
                const word = getDailyWord(words) // same word for everybody today
                const saved = getDailyProgress(todayKey())
                const won = saved.includes(word)
                start('daily', words, [word], MAX_TRIES)
                setGuesses(saved) // one attempt per day: pick up where the player left
                setScore(won ? roundScore(saved.length, MAX_TRIES) : 0)
                setAlreadyDone(won || saved.length >= MAX_TRIES)
                setReady(true)
            })
            .catch((e) => { if (!cancelled) setError(e.message) })
        return () => { cancelled = true }
    }, [start, setGuesses, setScore])

    // keep the guesses of the day, so a refresh can't give a new attempt
    useEffect(() => {
        if (ready) saveDailyProgress(todayKey(), guesses)
    }, [ready, guesses])

    // game finished (won or out of tries): show the countdown
    const over = answers.length > 0 && (answers.every((a) => guesses.includes(a)) || guesses.length >= maxTries)

    return (
        <section className="daily flex w-full flex-col items-center gap-6">
        <h2 className="page-title">Daily</h2>
        {error && <p className="notice">{error}</p>}
        {ready && mode === 'daily' && <Game game={game} saveResult={!alreadyDone} />}
        {ready && mode === 'daily' && over && <Countdown />}
        </section>
    )
}
