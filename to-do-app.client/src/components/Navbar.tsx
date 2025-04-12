import { Link } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';

const Navbar = () => {
    return (
        <div className='navBar w-1/6'>
            <div className='stocks'>
                <Link to="/">Stocks</Link>
            </div>
            <div className='avatars'>
                <Link to="/avatars">Avatary</Link>
            </div>
            <LogoutButton />
        </div>
    )

}

export default Navbar;