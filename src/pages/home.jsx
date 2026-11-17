import { useCallback, useState } from 'react'
import Header from '../components/header.jsx'
import Footer from '../components/footer.jsx'
import Menu from '../components/menu.jsx'
import Daily from './daily.jsx'
import Classic from './classic.jsx'
import Custom from './custom.jsx'
import Hardcore from './hardcore.jsx'
import Locked from './locked.jsx'
import Stats from './stats.jsx'
import HowToPlay from './howtoplay.jsx'
import Leaderboard from './leaderboard.jsx'
import About from './about.jsx'
import NotFound from './notfound.jsx'
import Welcome from './welcome.jsx'
import { getUsername, saveUsername } from '../data/storage.js'
import { DEFAULT_MAX_TRIES } from '../config.js'
import { Route, Routes } from 'react-router'

const IDLE = { mode: '', lang: null, rows: [], grids: 1, wordLength: 5, maxTries: DEFAULT_MAX_TRIES, status: 'idle', score: 0, words: 0, number: 0, deadline: null, pattern: null, revealed: null, engine: null, ranked: false, notice: null }

function Home() {
  const [session, setSession] = useState(null)
  const [guess, setGuess] = useState("")
  const [username, setUsername] = useState(getUsername)

  const start = useCallback(({ view, engine, ranked, notice }) => {
    setSession({ ...view, engine, ranked, notice })
    setGuess("")
  }, [])

  const apply = useCallback((view) => setSession((s) => (s ? { ...s, ...view } : s)), [])

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
        <Route path="/classic" element={<Classic game={game} />} />
        <Route path="/custom/:length?" element={<Custom game={game} />} />
        <Route path="/hardcore" element={<Hardcore game={game} />} />
        <Route path="/locked" element={<Locked game={game} />} />
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
