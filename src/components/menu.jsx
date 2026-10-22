import { Link } from 'react-router'

const MODES = [
    { to: '/how-to-play', name: 'How to play', note: 'The rules, and what each mode changes.', ink: 'bg-card' },
    { to: '/daily', name: 'Daily', note: 'One word. One shot. The same for everybody.', ink: 'bg-sun' },
    { to: '/classic', name: 'Classic', note: 'Endless words. Just don\'t lose.', ink: 'bg-pink' },
    { to: '/custom', name: 'Custom', note: 'You pick the length, the tries, the grids.', ink: 'bg-cobalt text-paper' },
    { to: '/hardcore', name: 'Hardcore', note: 'Four grids at once. Nine tries.', ink: 'bg-ink text-paper' },
    { to: '/locked', name: 'Locked', note: 'Found letters are locked in. You must use them.', ink: 'bg-sun' },
    { to: '/stats', name: 'Stats', note: 'Your classic numbers.', ink: 'bg-pink' },
    { to: '/leaderboard', name: 'Leaderboard', note: 'The best players, for everyone.', ink: 'bg-card' },
    { to: '/about', name: 'About', note: 'Who, why, how.', ink: 'bg-card' },
]

export default function Menu() {
    return (
        <section className="menu w-full max-w-2xl">
        <ul className="flex flex-col gap-5">
            {MODES.map((mode, i) => (
                <li key={mode.to} className="w-[90%] odd:self-start even:self-end">
                    <Link
                        to={mode.to}
                        className={`flex items-center gap-4 border-[3px] border-ink p-4 shadow-hard transition hover:-translate-x-1 hover:-translate-y-1 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none ${mode.ink} ${i % 2 ? 'rotate-1' : '-rotate-1'}`}
                    >
                        <span className="font-display text-5xl font-extrabold sm:text-6xl">{String(i + 1).padStart(2, '0')}</span>
                        <span className="flex flex-col">
                            <span className="font-display text-3xl font-extrabold uppercase sm:text-4xl">{mode.name}</span>
                            <span className="text-sm">{mode.note}</span>
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
        </section>
    )
}
