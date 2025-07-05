import { useEffect, useState } from 'react';
import '../styles/HomePage.css';
import Post from './Post';
import { useAuth } from '../contexts/AuthContext';
import { fetchAllPosts } from '../utils/utils';
import { useLoading } from '../contexts/LoadingContext';

const HomePage = () => {
    const [allPosts, setAllPosts] = useState([]);
    const { user } = useAuth();
    const { loading, setLoading } = useLoading();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchAllPosts(setAllPosts);
            setLoading(false);
        };
        loadData();
    }, []);

    return (
        <>
            {/*will be a carousel*/}
            <div className="hero-section">
                <h3>
                    Welcome
                    {user ? `, ${user.user_metadata?.name || user.email}` : ''}
                </h3>
            </div>
            <div className="posts">
                <h3>Posts</h3>
                {loading ? (
                    <div className="loading-spinner">Loading...</div>
                ) : allPosts.length === 0 ? (
                    <p>No posts yet.</p>
                ) : (
                    allPosts.map((post) => (
                        <div className="post-div" key={post.id}>
                            <Post post={post} />
                        </div>
                    ))
                )}
            </div>
        </>
    );
};
export default HomePage;
