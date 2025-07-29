import { useAuth } from '../contexts/AuthContext';
import {
    fetchParks,
    getUserProfileInfo,
    updateWishlist,
    WISHLIST,
    VISITED,
} from '../utils/utils';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import '../styles/EditWishListPage.css';
import { useLoading } from '../contexts/LoadingContext';

const EditWishListPage = () => {
    const [parkData, setParkData] = useState([]);
    const [formData, setFormData] = useState({});
    const { user } = useAuth();
    const { loading, setLoading } = useLoading();
    const nav = useNavigate();

    const fetchUserWishlist = async () => {
        setLoading(true);
        const userInfo = await getUserProfileInfo(user.id);
        const wishlist = userInfo.wishlist;
        const visited = userInfo.visited;
        const data = {};

        wishlist.forEach((park) => {
            data[park.id] = WISHLIST;
        });

        visited.forEach((park) => {
            data[park.id] = VISITED;
        });

        setFormData(data);
        setLoading(false);
    };
    useEffect(() => {
        fetchParks(setParkData);
    }, []);

    useEffect(() => {
        if (user && user.id) {
            fetchUserWishlist();
        }
    }, [user]);

    const handleInputChange = (parkId, status) => {
        setFormData((prev) => ({
            ...prev,
            [parkId]: status,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        await updateWishlist(user.id, formData);
        nav('/profile');
    };

    const handleClear = (parkId) => {
        setFormData((prev) => ({
            ...prev,
            [parkId]: null,
        }));
    };

    return (
        <div className="wishlist-page-wrapper">
            <div className="wishlist-page-header">
                <h1>Edit Your Park Wishlist</h1>
                <p className="wishlist-subtitle">
                    Mark parks as <span className="visited-label">Visited</span>{' '}
                    or <span className="wishlist-label">Want to Visit</span>
                </p>
            </div>
            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : (
                <form onSubmit={handleSubmit} className="wishlist-form">
                    <div className="wishlist-form-buttons">
                        <button type="submit" className="wishlist-update-btn">
                            Update Wishlist
                        </button>
                    </div>
                    <div className="wishlist-cards-container">
                        {parkData.map((park) => (
                            <div key={park.id} className="wishlist-card">
                                <div className="wishlist-card-text">
                                    <h3 className="wishlist-park-name">
                                        {park.name}
                                    </h3>
                                    <p>{park.description}</p>
                                </div>
                                <div className="wishlist-card-body">
                                    <label className="wishlist-radio-label">
                                        <input
                                            type="radio"
                                            name={`status-${park.id}`}
                                            checked={
                                                formData[park.id] === VISITED
                                            }
                                            onChange={() =>
                                                handleInputChange(
                                                    park.id,
                                                    VISITED
                                                )
                                            }
                                        />
                                        <span className="visited-label">
                                            Visited
                                        </span>
                                    </label>
                                    <label className="wishlist-radio-label">
                                        <input
                                            type="radio"
                                            name={`status-${park.id}`}
                                            checked={
                                                formData[park.id] === WISHLIST
                                            }
                                            onChange={() =>
                                                handleInputChange(
                                                    park.id,
                                                    WISHLIST
                                                )
                                            }
                                        />
                                        <span className="wishlist-label">
                                            Want to Visit
                                        </span>
                                    </label>
                                    <button
                                        type="button"
                                        className="wishlist-clear-btn"
                                        onClick={() => handleClear(park.id)}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </form>
            )}
        </div>
    );
};
export default EditWishListPage;
