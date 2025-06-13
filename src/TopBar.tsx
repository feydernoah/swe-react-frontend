import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import './TopBar.css';
import './Login.css'
interface TopBarProps {
  hasToken: boolean;
  username?: string;
}

const TopBar = ({ hasToken, username }: TopBarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="top-bar">
      <div className="flex items-center gap-1 relative">
        <Link to="/">
          <img
            src="/file.svg"
            alt="Banner"
            className="banner-svg"
          />
        </Link>
        <button
          className="burger-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Menü öffnen"
        >
          <Bars3Icon className="top-bar-burger" />
        </button>
        {menuOpen && (
          <div className="burger-menu">
            {username === 'admin' && (
              <>
              <Link to="/create">
                    <button className="burger-options">Anlegen</button>
              </Link>
              <Link to="/create-image">
                    <button className="burger-options">Bild Anlegen</button>
              </Link>
              </>
            )}
            <Link to="/search">
                    <button className="burger-options">Search</button>
            </Link>

          </div>
        )}
      </div>
      {hasToken ? (
        <button className="login-btn" onClick={() => { Cookies.remove('access_token'); Cookies.remove('username'); window.location.reload(); }}>
          Logout
        </button>
      ) : (
        <Link to="/login">
          <button className="login-btn">Login</button>
        </Link>
      )}
    </div>
  );
};

export default TopBar;