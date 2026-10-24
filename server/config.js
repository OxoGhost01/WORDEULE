// All the settings of the server in one place
// (the site has its own in src/config.js: the lists of modes and of languages must be the same)

export const PORT = 3000
export const DATA_FILE = process.env.DATA_FILE ?? './data/scores.json' // the docker image sets it to /data/scores.json

export const MODES = ['daily', 'classic', 'hardcore', 'locked'] // custom is not ranked: its rules change every game

// The scores of two languages are never mixed: their difficulty can't be compared.
// Results saved before there were two languages have no language, they were in the default one.
export const LANGUAGES = ['en', 'fr']
export const DEFAULT_LANGUAGE = 'en'

// What a player is allowed to send, and how much is returned
export const LIMITS = {
    maxScore: 100000,
    maxTries: 20, // tries used in a game
    maxUsername: 24,
    topPlayers: 100,
}
