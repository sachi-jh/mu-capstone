import { useEffect, useState } from 'react';
import {useParams} from 'react-router';
import { useLocation } from 'react-router';
import { fetchThingsToDo, fetchTripDetailsById } from '../utils/utils';

const CreateNewTripPage = () => {
    const {trip_id} = useParams();
    const parkId = useLocation().state;
    const [thingsToDo, setThingsToDo] = useState([]);
    const [tripData, setTripData] = useState({});

    useEffect(() => {
        fetchThingsToDo(setThingsToDo, parkId);
        fetchTripDetailsById(setTripData, trip_id);
    }, [fetchThingsToDo]);

    return(
        <>
        <h1>New Trip {trip_id}: {tripData.name}</h1>
        <p>Days: {tripData.days}</p>
        <h2>Things to do:</h2>
        {thingsToDo &&
            thingsToDo.map(activity => (
                <div key={activity.id}>
                    <label htmlFor={activity.id}>{activity.name}</label>
                    <p>{activity.description}</p>
                    <select>
                        {}
                    </select>
                </div>
            )
        )}
        </>
    );
};
export default CreateNewTripPage;
