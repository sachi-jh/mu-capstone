import { NavLink, Routes, Route, useNavigate } from 'react-router';
import './styles/App.css';
import HomePage from './components/HomePage';
import SignUpPage from './components/SignUpPage';
import ParksPage from './components/ParksPage';
import LogInPage from './components/LogInPage';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './utils/supabaseClient';
import ParkInfoPage from './components/ParkInfoPage';
import TripsPage from './components/TripsPage';
import CreateNewTripForm from './components/CreateNewTripForm';
import CreateNewTripPage from './components/CreateNewTripPage';

function App() {
    const { user } = useAuth();
    const nav = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        nav('/login');
    };

    return (
        <>
            <header>
                <nav>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/parks">Parks</NavLink>
                    {!user && <NavLink to="/login">Log In</NavLink>}
                    {user && <button onClick={handleLogout}>Log Out</button>}
                    {user && <NavLink to="/trips">My Trips</NavLink>}
                </nav>
            </header>
            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/parks" element={<ParksPage />} />
                    <Route path="/login" element={<LogInPage />} />
                    <Route path="/parks/:id" element={<ParkInfoPage />} />
                    <Route path="/trips" element={<TripsPage />} />
                    <Route
                        path="/trips/create"
                        element={<CreateNewTripForm />}
                    />
                    <Route
                        path="/trips/edit/:tripId"
                        element={<CreateNewTripPage />}
                    />
                </Routes>
            </main>
            <footer></footer>
        </>
    );
}

export default App;
