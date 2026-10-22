import { getScores } from '../data/storage.js'
import computeStats from '../game/stats.js'

export default function Stats() {
    const stats = computeStats(getScores(), 'classic')

    const cards = [
        { label: 'Games played', value: stats.played, ink: 'bg-sun' },
        { label: 'Win rate', value: `${stats.winRate}%`, note: `${stats.wins} / ${stats.played}`, ink: 'bg-pink' },
        { label: 'Win streak', value: stats.streak, note: `best: ${stats.bestStreak}`, ink: 'bg-cobalt text-paper' },
        { label: 'Personal best', value: stats.bestScore, note: 'points', ink: 'bg-ink text-paper' },
    ]

    return (
        <section className="stats flex w-full max-w-2xl flex-col items-center gap-8">
            <h2 className="page-title">Stats</h2>
            <p className="text-sm font-bold uppercase">Classic mode, on this device</p>
            {stats.played === 0 && <p className="notice">No classic game yet, go play one !</p>}
            <ul className="grid w-full grid-cols-2 gap-5">
                {cards.map((card, i) => (
                    <li
                        key={card.label}
                        className={`flex flex-col gap-1 border-[3px] border-ink p-4 shadow-hard ${card.ink} ${i % 2 ? 'rotate-1' : '-rotate-1'}`}
                    >
                        <span className="text-xs font-bold uppercase">{card.label}</span>
                        <span className="font-display text-6xl font-extrabold leading-none sm:text-7xl">{card.value}</span>
                        <span className="min-h-4 text-xs">{card.note}</span>
                    </li>
                ))}
            </ul>
        </section>
    )
}
