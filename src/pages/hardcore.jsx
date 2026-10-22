// Hardcore: 4 grids played at once, same guesses on all of them
import { useEffect, useState } from 'react'
import Game from '../components/game.jsx'
import { loadWords, randomWords } from '../game/words.js'

const WORD_LENGTH = 5
const MAX_TRIES = 9
const WORD_COUNT = 4 // grids played at the same time

export default function Hardcore({ game }) {
    const { mode, start } = game
    const [error, setError] = useState('')

    async function launch(keepScore = false) {
        try {
            const words = await loadWords(WORD_LENGTH)
            start('hardcore', words, randomWords(words, WORD_COUNT), MAX_TRIES, keepScore)
        } catch (e) {
            setError(e.message)
        }
    }

    useEffect(() => {
        let cancelled = false // the page may be left before the word is loaded
        loadWords(WORD_LENGTH)
            .then((words) => { if (!cancelled) start('hardcore', words, randomWords(words, WORD_COUNT), MAX_TRIES) })
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
