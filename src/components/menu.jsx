import { Link } from 'react-router'
import Countdown from './countdown.jsx'
import { getScores, todayKey } from '../data/storage.js'
import { dailyStreaks } from '../game/stats.js'
import useLanguage from '../i18n/useLanguage.js'

const MODES = [
    { to: '/classic', mode: 'classic', ink: 'bg-pink' },
    { to: '/locked', mode: 'locked', ink: 'bg-sun' },
    { to: '/hardcore', mode: 'hardcore', ink: 'bg-ink text-paper' },
    { to: '/custom', mode: 'custom', ink: 'bg-cobalt text-paper' },
    { to: '/blitz', mode: 'blitz', ink: 'bg-sun', isNew: true },
    { to: '/survival', mode: 'survival', ink: 'bg-card', isNew: true },
    { to: '/reverse', mode: 'reverse', ink: 'bg-pink', isNew: true },
    { to: '/duel', mode: 'duel', ink: 'bg-cobalt text-paper', isNew: true },
]

const LINKS = [
    { to: '/stats', title: 'pages.stats' },
    { to: '/leaderboard', title: 'pages.leaderboard' },
    { to: '/how-to-play', title: 'pages.howToPlay' },
    { to: '/settings', title: 'pages.settings' },
    { to: '/about', title: 'pages.about' },
]

const slab = 'border-[3px] border-ink shadow-hard transition hover:-translate-x-1 hover:-translate-y-1 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none'

export default function Menu() {
    const { lang, t } = useLanguage()
    const scores = getScores(lang)
    const today = todayKey()
    const { current } = dailyStreaks(scores, today)
    const playedToday = scores.some((result) => result.mode === 'daily' && result.playedAt.slice(0, 10) === today)

    return (
        <section className="menu flex w-full max-w-2xl flex-col gap-8">
            <Link to="/daily" className={`flex flex-wrap items-center justify-between gap-4 bg-sun p-5 -rotate-1 ${slab}`}>
                <span className="flex flex-col">
                    <span className="font-display text-5xl font-extrabold uppercase sm:text-6xl">{t('modes.daily')}</span>
                    <span className="text-sm">{playedToday ? t('menu.dailyDone') : t('menu.daily')}</span>
                </span>
                <span className="flex flex-col items-end gap-2">
                    {current > 0 && (
                        <span className="border-2 border-ink bg-pink px-2 py-0.5 text-xs font-bold uppercase">{t(current === 1 ? 'menu.streakOne' : 'menu.streak', { count: current })}</span>
                    )}
                    {playedToday && <Countdown compact />}
                </span>
            </Link>

            <div className="flex flex-col gap-4">
                <h3 className="font-display text-2xl font-extrabold uppercase">{t('menu.play')}</h3>
                <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {MODES.map((entry, i) => (
                        <li key={entry.to}>
                            <Link to={entry.to} className={`relative flex h-full flex-col gap-1 p-4 ${entry.ink} ${slab} ${i % 2 ? 'rotate-1' : '-rotate-1'}`}>
                                <span className="font-display text-3xl font-extrabold uppercase">{t(`modes.${entry.mode}`)}</span>
                                <span className="text-sm">{t(`menu.${entry.mode}`)}</span>
                                {entry.isNew && (
                                    <span className="absolute -top-3 -right-2 rotate-6 border-2 border-ink bg-pink px-2 text-xs font-bold uppercase text-ink">{t('menu.new')}</span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <nav aria-label={t('menu.more')} className="flex flex-wrap justify-center gap-3">
                {LINKS.map((link) => (
                    <Link key={link.to} to={link.to} className="border-[3px] border-ink bg-card px-3 py-1 font-display text-lg font-extrabold uppercase shadow-hard transition hover:bg-pink">
                        {t(link.title)}
                    </Link>
                ))}
            </nav>
        </section>
    )
}
