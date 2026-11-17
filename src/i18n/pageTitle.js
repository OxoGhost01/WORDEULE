const PAGE_KEYS = {
    daily: 'modes.daily',
    classic: 'modes.classic',
    locked: 'modes.locked',
    hardcore: 'modes.hardcore',
    survival: 'modes.survival',
    blitz: 'modes.blitz',
    reverse: 'modes.reverse',
    custom: 'modes.custom',
    duel: 'modes.duel',
    'how-to-play': 'pages.howToPlay',
    stats: 'pages.stats',
    leaderboard: 'pages.leaderboard',
    settings: 'pages.settings',
    about: 'pages.about',
}

export function pageTitle(pathname, t) {
    const key = PAGE_KEYS[pathname.split('/')[1]]
    return key ? `${t(key)} · WORDEULE` : t('app.title')
}
