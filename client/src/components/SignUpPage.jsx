import { useState } from "react";
import { Link } from "react-router";
import '../styles/SignUpPage.css'
const apiURL = import.meta.env.VITE_API_URL;

const SignUpPage = () => {
    const [formData, setFormData] = useState({email: '', password: '', name: '', img_url:''});

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleCreateNewUser = async (e) => {
        e.preventDefault();
        const createNewUserURL = `${apiURL}/api/auth/register`;
        try {
          const response = await fetch(createNewUserURL, {
            method: 'POST',
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              name: formData.name,
            }),
            headers: {'Content-Type': 'application/json'},
          });
          if (!response.ok) {
            throw new Error("Failed to create user");
          }
          const body = await response.json();
          console.log(body);
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
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} />

                    <label htmlFor="img_url">Profile Image URL:</label>
                    <input type="text" id="img_url" name="img_url" value={formData.img_url} onChange={handleFormChange} />

                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleFormChange} />

                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleFormChange} />

                    <button type="submit" className="signup-button">Register</button>
                </form>
                <Link to="/login" className="login-page-link">Already have an account? Log in</Link>
            </div>
        </>
    );
};
export default SignUpPage;
