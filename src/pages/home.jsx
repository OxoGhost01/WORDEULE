import { useCallback, useState } from 'react'
import Header from '../components/header.jsx'
import Footer from '../components/footer.jsx'
import Menu from '../components/menu.jsx'
import Daily from './daily.jsx'
import Classic from './classic.jsx'
import Custom from './custom.jsx'
import Hardcore from './hardcore.jsx'
import Leaderboard from './leaderboard.jsx'
import About from './about.jsx'
import Welcome from './welcome.jsx'
import { getUsername, saveUsername } from '../data/storage.js'
import { BrowserRouter, Route, Routes } from 'react-router'

function Home() {

  const [mots, setMots] = useState([]) // Word list of the current game: possible answers and valid guesses
  const [mode, setMode] = useState("") // Current gamemode: daily, classic, custom
  const [guess, setGuess] = useState("") // Word being typed by the player
  const [score, setScore] = useState(0) // Score
  const [answers, setAnswers] = useState([]) // Words to guess (one grid each)
  const [guesses, setGuesses] = useState([]) // Words already submitted by the player
  const [maxTries, setMaxTries] = useState(6) // Number of tries allowed
  const [username, setUsername] = useState(getUsername)

  // Launches a game: only one mode runs at a time, so they all share the same state
  const start = useCallback((newMode, newWords, newAnswers, newMaxTries = 6, keepScore = false) => {
    setMode(newMode)
    setMots(newWords)
    setAnswers(newAnswers)
    setMaxTries(newMaxTries)
    setGuesses([])
    setGuess("")
    if (!keepScore) setScore(0)
  }, [])

  if (!username) {
    return <Welcome onSave={(name) => setUsername(saveUsername(name))} />
  }

  const game = { mode, answers, words: mots, guesses, setGuesses, guess, setGuess, score, setScore, maxTries, start }

  return (
    <BrowserRouter>
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 sm:px-8">
        <Header />
        <main className="flex flex-1 flex-col items-center pt-6">
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/daily" element={<Daily game={game} />} />
          <Route path="/classic" element={<Classic game={game} />} />
          <Route path="/custom" element={<Custom game={game} />} />
          <Route path="/hardcore" element={<Hardcore game={game} />} />
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
