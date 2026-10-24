import { useEffect, useState } from 'react'
import Game from '../components/game.jsx'
import Countdown from '../components/countdown.jsx'
import { loadWordLists } from '../game/words.js'
import roundScore, { scoreMultiplier } from '../game/score.js'
import { getDailyWord, getDailyProgress, saveDailyProgress, todayKey } from '../data/storage.js'
import { fetchDailyCount } from '../data/api.js'
import { GAME_MODES, DAILY } from '../config.js'
import useLanguage from '../i18n/useLanguage.js'

const { wordLength: WORD_LENGTH, maxTries: MAX_TRIES } = GAME_MODES.daily

export default function Daily({ game }) {
    const { lang, t } = useLanguage()
    const { mode, answers, guesses, maxTries, start, setGuesses, setScore } = game
    const [failed, setFailed] = useState(false) // the words could not be loaded
    const [ready, setReady] = useState(false) // today's game is loaded (and restored if already started)
    const [alreadyDone, setAlreadyDone] = useState(false) // finished before this visit: result already saved
    const [foundCount, setFoundCount] = useState(null) // players who found today's word (null: not loaded)

    // load the words of the language and start today's game, restoring the guesses if it was already started.
    // Each language has its own daily word, and its own attempt.
    useEffect(() => {
        let cancelled = false // the page may be left before the word is loaded
        loadWordLists(WORD_LENGTH, lang)
            .then(({ words, pool, display }) => {
                if (cancelled) return
                const word = getDailyWord(pool) // same word for everybody today
                const saved = getDailyProgress(todayKey(), lang)
                const won = saved.includes(word)
                start({ mode: 'daily', words, display, answers: [word], maxTries: MAX_TRIES })
                setGuesses(saved) // one attempt per day: pick up where the player left
                setScore(won ? roundScore(saved.length, MAX_TRIES, scoreMultiplier('daily', WORD_LENGTH)) : 0)
                setAlreadyDone(won || saved.length >= MAX_TRIES)
                setReady(true)
            })
            .catch(() => { if (!cancelled) setFailed(true) })
        return () => { cancelled = true }
    }, [lang, start, setGuesses, setScore])

    // keep the guesses of the day, so a refresh can't give a new attempt
    useEffect(() => {
        if (ready) saveDailyProgress(todayKey(), guesses, lang)
    }, [ready, guesses, lang])

    // game finished (won or out of tries): show the countdown
    const over = answers.length > 0 && (answers.every((a) => guesses.includes(a)) || guesses.length >= maxTries)

    // how many players found today's word in this language: loaded now, then regularly
    // (it restarts from 0 with the new word, since the server only counts today's results)
    useEffect(() => {
        const load = () => fetchDailyCount(lang).then(setFoundCount).catch(() => {})
        load()
        const refresh = setInterval(load, DAILY.countRefreshMs)
        // when the game just ended, reload once the player's own result has reached the server
        const afterResult = over ? setTimeout(load, DAILY.countDelayAfterResultMs) : null
        return () => {
            clearInterval(refresh)
            clearTimeout(afterResult)
        }
    }, [lang, over])

    return (
        <section className="daily flex w-full flex-col items-center gap-6">
        <h2 className="page-title">{t('modes.daily')}</h2>
        {failed && <p className="notice">{t('errors.words')}</p>}
        {foundCount !== null && (
            <p className="border-[3px] border-ink bg-pink px-4 py-1 text-sm font-bold uppercase shadow-hard">
                {t(foundCount === 1 ? 'daily.foundOne' : 'daily.foundMany', { count: foundCount })}
            </p>
        )}
        {ready && mode === 'daily' && game.lang === lang && <Game game={game} saveResult={!alreadyDone} />}
        {ready && mode === 'daily' && game.lang === lang && over && <Countdown />}
        </section>
    )
}
