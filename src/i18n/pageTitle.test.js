import { describe, expect, it } from 'vitest'
import { translate } from './translate.js'
import { pageTitle } from './pageTitle.js'

const french = (key) => translate('fr', key)
const english = (key) => translate('en', key)

describe('pageTitle', () => {
    it('names the page of a mode', () => {
        expect(pageTitle('/blitz', english)).toBe('Blitz · WORDEULE')
        expect(pageTitle('/daily', french)).toBe('Mot du jour · WORDEULE')
    })

    it('ignores what comes after the first part of the address', () => {
        expect(pageTitle('/custom/7', english)).toBe('Custom · WORDEULE')
        expect(pageTitle('/duel/ABC123', english)).toBe('Duel · WORDEULE')
    })

    it('uses the title of the site for the menu and unknown pages', () => {
        expect(pageTitle('/', english)).toBe(english('app.title'))
        expect(pageTitle('/nothing-here', french)).toBe(french('app.title'))
    })
})
