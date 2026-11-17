export default function Pattern({ pattern, width = '14rem' }) {
    return (
        <div className="flex gap-1" style={{ width }} role="img" aria-label={pattern.join(', ')}>
            {pattern.map((status, i) => (
                <span key={i} className={`tile ${status}`} style={{ '--r': '0deg', '--d': `${i * 90}ms` }}>
                    <b>?</b>
                </span>
            ))}
        </div>
    )
}
