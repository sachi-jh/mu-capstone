const apiURL = import.meta.env.VITE_API_URL;
import { supabase } from '../utils/supabaseClient';

const WISHLIST = 'wishlist';
const VISITED = 'visited';

const TravelSeasons = {
    SPRING: 'Spring',
    SUMMER: 'Summer',
    FALL: 'Fall',
    WINTER: 'Winter',
};

const TripDuration = {
    DAYTRIP: 'Day trip',
    WEEKEND: 'Weekend',
    WEEKPLUS: '1 week or more',
};

const Regions = {
    NORTHEAST: 'Northeast',
    MIDWEST: 'Midwest',
    SOUTHEAST: 'Southeast',
    SOUTHWEST: 'Southwest',
    WEST: 'West',
    OUTSIDE: 'Outside',
};

const AlertCategories = {
    INFORMATION: 'Information',
    CAUTION: 'Caution',
    DANGER: 'Danger',
    PARK_CLOSURE: 'Park Closure',
};

const PostTypes = {
    POST: 'post',
    ALERT: 'alert',
    EVENT: 'event',
};

// Fetch location name from db given location id
const fetchLocation = async (locationId, setLocation) => {
    const body = await apiCall(`/api/parks/${locationId}`);
    setLocation(body.name);
};

// Fetch user Info from db given user id
const fetchUserInfo = async (userUUID, setUserInfo) => {
    const body = await apiCall(`/api/user/${userUUID}/profile`);
    setUserInfo(body);
};

const fetchUserInfoFromId = async (userId, setUserInfo) => {
    const body = await apiCall(`/api/user/${userId}/info-id`);
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

const newReview = async (data) => {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session || !session.access_token) {
        console.error('No session or access token found');
        return; // Or handle this error case appropriately
    }
    try {
        const body = await fetch(`${apiURL}/api/posts/new-review`, {
            method: 'POST',
            body: JSON.stringify({
                rating: data.rating,
                review: data.review,
                locationId: data.locationId,
            }),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
            },
        });
        return body;
    } catch (error) {
        console.log(error);
    }
};

const newPost = async (postType, data, selectedPark) => {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session || !session.access_token) {
        console.error('No session or access token found');
        return; // Or handle this error case appropriately
    }
    try {
        switch (postType) {
            case 'post':
                const body = await fetch(`${apiURL}/api/posts/newpost`, {
                    method: 'POST',
                    body: JSON.stringify({
                        text: data.text,
                        locationId: selectedPark,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });
                return body;
            case 'alert':
                const alertBody = await fetch(`${apiURL}/api/posts/new-alert`, {
                    method: 'POST',
                    body: JSON.stringify({
                        name: data.title,
                        description: data.description,
                        category: data.category,
                        locationId: selectedPark,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });
                return alertBody;
            case 'event':
                const eventBody = await fetch(`${apiURL}/api/posts/new-event`, {
                    method: 'POST',
                    body: JSON.stringify({
                        name: data.title,
                        startDate: new Date(data.startDate),
                        startTime: new Date(
                            `${data.startDate}T${data.startTime}`
                        ),
                        endTime: new Date(`${data.startDate}T${data.endTime}`),
                        description: data.description, // or name/details if you're renaming it
                        category: data.category,
                        locationId: selectedPark,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });
                return eventBody;
            default:
                return;
        }
    } catch (error) {
        console.error(error);
    }
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

const createNewTrip = async (
    name,
    locationId,
    authorId,
    startDate,
    endDate,
    diffDays
) => {
    const body = await apiCall(`/api/trips/newtrip`, 'POST', {
        authorId: parseInt(authorId),
        name: name,
        startDate: startDate,
        endDate: endDate,
        days: diffDays,
        locationId: parseInt(locationId),
    });
    return body;
};

const updateWishlist = async (userUUID, wishlist) => {
    for (const parkId in wishlist) {
        const status = wishlist[parkId];
        await apiCall(`/api/user/update-wishlist`, 'PATCH', {
            userId: userUUID,
            parkId: parseInt(parkId),
            status: status,
        });
    }
};

const saveTrip = async (tripId, activities) => {
    const body = await apiCall(`/api/activities/save`, 'POST', {
        tripId: parseInt(tripId),
        activities: activities,
    });
    return body;
};

const createOrUpdateActivity = async (
    tripId,
    thingstodoId,
    dayOfTrip,
    startTime,
    endTime,
    durationMins
) => {
    const body = await apiCall(`/api/activities/upsert`, 'POST', {
        tripId: parseInt(tripId),
        thingstodoId: parseInt(thingstodoId),
        day: parseInt(dayOfTrip),
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

const fetchParkInfo = async (parkId) => {
    const body = apiCall(`/api/parks/${parkId}`);
    return body;
};

const fetchActivitesByTripId = async (tripId) => {
    const body = await apiCall(`/api/activities/${tripId}`);
    return body;
};

const fetchTripDetailsById = async (id) => {
    const body = await apiCall(`/api/trips/${id}`);
    return body;
};

const fetchActivityTypes = async (setData) => {
    const body = await apiCall(`/api/activity-types`);
    setData(body);
};

const getRecommendedParks = async (formData) => {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const body = {
        activities: formData.activities,
        season: formData.season,
        duration: formData.duration,
        region: formData.region,
    };
    try {
        const response = await fetch(`${apiURL}/api/parks/recommend`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
            },
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

const editUserProfile = async (
    name,
    userLocationLat,
    userLocationLong,
    bio
) => {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const body = {
        name: name,
        userLocationLat: userLocationLat,
        userLocationLong: userLocationLong,
        bio: bio,
    };

    try {
        const response = await fetch(`${apiURL}/api/user/edit-profile`, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
            },
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

const generateItinerary = (
    name,
    parkId,
    userId,
    startDate,
    endDate,
    days,
    activities
) => {
    const body = apiCall(`/api/trip/generate-trip`, 'POST', {
        authorId: userId,
        name: name,
        startDate: startDate,
        endDate: endDate,
        days: days,
        locationId: parkId,
        activities: activities,
    });
    return body;
};

// Helper method for API calls to db
const apiCall = async (urlPath, method = 'GET', body) => {
    try {
        const response = await fetch(`${apiURL}${urlPath}`, {
            method,
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
            },
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
    fetchParkInfo,
    fetchUserInfo,
    fetchUserInfoFromId,
    fetchParks,
    createNewTrip,
    getUserTripInfo,
    getUserProfileInfo,
    fetchThingsToDo,
    fetchTripDetailsById,
    saveTrip,
    createOrUpdateActivity,
    fetchActivitesByTripId,
    fetchAllPosts,
    fetchActivityTypes,
    getRecommendedParks,
    updateWishlist,
    generateItinerary,
    editUserProfile,
    newPost,
    newReview,
    TravelSeasons,
    TripDuration,
    Regions,
    WISHLIST,
    VISITED,
    AlertCategories,
    PostTypes,
};
