const apiURL = import.meta.env.VITE_API_URL;

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
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`API call failed: ${error.message}`);
    }
}


export {fetchLocation, fetchUserInfo, fetchParks}
