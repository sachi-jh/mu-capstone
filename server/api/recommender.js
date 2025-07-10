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

const Regions = {
    NORTHEAST: 'Northeast',
    MIDWEST: 'Midwest',
    SOUTHEAST: 'Southeast',
    SOUTHWEST: 'Southwest',
    WEST: 'West',
    OUTSIDE: 'Outside',
};

const TravelSeasons = {
    SPRING: 'Spring',
    SUMMER: 'Summer',
    FALL: 'Fall',
    WINTER: 'Winter',
};

const ADJACENT_REGIONS = Object.freeze([
    {
        region: Regions.NORTHEAST,
        adjacent: [Regions.SOUTHEAST, Regions.MIDWEST],
    },
    {
        region: Regions.SOUTHEAST,
        adjacent: [Regions.NORTHEAST, Regions.MIDWEST, Regions.SOUTHWEST],
    },
    {
        region: Regions.SOUTHWEST,
        adjacent: [Regions.WEST, Regions.MIDWEST, Regions.SOUTHEAST],
    },
    {
        region: Regions.MIDWEST,
        adjacent: [
            Regions.WEST,
            Regions.SOUTHWEST,
            Regions.SOUTHEAST,
            Regions.NORTHEAST,
        ],
    },
    {
        region: Regions.WEST,
        adjacent: [Regions.MIDWEST, Regions.SOUTHWEST, Regions.OUTSIDE],
    },
    {
        region: Regions.OUTSIDE,
        adjacent: [Regions.WEST],
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

const sortScores = (a, b, userSeason) => {
    if (a.score !== b.score) {
        return b.score - a.score;
    }

    switch (userSeason) {
        case TravelSeasons.SPRING:
            return b.spring_avg_visitors - a.spring_avg_visitors;
        case TravelSeasons.FALL:
            return b.fall_avg_visitors - a.fall_avg_visitors;
        case TravelSeasons.SUMMER:
            return b.summer_avg_visitors - a.summer_avg_visitors;
        case TravelSeasons.WINTER:
            return b.winter_avg_visitors - a.winter_avg_visitors;
        default:
            return b.score - a.score;
    }
};

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

const calculateParkScore = (parkData, userInput, wishlist, visited) => {
    const scores = parkData.map((park) => {
        const activityScore = getActivityScore(park, userInput.activities);
        const seasonScore = getSeasonScore(park, userInput.season);
        const durationScore = getDurationScore(park, userInput.duration);
        const regionScore = getRegionScore(park, userInput.region);
        let score =
            activityScore * WEIGHTS.activities +
            seasonScore * WEIGHTS.season +
            durationScore * WEIGHTS.duration +
            regionScore * WEIGHTS.region;

        //let newscore = 0;
        if (visited && visited.some((x) => x.id === park.id)) {
            score = score * 0.5;
        } else if (wishlist && wishlist.some((x) => x.id === park.id)) {
            score = score * 1.25;
        }
        return {
            name: park.name,
            springAvgVisitors: park.spring_avg_visitors,
            summerAvgVisitors: park.summer_avg_visitors,
            fallAvgVisitors: park.fall_avg_visitors,
            winterAvgVisitors: park.winter_avg_visitors,
            activityScore: activityScore,
            seasonScore: seasonScore,
            durationScore: durationScore,
            regionScore: regionScore,
            score: score,
        };
    });

    const rankedParks = scores.sort((a, b) =>
        sortScores(a, b, userInput.season)
    );
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
