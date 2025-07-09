const data = {
    activities: ['Hiking', 'Swimming'],
    season: 'Summer',
    duration: 'Daytrip',
    region: ['West'],
};

const WEIGHTS = {
    activities: 0.4,
    season: 0.3,
    region: 0.2,
    duration: 0.1,
};

const ADJACENT_REGIONS = Object.freeze([
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
        adjacent: ['West', 'Midwest', 'Southeast'],
    },
    {
        region: 'Midwest',
        adjacent: ['West', 'Southwest', 'Southeast', 'Northeast'],
    },
    {
        region: 'West',
        adjacent: ['Midwest', 'Southwest', 'Outside'],
    },
    {
        region: 'Outside',
        adjacent: ['West'],
    },
]);

const getActivityScore = (parkData, userActivities) => {
    const matches = parkData.activity_types.filter((activity) =>
        userActivities.includes(activity)
    );
    return matches.length / userActivities.length;
};

const SELECTED_SEASON_SCORE = 1;

const getSeasonScore = (parkData, userSeason) => {
    if (parkData.season.includes(userSeason)) {
        return SELECTED_SEASON_SCORE;
    }
    return 0;
};

const SELECTED_TRIP_DURATION_SCORE = 1;

const getDurationScore = (parkData, userDuration) => {
    if (parkData.duration.includes(userDuration)) {
        return SELECTED_TRIP_DURATION_SCORE;
    }
    return 0;
};

const SELECTED_REGION_SCORE = 1; // score adds 1 is park region is included
const ADJACENT_REGION_SCORE = 0.5; //score adds 0.5 if park region is adjacent to one included

const getRegionScore = (parkData, userRegions) => {
    if (userRegions.includes(parkData.region)) {
        return SELECTED_REGION_SCORE;
    }

    for (const region of userRegions) {
        const adjReg = ADJACENT_REGIONS.filter((r) => r.region === region);
        if (adjReg.some((x) => x.adjacent.includes(parkData.region))) {
            return ADJACENT_REGION_SCORE;
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
        return data;
    } catch (e) {
        console.error(e);
    }
};

const calculateParkScore = (parkData, userInput) => {
    const scores = parkData.map((park) => {
        const activityScore = getActivityScore(park, userInput.activities);
        const seasonScore = getSeasonScore(park, userInput.season);
        const durationScore = getDurationScore(park, userInput.duration);
        const regionScore = getRegionScore(park, userInput.region);
        const score =
            activityScore * WEIGHTS.activities +
            seasonScore * WEIGHTS.season +
            durationScore * WEIGHTS.duration +
            regionScore * WEIGHTS.region;
        return {
            name: park.name,
            activityScore: activityScore,
            seasonScore: seasonScore,
            durationScore: durationScore,
            regionScore: regionScore,
            score: score,
        };
    });

    const rankedParks = scores.sort((a, b) => b.score - a.score);
    return rankedParks;
};
const main = async () => {
    const userInput = data;
    const parkData = await fetchNationalParks();

    const rankedParks = calculateParkScore(parkData, userInput);

    // Included log statement since there is no output on client yet
    console.log(rankedParks);
};
module.exports = calculateParkScore;
