import { useState, useEffect } from 'react';
import { fetchParks, createNewTrip, getUserProfileInfo } from '../utils/utils';
import '../styles/CreateNewTripForm.css';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

const CreateNewTripForm = () => {
    const [parks, setParks] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [tripName, setTripName] = useState('');
    const [parkID, setParkID] = useState('');
    const nav = useNavigate();
    const { user } = useAuth();
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            setError('Start date must be before end date.');
            return;
        }

        const diffTime = Math.abs(end - start);
        const diffDays = diffTime / (1000 * 60 * 60 * 24); // ms to days

        if (diffDays > 10) {
            setError('Trip duration cannot exceed 10 days.');
            return;
        }
        try {
            const userProfile = await getUserProfileInfo(user.id);
            const body = await createNewTrip(
                tripName,
                parkID,
                userProfile.id,
                startDate,
                endDate,
                diffDays
            );
            nav(`/trips/edit/${body.id}`, { state: { parkId: parkID } });
        } catch (error) {
            console.error('Failed to create trip:', error);
        }
    };

    const handleStartChange = (event) => {
        setStartDate(event.target.value);
    };

    const handleEndChange = (event) => {
        setEndDate(event.target.value);
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
                    <label htmlFor="days">Enter travel days:</label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        required
                        value={startDate}
                        onChange={handleStartChange}
                    />
                    <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        required
                        value={endDate}
                        onChange={handleEndChange}
                    />
                    {error && <p className="error">{error}</p>}

                    <label htmlFor="trip-name">Enter trip name:</label>
                    <input
                        type="text"
                        id="trip-name"
                        name="trip-name"
                        placeholder="Trip Name"
                        required
                        value={tripName}
                        onChange={handleTripNameChange}
                    />

                    <label htmlFor="park-name">Choose Park:</label>
                    <select
                        id="park-name"
                        name="park-name"
                        required
                        value={parkID}
                        onChange={handleParkIDChange}
                    >
                        <option value="" disabled hidden>
                            Select Park
                        </option>
                        {parks.map((park) => (
                            <option key={park.id} value={park.id}>
                                {park.name}
                            </option>
                        ))}
                    </select>

                    <button type="submit">Submit</button>
                </form>
            </div>
        </>
    );
};
export default CreateNewTripForm;
