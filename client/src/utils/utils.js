const apiURL = import.meta.env.VITE_API_URL;
import { supabase } from '../utils/supabaseClient';
const npsEventsUrl = import.meta.env.VITE_NPS_EVENTS_URL;
const npsAlertsUrl = import.meta.env.VITE_NPS_ALERTS_URL;
const npsApiKey = import.meta.env.VITE_NPS_API_KEY;

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

const PARKS = [
    'acad',
    'arch',
    'badl',
    'bibe',
    'bisc',
    'blca',
    'brca',
    'cany',
    'care',
    'cave',
    'chis',
    'cong',
    'crla',
    'cuva',
    'deva',
    'dena',
    'drto',
    'ever',
    'gaar',
    'jeff',
    'glba',
    'glac',
    'grca',
    'grte',
    'grba',
    'grsa',
    'grsm',
    'gumo',
    'hale',
    'havo',
    'hosp',
    'indu',
    'isro',
    'jotr',
    'katm',
    'kefj',
    'kova',
    'lacl',
    'lavo',
    'maca',
    'meve',
    'mora',
    'npsa',
    'neri',
    'noca',
    'olym',
    'pefo',
    'pinn',
    'redw',
    'romo',
    'sagu',
    'seki',
    'shen',
    'thro',
    'viis',
    'voya',
    'whsa',
    'wica',
    'wrst',
    'yell',
    'yose',
    'zion',
];

const fetchNPSEventsData = async () => {
    const body = await fetch(`${npsEventsUrl}${npsApiKey}`);
    const data = await body.json();
    const events = [];
    for (const elem of data.data) {
        const parkId = await getParkfromParkCode(elem.sitecode);

        const startTime =
            elem.times && elem.times.length > 0
                ? parseTime(elem.times[0].timestart)
                : null;
        const endTime =
            elem.times && elem.times.length > 0
                ? parseTime(elem.times[0].timeend)
                : null;

        const event = {
            name: elem.title,
            description: removeHTMLTags(elem.description),
            startDate: new Date(elem.date),
            startTime: startTime,
            endTime: endTime,
            createdAt: new Date(elem.datetimecreated),
            locationId: parkId.name,
            authorId: null,
        };

        events.push(event);
    }
    return events;
};

const parseTime = (timeStr) => {
    const timeParts = timeStr.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);

    if (!timeParts) {
        return null;
    }

    let [_, hours, minutes, period] = timeParts;

    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    if (period.toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
    }

    return new Date(
        `1970-01-01T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
    );
};

const fetchNPSAlertsData = async () => {
    const alerts = [];
    for (const parkCode of PARKS) {
        const body = await fetch(
            `${npsAlertsUrl}${parkCode}&api_key=${npsApiKey}`
        );
        const data = await body.json();
        const parkId = await getParkfromParkCode(parkCode);
        for (const alertData of data.data) {
            const alert = {
                name: alertData.title,
                description: alertData.description,
                category: alertData.category,
                createdAt: new Date(alertData.lastIndexedDate),
                locationId: parkId.name,
                authorId: null,
            };

            alerts.push(alert);
        }
    }
    return alerts;
};

const removeHTMLTags = (input) => {
    return input.replace(/<[^>]*>/g, '');
};

const getParkfromParkCode = (parkCode) => {
    const body = apiCall(`/api/park/get-from-parkcode/${parkCode}`);
    return body;
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

// Fetch Parks
const fetchParks = async (setParks) => {
    const body = await apiCall(`/api/parks`);
    setParks(body);
};

const fetchAllPosts = async () => {
    const body = await apiCall(`/api/posts`);
    return body;
};

const fetchAllAlerts = async () => {
    const body = await apiCall(`/api/alerts`);
    return body;
};

const fetchAllEvents = async () => {
    const body = await apiCall(`/api/events`);
    return body;
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
        return;
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
        return;
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
                        description: data.description,
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
            throw new Error(errorMessage);
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
            throw new Error(errorMessage);
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

const deletePost = async (postId) => {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    try {
        const response = await fetch(`${apiURL}/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
            },
        });
    } catch (error) {
        throw new Error(`API call failed: ${error.message}`);
    }
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
            throw new Error(errorMessage);
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
    fetchParks,
    createNewTrip,
    getUserTripInfo,
    getUserProfileInfo,
    fetchThingsToDo,
    fetchTripDetailsById,
    saveTrip,
    fetchActivitesByTripId,
    fetchAllPosts,
    fetchAllAlerts,
    fetchAllEvents,
    fetchActivityTypes,
    getRecommendedParks,
    updateWishlist,
    generateItinerary,
    editUserProfile,
    newPost,
    newReview,
    deletePost,
    fetchNPSEventsData,
    fetchNPSAlertsData,
    TravelSeasons,
    TripDuration,
    Regions,
    WISHLIST,
    VISITED,
    AlertCategories,
    PostTypes,
};
