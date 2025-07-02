import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getUserTripInfo, fetchParks } from "../utils/utils";
import ParkCard from "./ParkCard";
const apiKey = import.meta.env.VITE_API_URL

const TripsPage = () => {
    const [tripData, setTripData] = useState([]);
    const [parks, setParks] = useState([]);


    useEffect(() => {
        fetchParks(setParks);
        getUserTripInfo(setTripData);
    }, [getUserTripInfo]);

    return(
        <>
        <h1>My Trips</h1>
        <button ><Link to="/create-new-trip">Create New Trip</Link></button>
        {tripData.length !== 0 ?
            (tripData.map((trip) => {
                const park = parks.find(park => park.id === trip.locationId);
                return (
                <div key={trip.id}>
                    <ParkCard image_url={park.image_url} name={trip.name} description={park.name}/>
                </div>
            )})) : (
            <p>No trips yet</p>
        )}
        </>
    );
};

export default TripsPage;
