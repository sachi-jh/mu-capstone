import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getUserTripInfo } from "../utils/utils";
const apiKey = import.meta.env.VITE_API_URL

const TripsPage = () => {
    const [tripData, setTripData] = useState([]);

    // Get user UUID from session info


    // Get user trip info from db

    useEffect(() => {
        getUserTripInfo(setTripData);
    }, [getUserTripInfo]);

    return(
        <>
        <h1>My Trips</h1>
        <button ><Link to="/create-new-trip">Create New Trip</Link></button>
        {tripData.length !== 0 ?
            (tripData.map((trip) => (
                <div key={trip.id}>
                    <h2>{trip.name}</h2>
                    <p>{trip.details}</p>
                </div>
            ))) : (
            <p>No trips yet</p>
        )}
        </>
    );
};

export default TripsPage;
