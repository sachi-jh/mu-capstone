import { useEffect, useState } from 'react';
import '../styles/HomePage.css';
import Post from './Post';
import { useAuth } from '../contexts/AuthContext';
import {
    fetchAllPosts,
    fetchAllAlerts,
    fetchAllEvents,
    fetchNPSEventsData,
    fetchNPSAlertsData,
} from '../utils/utils';
import { useLoading } from '../contexts/LoadingContext';
import { Link } from 'react-router';

const HomePage = () => {
    const [allPosts, setAllPosts] = useState([]);
    const { user } = useAuth();
    const { loading, setLoading } = useLoading();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const posts = await fetchAllPosts();
            const events = await fetchAllEvents();
            const alerts = await fetchAllAlerts();
            const eventsUpdated = await fetchNPSEventsData();
            const alertsUpdated = await fetchNPSAlertsData();
            const allData = [
                ...posts,
                ...events,
                ...alerts,
                ...eventsUpdated,
                ...alertsUpdated,
            ];
            allData.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setAllPosts(allData);
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
                <button className="create-post-button">
                    <Link to={'/posts/create'}>Create New</Link>
                </button>
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
