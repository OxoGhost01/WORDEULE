// Points of one won round: the fewer tries used, the more points. A lost round gives nothing.
export default function roundScore(tries, maxTries) {
    return (maxTries - tries + 1) * 100
}
