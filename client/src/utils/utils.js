const apiURL = import.meta.env.VITE_API_URL;
import { supabase } from "../utils/supabaseClient";


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
}

// Fetch ThingsToDo by Park Location
const fetchThingsToDo =  async (setData, park_id) => {
    const body = await apiCall(`/api/parks/${park_id}/activities`);
    setData(body);
}

//helper function to get user uuid from session info
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

const getUserProfileInfo = async(setUserInfo) => {
    const userUUID = await getUserUUID();
    const body = await apiCall(`/api/user/${userUUID}/profile`);
    setUserInfo(body);
}

//get all user info!!
const getUserTripInfo = async(setTripData) => {
    const userUUID = await getUserUUID();
    const body = await apiCall(`/api/user/${userUUID}/trips`);
    setTripData(body?.trips ?? []);
}


const createNewTrip = async (name, locationId, authorId) => {
    const body = await apiCall(`/api/trips/newtrip`, 'POST', {
        authorId: parseInt(authorId),
        name: name,
        details: "",
        locationId: parseInt(locationId),
    });
    return body;
}

const fetchTripDetailsById = async (setData, id) => {
    const body = await apiCall(`/api/trips/${id}`);
    setData(body)
}

// Helper method for API calls to db
const apiCall = async (urlPath, method = 'GET', body) => {
    try {
        const response = await fetch(`${apiURL}${urlPath}`, {
            method,
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
    });
        if (!response.ok) {
            throw new Error("Could not fetch data");
        }
        if (response.status === 204){
            return ([]);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`API call failed: ${error.message}`);
    }
}

export {fetchLocation, fetchUserInfo, fetchParks, createNewTrip, getUserTripInfo, getUserProfileInfo, fetchThingsToDo, fetchTripDetailsById};
