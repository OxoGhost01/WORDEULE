export const DEFAULT_LANGUAGE = 'en'

export const LANGUAGE_SOURCES = {
    en: {
        dictionaryUrl: 'https://cdn.jsdelivr.net/npm/an-array-of-english-words@2.0.0/index.json',
        commonWordsUrl: 'https://cdn.jsdelivr.net/gh/first20hours/google-10000-english@d0736d492489198e4f9d650c7ab4143bc14c1e9e/google-10000-english-no-swears.txt',
        commonWordsLimit: 10000,
    },
    fr: {
        dictionaryUrl: 'https://cdn.jsdelivr.net/npm/an-array-of-french-words@2.0.0/index.json',
        commonWordsUrl: 'https://cdn.jsdelivr.net/gh/hermitdave/FrequencyWords@525f9b560de45753a5ea01069454e72e9aa541c6/content/2018/fr/fr_50k.txt',
        commonWordsLimit: 12000,
    },
}

export const LANGUAGE_IDS = Object.keys(LANGUAGE_SOURCES)

export const DEFAULT_MAX_TRIES = 6

export const GAME_MODES = {
    daily: { wordLength: 5, maxTries: 6, grids: 1, endless: false },
    classic: { wordLength: 5, maxTries: 6, grids: 1, endless: true },
    locked: { wordLength: 5, maxTries: 6, grids: 1, endless: true },
    hardcore: { wordLength: 5, maxTries: 9, grids: 4, endless: true },
    survival: { wordLength: 4, maxTries: 6, grids: 1, endless: true },
    blitz: { wordLength: 5, maxTries: 6, grids: 1, endless: true },
    reverse: { wordLength: 5, maxTries: 3, grids: 1, endless: true },
    duel: { wordLength: 5, maxTries: 6, grids: 1, endless: false },
}

export const LEADERBOARD_MODES = ['daily', 'classic', 'hardcore', 'locked', 'survival', 'blitz', 'reverse']

export const SERVER_MODES = [...LEADERBOARD_MODES, 'duel']

export const SCORE = {
    pointsPerTry: 100,
    lengthBonus: [
        { from: 7, bonus: 2 },
        { from: 6, bonus: 1.5 },
    ],
    modeBonus: { locked: 1.5 },
}

export const SURVIVAL = { startLength: 4, maxLength: 10 }

export const BLITZ = { startSeconds: 90, bonusSeconds: 15, graceMs: 1000 }

export const REVERSE = { minHints: 2, searchLimit: 300 }

export const DUEL = { codeLength: 6, expireDays: 7, codeAlphabet: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' }

export const USERNAME = { maxLength: 24, pattern: /^[\p{L}\p{N}][\p{L}\p{N} _.-]*$/u }

export const GUESS_MIN_INTERVAL_MS = 250
