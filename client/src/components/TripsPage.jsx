import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getUserTripInfo, fetchParks } from '../utils/utils';
import ParkCard from './ParkCard';
import { useAuth } from '../contexts/AuthContext';
const apiKey = import.meta.env.VITE_API_URL;

const TripsPage = () => {
    const [tripData, setTripData] = useState([]);
    const [parks, setParks] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        fetchParks(setParks);
        getUserTripInfo(setTripData, user.id);
    }, [getUserTripInfo]);

    return (
        <>
            <h1>My Trips</h1>
            <button>
                <Link to="/trips/create">Create New Trip</Link>
            </button>
            {tripData.length !== 0 ? (
                tripData.map((trip) => {
                    const park = parks.find(
                        (park) => park.id === trip.locationId
                    );
                    return (
                        <div key={trip.id}>
                            <ParkCard
                                image_url={park.image_url}
                                name={trip.name}
                                description={park.name}
                            />
                            <button>
                                <Link
                                    to={`/trips/edit/${trip.id}`}
                                    state={{ parkId: park.id }}
                                >
                                    edit
                                </Link>
                            </button>
                        </div>
                    );
                })
            ) : (
                <p>No trips yet</p>
            )}
        </>
    );
};

export default TripsPage;
