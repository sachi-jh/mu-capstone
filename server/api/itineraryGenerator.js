require('dotenv').config();
const prisma = require('./db.js');
const relatedActivities = require('./relatedActivities.js');

const data = {
    duration: 10,
    park: '36',
    activities: ['Swimming', 'Boating', 'Camping'],
};

const LENGTH_OF_DAY = 600; //10 hours of travel time each day in minutes 8am-6pm
const LUNCH_DURATION = 60; // 1 hour for lunch in minutes
const LUNCH_START = 210; // 11:30am
const LUNCH_END = 270; // 2:30pm
const START_TIME = 480;
const BUFFER_TIME = 30; // padding in between activities to account for fixed travel time
const CAMPING_START_TIME = 1380;
const CAMPING_END_TIME = 1440;
const CAMPING_DURATION = 60;

const isFullDayActivity = (duration) =>
    duration >= 300 && duration <= LENGTH_OF_DAY; // check if activity is a is between 5-10 hours

const isMultiDayActivity = (duration) => duration > LENGTH_OF_DAY; // check if activity is more than 10 hours

const isNightActivity = (activityType) =>
    activityType === 'Stargazing' || activityType === 'Astronomy';

const isCamping = (activityType) => activityType === 'Camping';

const fetchNationalPark = async (id) => {
    try {
        const park = await prisma.park.findUnique({
            where: { id: Number(id) },
            include: { thingsToDo: true },
        });
        return park;
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

const scheduleMultiDayActivity = (
    activity,
    remainingDays,
    tripDuration,
    tripId
) => {
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
            activity_obj: activity,
            tripId: tripId,
            thingsToDoID: activity.id,
            day: currDay + i + 1,
            startTime: START_TIME,
            endTime: START_TIME + LENGTH_OF_DAY,
            durationMins: 600,
        });
    }
    return activityDays;
};

const NIGHT_START_TIME = 1320; //22:00
const NIGHT_END_TIME = 1440; //23:59

// schedules stargazing in the evening
const scheduleNightActivity = (
    activity,
    currentDay,
    tripId,
    campingActivity
) => {
    const start = NIGHT_START_TIME; // 10:00 PM
    const end = campingActivity ? NIGHT_END_TIME - 60 : NIGHT_END_TIME; //schedules stargazing before camping if both are selected
    return {
        activity_obj: activity,
        tripId: tripId,
        thingsToDoID: activity.id,
        day: currentDay + 1,
        startTime: start,
        endTime: end,
        durationMins: end - start,
    };
};

const addLunchBreak = (remainingTime, currTime, day) => {
    if (remainingTime >= LUNCH_DURATION && currTime >= LUNCH_START) {
        let lunchStartTime = currTime;
        let lunchEndTime = lunchStartTime + LUNCH_DURATION;

        return {
            day: day + 1,
            time: `${formatTime(lunchStartTime)} - ${formatTime(lunchEndTime)}`,
            start: lunchStartTime,
            end: lunchEndTime,
            name: 'Lunch Break',
            duration: 60,
            id: 'lunch',
        };
    }
};

const generateItinerary = async (data) => {
    const { duration, park, tripId } = data;
    const parkData = await fetchNationalPark(park);
    let activityData = shuffle(parkData.thingsToDo, data);
    let itinerary = [];

    const campingActivity = activityData.find(
        (a) => a.activity_type === 'Camping'
    );

    if (data.activities.includes('Camping') && campingActivity) {
        //if user selected camping, and it is present at the park, scheduled every night
        for (let i = 0; i < duration - 1; i++) {
            itinerary.push({
                activity_obj: campingActivity,
                tripId: tripId,
                thingsToDoID: campingActivity.id,
                day: i + 1,
                startTime: CAMPING_START_TIME,
                endTime: CAMPING_END_TIME,
                durationMins: CAMPING_DURATION,
            });
        }

        activityData = activityData.filter((a) => a.id !== campingActivity.id);
    }

    let day = 0;
    while (day < duration) {
        let currTime = START_TIME;
        let dayActivities = [];
        let remainingTime = LENGTH_OF_DAY;
        let lunch = false;
        let stargazing = false;

        // Add lunch to the itinerary

        for (let activity of activityData) {
            if (activity.durationMins <= remainingTime) {
                if (isNightActivity(activity.activity_type)) {
                    if (duration - day > 1 && !stargazing) {
                        const nightActivity = scheduleNightActivity(
                            activity,
                            day,
                            tripId,
                            campingActivity
                        );
                        dayActivities.push(nightActivity);
                        stargazing = true;
                        activityData = activityData.filter(
                            (a) => a.id !== activity.id
                        );
                    }
                    continue;
                } else if (isFullDayActivity(activity.durationMins)) {
                    // if full day activity, it should be the only activity on the day
                    if (dayActivities.length > 0 || duration < 2) {
                        // if there are already activities on the day or if the trip is less than 2 days, skip this activity
                        continue;
                    } else {
                        dayActivities.push({
                            activity_obj: activity,
                            tripId: tripId,
                            thingsToDoID: activity.id,
                            day: day + 1,
                            startTime: currTime,
                            endTime: currTime + activity.durationMins,
                            durationMins: activity.durationMins,
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
                    activity_obj: activity,
                    tripId: tripId,
                    thingsToDoID: activity.id,
                    day: day + 1,
                    startTime: currTime,
                    endTime: currTime + activity.durationMins,
                    durationMins: activity.durationMins,
                });
                activityData = activityData.filter((a) => a.id !== activity.id);
                currTime += activity.durationMins;
                remainingTime -= activity.durationMins;
                if (!lunch) {
                    const lunchActivity = addLunchBreak(
                        remainingTime,
                        currTime,
                        day
                    ); // add a lunch break if it is not already added
                    if (lunchActivity) {
                        currTime = lunchActivity.end;
                        remainingTime -= LUNCH_DURATION;
                        lunch = true;
                        dayActivities.push(lunchActivity);
                    }
                }
            } else if (isMultiDayActivity(activity.durationMins)) {
                // if multi-day activity, schedule it for a multiple consecutive days as long as it is <= trip duration/2
                if (isCamping(activity.activity_type)) {
                    // skip camping in multiday activities
                    continue;
                }
                if (
                    duration - day > 2 && //make sure there are at least 2 days left in the trip
                    dayActivities.length === 0 //make sure there are no activities on the day
                ) {
                    const scheduledactivities = scheduleMultiDayActivity(
                        // returns an array of activity objects for the duration of the activity
                        activity,
                        duration - day,
                        duration,
                        tripId
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
        itinerary = [...itinerary, ...dayActivities];
        day++;
    }
    return itinerary;
};

const main = async () => {
    const itinerary = await generateItinerary(data);
};

module.exports = generateItinerary;
