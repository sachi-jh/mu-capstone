import { createClient } from '@supabase/supabase-js';
const supabase = createClient("https://wvmxtvzlnazeamtfoksk.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bXh0dnpsbmF6ZWFtdGZva3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Mzc1NjIsImV4cCI6MjA2NjMxMzU2Mn0.k-PEEYExt4eS0ZTAkfNFYTuPQ0-9jArnX0UTh8V8rnw");


const SignUpPage = () => {
    return (
        <>
            <h1>Sign Up</h1>
            <form action="">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" />

                <label for="password">Password:</label>
                <input type="password" id="password" name="password" />
            </form>
        </>
    );
};
export default SignUpPage;
