import { useCallback, useEffect, useState } from 'react';
import '../styles/HomePage.css';
import Post from './Post';
import { useAuth } from '../contexts/AuthContext';
const apiURL = import.meta.env.VITE_API_URL;

const HomePage = () => {
    const [allPosts, setAllPosts] = useState([])
    const { user } = useAuth();

    const fetchPosts = useCallback(async () => {
        const fetchAllPostsURL = `${apiURL}/api/posts`;
        try {
          const response = await fetch(fetchAllPostsURL);
          if (response.status === 204) {
            setAllPosts([]);
            return;
          }
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          const body = await response.json();
          setAllPosts(body);
        } catch (error) {
          console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return(
        <>
            {/*will be a carousel*/}
            <div className="hero-section">
                <h3>Welcome{user ? `, ${user.user_metadata?.name || user.email}` : ''}</h3>
            </div>
            <div className="posts">
                <h3>Posts</h3>
                {allPosts.length !==0 ?
                    (allPosts.map((post) => (
                        <div className="post-div" key={post.id}>
                            <Post post={post}/>
                        </div>
                    ))) : (
                        <p>No posts yet.</p>
                )}
            </div>
        </>
    );
};
export default HomePage;
