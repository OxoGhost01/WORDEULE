import { getScores } from '../data/storage.js'
import computeStats from '../game/stats.js'

const MAX_TRIES = 6 // classic

export default function Stats() {
    const stats = computeStats(getScores(), 'classic', MAX_TRIES)
    const most = Math.max(1, ...stats.distribution) // the longest bar

    const cards = [
        { label: 'Games played', value: stats.played, ink: 'bg-sun' },
        { label: 'Victories', value: `${stats.winRate}%`, note: `${stats.wins} / ${stats.played}`, ink: 'bg-pink' },
        { label: 'Win streak', value: stats.streak, note: 'in a row, right now', ink: 'bg-cobalt text-paper' },
        { label: 'Best streak', value: stats.bestStreak, note: 'in a row, ever', ink: 'bg-ink text-paper' },
        { label: 'Total points', value: stats.totalPoints, ink: 'bg-card col-span-2' },
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

            <div className="flex w-full flex-col gap-3 border-[3px] border-ink bg-card p-5 shadow-hard">
                <h3 className="font-display text-2xl font-extrabold uppercase">Victories by number of tries</h3>
                <ol className="flex flex-col gap-2">
                    {stats.distribution.map((count, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <span className="w-4 font-display text-lg font-extrabold">{i + 1}</span>
                            <div className="flex flex-1 items-center gap-2">
                                {count > 0 && <div className="h-7 border-[3px] border-ink bg-cobalt" style={{ width: `${(count / most) * 85}%` }} />}
                                <span className="font-bold">{count}</span>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}
