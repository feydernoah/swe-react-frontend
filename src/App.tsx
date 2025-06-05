import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './login.tsx';
import Cookies from 'js-cookie';

const App = () => {
  const hasToken = !!Cookies.get('access_token');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="*"
          element={
            <div className="app-bg">
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
              {/* Hier kann weiterer Seiteninhalt stehen */}
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;