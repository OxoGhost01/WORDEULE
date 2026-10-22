
export default function Wiki({ word }) {
    const lower = word.toLowerCase()
    return (
        <section className="wiki">
            <a
                className="font-bold underline decoration-4 decoration-pink underline-offset-4 hover:bg-pink"
                href={`https://en.wiktionary.org/wiki/${lower}`}
                target="_blank"
                rel="noreferrer"
            >
                What does {word} mean ?
            </a>
        </section>
    )
}
