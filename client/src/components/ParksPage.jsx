import { useState, useEffect, useCallback } from 'react';
import ParkCard from './ParkCard';
import '../styles/ParksPage.css';
import { Link } from 'react-router';
import { fetchParks } from '../utils/utils';
import { useLoading } from '../contexts/LoadingContext';

const ParksPage = () => {
    const [parks, setParks] = useState([]);
    const { loading, setLoading } = useLoading();

    useEffect(() => {
        const loadingInfo = async () => {
            setLoading(true);
            await fetchParks(setParks);
            setLoading(false);
        };
        loadingInfo();
    }, []);

    return (
        <>
            <div className="hero-section-parks">
                <h3>Home to 63 National Parks</h3>
            </div>
            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : (
                <div className="park-cards">
                    {parks.length !== 0 ? (
                        parks.map((park) => (
                            <div key={park.id}>
                                <ParkCard
                                    image_url={park.image_url[0]}
                                    name={park.name}
                                    description={park.description}
                                    rating={park.avgRating}
                                />
                                <Link
                                    to={`/parks/${park.id}`}
                                    className="park-link"
                                >
                                    View Details
                                </Link>
                            </div>
                        ))
                    ) : (
                        <h3>No parks found</h3>
                    )}
                </div>
            )}
        </>
    );
};
export default ParksPage;
