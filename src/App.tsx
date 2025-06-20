import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './Login.tsx';
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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create" element={<Create />} />
        <Route path="/create-image" element={<CreateImage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
