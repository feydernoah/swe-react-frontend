import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Bars3Icon } from '@heroicons/react/24/solid';
import './TopBar.css';
interface TopBarProps {
  hasToken: boolean;
}

const TopBar = ({ hasToken }: TopBarProps) => (
  <div className="top-bar">
    <img
      src="/file.svg"
      alt="Banner"
      className="banner-svg"
    />
    <Bars3Icon className="top-bar-burger"/>
    {hasToken ? (
      <button className="login-btn" onClick={() => { Cookies.remove('access_token'); window.location.reload(); }}>
        Logout
      </button>
    ) : (
      <Link to="/login">
        <button className="login-btn">Login</button>
      </Link>
    )}
  </div>
);

export default TopBar;