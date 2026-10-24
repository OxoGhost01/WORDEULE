// Everything saved in the browser (localStorage), in one entry: username, language, played games, daily progress, settings
import { STORAGE_KEY, CUSTOM, DAILY, LANGUAGES, DEFAULT_LANGUAGE } from '../config.js'

// Nothing saved yet
const emptyData = () => ({ username: '', language: null, scores: [], daily: {}, settings: {} })

// The daily progress of each language: { en: { date, guesses }, fr: { date, guesses } }
// (it used to be a single { date, guesses }, played in English)
function readDaily(daily) {
	if (daily && typeof daily.date === 'string') return { [DEFAULT_LANGUAGE]: daily }
	return daily && typeof daily === 'object' ? daily : {}
}

// Reads the saved data; anything missing or broken falls back to an empty value
function readData() {
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY)
		if (!stored) return emptyData()

		const data = JSON.parse(stored)
		return {
			username: typeof data.username === 'string' ? data.username : '',
			language: data.language in LANGUAGES ? data.language : null,
			scores: Array.isArray(data.scores) ? data.scores : [],
			daily: readDaily(data.daily),
			settings: data.settings && typeof data.settings === 'object' ? data.settings : {},
		}
	} catch {
		return emptyData()
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

// The language chosen by the player (null the first time)
export function getLanguage() {
	return readData().language
}

export function saveLanguage(lang) {
	const data = readData()
	data.language = lang
	writeData(data)
}

// The games played in a language: the scores of two languages are never mixed, their difficulty can't be compared
// (the games saved before there were two languages were in English)
export function getScores(lang) {
	return readData().scores.filter((result) => (result.lang ?? DEFAULT_LANGUAGE) === lang)
}

// Saves the result of a finished game (a word) and returns it
export function saveScore({ mode, lang, score, outcome, tries }) {
	const data = readData()
	const result = {
		username: data.username || 'Player',
		mode,
		lang,
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

// Guesses already played on the daily word of that date in a language (none if it is a new day).
// Each language has its own daily word, so its own attempt.
export function getDailyProgress(date, lang) {
	const progress = readData().daily[lang]
	return progress && progress.date === date ? progress.guesses : []
}

export function saveDailyProgress(date, guesses, lang) {
	const data = readData()
	data.daily[lang] = { date, guesses }
	writeData(data)
}

// Settings of the custom mode, kept between two visits
export function getSettings() {
	return { ...CUSTOM.defaults, ...readData().settings }
}

export function saveSettings(settings) {
	const data = readData()
	data.settings = settings
	writeData(data)
}

// Same word for everybody during a whole day (UTC): the list is shuffled with a fixed seed,
// then indexed by the number of days since 1970-01-01, so no word repeats before the list is used up
export function getDailyWord(words, date = new Date()) {
	const shuffledWords = [...words]
	let seed = DAILY.seed

	// small random generator: with the same seed it always gives the same numbers
	function nextRandom() {
		seed = (seed + 0x6d2b79f5) | 0 // (constant of the algorithm, not a setting)
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

