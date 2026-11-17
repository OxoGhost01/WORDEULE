import { SCORE } from './rules.js'

export default function roundScore(tries, maxTries, multiplier = 1) {
    return Math.round((maxTries - tries + 1) * SCORE.pointsPerTry * multiplier)
}

export function scoreMultiplier(mode, wordLength, grids = 1) {
    const byLength = SCORE.lengthBonus.find((b) => wordLength >= b.from)?.bonus ?? 1
    const byMode = SCORE.modeBonus[mode] ?? 1
    return byLength * byMode * grids
}
