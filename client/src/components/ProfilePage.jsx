import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { fetchUserInfo } from '../utils/utils';
import '../styles/ProfilePage.css';
import { Link } from 'react-router';

const ProfilePage = () => {
    const { user } = useAuth();
    const [userInfo, setUserInfo] = useState(null);
    const { loading, setLoading } = useLoading();

    useEffect(() => {
        if (!user) return;
        const loadData = async () => {
            setLoading(true);
            await fetchUserInfo(user.id, setUserInfo);
            setLoading(false);
        };
        loadData();
    }, [user]);

    return (
        <>
            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : user && userInfo ? (
                <div>
                    <p>{userInfo.name}</p>
                    <img src={userInfo.image_url} alt="profile" />
                    <p>this is my bio</p>
                    <h3>Trips: </h3>
                    <h3>Wishlist: </h3>
                    <button>
                        <Link to={'/edit-wishlist'}>Edit Wishlist</Link>{' '}
                    </button>
                    <h3>Posts: </h3>
                </div>
            ) : (
                <p>Could not load user info.</p>
            )}
        </>
    );
};
export default ProfilePage;
