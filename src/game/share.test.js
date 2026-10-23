import { describe, expect, it } from 'vitest'
import shareText from './share.js'

describe('shareText', () => {
    it('shows the colors of each guess and no letter', () => {
        const text = shareText('classic', ['CRANE'], ['BUMPY', 'CRANE'], 6)
        const [header, ...lines] = text.split('\n')
        expect(header).toBe('WORDEULE classic 2/6')
        expect(lines).toEqual(['⬛⬛⬛⬛⬛', '🟦🟦🟦🟦🟦'])
    })

    it('writes X when the game is lost', () => {
        expect(shareText('classic', ['CRANE'], ['BUMPY'], 1).split('\n')[0]).toBe('WORDEULE classic X/1')
    })
})
