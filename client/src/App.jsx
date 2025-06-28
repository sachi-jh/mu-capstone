import {BrowserRouter, NavLink, Routes, Route } from 'react-router';
import './styles/App.css';
import HomePage from './components/HomePage';
import SignUpPage from './components/SignUpPage';
import ParksPage from './components/ParksPage';
import LogInPage from './components/LogInPage';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './utils/supabaseClient';
import ParkInfoPage from './components/ParkInfoPage';

function App() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
      <>
        <BrowserRouter>
          <header>
              <nav>
                  <NavLink to="/">Home</NavLink>
                  <NavLink to="/parks">Parks</NavLink>
                  {!user && <NavLink to="/login">Log In</NavLink>}
                  {user && <button onClick={handleLogout}>Log Out</button>}
              </nav>
          </header>
          <main>
              <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="signup" element={<SignUpPage />} />
                  <Route path="parks" element={<ParksPage />} />
                  <Route path="login" element={<LogInPage />} />
                  <Route path="parks/:id" element={<ParkInfoPage />} />
              </Routes>
          </main>
          <footer></footer>
        </BrowserRouter>
      </>
  );
};

export default App;
