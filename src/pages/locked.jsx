import { useEffect, useState } from 'react'
import Game from '../components/game.jsx'
import { loadWords, randomWord } from '../game/words.js'

const WORD_LENGTH = 5
const MAX_TRIES = 6

export default function Locked({ game }) {
    const { mode, start } = game
    const [error, setError] = useState('')

    // start a game with a new word (keepScore: a win goes on with the same score)
    async function launch(keepScore = false) {
        try {
            const words = await loadWords(WORD_LENGTH)
            start('locked', words, [randomWord(words)], MAX_TRIES, keepScore)
        } catch (e) {
            setError(e.message)
        }
    }

    // start a game as soon as the page opens
    useEffect(() => {
        let cancelled = false // the page may be left before the word is loaded
        loadWords(WORD_LENGTH)
            .then((words) => { if (!cancelled) start('locked', words, [randomWord(words)], MAX_TRIES) })
            .catch((e) => { if (!cancelled) setError(e.message) })
        return () => { cancelled = true }
    }, [start])

    // Locked: letters found at their place stay locked there (pre-filled on every new line),
    // letters found elsewhere must be used. Endless like classic: a win keeps the score and gives a new word,
    // a loss starts over from 0
    return (
        <section className="locked flex w-full flex-col items-center gap-6">
        <h2 className="page-title">Locked</h2>
        {error && <p className="notice">{error}</p>}
        {mode === 'locked' && (
            <Game game={game} onNext={() => launch(true)} onRestart={() => launch()} />
        )}
        </section>
    )
}
