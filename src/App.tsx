import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './Login.tsx';
import Cookies from 'js-cookie';
import TopBar from './TopBar';

const App = () => {
  const hasToken = !!Cookies.get('access_token');
  const handleLogout = () => {
    Cookies.remove('access_token');
    window.location.reload();
  };
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="*"
          element={
            <div className="app-bg">
              <TopBar hasToken={hasToken} onLogout={handleLogout} />
              {/* Hier kann weiterer Seiteninhalt stehen */}
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;