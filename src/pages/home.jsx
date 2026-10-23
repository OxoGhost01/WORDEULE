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
import Welcome from './welcome.jsx'
import { getUsername, saveUsername } from '../data/storage.js'
import { DEFAULT_MAX_TRIES } from '../config.js'
import { BrowserRouter, Route, Routes } from 'react-router'

// Root of the app: owns the state of the current game, shared by all the modes (only one runs at a time)
function Home() {

  const [mots, setMots] = useState([]) // Word list of the current game: possible answers and valid guesses
  const [mode, setMode] = useState("") // Current gamemode: daily, classic, custom
  const [guess, setGuess] = useState("") // Word being typed by the player
  const [score, setScore] = useState(0) // Score
  const [answers, setAnswers] = useState([]) // Words to guess (one grid each)
  const [guesses, setGuesses] = useState([]) // Words already submitted by the player
  const [maxTries, setMaxTries] = useState(DEFAULT_MAX_TRIES) // Number of tries allowed
  const [username, setUsername] = useState(getUsername) // saved in the browser, asked by Welcome the first time

  // Launches a game: only one mode runs at a time, so they all share the same state (singleton)
  const start = useCallback((newMode, newWords, newAnswers, newMaxTries = DEFAULT_MAX_TRIES, keepScore = false) => {
    setMode(newMode)
    setMots(newWords)
    setAnswers(newAnswers)
    setMaxTries(newMaxTries)
    setGuesses([])
    setGuess("")
    if (!keepScore) setScore(0)
  }, [])

  // no username yet: show the welcome page instead of the game
  if (!username) {
    return <Welcome onSave={(name) => setUsername(saveUsername(name))} />
  }

  // everything a mode needs to run a game, passed down as one prop
  const game = { mode, answers, words: mots, guesses, setGuesses, guess, setGuess, score, setScore, maxTries, start }

  return (
    <BrowserRouter>
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
        </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default Home
