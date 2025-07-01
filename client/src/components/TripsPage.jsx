import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Link } from "react-router";
const apiKey = import.meta.env.VITE_API_URL

const TripsPage = () => {
    const [tripData, setTripData] = useState([]);

    // Get user UUID from session info
    const getUserUUID = async () => {
        try {
            const {data: {user}, error} = await supabase.auth.getUser();
            if (error) {
                next({ status: 400, message: error.message });
            }
            return user.id;
        } catch (error) {
            console.log(error);
        }
    }

    // Get user trip info from db
    const getUserInfo = useCallback(async () => {
        const userUUID = await getUserUUID();
        try {
            const response = await fetch(`${apiKey}/api/user/${userUUID}/trips`);
            if (response.status === 204) {
                setTripData([]);
                return;
            }
            if (!response.ok) {
                throw new Error('Failed to fetch trips')
            }
            const data = await response.json();
            setTripData(data.trips);
        } catch (error) {
            console.log(error);
        }
    })

    useEffect(() => {
        getUserInfo();
    }, [getUserInfo]);

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
