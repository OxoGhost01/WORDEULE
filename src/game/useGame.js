import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { normalize } from '../../shared/text.js'
import { fixedLetters, requiredCounts, missingLetters, mergeRow } from '../../shared/locked.js'

const ERROR_TEXTS = {
    notInList: 'game.notInList',
    wrongLength: 'game.notEnough',
    lockedLetters: 'game.lockedLetters',
    timeUp: 'game.timeUp',
    connection: 'game.connection',
}

export default function useGame({ mode, rows, wordLength, status, engine, apply, guess, setGuess }) {
    const locked = mode === 'locked' && status !== 'idle'
    const fixed = useMemo(() => (locked ? fixedLetters(rows, wordLength) : []), [locked, rows, wordLength])
    const requiredByLetter = useMemo(() => (locked ? requiredCounts(rows) : {}), [locked, rows])
    const typedLength = wordLength - fixed.filter(Boolean).length
    const row = locked ? mergeRow(fixed, guess, wordLength) : guess
    const required = missingLetters(row.replace(/ /g, ''), requiredByLetter)
    const missingRequired = required.length > 0

    const [feedback, setFeedback] = useState({ n: 0, row: -1, text: '', alert: false, pulse: 0 })
    const [pending, setPending] = useState(false)
    const sending = useRef(false)

    const onKey = useCallback((key) => {
        if (status !== 'playing' || sending.current) return

        const refuse = (text) => setFeedback((f) => ({ n: f.n + 1, row: rows.length, text }))
        const clearText = () => setFeedback((f) => (f.text || f.alert ? { ...f, text: '', alert: false } : f))

        if (key === 'Backspace') {
            clearText()
            setGuess(guess.slice(0, -1))
        } else if (key === 'Enter') {
            if (guess.length !== typedLength) return refuse('game.notEnough')
            if (locked && missingRequired) {
                return setFeedback((f) => ({ ...f, alert: true, pulse: f.pulse + 1 }))
            }
            sending.current = true
            setPending(true)
            engine.submit(row)
                .then((view) => {
                    apply(view)
                    setGuess('')
                    clearText()
                })
                .catch((error) => refuse(ERROR_TEXTS[error.code] ?? 'game.connection'))
                .finally(() => {
                    sending.current = false
                    setPending(false)
                })
        } else if (/^[A-Z]$/.test(normalize(key)) && key.length === 1 && guess.length < typedLength) {
            clearText()
            setGuess(guess + normalize(key))
        }
    }, [status, rows.length, typedLength, locked, row, missingRequired, guess, engine, apply, setGuess])

    useEffect(() => {
        function onKeyDown(e) {
            if (e.ctrlKey || e.metaKey || e.altKey) return
            onKey(e.key)
        }

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [onKey])

    return { onKey, row, fixed, required, feedback, pending }
}
