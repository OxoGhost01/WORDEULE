
import { getScores } from '../data/storage.js'

const MODE_INKS = {
    daily: 'bg-sun',
    classic: 'bg-pink',
    custom: 'bg-cobalt text-paper',
    hardcore: 'bg-ink text-paper',
}

export default function Leaderboard() {
    const scores = getScores().sort((first, second) => second.playedAt.localeCompare(first.playedAt))

    return (
        <section className="leaderboard flex w-full max-w-2xl flex-col items-center gap-8">
            <h2 className="page-title">Scores</h2>
            <p className="text-sm font-bold uppercase">Only the games played on this device</p>
            {scores.length === 0 ? <p className="notice">No completed games yet.</p> : (
                <ol className="flex w-full flex-col gap-4">
                    {scores.map((result, index) => (
                        <li
                            key={`${result.playedAt}-${index}`}
                            className="flex items-center gap-4 border-[3px] border-dashed border-ink bg-card p-3"
                        >
                            <strong className="min-w-[4ch] font-display text-4xl font-extrabold">{result.score}</strong>
                            <span className="flex flex-1 flex-col">
                                <span className="font-bold">{result.username}</span>
                                <time className="text-xs" dateTime={result.playedAt}>{new Date(result.playedAt).toLocaleDateString()}</time>
                            </span>
                            <span className={`border-2 border-ink px-2 py-0.5 text-xs font-bold uppercase ${MODE_INKS[result.mode] ?? 'bg-card'}`}>{result.mode}</span>
                            <span className="text-xs font-bold uppercase">{result.outcome}</span>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    )
}
