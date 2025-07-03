import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useLocation } from 'react-router';
import {
    createOrUpdateActivity,
    fetchActivitesByTripId,
    fetchThingsToDo,
    fetchTripDetailsById,
} from '../utils/utils';
import '../styles/CreateNewTripPage.css';

const CreateNewTripPage = () => {
    const { tripId } = useParams();
    const { state } = useLocation();
    const parkId = state?.parkId;
    const [thingsToDo, setThingsToDo] = useState([]);
    const [tripData, setTripData] = useState({});
    const [activityDays, setActivityDays] = useState({});

    const handleSave = async () => {
        const entries = Object.entries(activityDays);
        const validActivities = entries.filter(
            ([_, value]) => value.day && value.time
        );

        if (!validActivities.length) {
            return;
        }

        try {
            for (const [thingstodoId, value] of validActivities) {
                await createOrUpdateActivity(
                    tripId,
                    thingstodoId,
                    value.day,
                    value.time
                );
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchExistingData = async () => {
            const existingActivities = await fetchActivitesByTripId(tripId);
            const existingActivityMap = existingActivities.reduce(
                (acc, activity) => {
                    acc[activity.thingstodoId] = {
                        day: activity.tripDay,
                        time: activity.timeOfDay,
                    };
                    return acc;
                },
                {}
            );
            setActivityDays(existingActivityMap);
        };

        fetchExistingData();
        fetchThingsToDo(setThingsToDo, parkId);
        fetchTripDetailsById(setTripData, tripId);
    }, [tripId, parkId]);

    return (
        <>
            <h1>
                New Trip {tripId}: {tripData.name}
            </h1>
            <p>Days: {tripData.days}</p>
            <h2>Things to do:</h2>
            <button onClick={handleSave}>Save</button>
            {thingsToDo &&
                thingsToDo.map((activity) => (
                    <div key={activity.id} className="activity">
                        <div>
                            <h3>{activity.name}</h3>
                            <p>{activity.description}</p>
                        </div>
                        <select
                            value={activityDays[activity.id]?.day || ''}
                            onChange={(e) =>
                                setActivityDays({
                                    ...activityDays,
                                    [activity.id]: {
                                        ...activityDays[activity.id],
                                        day: parseInt(e.target.value),
                                    },
                                })
                            }
                        >
                            <option value="">Select a day</option>
                            {Array.from({ length: tripData.days }, (_, i) => {
                                const dayNum = i + 1;
                                return (
                                    <option key={i} value={dayNum}>
                                        Day {dayNum}
                                    </option>
                                );
                            })}
                        </select>
                        <input
                            type="time"
                            step={1800}
                            value={activityDays[activity.id]?.time || ''}
                            onChange={(e) =>
                                setActivityDays({
                                    ...activityDays,
                                    [activity.id]: {
                                        ...activityDays[activity.id],
                                        time: e.target.value,
                                    },
                                })
                            }
                        />
                    </div>
                ))}
        </>
    );
};
export default CreateNewTripPage;
