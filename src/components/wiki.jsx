
export default function Wiki({ word }) {
    word = word.toLowerCase()
    return (
        <section className="wiki">
            <a href={`https://en.wiktionary.org/wiki/${word}`} target="_blank" rel="noreferrer">See the word on Wiktionary</a>
        </section>
    )
}
