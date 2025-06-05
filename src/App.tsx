import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './Login.tsx';
import Cookies from 'js-cookie';
import TopBar from './TopBar';

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
              <TopBar hasToken={hasToken}/>
              {/* Hier kann weiterer Seiteninhalt stehen */}
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;