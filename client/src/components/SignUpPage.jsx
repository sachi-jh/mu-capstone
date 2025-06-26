
const SignUpPage = () => {
    return (
        <>
            <h1>Sign Up</h1>
            <form>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" placeholder="Email" />

                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" placeholder="Username" />

                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Password" />

                <button type="submit">Register</button>
            </form>

        </>
    );
};
export default SignUpPage;
