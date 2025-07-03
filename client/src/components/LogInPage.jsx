import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../utils/supabaseClient';
const apiURL = import.meta.env.VITE_API_URL;

const LogInPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const nav = useNavigate();

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });
            if (error) {
                setError(error.message);
                return;
            }

            if (data.user) {
                nav('/');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <div className="signup-container">
                <h1 className="signup-title">Log In</h1>
                <form className="signup-form" onSubmit={handleLogin}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                    />

                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleFormChange}
                    />

                    <button type="submit" className="signup-button">
                        Log In
                    </button>
                    {error && <div className="error-message">{error}</div>}
                </form>
                <Link to="/signup" className="login-page-link">
                    Don't have an account? Sign Up
                </Link>
            </div>
        </>
    );
};
export default LogInPage;
