import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_hash TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    created_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY,
    player_id INTEGER REFERENCES players(id),
    legacy_name TEXT,
    mode TEXT NOT NULL,
    lang TEXT NOT NULL,
    day TEXT,
    state TEXT NOT NULL,
    status TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    words INTEGER,
    tries INTEGER,
    started_ms INTEGER NOT NULL,
    updated_ms INTEGER NOT NULL,
    last_guess_ms INTEGER NOT NULL DEFAULT 0,
    duel_code TEXT
);

CREATE INDEX IF NOT EXISTS runs_board ON runs (mode, lang, score);
CREATE INDEX IF NOT EXISTS runs_player ON runs (player_id, mode, lang, day);
CREATE INDEX IF NOT EXISTS runs_duel ON runs (duel_code);

CREATE TABLE IF NOT EXISTS duels (
    code TEXT PRIMARY KEY,
    lang TEXT NOT NULL,
    word TEXT NOT NULL,
    created_by INTEGER NOT NULL REFERENCES players(id),
    created_ms INTEGER NOT NULL
);
`

const UNIQUE_INDEXES = [
    'DROP INDEX IF EXISTS runs_daily_once',
    "CREATE UNIQUE INDEX runs_daily_once ON runs (player_id, mode, lang, day) WHERE day IS NOT NULL AND player_id IS NOT NULL AND state != '{}'",
    'CREATE UNIQUE INDEX IF NOT EXISTS runs_duel_once ON runs (player_id, duel_code) WHERE duel_code IS NOT NULL',
]

export function openDb(file) {
    if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true })
    const db = new DatabaseSync(file)
    db.exec('PRAGMA journal_mode = WAL')
    db.exec('PRAGMA foreign_keys = ON')
    db.exec(SCHEMA)
    for (const statement of UNIQUE_INDEXES) {
        try {
            db.exec(statement)
        } catch (error) {
            console.warn(`Could not create a unique index: ${error.message}`)
        }
    }
    return db
}
