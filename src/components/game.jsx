import { useEffect, useRef, useState } from 'react'
import Grid from './grid.jsx'
import useGame from '../game/useGame.js'
import Keyboard from './keyboard.jsx'
import Wiki from '../components/wiki.jsx'
import { saveScore, todayKey } from '../data/storage.js'
import shareText from '../game/share.js'
import { sendScore } from '../data/api.js'
import useLanguage from '../i18n/useLanguage.js'

// One round: grid + typing + end message. onNext (after a win) and onRestart (after a loss) are optional.
// saveResult false: the finished game is only displayed (daily game restored after a refresh), not saved again.
export default function Game({ game, onNext, onRestart, saveResult = true }) {
    const { t } = useLanguage()
    const { mode, lang, answers, display, guesses, score, maxTries } = game // lang: language of this game
    const { status, onKey, row, fixed, required, feedback } = useGame(game)
    const savedResult = useRef(false)

    // save the result once, when the game ends (the flag is reset when a new game starts)
    useEffect(() => {
        if (status === 'playing' || status === 'idle') {
            savedResult.current = false
        } else if (!savedResult.current) {
            if (saveResult) sendScore(saveScore({ mode, lang, score, outcome: status, tries: guesses.length }))
            savedResult.current = true
        }
    }, [mode, lang, score, status, saveResult, guesses.length, answers])

    const over = status === 'won' || status === 'lost'

    // the words are compared without accents, but shown with their accents
    const spelled = (word) => display[word] ?? word
    const missed = answers.filter((a) => !guesses.includes(a)).map(spelled)

    // text to share (colors only, no letters); copiedText remembers which text was copied
    const [copiedText, setCopiedText] = useState('')
    const title = `${lang.toUpperCase()} ${t(`modes.${mode}`)}${mode === 'daily' ? ` ${todayKey()}` : ''}`
    const text = over ? shareText(title, answers, guesses, maxTries) : ''
    // on a phone (touch screen): the native share sheet. Elsewhere (computers) it is not good: Chrome on Windows
    // would only copy the link. So the text and the link are copied.
    async function share() {
        const message = `${text}\n${window.location.origin}` // the link is in the text, some apps ignore a separate link
        const onPhone = navigator.share && window.matchMedia('(pointer: coarse)').matches
        if (onPhone) {
            try {
                await navigator.share({ title: 'WORDEULE', text: message })
            } catch {
                // the player closed the share sheet
            }
            return
        }
        try {
            await navigator.clipboard.writeText(message)
            setCopiedText(text)
        } catch {
            setCopiedText('') // clipboard not allowed
        }
    }

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
                {feedback.text && <p className="notice">{t(feedback.text)}</p>}
                {required.length > 0 && !over && (
                    <p key={feedback.pulse} className={`flex items-center gap-2 text-sm font-bold uppercase ${feedback.alert ? 'shake' : ''}`}>
                        {t('game.mustUse')}
                        {required.map((letter, i) => (
                            <span key={i} className={`grid size-7 place-items-center border-2 border-ink bg-sun font-display ${feedback.alert ? 'flash' : ''}`}>{letter}</span>
                        ))}
                    </p>
                )}
            </div>
            <Keyboard answers={answers} guesses={guesses} onKey={onKey} />
            {over && (
                <div className="flex flex-col items-center gap-4">
                    {status === 'won' && <p className="stamp border-cobalt text-cobalt">{t('game.won', { tries: guesses.length, max: maxTries })}</p>}
                    {status === 'lost' && <p className="stamp border-pink text-pink">{t(answers.length > 1 ? 'game.lostMany' : 'game.lostOne', { words: missed.join(', ') })}</p>}
                    <p className="font-display text-2xl font-extrabold uppercase">{t('game.score', { score })}</p>
                    {status === 'won' && onNext && <button className="btn" onClick={onNext}>{t('game.next')}</button>}
                    <button className="btn bg-card" onClick={share}>{copiedText === text ? t('game.copied') : t('game.share')}</button>
                    {status === 'lost' && onRestart && <button className="btn bg-pink" onClick={onRestart}>{t('game.newGame')}</button>}
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                        {answers.map((word) => <Wiki key={word} word={spelled(word)} />)}
                    </div>
                </div>
            )}
        </div>
    )
}
