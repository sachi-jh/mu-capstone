import { Link } from 'react-router';

const Navbar = () => {
    return (
        <>
            <ul>
                <Link to={'/'} > Home</Link>
                <Link to={'/signin'}> Sign In</Link>
                <Link to={'/signup'}> Sign Up</Link>
            </ul>
        </>
    )
}

export default Navbar;
