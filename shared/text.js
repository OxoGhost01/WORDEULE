// Removes the accents and puts the text in uppercase: é -> E, ç -> C.
// The game compares plain letters, so a word is typed without accents.
export function normalize(text) {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
}
