import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { fetchUserInfo } from '../utils/utils';
import '../styles/ProfilePage.css';
import { Link } from 'react-router';
import ParkCard from './ParkCard';

const ProfilePage = () => {
    const { user } = useAuth();
    const [userInfo, setUserInfo] = useState(null);
    const { loading, setLoading } = useLoading();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            if (user) {
                await fetchUserInfo(user.id, setUserInfo);
            }
            setLoading(false);
        };
        loadData();
    }, [user]);

    return (
        <>
            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : user && userInfo ? (
                <div className="profile-container">
                    <section className="user-info">
                        <h2>{userInfo.name}</h2>
                        <p>{userInfo.role}</p>
                        <img src={userInfo.image_url} alt="profile" />
                        <p>this is my bio</p>
                    </section>
                    <section className="user-activity">
                        <div className="trips-container">
                            <div className="trips-header">
                                <h3>Trips: </h3>
                                <button>
                                    <Link to={'/trips'}>Go to Trips</Link>{' '}
                                </button>
                            </div>
                            <article className="trips-items">
                                {userInfo.trips &&
                                    userInfo.trips.map((item) => (
                                        <>
                                            <ParkCard
                                                image_url={
                                                    item.location
                                                        .image_url[3] ||
                                                    item.location.image_url[0]
                                                }
                                                name={item.name}
                                                description={item.location.name}
                                            />
                                        </>
                                    ))}
                            </article>
                        </div>
                        <div className="wishlist-container">
                            <div className="wishlist-header">
                                <h3>Wishlist: </h3>
                                <button>
                                    <Link to={'/edit-wishlist'}>
                                        Edit Wishlist
                                    </Link>{' '}
                                </button>
                            </div>
                            <article className="wishlist-items">
                                {userInfo.wishlist &&
                                    userInfo.wishlist.map((item) => (
                                        <>
                                            <ParkCard
                                                image_url={
                                                    item.image_url[2] ||
                                                    item.image_url[0]
                                                }
                                                name={item.name}
                                            />
                                        </>
                                    ))}
                            </article>
                        </div>

                        <h3>Posts: </h3>
                    </section>
                </div>
            ) : (
                <p>Could not load user info.</p>
            )}
        </>
    );
};
export default ProfilePage;
