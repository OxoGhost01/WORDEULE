import { useEffect, useState } from 'react'

// Seconds left until the next daily word (the word changes at midnight UTC)
function secondsLeft() {
    const now = new Date()
    const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
    return Math.max(0, Math.floor((midnight - now) / 1000))
}

const pad = (n) => String(n).padStart(2, '0')

export default function Countdown() {
    const [left, setLeft] = useState(secondsLeft)

    // refresh the time left every second
    useEffect(() => {
        const timer = setInterval(() => setLeft(secondsLeft()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        if (left === 0) window.location.reload() // new day: load the new word
    }, [left])

    return (
        <div className="flex flex-col items-center gap-1 border-[3px] border-ink bg-card px-6 py-3 shadow-hard">
            <span className="text-xs font-bold uppercase">Next word in</span>
            <span className="font-display text-5xl font-extrabold tabular-nums">
                {pad(Math.floor(left / 3600))}:{pad(Math.floor(left / 60) % 60)}:{pad(left % 60)}
            </span>
        </div>
    )
}
