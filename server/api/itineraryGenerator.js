require('dotenv').config();
const relatedActivities = require('./relatedActivities.js');

const data = {
    duration: 10,
    park: '28',
    activities: ['Swimming', 'Boating'],
};

const LENGTH_OF_DAY = 600; //10 hours of travel time each day in minutes 8am-6pm
const LUNCH_DURATION = 60; // 1 hour for lunch in minutes
const LUNCH_START = 210; // 11:30am
const BUFFER_TIME = 30; // padding in between activities to account for fixed travel time

const isFullDayActivity = (duration) => duration >= 300 && duration <= 600; // check if activity is a is between 5-10 hours

const isMultiDayActivity = (duration) => duration > 600; // check if activity is more than 10 hours

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

const isRelatedActivity = (activity1, userActivities) => {
    // checks if activity is in the same category as any of the user's chosen activities
    for (const type in relatedActivities) {
        const activitiesInCategory = relatedActivities[type];
        if (activitiesInCategory.includes(activity1)) {
            const relatesToUserInput = userActivities.some((activity) =>
                activitiesInCategory.includes(activity)
            );
            if (relatesToUserInput) {
                return true;
            }
        }
    }
    return false;
};

const weightedShuffle = (array, getWeight) => {
    const arr = array.slice();
    const output = [];
    while (arr.length > 0) {
        const sum = arr.reduce((acc, item) => acc + getWeight(item), 0);
        let randomnum = Math.random() * sum;
        let i = 0;
        for (; i < arr.length; i++) {
            randomnum -= getWeight(arr[i]);
            if (randomnum <= 0) break;
        }
        output.push(arr.splice(i, 1)[0]);
    }
    return output;
};

// Helper shuffle algorithm to sort activities by distance to other activities
const shuffle = (array, userData) => {
    const map = calculateDistanceMatrix(array); // calculate distance matrix for all activities

    const weightedActivities = array.map((a) => {
        const proximityWeight = [...map.entries()]
            .filter((x) => x[0].startsWith(a.id))
            .map((x) => 1 / (x[1] + 1))
            .reduce((x, y) => x + y, 0);

        let relevanceWeight = 0;
        if (userData.activities.includes(a.activity_type)) {
            relevanceWeight = 1;
        } else if (isRelatedActivity(a.activity_type, userData.activities)) {
            relevanceWeight = 0.75;
        } else {
            relevanceWeight = 0.25;
        }
        return { a, weight: proximityWeight + relevanceWeight };
    });
    const shuffled = weightedShuffle(weightedActivities, (x) => x.weight);
    return shuffled.map((x) => x.a);
};

const filterActivities = (array, activities) => {
    if (!activities.includes('Hiking')) {
        activities.push('Hiking');
    }
    return array.filter((x) => activities.includes(x.activity_type));
};

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
    const distanceMap = new Map();
    const validActivities = activities.filter(
        (x) => x.latitude !== 0 && x.longitude !== 0
    );

    validActivities.forEach((activity1, i) => {
        validActivities.forEach((activity2, j) => {
            if (i !== j) {
                distanceMap.set(
                    `${activity1.id},${activity2.id}`,
                    distanceFormula(
                        activity1.latitude,
                        activity1.longitude,
                        activity2.latitude,
                        activity2.longitude
                    )
                );
            }
        });
    });
    return distanceMap;
};

const scheduleMultiDayActivity = (activity, remainingDays, tripDuration) => {
    // given the activity, remaining days, and trip duration, return an array of activity objects for the duration of the activity
    const activityDuration = activity.durationMins;
    const maxDurationDays = Math.floor(tripDuration / 2); // don't schedule multi-day activities for more than half of the trip duration
    const durationDays = Math.min(
        Math.ceil(activityDuration / LENGTH_OF_DAY), // full duration of activity in days
        maxDurationDays, // half the trip duration
        remainingDays // remaining days in the trip (don't schedule for more days than remaining)
    );
    const currDay = tripDuration - remainingDays; // where to start scheduling the activity

    let activityDays = [];

    for (let i = 0; i < durationDays; i++) {
        activityDays.push({
            // create day object and include activity object
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
    let activityData = shuffle(parkData.thingsToDo, data);
    let itinerary = [];

    let day = 0;
    while (day < duration) {
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
                    // if full day activity, it should be the only activity on the day
                    if (dayActivities.length > 0 || duration < 2) {
                        // if there are already activities on the day or if the trip is less than 2 days, skip this activity
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
                    // if this is not the first activity on the day, add a buffer time
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
                addLunchBreak(); // add a lunch break if it is not already added
            } else if (isMultiDayActivity(activity.durationMins)) {
                // if multi-day activity, schedule it for a multiple consecutive days as long as it is <= trip duration/2
                if (
                    duration - day > 2 && //make sure there are at least 2 days left in the trip
                    dayActivities.length === 0 //make sure there are no activities on the day
                ) {
                    const scheduledactivities = scheduleMultiDayActivity(
                        // returns an array of activity objects for the duration of the activity
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
                }
                continue;
            }
        }
        if (day === duration) {
            // quit once the trip duration is reached
            break;
        }
        itinerary.push({
            Day: day + 1,
            Activities: dayActivities,
        });
        day++;
    }
    return itinerary;
};

const main = async () => {
    const itinerary = await generateItinerary(data);
    console.log(JSON.stringify(itinerary, null, 2));
    //const activityData = await fetchNationalPark('18');
    //const distanceMatrix = calculateDistanceMatrix(activityData.thingsToDo);
    //console.log(distanceMatrix);
    // const parkData = await fetchNationalPark('28');
    // const shuffledArr = shuffle(parkData.thingsToDo, data);
    // console.log(shuffledArr.map((x) => x.name));
};

main();
