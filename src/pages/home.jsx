import { useCallback, useState } from 'react'
import Header from '../components/header.jsx'
import Footer from '../components/footer.jsx'
import Menu from '../components/menu.jsx'
import Daily from './daily.jsx'
import ModePage from './modepage.jsx'
import Blitz from './blitz.jsx'
import Duel from './duel.jsx'
import Settings from './settings.jsx'
import Custom from './custom.jsx'
import Stats from './stats.jsx'
import HowToPlay from './howtoplay.jsx'
import Leaderboard from './leaderboard.jsx'
import About from './about.jsx'
import NotFound from './notfound.jsx'
import Welcome from './welcome.jsx'
import { getUsername, saveUsername } from '../data/storage.js'
import { DEFAULT_MAX_TRIES } from '../config.js'
import { Route, Routes } from 'react-router'

const IDLE = { clockOffset: 0, mode: '', lang: null, rows: [], grids: 1, wordLength: 5, maxTries: DEFAULT_MAX_TRIES, status: 'idle', score: 0, words: 0, number: 0, deadline: null, pattern: null, target: null, revealed: null, engine: null, ranked: false, notice: null }

const clockOffsetOf = (view, fallback) => (view.serverNow ? view.serverNow - Date.now() : fallback)

function Home() {
  const [session, setSession] = useState(null)
  const [guess, setGuess] = useState("")
  const [username, setUsername] = useState(getUsername)

  const start = useCallback(({ view, engine, ranked, notice }) => {
    setSession({ ...view, engine, ranked, notice, clockOffset: clockOffsetOf(view, 0) })
    setGuess("")
  }, [])

  const apply = useCallback((view) => setSession((s) => (s ? { ...s, ...view, clockOffset: clockOffsetOf(view, s.clockOffset) } : s)), [])

  // no username yet: show the welcome page instead of the game
  if (!username) {
    return <Welcome onSave={(name) => setUsername(saveUsername(name))} />
  }

  const game = { ...(session ?? IDLE), guess, setGuess, start, apply }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 sm:px-8">
      <Header />
      <main className="flex flex-1 flex-col items-center pt-6">
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/daily" element={<Daily game={game} />} />
        <Route path="/classic" element={<ModePage mode="classic" game={game} />} />
        <Route path="/custom/:length?" element={<Custom game={game} />} />
        <Route path="/hardcore" element={<ModePage mode="hardcore" game={game} />} />
        <Route path="/locked" element={<ModePage mode="locked" game={game} />} />
        <Route path="/survival" element={<ModePage mode="survival" game={game} />} />
        <Route path="/reverse" element={<ModePage mode="reverse" game={game} />} />
        <Route path="/blitz" element={<Blitz game={game} />} />
        <Route path="/duel/:code?" element={<Duel game={game} />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default Home
