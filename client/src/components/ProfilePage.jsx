import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { fetchUserInfo } from '../utils/utils';
import '../styles/ProfilePage.css';
import { Link } from 'react-router';
import ParkCard from './ParkCard';
import EditProfileModal from './EditProfileModal';
import Post from './Post';

const ProfilePage = () => {
    const { user } = useAuth();
    const [userInfo, setUserInfo] = useState(null);
    const { loading, setLoading } = useLoading();
    const [profileModalOpen, setProfileModalOpen] = useState(false);

    const openModal = () => setProfileModalOpen(true);
    const closeModal = () => setProfileModalOpen(false);

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
                        <p>{userInfo.bio}</p>
                        <button onClick={openModal}>Edit Profile</button>
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

                        <div className="post-container">
                            <div className="post-container-header">
                                <h3>Posts: </h3>
                                <button>
                                    <Link to={'/posts/create'}>
                                        Create New
                                    </Link>{' '}
                                </button>
                            </div>
                            <article className="post-items">
                                {userInfo.posts &&
                                    userInfo.posts.map((item) => (
                                        <Post post={item} />
                                    ))}
                            </article>
                        </div>
                    </section>
                    {profileModalOpen && (
                        <div className="profile-modal">
                            <EditProfileModal
                                userInfo={userInfo}
                                setUserInfo={setUserInfo}
                                closeModal={closeModal}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <p>Could not load user info.</p>
            )}
        </>
    );
};
export default ProfilePage;
