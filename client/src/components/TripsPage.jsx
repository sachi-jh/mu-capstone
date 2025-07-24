import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { getUserTripInfo, fetchParks } from '../utils/utils';
import ParkCard from './ParkCard';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import '../styles/TripsPage.css';
import ToolTip from './ToolTip';

const TripsPage = () => {
    const [tripData, setTripData] = useState([]);
    const { user } = useAuth();
    const { loading, setLoading } = useLoading();

    const fetchData = async () => {
        setLoading(true);
        if (user?.id) {
            await getUserTripInfo(setTripData, user.id);
        }
        setLoading(false);
    };
    useEffect(() => {
        fetchData();
    }, [user]);

    return (
        <>
            <h1>My Trips</h1>
            <div className="trips-page-buttons">
                <div>
                    <button className="trip-button">
                        <Link to="/trips/create">Create New Trip</Link>
                    </button>
                </div>
                <div className="button-with-tooltip">
                    <button>
                        <Link to="/park-recommender">
                            Don't know where to go?
                        </Link>
                    </button>
                    <ToolTip
                        content={
                            'Park Recommender: Let us help you decide what park to visit next!'
                        }
                    />
                </div>
                <div className="button-with-tooltip">
                    <button>
                        <Link to="/trips/generate-trip-form">
                            Generate Trip
                        </Link>
                    </button>
                    <ToolTip
                        content={
                            'Avoid the hassle of planning your trip by automatically generating a day by day schedule of activities'
                        }
                    />
                </div>
            </div>
            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : tripData.length !== 0 ? (
                tripData.map((trip) => {
                    return (
                        <div key={trip.id}>
                            <ParkCard
                                image_url={
                                    trip.location.image_url[1] ??
                                    trip.location.image_url[0]
                                }
                                name={trip.name}
                                description={trip.location.name}
                            />
                            <button>
                                <Link
                                    to={`/trips/edit/${trip.id}`}
                                    state={{ parkId: trip.location.id }}
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
