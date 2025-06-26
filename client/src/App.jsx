import { NavLink, Routes, Route } from 'react-router';
import './styles/App.css';
import HomePage from './components/HomePage';
import SignInPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import ParksPage from './components/ParksPage';

function App() {

  return (
    <>
      <header>
        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/signin">Sign In</NavLink>
          <NavLink to="/signup">Sign Up</NavLink>
          <NavLink to="/parks">Parks</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="signin" element={<SignInPage />} />
          <Route path="signup" element={<SignUpPage />} />
          <Route path="parks" element={<ParksPage/>} />
        </Routes>
      </main>
      <footer></footer>
    </>
  );
};

export default App;
