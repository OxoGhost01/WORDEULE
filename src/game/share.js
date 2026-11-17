import { SHARE_EMOJI } from '../config.js'
import { allSolved, shownRows } from '../../shared/evaluate.js'

export default function shareText(title, rows, grids, maxTries, won = allSolved(rows, grids)) {
    const header = `WORDEULE ${title} ${won ? rows.length : 'X'}/${maxTries}`

    const blocks = Array.from({ length: grids }, (_, grid) =>
        shownRows(rows, grid)
            .map((row) => row.results[grid].map((status) => SHARE_EMOJI[status]).join(''))
            .join('\n'))

    return `${header}\n${blocks.join('\n\n')}`
}
