/* eslint-disable no-await-in-loop */
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const apiKey = process.env.NPS_API_KEY;

const prisma = new PrismaClient();

const DEFAULT_DURATION = 60; // 1 hour
const NULL_LATITUDE = 0;
const NULL_LONGITUDE = 0;

const REGIONS_BY_STATE = Object.freeze([
    {
        region: 'Northeast',
        states: [
            'ME',
            'NH',
            'VT',
            'MA',
            'RI',
            'CT',
            'NY',
            'NJ',
            'PA',
            'MD',
            'DE',
        ],
    },
    {
        region: 'Southeast',
        states: [
            'VA',
            'WV',
            'KY',
            'TN',
            'NC',
            'SC',
            'GA',
            'FL',
            'AL',
            'MS',
            'AR',
            'LA',
        ],
    },
    {
        region: 'Southwest',
        states: ['OK', 'TX', 'NM', 'AZ'],
    },
    {
        region: 'Midwest',
        states: [
            'IA',
            'MO',
            'IL',
            'IN',
            'WI',
            'MI',
            'OH',
            'ND',
            'SD',
            'NE',
            'KS',
            'MN',
        ],
    },
    {
        region: 'West',
        states: ['CO', 'WY', 'MT', 'ID', 'UT', 'NV', 'WA', 'OR', 'CA'],
    },
    {
        region: 'Outside', // Used for parks that are not in US States and Alaska/Hawaii (everything not in the mainland)
        states: ['AK', 'HI', 'AS'],
    },
]);

const getRegion = (state) => {
    for (const region of REGIONS_BY_STATE) {
        if (region.states.includes(state.split(',')[0].trim())) {
            return region.region;
        }
    }
    return 'Outside';
};

//add image arrays
const AddImageArray = async () => {
    try {
        const response = await fetch(
            `https://developer.nps.gov/api/v1/parks?limit=500&api_key=${apiKey}`
        );
        if (!response.ok) {
            console.error('Error fetching national parks');
        }

        const data = await response.json();
        const nationalParks = data.data.filter(
            (elem) =>
                elem.designation.includes('National Park') ||
                elem.designation.includes('National and State Parks') ||
                elem.parkCode === 'npsa'
        );
        const nationalParksData = nationalParks.map((park) => {
            return {
                npsParkCode: park.parkCode,
                image_url: park.images.map((image) => image.url),
            };
        });
        for (const park of nationalParksData) {
            const exists = await prisma.park.findUnique({
                where: { npsParkCode: park.npsParkCode },
            });
            if (exists) {
                await prisma.park.update({
                    where: { npsParkCode: park.npsParkCode },
                    data: { image_url: park.image_url },
                });
            }
        }
    } catch (e) {
        console.error(e);
    }
};

// Convert duration string to integer of minutes (when given range, take average and round to nearest 5)
const durationStringToNumber = (durationString) => {
    if (!durationString) {
        return null;
    }
    const numbers = durationString.match(/\d+/g).map(Number);
    let minutesMultiplier = 1;
    if (/day/i.test(durationString)) {
        minutesMultiplier = 1440; // 24 * 60
    } else if (/hour/i.test(durationString)) {
        minutesMultiplier = 60;
    } else if (/minute/i.test(durationString)) {
        minutesMultiplier = 1;
    } else {
        // Default fallback if no unit found, assume minutes
        minutesMultiplier = 1;
    }
    const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const minutes = avg * minutesMultiplier;
    return Math.round(minutes / 5) * 5;
};

async function main() {
    // Seeds things to do data from API
    try {
        const response = await fetch(
            `https://developer.nps.gov/api/v1/thingstodo?limit=3504&api_key=${apiKey}`
        );
        if (!response.ok) {
            console.error('Error fetching national parks');
        }

        const data = await response.json();
        const activitiesList = data.data.filter((activity) => {
            const relatedPark = activity.relatedParks[0];
            return (
                relatedPark &&
                (relatedPark.designation?.includes('National Park') ||
                    relatedPark.designation?.includes(
                        'National and State Park'
                    ))
            );
        });

        const activitiesData = await Promise.all(
            activitiesList.map(async (activity) => {
                const relatedPark = activity.relatedParks[0];
                const relatedParkObj = await prisma.park.findUnique({
                    where: { npsParkCode: relatedPark.parkCode },
                });
                if (relatedParkObj) {
                    return {
                        name: activity.title,
                        activity_type: activity.activities[0].name,
                        locationId: relatedParkObj.id,
                        description:
                            activity.shortDescription ||
                            'No description available',
                        durationMins:
                            durationStringToNumber(activity.duration) ||
                            DEFAULT_DURATION,
                        latitude:
                            parseFloat(activity.latitude) || NULL_LATITUDE,
                        longitude:
                            parseFloat(activity.longitude) || NULL_LONGITUDE,
                        timeOfDay: activity.timeOfDay,
                        season: activity.season,
                    };
                }
            })
        );

        for (const activity of activitiesData) {
            try {
                await prisma.thingstodo.create({
                    data: {
                        name: activity.name,
                        activity_type: activity.activity_type,
                        location: {
                            connect: {
                                id: activity.locationId,
                            },
                        },
                        description: activity.description,
                        durationMins: activity.durationMins,
                        latitude: activity.latitude,
                        longitude: activity.longitude,
                        timeOfDay: activity.timeOfDay,
                        season: activity.season,
                    },
                });
            } catch (err) {
                console.error(
                    `Failed to create activity: ${activity.name}`,
                    err
                );
            }
        }
    } catch (e) {
        console.error(e);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
