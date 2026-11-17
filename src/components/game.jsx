import { useEffect, useRef, useState } from 'react'
import Grid from './grid.jsx'
import Pattern from './pattern.jsx'
import useGame from '../game/useGame.js'
import Keyboard from './keyboard.jsx'
import Wiki from '../components/wiki.jsx'
import { saveScore, todayKey } from '../data/storage.js'
import shareText from '../game/share.js'
import { gridSolved } from '../../shared/evaluate.js'
import useLanguage from '../i18n/useLanguage.js'

export default function Game({ game, onNext, onRestart, saveResult = true, endless = true }) {
    const { t } = useLanguage()
    const { mode, lang, rows, grids, wordLength, maxTries, status, score, words, revealed, pattern, notice } = game
    const { onKey, row, fixed, required, feedback, pending } = useGame(game)
    const savedResult = useRef(false)

    useEffect(() => {
        if (status === 'playing' || status === 'idle') {
            savedResult.current = false
        } else if (!savedResult.current) {
            if (saveResult) saveScore({ mode, lang, score, outcome: status, tries: rows.length, words, guesses: rows.map((r) => r.guess) })
            savedResult.current = true
        }
    }, [mode, lang, score, words, status, saveResult, rows])

    const over = status === 'won' || status === 'lost' || status === 'over'

    const spelled = (word) => revealed?.display[word] ?? word
    const answers = revealed?.answers ?? []
    const missed = answers.filter((_, grid) => !gridSolved(rows, grid)).map(spelled)
    const solved = status === 'won'

    const [copiedText, setCopiedText] = useState('')
    const title = `${lang.toUpperCase()} ${t(`modes.${mode}`)}${mode === 'daily' ? ` ${todayKey()}` : ''}`
    const text = over ? shareText(title, rows, grids, maxTries, solved) : ''
    async function share() {
        const message = `${text}\n${window.location.origin}`
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
            setCopiedText('')
        }
    }

    const gridWidth = grids === 1
        ? `max(9rem, min(100%, 22rem, calc((100dvh - 26rem) * ${wordLength / maxTries})))`
        : '12.5rem'

    const lastRow = rows[rows.length - 1]
    const announcement = lastRow
        ? `${lastRow.guess}: ${lastRow.results.map((statuses) => statuses.map((s, i) => `${lastRow.guess[i]} ${t(`status.${s}`)}`).join(', ')).join(' / ')}`
        : ''

    return (
        <div className="flex w-full flex-col items-center gap-6">
            <p className="sr-only" aria-live="polite">{announcement}</p>
            {notice && <p className="notice">{t(notice)}</p>}
            {mode === 'reverse' && pattern && (
                <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-bold uppercase">{t('reverse.word')}</p>
                    <div className="flex gap-1" style={{ width: '14rem' }}>
                        {[...(game.target ?? '')].map((letter, i) => (
                            <span key={i} className="tile" style={{ '--r': '0deg' }}><b>{letter}</b></span>
                        ))}
                    </div>
                    <p className="text-sm font-bold uppercase">{t('reverse.target')}</p>
                    <Pattern pattern={pattern} />
                </div>
            )}
            <div className="flex w-full max-w-6xl flex-wrap justify-center gap-x-6 gap-y-6">
                {Array.from({ length: grids }, (_, grid) => (
                    <Grid key={`${game.number}-${grid}`} rows={rows} grid={grid} guess={row} wordLength={wordLength} maxTries={maxTries} width={gridWidth} fixed={fixed} shake={feedback} finished={over} />
                ))}
            </div>
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
            <Keyboard rows={rows} grids={grids} onKey={pending ? () => {} : onKey} />
            {over && (
                <div className="flex flex-col items-center gap-4">
                    {status === 'won' && <p className="stamp border-cobalt text-cobalt">{t('game.won', { tries: rows.length, max: maxTries })}</p>}
                    {status === 'lost' && <p className="stamp border-pink text-pink">{t(grids > 1 ? 'game.lostMany' : 'game.lostOne', { words: missed.join(', ') })}</p>}
                    {status === 'over' && <p className="stamp border-pink text-pink">{t('game.timeUp')}</p>}
                    <p className="font-display text-2xl font-extrabold uppercase">{t('game.score', { score })}</p>
                    {solved && endless && onNext && <button className="btn" onClick={onNext}>{t('game.next')}</button>}
                    <button className="btn bg-card" onClick={share}>{copiedText === text ? t('game.copied') : t('game.share')}</button>
                    {(status === 'lost' || status === 'over') && onRestart && <button className="btn bg-pink" onClick={onRestart}>{t('game.newGame')}</button>}
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                        {answers.map((word) => <Wiki key={word} word={spelled(word)} />)}
                    </div>
                </div>
            )}
        </div>
    )
}
