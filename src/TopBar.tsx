import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Bars3Icon } from '@heroicons/react/24/solid';
interface TopBarProps {
  hasToken: boolean;
  username?: string;
}

/**
 * TopBar-Komponente
 *
 * Diese Komponente stellt die obere Navigationsleiste der Anwendung dar.
 * Sie zeigt das Logo, ein Dropdown-Menü für Navigation und Admin-Funktionen sowie Login/Logout-Buttons an.
 *
 * Props:
 * - hasToken: Gibt an, ob ein Benutzer eingeloggt ist.
 * - username: Optionaler Benutzername, um Admin-Funktionen anzuzeigen.
 *
 * Funktionen:
 * - Zeigt für Admins zusätzliche Links zum Anlegen von Büchern und Bildern.
 * - Ermöglicht das Ein- und Ausloggen über Cookies.
 * - Bietet einen Link zur Suchseite.
 */
const TopBar = ({ hasToken, username }: TopBarProps) => {
  return (
    <div
      data-theme="black"
      className="bg-neutral w-full flex flex-row items-center justify-between p-4 flex-nowrap"
    >
      <div className="flex items-center gap-1 relative">
        <Link to="/">
          <img
            src="/file.svg"
            alt="Banner"
            className="w-14 h-14 flex-shrink-0 m-0"
          />
        </Link>
        <div className="dropdown dropdown-start">
          <div tabIndex={0} role="button" className="btn btn-accent btn-ghost">
            <Bars3Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ml-0 text-primary" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-primary rounded-box z-1 w-52 p-2 shadow-sm"
          >
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
        <button
          data-theme="black"
          className="btn btn-accent"
          onClick={() => {
            Cookies.remove('access_token');
            Cookies.remove('username');
            Cookies.remove('refresh_token');
            window.location.reload();
          }}
        >
          Logout
        </button>
      ) : (
        <Link to="/login">
          <button data-theme="black" className="btn btn-accent">
            Login
          </button>
        </Link>
      )}
    </div>
  );
};

export default TopBar;
