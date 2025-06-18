import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './Login.tsx';
import Cookies from 'js-cookie';
import TopBar from './TopBar.tsx';
import SearchPage from './SearchPage';
import Create from './Create';
import CreateImage from './CreateImage';
import LandingPage from './LandingPage.tsx';

/**
 * Hauptkomponente der Anwendung.
 *
 * Verantwortlich für:
 * - Routing zwischen den Seiten (Login, Suche, Buch-/Bild-Anlegen)
 * - Einbindung des Layouts (z.B. TopBar)
 * - Übergabe von Login-Informationen via Cookies
 */
const App = () => {
  const hasToken = !!Cookies.get('access_token');
  const username = Cookies.get('username');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create" element={<Create />} />
        <Route path="/create-image" element={<CreateImage />} />
        <Route
          path="/search"
          element={
            <div className="app-bg">
              <TopBar hasToken={hasToken} username={username} />
              <SearchPage />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
