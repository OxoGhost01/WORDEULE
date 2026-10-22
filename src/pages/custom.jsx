import { useState } from 'react'
import Game from '../components/game.jsx'
import { loadWords, randomWords } from '../game/words.js'

const MIN = 3
const MAX = 10

export default function Custom({ game }) {
    const { mode, start } = game

    const [started, setStarted] = useState(false) // false: difficulty selector, true: game
    const [wordLength, setWordLength] = useState(5)
    const [maxTries, setMaxTries] = useState(6)
    const [wordCount, setWordCount] = useState(1)
    const [error, setError] = useState('')

    const valid = [wordLength, maxTries, wordCount].every((n) => Number.isInteger(n) && n >= (n === wordCount ? 1 : MIN) && n <= MAX)

    async function launch(keepScore = false) {
        try {
            const words = await loadWords(wordLength)
            start('custom', words, randomWords(words, wordCount), maxTries, keepScore)
            setError('')
            setStarted(true)
        } catch (e) {
            setError(e.message) // no word list for this length
        }
    }

    // infinite mode like classic: a win keeps the score and gives a new word, a loss starts over from 0
    return (
        <section className="custom flex w-full flex-col items-center gap-6">
        <h2 className="page-title">Custom</h2>
        {!started && (
            <form className="flex w-full max-w-md flex-col gap-5 border-[3px] border-ink bg-card p-6 shadow-hard-lg" onSubmit={(e) => { e.preventDefault(); launch() }}>
                <label className="flex flex-col gap-1 text-sm font-bold uppercase">
                    Word length
                    <input className="field" type="number" min={MIN} max={MAX} value={wordLength} onChange={(e) => setWordLength(Number(e.target.value))} />
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold uppercase">
                    Max tries
                    <input className="field" type="number" min={MIN} max={MAX} value={maxTries} onChange={(e) => setMaxTries(Number(e.target.value))} />
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold uppercase">
                    Number of grids
                    <input className="field" type="number" min={1} max={MAX} value={wordCount} onChange={(e) => setWordCount(Number(e.target.value))} />
                </label>
                <button className="btn" type="submit" disabled={!valid}>Start</button>
                {error && <p className="notice">{error}</p>}
            </form>
        )}
        {started && mode === 'custom' && (
            <>
                <Game game={game} onNext={() => launch(true)} onRestart={() => launch()} />
                <button className="btn bg-card" onClick={() => setStarted(false)}>Change difficulty</button>
            </>
        )}
        </section>
    )
}
