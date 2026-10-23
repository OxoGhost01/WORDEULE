// Hardcore: 4 grids played at once, same guesses on all of them
import { useEffect, useState } from 'react'
import Game from '../components/game.jsx'
import { loadWordLists, randomWords } from '../game/words.js'
import { GAME_MODES } from '../config.js'

const { wordLength: WORD_LENGTH, maxTries: MAX_TRIES, grids: WORD_COUNT } = GAME_MODES.hardcore // WORD_COUNT: grids played at the same time

export default function Hardcore({ game }) {
    const { mode, start } = game
    const [error, setError] = useState('')

    // start a game with a new word (keepScore: a win goes on with the same score)
    async function launch(keepScore = false) {
        try {
            const { words, answers } = await loadWordLists(WORD_LENGTH)
            start('hardcore', words, randomWords(answers, WORD_COUNT), MAX_TRIES, keepScore)
        } catch (e) {
            setError(e.message)
        }
    }

    // start a game as soon as the page opens
    useEffect(() => {
        let cancelled = false // the page may be left before the word is loaded
        loadWordLists(WORD_LENGTH)
            .then(({ words, answers }) => { if (!cancelled) start('hardcore', words, randomWords(answers, WORD_COUNT), MAX_TRIES) })
            .catch((e) => { if (!cancelled) setError(e.message) })
        return () => { cancelled = true }
    }, [start])

    // infinite mode: a win keeps the score and gives 4 new words, a loss starts over from 0
    return (
        <section className="hardcore flex w-full flex-col items-center gap-6">
        <h2 className="page-title">Hardcore</h2>
        {error && <p className="notice">{error}</p>}
        {mode === 'hardcore' && (
            <Game game={game} onNext={() => launch(true)} onRestart={() => launch()} />
        )}
        </section>
    )
}
