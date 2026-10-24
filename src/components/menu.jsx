import { Link } from 'react-router'
import useLanguage from '../i18n/useLanguage.js'

// One slab per page: where it goes, the key of its title and of its short line (see src/i18n), and its color
const PAGES = [
    { to: '/how-to-play', title: 'pages.howToPlay', note: 'menu.howToPlay', ink: 'bg-card' },
    { to: '/daily', title: 'modes.daily', note: 'menu.daily', ink: 'bg-sun' },
    { to: '/classic', title: 'modes.classic', note: 'menu.classic', ink: 'bg-pink' },
    { to: '/custom', title: 'modes.custom', note: 'menu.custom', ink: 'bg-cobalt text-paper' },
    { to: '/hardcore', title: 'modes.hardcore', note: 'menu.hardcore', ink: 'bg-ink text-paper' },
    { to: '/locked', title: 'modes.locked', note: 'menu.locked', ink: 'bg-sun' },
    { to: '/stats', title: 'pages.stats', note: 'menu.stats', ink: 'bg-pink' },
    { to: '/leaderboard', title: 'pages.leaderboard', note: 'menu.leaderboard', ink: 'bg-card' },
    { to: '/about', title: 'pages.about', note: 'menu.about', ink: 'bg-card' },
]

export default function Menu() {
    const { t } = useLanguage()

    return (
        <section className="menu w-full max-w-2xl">
        <ul className="flex flex-col gap-5">
            {PAGES.map((page, i) => (
                <li key={page.to} className="w-[90%] odd:self-start even:self-end">
                    <Link
                        to={page.to}
                        className={`flex items-center gap-4 border-[3px] border-ink p-4 shadow-hard transition hover:-translate-x-1 hover:-translate-y-1 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none ${page.ink} ${i % 2 ? 'rotate-1' : '-rotate-1'}`}
                    >
                        <span className="font-display text-5xl font-extrabold sm:text-6xl">{String(i + 1).padStart(2, '0')}</span>
                        <span className="flex flex-col">
                            <span className="font-display text-3xl font-extrabold uppercase sm:text-4xl">{t(page.title)}</span>
                            <span className="text-sm">{t(page.note)}</span>
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
        </section>
    )
}
