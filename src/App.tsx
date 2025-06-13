import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './Login.tsx';
import Cookies from 'js-cookie';
import TopBar from './TopBar';
import SearchPage from './SearchPage';
import Create from './Create';
import CreateImage from './CreateImage';

const App = () => {
  const hasToken = !!Cookies.get('access_token');
  const username = Cookies.get('username');
  return (
    <BrowserRouter>
      <Routes>
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
        <Route
          path="/"
          element={
            <div className="app-bg">
              <TopBar hasToken={hasToken} username={username} />
              {/* Hier kann weiterer Seiteninhalt stehen */}
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;