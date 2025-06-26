import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

const supabase = createClient('https://wvmxtvzlnazeamtfoksk.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bXh0dnpsbmF6ZWFtdGZva3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Mzc1NjIsImV4cCI6MjA2NjMxMzU2Mn0.k-PEEYExt4eS0ZTAkfNFYTuPQ0-9jArnX0UTh8V8rnw')

const SignInPage = () => {
    const [session, setSession] = useState(null);

    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    }, [])

    if (!session) {
      return (<Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />);
    }
    else {
      return (<div>Logged in!</div>);
    }
};
export default SignInPage;
