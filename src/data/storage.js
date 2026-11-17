// Everything saved in the browser (localStorage), in one entry: username, language, played games, daily progress, settings
import { STORAGE_KEY, CUSTOM, LANGUAGES, DEFAULT_LANGUAGE } from '../config.js'

// Nothing saved yet
const emptyData = () => ({ username: '', token: '', language: null, scores: [], daily: {}, settings: {}, prefs: {} })

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
			token: typeof data.token === 'string' ? data.token : '',
			language: data.language in LANGUAGES ? data.language : null,
			scores: Array.isArray(data.scores) ? data.scores : [],
			daily: readDaily(data.daily),
			settings: data.settings && typeof data.settings === 'object' ? data.settings : {},
			prefs: data.prefs && typeof data.prefs === 'object' ? data.prefs : {},
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

export function getToken() {
	return readData().token
}

export function saveToken(token) {
	const data = readData()
	data.token = token
	writeData(data)
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

export const DEFAULT_PREFS = { palette: 'default', motion: 'system' }

export function getPrefs() {
	return { ...DEFAULT_PREFS, ...readData().prefs }
}

export function savePrefs(prefs) {
	const data = readData()
	data.prefs = prefs
	writeData(data)
}
