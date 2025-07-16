require('dotenv').config();

const data = {
    duration: 10,
    park: '28',
    activities: ['Swimming', 'Boating'],
};

const LENGTH_OF_DAY = 600; //10 hours of travel time each day in minutes 8am-6pm
const LUNCH_DURATION = 60; // 1 hour for lunch in minutes
const LUNCH_START = 210; // 11:30am
const BUFFER_TIME = 30; // padding in between activities to account for fixed travel time

const isFullDayActivity = (duration) => {
    // the only activity that will be done that day
    if (duration >= 300 && duration <= 600) {
        return true;
    }
    return false;
};

const isMultiDayActivity = (duration) => {
    // the only activity that will be done that day -> will stretch into following day(s)
    if (duration > 600) {
        return true;
    }
    return false;
};

const fetchNationalPark = async (id) => {
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

//TO DO: create new trip, add information about itinerary, add to DB
//TO DO: optimize the algorithm to find the best possible itinerary
//TO DO: if "Camping" is selected, add it as a night activity for duration > 1 day if camping is an available activity
//TO DO: Prioritize dawn activities for time <240 and dusk activitities for time > 390
// Helper function to format time in 12-hour format make it easier to read
//TO DO: for trips <= 3 days no multiday hikes
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

const filterActivities = (array, activities) => {
    if (!activities.includes('Hiking')) {
        activities.push('Hiking');
    }
    return array.filter((x) => activities.includes(x.activity_type));
};

//calculate distance btwn all activities and all other activities
//^ better approach
//or
//calculate distance btwn all activities once they are schdeuled

// distance in km between two points
const distanceFormula = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // radius of the earth in km
    const toRadians = (angle) => angle * (Math.PI / 180); // convert degrees to radians
    d =
        2 *
        R *
        Math.asin(
            Math.sqrt(
                Math.sin((toRadians(lat2) - toRadians(lat1)) / 2) ** 2 +
                    Math.cos(toRadians(lat1)) *
                        Math.cos(toRadians(lat2)) *
                        Math.sin((toRadians(lon2) - toRadians(lon1)) / 2) ** 2
            )
        ); // haversine formula
    return d;
};

//calculate distance btwn all activities and all other activities
const calculateDistanceMatrix = (activities) => {
    const distanceMatrix = [];
    //activities.filter((x) => x.latitude !== 0 && x.longitude !== 0);
    for (let i = 0; i < activities.length; i++) {
        const sublist = [];
        for (let j = i; j < activities.length; j++) {
            let activity1 = activities[i];
            let activity2 = activities[j];
            let distance = distanceFormula(
                activity1.latitude,
                activity1.longitude,
                activity2.latitude,
                activity2.longitude
            );
            sublist.push(distance);
        }
        distanceMatrix.push(sublist);
    }
    return distanceMatrix;
};

const scheduleMultiDayActivity = (activity, remainingDays, tripDuration) => {
    const activityDuration = activity.durationMins;
    const maxDurationDays = Math.floor(tripDuration / 2);
    const durationDays = Math.min(
        Math.ceil(activityDuration / LENGTH_OF_DAY),
        maxDurationDays
    );
    const currDay = tripDuration - remainingDays;

    let activityDays = [];

    for (let i = 0; i < durationDays; i++) {
        activityDays.push({
            Day: currDay + i + 1,
            Activities: [
                {
                    name: activity.name,
                    id: activity.id,
                    time: `${formatTime(0)} - ${formatTime(LENGTH_OF_DAY)}`,
                    day: currDay + i + 1,
                },
            ],
        });
    }
    return activityDays;
};

const generateItinerary = async (data) => {
    const { duration, park, activities } = data;
    const parkData = await fetchNationalPark(park);
    const shuffledArr = shuffle(parkData.thingsToDo);
    let activityData = shuffledArr;
    //let activityData = filterActivities(shuffledArr, activities);

    let itinerary = [];

    //let day = 0;
    //while( day < duration){
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
                    day: day + 1,
                    time: `${formatTime(lunchStartTime)} - ${formatTime(lunchEndTime)}`,
                    name: 'Lunch Break',
                    id: 'lunch',
                });

                currTime = lunchEndTime;
                remainingTime -= LUNCH_DURATION;
                lunch = true;
            }
        };

        for (let activity of activityData) {
            if (activity.durationMins <= remainingTime) {
                if (isFullDayActivity(activity.durationMins)) {
                    // no full day activities during day trip
                    if (dayActivities.length > 0 || duration > 1) {
                        continue;
                    } else {
                        dayActivities.push({
                            name: activity.name,
                            id: activity.id,
                            time: `${formatTime(currTime)} - ${formatTime(currTime + activity.durationMins)}`,
                            day: day + 1,
                        });
                        activityData = activityData.filter(
                            (a) => a.id !== activity.id
                        );
                        break;
                    }
                }

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
                activityData = activityData.filter((a) => a.id !== activity.id);
                currTime += activity.durationMins;
                remainingTime -= activity.durationMins;
                addLunchBreak();
            } else if (isMultiDayActivity(activity.durationMins)) {
                if (
                    duration - day > 2 &&
                    dayActivities.length === 0 &&
                    duration - day >= Math.floor(duration / 2)
                ) {
                    const scheduledactivities = scheduleMultiDayActivity(
                        activity,
                        duration - day,
                        duration
                    );
                    scheduledactivities.forEach((act) => {
                        itinerary.push(act);
                    });
                    day += scheduledactivities.length;
                    activityData = activityData.filter(
                        (a) => a.id !== activity.id
                    );
                } else {
                    continue;
                }
            } else {
                continue;
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
    // const activityData = await fetchNationalPark('18');
    // console.log(calculateDistanceMatrix(activityData.thingsToDo));
};

main();
