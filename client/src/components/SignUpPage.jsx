import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../utils/supabaseClient';
import '../styles/SignUpPage.css';
const apiURL = import.meta.env.VITE_API_URL;

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: '',
        latitude: 0,
        longitude: 0,
    });
    const [error, setError] = useState(null);
    const nav = useNavigate();

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleCreateNewUser = async (e) => {
        e.preventDefault();
        if (
            formData.role === 'Ranger' &&
            !formData.email.match(/^[a-zA-Z0-9._%+-]+@nps\.gov$/)
        ) {
            setError(
                'You must use your work email to register as a park ranger'
            );
            return;
        }
        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                        role: formData.role,
                        latitude: formData.latitude,
                        longitude: formData.longitude,
                    },
                },
            });
            if (error) {
                if (
                    error.message.includes('User already registered') ||
                    error.code === 'user_already_exists'
                ) {
                    setError('User already exists with this email address');
                } else {
                    setError(error.message);
                }
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
                <h1 className="signup-title">Sign Up</h1>
                <form className="signup-form" onSubmit={handleCreateNewUser}>
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        required
                    />

                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        required
                    />

                    <label htmlFor="role">Are you a visitor or a ranger?</label>
                    <select
                        value={formData.role}
                        onChange={handleFormChange}
                        id="role"
                        name="role"
                        required
                    >
                        <option value="">Please select your role</option>
                        <option value="Visitor">Visitor</option>
                        <option value="Ranger">Ranger</option>
                    </select>

                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleFormChange}
                        required
                    />

                    <button type="submit" className="signup-button">
                        Register
                    </button>
                    {error && <div className="error-message">{error}</div>}
                </form>
                <Link to="/login" className="login-page-link">
                    Already have an account? Log in
                </Link>
            </div>
        </>
    );
};
export default SignUpPage;
