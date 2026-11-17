import { API_URL } from '../config.js'
import { getToken, getUsername, saveToken } from './storage.js'

export class ApiError extends Error {
    constructor(status, code) {
        super(code)
        this.status = status
        this.code = code
    }
}

async function raw(path, { method = 'GET', body, token } = {}) {
    const headers = {}
    if (body) headers['Content-Type'] = 'application/json'
    if (token) headers.Authorization = `Bearer ${token}`

    let response
    try {
        response = await fetch(`${API_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
    } catch {
        throw new ApiError(0, 'connection')
    }

    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new ApiError(response.status, data.error ?? 'server')
    return data
}

let registering = null

export async function registerPlayer(username) {
    const { token } = await raw('/players', { method: 'POST', body: { username } })
    saveToken(token)
    return token
}

async function ensureToken() {
    const saved = getToken()
    if (saved) return saved
    registering ??= registerPlayer(getUsername()).finally(() => { registering = null })
    return registering
}

async function authed(path, options) {
    try {
        return await raw(path, { ...options, token: await ensureToken() })
    } catch (error) {
        if (error.status !== 401) throw error
        saveToken('')
        return raw(path, { ...options, token: await ensureToken() })
    }
}

export const renamePlayer = (username) => authed('/players/me', { method: 'PATCH', body: { username } })

export const startRun = (mode, lang) => authed('/runs', { method: 'POST', body: { mode, lang } })
export const sendGuess = (runId, guess) => authed(`/runs/${runId}/guess`, { method: 'POST', body: { guess } })
export const nextRound = (runId) => authed(`/runs/${runId}/next`, { method: 'POST', body: {} })

export function fetchLeaderboard(lang, mode, period = 'all') {
    return raw(`/scores/${lang}/${mode}?period=${period}`, { token: getToken() })
}

export async function fetchDailyCount(lang) {
    return (await raw(`/daily/count/${lang}`)).count
}

export const createDuel = (lang) => authed('/duels', { method: 'POST', body: { lang } })
export const joinDuel = (code) => authed(`/duels/${code}/join`, { method: 'POST', body: {} })
export const fetchDuel = (code) => authed(`/duels/${code}`)
