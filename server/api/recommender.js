data = [
    {
        activities: ['Hiking', 'Swimming'],
        season: 'Summer',
        duration: 'Daytrip',
        region: ['Midwest', 'West'],
    },
];

let parkdata;

const adjacentRegions = [
    {
        region: 'Northeast',
        adjacent: ['Southeast', 'Midwest'],
    },
    {
        region: 'Southeast',
        adjacent: ['Northeast', 'Midwest', 'Southwest'],
    },
    {
        region: 'Southwest',
        adjacent: ['West', 'Midwest', 'Southest'],
    },
    {
        region: 'Midwest',
        adjacent: ['West', 'Southwest', 'Southest', 'Northeast'],
    },
    {
        region: 'West',
        adjacent: ['Midwest', 'Southwest', 'Outside'],
    },
    {
        region: 'Outside',
        adjacent: ['West'],
    },
];

const getActivityScore = (data, activities) => {
    const matches = data.activity_types.filter((activity) =>
        activities.includes(activity)
    );
    const score = matches.length / activities.length;
    return score;
};

const getRegionScore = (data, regions) => {
    if (regions.includes(data.region)) {
        return 1;
    }

    for (const region of regions) {
        const ajdreg = adjacentRegions.filter((r) => r.region === region);
        if (ajdreg.includes(data.region)) {
            return 0.5;
        }
    }

    return 0;
};

const fetchNationalParks = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/parks');
        if (!response.ok) {
            throw new Error(`error status: ${response.status}`);
        }
        const data = await response.json();
        parkdata = data;
    } catch (e) {
        console.error(e);
    }
};

const main = async () => {
    const userInput = data[0];
    await fetchNationalParks();

    const scores = parkdata.map((park) => {
        const activityscore = getActivityScore(park, userInput.activities);
        const regionscore = getRegionScore(park, userInput.region);
        const score = activityscore + regionscore;
        return {
            name: park.name,
            activityscore: activityscore,
            regionscore: regionscore,
            score: score,
        };
    });

    const rankedParks = scores.sort((a, b) => b.score - a.score);

    // Included log statement since there is no output on client yet
    console.log(rankedParks);
};

main();
