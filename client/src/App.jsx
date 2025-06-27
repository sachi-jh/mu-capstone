import { NavLink, Routes, Route } from 'react-router';
import './styles/App.css';
import HomePage from './components/HomePage';
import SignUpPage from './components/SignUpPage';
import ParksPage from './components/ParksPage';
import LogInPage from './components/LogInPage';

function App() {

  return (
      <>
          <header>
              <div></div>
              <nav>
                  <NavLink to="/">Home</NavLink>
                  <NavLink to="/signup">Sign Up</NavLink>
                  <NavLink to="/parks">Parks</NavLink>
              </nav>
          </header>
          <main>
              <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="signup" element={<SignUpPage />} />
                  <Route path="parks" element={<ParksPage />} />
                  <Route path="login" element={<LogInPage />} />
              </Routes>
          </main>
          <footer></footer>
      </>
  );
};

export default App;
