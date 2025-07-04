const apiURL = import.meta.env.VITE_API_URL;
import { supabase } from '../utils/supabaseClient';
// Fetch location name from db given location id
const fetchLocation = async (locationId, setLocation) => {
    const body = await apiCall(`/api/parks/${locationId}`);
    setLocation(body.name);
};

// Fetch user Info from db given user id
const fetchUserInfo = async (userId, setUserInfo) => {
    const body = await apiCall(`/api/user/${userId}/profile`);
    setUserInfo(body);
};

// Fetch Parks
const fetchParks = async (setParks) => {
    const body = await apiCall(`/api/parks`);
    setParks(body);
};

const fetchAllPosts = async (setData) => {
    const body = await apiCall(`/api/posts`);
    setData(body);
};

// Fetch ThingsToDo by Park Location
const fetchThingsToDo = async (setData, park_id) => {
    const body = await apiCall(`/api/parks/${park_id}/activities`);
    setData(body);
};

// Helper function to get user uuid from session info
const getUserUUID = async () => {
    try {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();
        if (error) {
            next({ status: 400, message: error.message });
        }
        return user.id;
    } catch (error) {
        console.log(error);
    }
};

const getUserProfileInfo = async (userUUID) => {
    const body = await apiCall(`/api/user/${userUUID}/profile`);
    return body;
};

const getUserTripInfo = async (setTripData, userUUID) => {
    const body = await apiCall(`/api/user/${userUUID}/trips`);
    setTripData(body ?? []);
};

const createNewTrip = async (name, locationId, authorId, days) => {
    const body = await apiCall(`/api/trips/newtrip`, 'POST', {
        authorId: parseInt(authorId),
        name: name,
        days: parseInt(days),
        locationId: parseInt(locationId),
    });
    return body;
};

const createOrUpdateActivity = async (tripId, thingstodoId, day, time) => {
    const body = await apiCall(`/api/activities/upsert`, 'POST', {
        tripId: parseInt(tripId),
        thingstodoId: parseInt(thingstodoId),
        day: parseInt(day),
        time: time,
    });
    return body;
};

const createNewActivity = async (tripId, thingstodoId, day, time) => {
    try {
        const body = await apiCall(`/api/activities/newactivity`, 'POST', {
            tripId: parseInt(tripId),
            thingstodoId: parseInt(thingstodoId),
            day: parseInt(day),
            time: time,
        });
        return body;
    } catch (err) {
        if (err.message.includes('409')) {
            const updated = await updateActivity(
                tripId,
                thingstodoId,
                day,
                time
            );
            return updated;
        }
        throw err;
    }
};

const updateActivity = async (tripId, thingstodoId, day, time) => {
    const body = await apiCall(`/api/activities/updateactivity`, 'PUT', {
        tripId: parseInt(tripId),
        thingstodoId: parseInt(thingstodoId),
        day: parseInt(day),
        time: time,
    });
    return body;
};

const fetchActivitesByTripId = async (tripId) => {
    const body = await apiCall(`/api/activities/${tripId}`);
    return body;
};

const fetchTripDetailsById = async (setData, id) => {
    const body = await apiCall(`/api/trips/${id}`);
    setData(body);
};

// Helper method for API calls to db
const apiCall = async (urlPath, method = 'GET', body) => {
    try {
        const response = await fetch(`${apiURL}${urlPath}`, {
            method,
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            throw new Error('Could not fetch data');
        }
        if (response.status === 204) {
            return [];
        }
        if (response.status === 409) {
            const errorMessage = `${response.status}`;
            throw new Error(errorMessage); // let caller handle specific error code
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`API call failed: ${error.message}`);
    }
};

export {
    fetchLocation,
    fetchUserInfo,
    fetchParks,
    createNewTrip,
    getUserTripInfo,
    getUserProfileInfo,
    fetchThingsToDo,
    fetchTripDetailsById,
    createOrUpdateActivity,
    fetchActivitesByTripId,
    fetchAllPosts,
};
