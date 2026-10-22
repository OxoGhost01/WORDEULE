import { useEffect, useRef } from 'react'
import Grid from './grid.jsx'
import useGame from '../game/useGame.js'
import Keyboard from './keyboard.jsx'
import Wiki from '../components/wiki.jsx'
import { saveScore } from '../data/storage.js'
import { sendScore } from '../data/api.js'

// One round: grid + typing + end message. onNext (after a win) and onRestart (after a loss) are optional.
// saveResult false: the finished game is only displayed (daily game restored after a refresh), not saved again.
export default function Game({ game, onNext, onRestart, saveResult = true }) {
    const { mode, answers, guesses, score, maxTries } = game
    const { status, onKey, row, fixed, required, feedback } = useGame(game)
    const savedResult = useRef(false)

    // save the result once, when the game ends (the flag is reset when a new game starts)
    useEffect(() => {
        if (status === 'playing' || status === 'idle') {
            savedResult.current = false
        } else if (!savedResult.current) {
            if (saveResult) sendScore(saveScore({ mode, score, outcome: status, tries: guesses.length }))
            savedResult.current = true
        }
    }, [mode, score, status, saveResult, guesses.length])

    const over = status === 'won' || status === 'lost'
    // one grid fills the width, several grids share it; a single grid never gets taller than the screen
    const gridWidth = answers.length === 1
        ? `max(9rem, min(100%, 22rem, calc((100dvh - 26rem) * ${(answers[0]?.length ?? 5) / maxTries})))`
        : '12.5rem'

    // grids, then messages, keyboard, and the end of game block
    return (
        <div className="flex w-full flex-col items-center gap-6">
            <div className="flex w-full max-w-6xl flex-wrap justify-center gap-x-6 gap-y-6">
                {answers.map((word) => (
                    <Grid key={word} guesses={guesses} guess={row} word={word} maxTries={maxTries} width={gridWidth} fixed={fixed} shake={feedback} />
                ))}
            </div>
            {/* refused word message, and the letters the locked mode asks to use */}
            <div className="flex min-h-9 flex-col items-center gap-2">
                {feedback.text && <p className="notice">{feedback.text}</p>}
                {required.length > 0 && !over && (
                    <p key={feedback.pulse} className={`flex items-center gap-2 text-sm font-bold uppercase ${feedback.alert ? 'shake' : ''}`}>
                        Must use
                        {required.map((letter, i) => (
                            <span key={i} className={`grid size-7 place-items-center border-2 border-ink bg-sun font-display ${feedback.alert ? 'flash' : ''}`}>{letter}</span>
                        ))}
                    </p>
                )}
            </div>
            <Keyboard answers={answers} guesses={guesses} onKey={onKey} />
            {over && (
                <div className="flex flex-col items-center gap-4">
                    {status === 'won' && <p className="stamp border-cobalt text-cobalt">Won in {guesses.length} / {maxTries}</p>}
                    {status === 'lost' && <p className="stamp border-pink text-pink">Lost, the {answers.length > 1 ? 'words were' : 'word was'} {answers.filter((a) => !guesses.includes(a)).join(', ')}</p>}
                    <p className="font-display text-2xl font-extrabold uppercase">Score: {score}</p>
                    {status === 'won' && onNext && <button className="btn" onClick={onNext}>Next word</button>}
                    {status === 'lost' && onRestart && <button className="btn bg-pink" onClick={onRestart}>New game</button>}
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                        {answers.map((word) => <Wiki key={word} word={word} />)}
                    </div>
                </div>
            )}
        </div>
    )
}
