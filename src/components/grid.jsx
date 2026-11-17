import { gridSolved, shownRows } from '../../shared/evaluate.js'

export default function Grid({ rows, grid = 0, guess, maxTries = 6, wordLength, width = '100%', fixed = [], shake = { n: 0, row: -1 }, finished = false }) {
    function line(letters, rowIndex, statuses = [], lockedLetters = []) {
        return Array.from({ length: wordLength }, (_, index) => {
            const letter = letters[index] === ' ' ? undefined : letters[index]
            const status = statuses[index] ?? ''
            const tilt = ((rowIndex * 5 + index * 3) % 7 - 3) * 0.5
            return (
                <span
                    key={index}
                    className={`tile ${status} ${letter && !status ? 'typed' : ''} ${letter ? '' : 'empty'} ${lockedLetters[index] ? 'locked' : ''}`}
                    style={{ '--r': `${tilt}deg`, '--d': `${index * 90}ms` }}
                >
                    <b>{letter ?? '_'}</b>
                </span>
            )
        })
    }

    const shown = shownRows(rows, grid)
    const solved = gridSolved(rows, grid)
    const typing = !solved && !finished

    function row(i) {
        if (i < shown.length) return line(shown[i].guess, i, shown[i].results[grid])
        if (i === shown.length && typing) return line(guess, i, [], fixed)
        return line('', i)
    }

    function rowProps(i) {
        if (!(i === shown.length && typing)) return { key: i, className: 'flex gap-1' }
        const shaking = shake.n > 0 && shake.row === rows.length
        return { key: `typing-${shake.n}`, className: `flex gap-1 ${shaking ? 'shake' : ''}` }
    }

    return (
        <div className="flex flex-col gap-1" style={{ width }}>
            {Array.from({ length: maxTries }, (_, i) => {
                const { key, className } = rowProps(i)
                return <div key={key} className={className}>{row(i)}</div>
            })}
        </div>
    )
}
