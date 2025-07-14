const data = {
    duration: 3,
    park: '1',
    activities: ['Hiking', 'Swimming', 'Boating'],
};

const LENGTH_OF_DAY = 600; //10 hours of travel time each day in minutes 8am-6pm
const LUNCH_DURATION = 60; // 1 hour for lunch in minutes
const LUNCH_START = 210; // 11:30am
const LUNCH_END = 390; // 2:30 pm
const BUFFER_TIME = 30; // padding in between activities to account for fixed travel time

const fetchNationalParks = async (id) => {
    try {
        const response = await fetch(`http://localhost:3000/api/parks/${id}`);
        if (!response.ok) {
            throw new Error(`error status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (e) {
        console.error(e);
    }
};

// Helper function to format time in 12-hour format make it easier to read
const formatTime = (minutes) => {
    const startTime = 480; // 8am
    minutes += startTime;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = mins < 10 ? '0' + mins : mins;
    return `${formattedHours}:${formattedMinutes} ${suffix}`;
};

// Helper shuffle algorithm to randomize the order of activities
const shuffle = (array) => {
    return array.sort((a, b) => 0.5 - Math.random());
};

const generateItinerary = async (data) => {
    const { duration, park, activities } = data;
    const parkData = await fetchNationalParks(park);
    const actitivityData = shuffle(parkData.thingsToDo);
    let itinerary = [];

    for (let day = 0; day < duration; day++) {
        let currTime = 0;
        let dayActivities = [];
        let remainingTime = LENGTH_OF_DAY;
        let lunch = false;

        // Add lunch to the itinerary
        const addLunchBreak = () => {
            if (
                !lunch &&
                remainingTime >= LUNCH_DURATION &&
                currTime >= LUNCH_START
            ) {
                let lunchStartTime = currTime;
                let lunchEndTime = lunchStartTime + LUNCH_DURATION;

                dayActivities.push({
                    Day: day + 1,
                    Time: `${formatTime(lunchStartTime)} - ${formatTime(lunchEndTime)}`,
                    activityname: 'Lunch Break',
                    activityId: 'lunch',
                });

                currTime = lunchEndTime;
                remainingTime -= LUNCH_DURATION;
                lunch = true;
            }
        };

        for (let activity of actitivityData) {
            actitivityData.shift();
            if (activity.durationMins <= remainingTime) {
                if (dayActivities.length > 0) {
                    currTime += BUFFER_TIME;
                    remainingTime -= BUFFER_TIME;
                }
                dayActivities.push({
                    name: activity.name,
                    id: activity.id,
                    time: `${formatTime(currTime)} - ${formatTime(currTime + activity.durationMins)}`,
                    day: day + 1,
                });
                currTime += activity.durationMins;
                remainingTime -= activity.durationMins;
                addLunchBreak();
            } else {
                break;
            }
        }
        itinerary.push({
            Day: day + 1,
            Activities: dayActivities,
        });
    }
    return itinerary;
};

const main = async () => {
    const itinerary = await generateItinerary(data);
    console.log(JSON.stringify(itinerary, null, 2));
};

main();
