import { useEffect, useState } from 'react';
import {useParams} from 'react-router';
import { useLocation } from 'react-router';
import { fetchThingsToDo } from '../utils/utils';

const CreateNewTripPage = () => {
    const {id} = useParams();
    const parkId = useLocation().state;
    const [thingsToDo, setThingsToDo] = useState([]);

    useEffect(() => {
        fetchThingsToDo(setThingsToDo, parkId);
    }, [fetchThingsToDo]);

    return(
        <>
        <h1>New Trip: {id}</h1>
        <h2>Things to do:</h2>
        {thingsToDo &&
            thingsToDo.map(activity => (
                <div key={activity.id}>
                    <h3>{activity.name}</h3>
                    <p>{activity.description}</p>
                </div>
            )
        )}
        </>
    );
};
export default CreateNewTripPage;
