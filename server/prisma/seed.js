/* eslint-disable no-await-in-loop */
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const apiKey = process.env.NPS_API_KEY;

const prisma = new PrismaClient();

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

async function main() {
    //add image arrays
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

    // Seed activity types
    try {
        const response = await fetch(
            `https://developer.nps.gov/api/v1/activities?limit=40&api_key=${apiKey}`
        );
        if (!response.ok) {
            console.error('Error fetching activity types');
        }

        const data = await response.json();
        const activityTypes = data.data;
        for (const activity of activityTypes) {
            try {
                await prisma.activityType.create({
                    data: { name: activity.name },
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

    // Seeds park data, picks 62/63 (sequoia and kings canyon are 1 entry)
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
            const region = getRegion(park.states);
            return {
                name: park.fullName,
                description: park.description,
                state: park.states,
                npsParkCode: park.parkCode,
                image_url: park.images.map((image) => image.url),
                region,
                activities: park.activities.map((activity) => activity.name),
            };
        });
        for (const park of nationalParksData) {
            const exists = await prisma.park.findUnique({
                where: { npsParkCode: park.npsParkCode },
            });

            if (!exists) {
                const createdPark = await prisma.park.create({
                    data: {
                        npsParkCode: park.npsParkCode,
                        name: park.name,
                        description: park.description,
                        state: park.state,
                        image_url: park.image_url,
                        region: park.region,
                        activity_types: park.activities,
                    },
                });
            }
        }
    } catch (e) {
        console.error(e);
    }

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
                    };
                }
            })
        );

        for (const activity of activitiesData) {
            try {
                await prisma.thingstodo.create({
                    data: activity,
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
