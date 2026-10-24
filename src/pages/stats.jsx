import { useState } from 'react'
import Tabs from '../components/tabs.jsx'
import { getScores } from '../data/storage.js'
import computeStats from '../game/stats.js'
import { GAME_MODES, CUSTOM } from '../config.js'
import useLanguage from '../i18n/useLanguage.js'

// Every mode has its own stats, in the language being played: the rules of the mode (tries, endless or not) come from the config
const RULES = { ...GAME_MODES, custom: CUSTOM }

export default function Stats() {
    const { lang, t } = useLanguage()
    const [mode, setMode] = useState('classic')
    const tabs = Object.keys(RULES).map((id) => ({ id, label: t(`modes.${id}`) }))

    // numbers computed from the games saved in this browser
    const { maxTries, endless } = RULES[mode]
    const stats = computeStats(getScores(lang), mode, maxTries, endless) // only the games of the current language
    const most = Math.max(1, ...stats.distribution) // the longest bar

    // the big numbers at the top
    const cards = [
        { label: t('stats.played'), value: stats.played, ink: 'bg-sun' },
        { label: t('stats.victories'), value: `${stats.winRate}%`, note: `${stats.wins} / ${stats.played}`, ink: 'bg-pink' },
        { label: t('stats.streak'), value: stats.streak, note: t('stats.streakNote'), ink: 'bg-cobalt text-paper' },
        { label: t('stats.bestStreak'), value: stats.bestStreak, note: t('stats.bestStreakNote'), ink: 'bg-ink text-paper' },
        { label: t('stats.points'), value: stats.totalPoints, ink: 'bg-card col-span-2' },
    ]

    return (
        <section className="stats flex w-full max-w-2xl flex-col items-center gap-8">
            <h2 className="page-title">{t('pages.stats')}</h2>
            <Tabs tabs={tabs} active={mode} onChange={setMode} />
            <p className="text-sm font-bold uppercase">{t('stats.mode', { mode: t(`modes.${mode}`) })}</p>
            {stats.played === 0 && <p className="notice">{t('stats.empty', { mode: t(`modes.${mode}`) })}</p>}
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
                <h3 className="font-display text-2xl font-extrabold uppercase">{t('stats.distribution')}</h3>
                <ol className="flex flex-col gap-2">
                    {stats.distribution.map((count, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <span className="w-6 font-display text-lg font-extrabold">{i + 1}</span>
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
