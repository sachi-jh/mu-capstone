import { fetchParks } from '../utils/utils';
import { useState, useEffect } from 'react';

const EditWishListPage = () => {
    const [parkData, setParkData] = useState([]);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchParks(setParkData);
    }, []);

    const handleInputChange = (parkId, status) => {
        setFormData((prev) => ({
            ...prev,
            [parkId]: status,
        }));
    };

    const handleSubmit = (event) => {};

    const handleClear = (parkId) => {
        setFormData((prev) => {
            const newState = { ...prev };
            delete newState[parkId];
            return newState;
        });
    };

    return (
        <>
            <div>
                <h1>Wishlist</h1>

                {parkData.map((park) => (
                    <div key={park.id}>
                        <form onSubmit={handleSubmit}>
                            <button type="submit">Update Wishlist</button>
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
                        </form>
                    </div>
                ))}
            </div>
        </>
    );
};
export default EditWishListPage;
