import { useState, useEffect } from "react";
import { fetchParks, createNewTrip, getUserProfileInfo } from "../utils/utils";
import "../styles/CreateNewTripForm.css";
import { useNavigate } from "react-router";

const CreateNewTripForm = () => {
    const [parks, setParks] = useState([]);
    const [days, setDays] = useState("");
    const [tripName, setTripName] = useState("");
    const [parkID, setParkID] = useState("");
    const nav = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const userProfile = await getUserProfileInfo();
            const body = await createNewTrip(tripName, parkID, userProfile.id);
            nav(`/trips/edit/${body.id}`, { state: parkID });
        } catch (error) {
            console.error("Failed to create trip:", error);
        }

    };

    const handleDaysChange = (event) => {
        setDays(event.target.value);
    };

    const handleTripNameChange = (event) => {
        setTripName(event.target.value);
    };

    const handleParkIDChange = (event) => {
        setParkID(event.target.value);
    };

    useEffect(() => {
        fetchParks(setParks);
    }, []);

    return (
        <>
        <div className="new-trip-form-container">
        <h1>Create New Trip</h1>
        <form className="create-new-trip-form" onSubmit={handleSubmit}>
            <label htmlFor="days">Enter number of days:</label>
            <input type="number" id="days" name="days" placeholder="Days" max={10} min={1} required value={days} onChange={handleDaysChange}/>

            <label htmlFor="trip-name">Enter trip name:</label>
            <input type="text" id="trip-name" name="trip-name" placeholder="Trip Name" required value={tripName} onChange={handleTripNameChange}/>

            <label htmlFor="park-name">Choose Park:</label>
            <select id="park-name" name="park-name" required value={parkID} onChange={handleParkIDChange}>
                <option value="" disabled hidden>Select Park</option>
                {parks.map((park) => (
                    <option key={park.id} value={park.id}>{park.name}</option>
                ))}
            </select>

            <button type="submit">Submit</button>

        </form>
        </div>
        </>
    );
};
export default CreateNewTripForm;
