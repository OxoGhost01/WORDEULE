// All the settings of the game in one place: change a value here, not in the code.
// The rules shared with the server (modes, score, word lists) are in shared/rules.js.
import { LANGUAGE_SOURCES } from '../shared/rules.js'

export {
    DEFAULT_LANGUAGE,
    DEFAULT_MAX_TRIES,
    GAME_MODES,
    LEADERBOARD_MODES,
    SCORE,
    SURVIVAL,
    BLITZ,
    DUEL,
    USERNAME,
} from '../shared/rules.js'

// What depends on the language of the game (the texts are in src/i18n): the word lists come from shared/rules.js
export const LANGUAGES = {
    en: {
        ...LANGUAGE_SOURCES.en,
        label: 'English',
        keyboardRows: [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace'],
        ],
        wiktionary: 'https://en.wiktionary.org/wiki/',
    },
    fr: {
        ...LANGUAGE_SOURCES.fr,
        label: 'Français',
        keyboardRows: [
            ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
            ['Enter', 'W', 'X', 'C', 'V', 'B', 'N', 'Backspace'],
        ],
        wiktionary: 'https://fr.wiktionary.org/wiki/',
    },
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

// --- Leaderboard, server and browser -------------------------------------------------------------

export const API_URL = '/api' // see vite.config.js (dev) and docker/nginx.conf (production)
export const STORAGE_KEY = 'wordeule:data:v1' // where the data is saved in the browser
export const USERNAME_MAX_LENGTH = 24

// --- Daily word ----------------------------------------------------------------------------------

export const DAILY = {
    seed: 0x6d2b79f5, // seed of the practice word used when the server can't be reached
    countRefreshMs: 30000, // how often the "players who found the word" counter is reloaded
    countDelayAfterResultMs: 1500, // wait before reloading it once the player's own result is sent
}

// --- Display -------------------------------------------------------------------------------------

// Squares of the shared result
export const SHARE_EMOJI = { correct: '🟦', present: '🟨', absent: '⬛' }

// The pages where a game is played: the language can't be changed there (it would break the game in progress)
export const GAME_PAGES = ['/daily', '/classic', '/custom', '/hardcore', '/locked', '/blitz', '/survival', '/reverse', '/duel']
