import { useState } from "react";
import { Link } from "react-router";
const apiURL = import.meta.env.VITE_API_URL;

const LogInPage = () => {
    const [formData, setFormData] = useState({email: '', password: ''});

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleCreateNewUser = async (e) => {
        e.preventDefault();
        const createNewUserURL = `${apiURL}/api/auth/login`;
        try {
          const response = await fetch(createNewUserURL, {
            method: 'POST',
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
            headers: {'Content-Type': 'application/json'},
          });
          if (!response.ok) {
            throw new Error("Failed to log in");
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
                <h1 className="signup-title">Log In</h1>
                <form className="signup-form" onSubmit={handleCreateNewUser}>
                <label htmlFor="email" >Email:</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleFormChange}/>

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleFormChange}/>

                <button type='submit'>Log In</button>
            </form>
            <Link to="/signup" className="login-page-link">Don't have an account? Sign Up</Link>
            </div>
        </>
    );
};
export default LogInPage;
