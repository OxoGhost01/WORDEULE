export const PORT = Number(process.env.PORT ?? 3000)
export const DATA_DIR = process.env.DATA_DIR ?? './data'
export const PRODUCTION = process.env.NODE_ENV === 'production'
export const TRUST_PROXY = Number(process.env.TRUST_PROXY ?? 2)
export const DAILY_SECRET = process.env.DAILY_SECRET ?? ''

export const LIMITS = {
    topPlayers: 100,
}

export const RATE_LIMITS = {
    read: { windowMs: 60_000, limit: 120 },
    play: { windowMs: 60_000, limit: 90 },
    start: { windowMs: 60_000, limit: 30 },
    register: { windowMs: 3_600_000, limit: 10 },
}
