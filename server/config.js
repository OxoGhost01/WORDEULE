// All the settings of the server in one place
// (the site has its own in src/config.js: the list of modes must be the same)

export const PORT = 3000
export const DATA_FILE = process.env.DATA_FILE ?? './data/scores.json' // the docker image sets it to /data/scores.json

export const MODES = ['daily', 'classic', 'hardcore', 'locked', 'custom']

// What a player is allowed to send, and how much is returned
export const LIMITS = {
    maxScore: 100000,
    minLength: 3, // letters of the word
    maxLength: 10,
    defaultLength: 5, // for results sent without a length
    maxUsername: 24,
    topPlayers: 100,
}
