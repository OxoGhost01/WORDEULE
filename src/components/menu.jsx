import { Link } from 'react-router'


export default function Menu() {
    return (
        <section className="menu">
        <ul>
            <li><Link to="/daily">daily</Link></li>
            <li><Link to="/classic">classic</Link></li>
            <li><Link to="/custom">custom</Link></li>
            <li><Link to="/hardcore">hardcore</Link></li>
            <li><Link to="/leaderboard">leaderboard</Link></li>
            <li><Link to="/about">about</Link></li>
        </ul>
        </section>
    )
}
