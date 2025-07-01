import { useState, useEffect } from "react";
import { fetchParks } from "../utils/utils";

const CreateNewTripPage = () => {
    const [parks, setParks] = useState([]);

    useEffect(() => {
        fetchParks(setParks);
    }, []);

    return (
        <>
        <h1>Create New Trip</h1>
        <form>
            <label htmlFor="days">Enter number of days:</label>
            <input type="number" id="days" name="days" placeholder="Days" max={10} required/>

            <label htmlFor="trip-name">Enter trip name:</label>
            <input type="text" id="trip-name" name="trip-name" placeholder="Trip Name" required/>

            <label htmlFor="park-name">Choose Park:</label>
            <select id="park-name" name="park-name" required defaultValue={"default"}>
                <option value="default" disabled hidden>Select Park</option>
                {parks.map((park) => (
                    <option value={park.parkCode}>{park.name}</option>
                ))}
            </select>

        </form>
        </>
    );
};
export default CreateNewTripPage;
