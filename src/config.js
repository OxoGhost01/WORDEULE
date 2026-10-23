// All the settings of the game in one place: change a value here, not in the code.
// (The server has its own settings in server/config.js.)

// --- Words ---------------------------------------------------------------------------------------

// The dictionary: every English word, used to check the guesses
export const DICTIONARY_URL = 'https://cdn.jsdelivr.net/npm/an-array-of-english-words@2.0.0/index.json'

// The 10,000 most common English words (Google): the words to guess are taken from it, among the ones
// that are in the dictionary. The address is pinned to an exact version, so the daily word never changes by accident.
export const COMMON_WORDS_URL = 'https://cdn.jsdelivr.net/gh/first20hours/google-10000-english@d0736d492489198e4f9d650c7ab4143bc14c1e9e/google-10000-english-no-swears.txt'

// --- Game modes ----------------------------------------------------------------------------------

// Number of tries when nothing else is said
export const DEFAULT_MAX_TRIES = 6

// Rules of each mode. endless: a win goes on with a new word and the same score, a loss restarts from 0
export const GAME_MODES = {
    daily: { wordLength: 5, maxTries: 6, grids: 1, endless: false },
    classic: { wordLength: 5, maxTries: 6, grids: 1, endless: true },
    locked: { wordLength: 5, maxTries: 6, grids: 1, endless: true },
    hardcore: { wordLength: 5, maxTries: 9, grids: 4, endless: true },
}

// Custom mode: the limits of the settings, and their values the first time
export const CUSTOM = {
    minLength: 3,
    maxLength: 10,
    minTries: 3,
    maxTries: 10,
    minGrids: 1,
    maxGrids: 10,
    endless: true,
    defaults: { wordLength: 5, maxTries: 6, wordCount: 1 },
}

// --- Score ---------------------------------------------------------------------------------------

export const SCORE = {
    pointsPerTry: 100, // a win gives (tries left + 1) x this
    // bonus for long words: the first line that fits applies
    lengthBonus: [
        { from: 7, bonus: 2 },
        { from: 6, bonus: 1.5 },
    ],
    modeBonus: { locked: 1.5 }, // bonus of a mode (the hard one)
    // (the number of grids is also a bonus: x4 in hardcore)
}

// --- Leaderboard, server and browser -------------------------------------------------------------

export const LEADERBOARD_MODES = ['daily', 'classic', 'hardcore', 'locked'] // custom is not ranked: its rules change every game
export const API_URL = '/api' // see vite.config.js (dev) and docker/nginx.conf (production)
export const STORAGE_KEY = 'wordeule:data:v1' // where the data is saved in the browser
export const USERNAME_MAX_LENGTH = 24

// --- Daily word ----------------------------------------------------------------------------------

export const DAILY = {
    seed: 0x6d2b79f5, // the daily word list is shuffled with this seed, the same for everybody
    countRefreshMs: 30000, // how often the "players who found the word" counter is reloaded
    countDelayAfterResultMs: 1500, // wait before reloading it once the player's own result is sent
}

// --- Display -------------------------------------------------------------------------------------

// Squares of the shared result
export const SHARE_EMOJI = { correct: '🟦', present: '🟨', absent: '⬛' }

// Layout of the on-screen keyboard
export const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace'],
]
