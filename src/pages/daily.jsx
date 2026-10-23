import { useEffect, useState } from 'react'
import Game from '../components/game.jsx'
import Countdown from '../components/countdown.jsx'
import { loadWordLists } from '../game/words.js'
import roundScore, { scoreMultiplier } from '../game/score.js'
import { getDailyWord, getDailyProgress, saveDailyProgress, todayKey } from '../data/storage.js'
import { fetchDailyCount } from '../data/api.js'
import { GAME_MODES, DAILY } from '../config.js'

const { wordLength: WORD_LENGTH, maxTries: MAX_TRIES } = GAME_MODES.daily

export default function Daily({ game }) {
    const { mode, answers, guesses, maxTries, start, setGuesses, setScore } = game
    const [error, setError] = useState('')
    const [ready, setReady] = useState(false) // today's game is loaded (and restored if already started)
    const [alreadyDone, setAlreadyDone] = useState(false) // finished before this visit: result already saved
    const [foundCount, setFoundCount] = useState(null) // players who found today's word (null: not loaded)

    // load the words and start today's game, restoring the guesses if it was already started
    useEffect(() => {
        let cancelled = false // the page may be left before the word is loaded
        loadWordLists(WORD_LENGTH)
            .then(({ words, answers }) => {
                if (cancelled) return
                const word = getDailyWord(answers) // same word for everybody today
                const saved = getDailyProgress(todayKey())
                const won = saved.includes(word)
                start('daily', words, [word], MAX_TRIES)
                setGuesses(saved) // one attempt per day: pick up where the player left
                setScore(won ? roundScore(saved.length, MAX_TRIES, scoreMultiplier('daily', WORD_LENGTH)) : 0)
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

    // how many players found today's word: loaded now, then regularly
    // (it restarts from 0 with the new word, since the server only counts today's results)
    useEffect(() => {
        const load = () => fetchDailyCount().then(setFoundCount).catch(() => {})
        load()
        const refresh = setInterval(load, DAILY.countRefreshMs)
        // when the game just ended, reload once the player's own result has reached the server
        const afterResult = over ? setTimeout(load, DAILY.countDelayAfterResultMs) : null
        return () => {
            clearInterval(refresh)
            clearTimeout(afterResult)
        }
    }, [over])

    return (
        <section className="daily flex w-full flex-col items-center gap-6">
        <h2 className="page-title">Daily</h2>
        {error && <p className="notice">{error}</p>}
        {foundCount !== null && (
            <p className="border-[3px] border-ink bg-pink px-4 py-1 text-sm font-bold uppercase shadow-hard">
                {foundCount} {foundCount === 1 ? 'player' : 'players'} found today's word
            </p>
        )}
        {ready && mode === 'daily' && <Game game={game} saveResult={!alreadyDone} />}
        {ready && mode === 'daily' && over && <Countdown />}
        </section>
    )
}
