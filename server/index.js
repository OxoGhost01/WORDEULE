import { join } from 'node:path'
import { createApp } from './app.js'
import { openDb } from './db.js'
import { createWordBank } from './words.js'
import { migrateLegacy } from './migrate.js'
import { DAILY_SECRET, DATA_DIR, PORT, PRODUCTION } from './config.js'

if (PRODUCTION && !DAILY_SECRET) {
    console.error('DAILY_SECRET is required in production')
    process.exit(1)
}

const db = openDb(join(DATA_DIR, 'wordeule.db'))
const migrated = migrateLegacy(db, join(DATA_DIR, 'scores.json'))
if (migrated > 0) console.log(`Imported ${migrated} legacy scores`)

const bank = createWordBank({ dir: join(DATA_DIR, 'words') })
const app = createApp({ db, bank, secret: DAILY_SECRET || 'development-secret', log: true })

app.listen(PORT, () => console.log(`WORDEULE server on port ${PORT}`))
