import { useState } from 'react'
import Tabs from '../components/tabs.jsx'
import useLanguage from '../i18n/useLanguage.js'

// The colors of the example lines (see the tiles of the game)
const BLUE = ['correct', 'absent', 'absent', 'absent', 'absent']
const YELLOW = ['absent', 'present', 'absent', 'absent', 'absent']
const BLACK = ['absent', 'absent', 'absent', 'absent', 'absent']
const LOCKED = ['correct', 'present', 'absent', 'absent', 'absent']

// What each tab shows, in order: the key of a text (see src/i18n), or an example line of tiles
const CONTENT = {
    basics: ['howto.basics.welcome', 'howto.basics.goal', 'howto.basics.colors', { example: BLUE }, 'howto.basics.blue',
        { example: YELLOW }, 'howto.basics.yellow', { example: BLACK }, 'howto.basics.black',
        'howto.basics.typing', 'howto.basics.points', 'howto.basics.share', 'howto.basics.accessibility'],
    daily: ['howto.daily.rules', 'howto.daily.attempt', 'howto.daily.leaderboard'],
    classic: ['howto.classic.rules', 'howto.classic.run', 'howto.classic.scores'],
    custom: ['howto.custom.rules', 'howto.custom.saved'],
    hardcore: ['howto.hardcore.rules', 'howto.hardcore.grids', 'howto.hardcore.points', 'howto.hardcore.keyboard'],
    locked: ['howto.locked.rules', { example: LOCKED }, 'howto.locked.fixed', 'howto.locked.used'],
    survival: ['howto.survival.rules', 'howto.survival.grow', 'howto.survival.points'],
    blitz: ['howto.blitz.rules', 'howto.blitz.time', 'howto.blitz.points'],
    reverse: ['howto.reverse.rules', { example: LOCKED }, 'howto.reverse.tries', 'howto.reverse.points'],
    duel: ['howto.duel.rules', 'howto.duel.how', 'howto.duel.winner'],
}

// A line of tiles as seen in the game: statuses are 'correct', 'present' or 'absent'
function Example({ word, statuses }) {
    return (
        <div className="flex w-56 gap-1">
            {[...word].map((letter, i) => (
                <span key={i} className={`tile ${statuses[i]}`}><b>{letter}</b></span>
            ))}
        </div>
    )
}

// A text where **this** is in bold
function Rich({ text }) {
    return text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))
}

export default function HowToPlay() {
    const { t } = useLanguage()
    const [tab, setTab] = useState('basics')

    // the first tab is the basics, then one per mode
    const tabs = Object.keys(CONTENT).map((id) => ({ id, label: id === 'basics' ? t('howto.tab.basics') : t(`modes.${id}`) }))

    return (
        <section className="howtoplay flex w-full max-w-2xl flex-col items-center gap-6">
            <h2 className="page-title">{t('pages.howToPlay')}</h2>
            <Tabs tabs={tabs} active={tab} onChange={setTab} />
            <div className="flex w-full flex-col gap-4 border-[3px] border-ink bg-card p-6 leading-relaxed shadow-hard-lg">
                {CONTENT[tab].map((item, i) => typeof item === 'string'
                    ? <p key={i}><Rich text={t(item)} /></p>
                    : <Example key={i} word={t('howto.exampleWord')} statuses={item.example} />)}
            </div>
        </section>
    )
}
