import { useState } from 'react'
import Tabs from '../components/tabs.jsx'

const TABS = [
    { id: 'basics', label: 'Basics' },
    { id: 'daily', label: 'Daily' },
    { id: 'classic', label: 'Classic' },
    { id: 'custom', label: 'Custom' },
    { id: 'hardcore', label: 'Hardcore' },
    { id: 'locked', label: 'Locked' },
]

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

const CONTENT = {
    basics: (
        <>
            <p>Find the hidden word in a limited number of tries. Each guess must be a real English word of the right length.</p>
            <p>After each guess, every letter takes a color:</p>
            <Example word="CRANE" statuses={['correct', 'absent', 'absent', 'absent', 'absent']} />
            <p><strong>Blue</strong>: the letter is in the word, at this exact place.</p>
            <Example word="CRANE" statuses={['absent', 'present', 'absent', 'absent', 'absent']} />
            <p><strong>Yellow</strong>: the letter is in the word, but somewhere else.</p>
            <Example word="CRANE" statuses={['absent', 'absent', 'absent', 'absent', 'absent']} />
            <p><strong>Black</strong>: the letter is not in the word (or all its copies are already found).</p>
            <p>
                Type with your keyboard or with the one on the screen, which also shows the state of every letter.
                A win gives more points the fewer tries you used: (tries left + 1) x 100.
            </p>
        </>
    ),
    daily: (
        <>
            <p>One word a day, the same for everybody. 5 letters, 6 tries.</p>
            <p>You only get one attempt per day: if you leave and come back, you pick up where you stopped. When the game is over, a counter shows the time left before the next word (it changes at midnight UTC).</p>
            <p>Your score is sent to the daily leaderboard.</p>
        </>
    ),
    classic: (
        <>
            <p>The endless mode. 5 letters, 6 tries.</p>
            <p>Find a word, and a new one comes right away. Your score keeps growing with every word you find. The first word you miss ends the run, and the score goes back to 0.</p>
            <p>Your best score is on the classic leaderboard, and your numbers are on the stats page.</p>
        </>
    ),
    custom: (
        <>
            <p>Your rules. Choose the length of the word (3 to 10), the number of tries (3 to 10) and the number of grids (1 to 10).</p>
            <p>It plays like classic: endless, until you miss a word. Since the difficulty changes, custom games are not on the leaderboard.</p>
        </>
    ),
    hardcore: (
        <>
            <p>4 grids at the same time, 9 tries, 5 letters.</p>
            <p>Every guess is played on all the grids at once, and each grid has its own hidden word. A grid stops filling as soon as its word is found. You win when the 4 words are found.</p>
            <p>On the keyboard, each key is split in 4 stripes: one for each grid.</p>
        </>
    ),
    locked: (
        <>
            <p>5 letters, 6 tries, and some rules to follow.</p>
            <Example word="CRANE" statuses={['correct', 'present', 'absent', 'absent', 'absent']} />
            <p>A letter found at its place is <strong>locked</strong> there: it is filled again on every new line and you can't remove it.</p>
            <p>A letter found at the wrong place must be <strong>used</strong> in your next guess. The "Must use" letters under the grid show what you still have to place, and flash if you try to send a word without them.</p>
        </>
    ),
}

export default function HowToPlay() {
    const [tab, setTab] = useState('basics')

    return (
        <section className="howtoplay flex w-full max-w-2xl flex-col items-center gap-6">
            <h2 className="page-title">How to play</h2>
            <Tabs tabs={TABS} active={tab} onChange={setTab} />
            <div className="flex w-full flex-col gap-4 border-[3px] border-ink bg-card p-6 leading-relaxed shadow-hard-lg">
                {CONTENT[tab]}
            </div>
        </section>
    )
}
