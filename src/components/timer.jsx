import { useEffect, useState } from 'react'
import useLanguage from '../i18n/useLanguage.js'

const secondsLeft = (deadline, offset) => Math.max(0, Math.ceil((deadline - offset - Date.now()) / 1000))

export default function Timer({ deadline, offset = 0, onEnd }) {
    const { t } = useLanguage()
    const [left, setLeft] = useState(() => secondsLeft(deadline, offset))

    useEffect(() => {
        const tick = () => setLeft(secondsLeft(deadline, offset))
        const timer = setInterval(tick, 250)
        return () => clearInterval(timer)
    }, [deadline, offset])

    useEffect(() => {
        if (left === 0) onEnd()
    }, [left, onEnd])

    return (
        <div className={`flex flex-col items-center gap-1 border-[3px] border-ink px-6 py-2 shadow-hard ${left <= 10 ? 'bg-pink' : 'bg-card'}`} role="timer">
            <span className="text-xs font-bold uppercase">{t('blitz.time')}</span>
            <span className="font-display text-5xl font-extrabold tabular-nums">{left}</span>
        </div>
    )
}
