import { SCORE } from '../config.js'

// Points of one won round: the fewer tries used, the more points, then multiplied by the difficulty.
// A lost round gives nothing.
export default function roundScore(tries, maxTries, multiplier = 1) {
    return Math.round((maxTries - tries + 1) * SCORE.pointsPerTry * multiplier)
}

// Difficulty bonus: x1.5 for 6 letters, x2 for 7 letters or more, x1.5 in locked mode (the hard mode),
// and x the number of grids, so a hardcore game (4 grids) is worth x4
export function scoreMultiplier(mode, wordLength, grids = 1) {
    const byLength = SCORE.lengthBonus.find((b) => wordLength >= b.from)?.bonus ?? 1
    const byMode = SCORE.modeBonus[mode] ?? 1
    return byLength * byMode * grids
}
