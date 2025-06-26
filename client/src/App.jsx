import { NavLink, Routes, Route } from 'react-router';
import './styles/App.css';
import HomePage from './HomePage';
import SignInPage from './SignInPage';
import SignUpPage from './SignUpPage';

function App() {

  return (
    <>
      <header>
        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/signin">Sign In</NavLink>
          <NavLink to="/signup">Sign Up</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="signin" element={<SignInPage />} />
          <Route path="signup" element={<SignUpPage />} />
        </Routes>
      </main>
      <footer></footer>
    </>
  );
};

export default App;
