import { useAuth } from '../contexts/AuthContext';
import { fetchParks, getUserProfileInfo, updateWishlist } from '../utils/utils';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

const EditWishListPage = () => {
    const [parkData, setParkData] = useState([]);
    const [formData, setFormData] = useState({});
    const { user } = useAuth();
    const nav = useNavigate();

    const fetchUserWishlist = async () => {
        const userInfo = await getUserProfileInfo(user.id);
        const wishlist = userInfo.wishlist;
        const visited = userInfo.visited;
        const data = {};

        wishlist.forEach((park) => {
            data[park.id] = 'wishlist';
        });

        visited.forEach((park) => {
            data[park.id] = 'visited';
        });

        setFormData(data);
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

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log(formData);
        updateWishlist(user.id, formData);
    };

    const handleClear = (parkId) => {
        setFormData((prev) => ({
            ...prev,
            [parkId]: null,
        }));
    };

    return (
        <>
            <div>
                <h1>Wishlist</h1>
                <form onSubmit={handleSubmit}>
                    <button type="submit">Update Wishlist</button>
                    {parkData.map((park) => (
                        <div key={park.id}>
                            <fieldset>
                                <p>{park.description}</p>
                                <legend>{park.name}</legend>
                                <label>
                                    <input
                                        type="radio"
                                        name={`status-${park.id}`}
                                        checked={
                                            formData[park.id] === 'visited'
                                        }
                                        onChange={() =>
                                            handleInputChange(
                                                park.id,
                                                'visited'
                                            )
                                        }
                                    />
                                    Visited
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name={`status-${park.id}`}
                                        checked={
                                            formData[park.id] === 'wishlist'
                                        }
                                        onChange={() =>
                                            handleInputChange(
                                                park.id,
                                                'wishlist'
                                            )
                                        }
                                    />
                                    Want to Visit
                                </label>
                                <button
                                    type="button"
                                    onClick={() => handleClear(park.id)}
                                >
                                    Clear
                                </button>
                            </fieldset>
                        </div>
                    ))}
                </form>
            </div>
        </>
    );
};
export default EditWishListPage;
