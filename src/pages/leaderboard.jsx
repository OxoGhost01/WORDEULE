
import { getScores } from '../data/storage.js'

export default function Leaderboard() {
    const scores = getScores().sort((first, second) => second.playedAt.localeCompare(first.playedAt))

    return (
        <section className="leaderboard">
            <h2>Scores on this device</h2>
            {scores.length === 0 ? <p>No completed games yet.</p> : (
                <ol>
                    {scores.map((result, index) => (
                        <li key={`${result.playedAt}-${index}`}>
                            <span>{result.username}</span>{' '}
                            <span>{result.mode}</span>{' '}
                            <span>{result.outcome}</span>{' '}
                            <strong>{result.score}</strong>{' '}
                            <time dateTime={result.playedAt}>{new Date(result.playedAt).toLocaleDateString()}</time>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    )
}