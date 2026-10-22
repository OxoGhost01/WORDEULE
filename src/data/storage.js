// Everything saved in the browser (localStorage), in one entry: username, played games, daily progress
const STORAGE_KEY = 'wordeule:data:v1'

// Reads the saved data; anything missing or broken falls back to an empty value
function readData() {
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY)
		if (!stored) return { username: '', scores: [], daily: null }

		const data = JSON.parse(stored)
		return {
			username: typeof data.username === 'string' ? data.username : '',
			scores: Array.isArray(data.scores) ? data.scores : [],
			daily: data.daily && typeof data.daily.date === 'string' && Array.isArray(data.daily.guesses) ? data.daily : null,
		}
	} catch {
		return { username: '', scores: [], daily: null }
	}
}

function writeData(data) {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
	} catch {
		// storage blocked or full: the game still works, the data is just not kept
	}
}

export function getUsername() {
	return readData().username
}

export function saveUsername(username) {
	const data = readData()
	data.username = username.trim()
	writeData(data)
	return data.username
}

export function getScores() {
	return readData().scores
}

// Saves the result of a finished game (a word) and returns it
export function saveScore({ mode, score, outcome, tries }) {
	const data = readData()
	const result = {
		username: data.username || 'Player',
		mode,
		score,
		outcome,
		tries,
		playedAt: new Date().toISOString(),
	}
	data.scores.push(result)
	writeData(data)
	return result
}

// Daily mode allows one attempt per day: the guesses of the day are kept so a refresh can't restart it
export function todayKey(date = new Date()) {
	return date.toISOString().slice(0, 10)
}

// Guesses already played on the daily word of that date (none if it is a new day)
export function getDailyProgress(date) {
	const { daily } = readData()
	return daily && daily.date === date ? daily.guesses : []
}

export function saveDailyProgress(date, guesses) {
	const data = readData()
	data.daily = { date, guesses }
	writeData(data)
}

// Same word for everybody during a whole day (UTC): the list is shuffled with a fixed seed,
// then indexed by the number of days since 1970-01-01, so no word repeats before the list is used up
export function getDailyWord(words, date = new Date()) {
	const shuffledWords = [...words]
	let seed = 0x6d2b79f5

	// small random generator: with the same seed it always gives the same numbers
	function nextRandom() {
		seed = (seed + 0x6d2b79f5) | 0
		let value = seed
		value = Math.imul(value ^ (value >>> 15), value | 1)
		value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296
	}

	// shuffle the list (Fisher-Yates) the same way for everybody
	for (let index = shuffledWords.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(nextRandom() * (index + 1))
		;[shuffledWords[index], shuffledWords[swapIndex]] = [shuffledWords[swapIndex], shuffledWords[index]]
	}

	const day = Math.floor(date.getTime() / 86400000)
	return shuffledWords[day % shuffledWords.length]
}

