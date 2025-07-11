import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { getUserTripInfo, fetchParks } from '../utils/utils';
import ParkCard from './ParkCard';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';

const TripsPage = () => {
    const [tripData, setTripData] = useState([]);
    const [parks, setParks] = useState([]);
    const { user } = useAuth();
    const { loading, setLoading } = useLoading();
    const nav = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchParks(setParks);
            if (user?.id) {
                await getUserTripInfo(setTripData, user.id);
            }
            setLoading(false);
        };
        fetchData();
    }, [user]);

    return (
        <>
            <h1>My Trips</h1>
            <button>
                <Link to="/trips/create">Create New Trip</Link>
            </button>
            <button>
                <Link to="/park-recommender">Don't know where to go?</Link>
            </button>
            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : tripData.length !== 0 && parks.length !== 0 ? (
                tripData.map((trip) => {
                    const park = parks.find(
                        (park) => park.id === trip.locationId
                    );
                    return (
                        <div key={trip.id}>
                            <ParkCard
                                image_url={
                                    park.image_url[1] ?? park.image_url[0]
                                }
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
