import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import './Login.css'
interface TopBarProps {
  hasToken: boolean;
  username?: string;
}

const TopBar = ({ hasToken, username }: TopBarProps) => {
  return (
    <div data-theme="lofi" className="bg-base w-full flex flex-row items-center justify-between p-4 flex-nowrap">
      <div className="flex items-center gap-1 relative">
        <Link to="/">
          <img
            src="/file.svg"
            alt="Banner"
            className="w-14 h-14 flex-shrink-0 m-0"
          />
        </Link>
        <div className="dropdown dropdown-start">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle m-1">
            <Bars3Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ml-0 text-primary" />
          </div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
            {username === 'admin' && (
              <>
                <li>
                  <Link to="/create">Anlegen</Link>
                </li>
                <li>
                  <Link to="/create-image">Bild Anlegen</Link>
                </li>
              </>
            )}
            <li>
              <Link to="/search">Search</Link>
            </li>
          </ul>
        </div>
      </div>
      {hasToken ? (
        <button data-theme="lofi" className="btn btn-info" onClick={() => { Cookies.remove('access_token'); Cookies.remove('username'); Cookies.remove('refresh_token'); window.location.reload(); }}>
          Logout
        </button>
      ) : (
        <Link to="/login">
          <button data-theme="lofi" className="btn btn-info">Login</button>
        </Link>
      )}
    </div>
  );
};

export default TopBar;