import { Link } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/solid';
import Cookies from 'js-cookie';

interface TopBarProps {
  hasToken: boolean;
  onLogout: () => void;
}

const TopBar = ({ hasToken, onLogout }: TopBarProps) => (
 <div className="top-bar">
                <img
                  src="/file.svg"
                  alt="Banner"
                  className="banner-svg"
                />
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