const {
    ACTIVITY_SEASON_MAP,
    TravelSeasons,
    WEIGHTS,
    ADJACENT_REGIONS,
} = require('./recommenderUtils.js');

const data = {
    activities: ['Hiking', 'Swimming'],
    season: 'Summer',
    duration: 'Daytrip',
    region: ['West'],
};

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

const ACTIVITY_SEASON_BOOST_SCORE = 2; // BOOST score if park season matches activity season

const getActivitySeasonBoostScore = (parkData, userActivities, userSeason) => {
    let numMatches = 0;
    for (const activity of userActivities) {
        const activitySeason = ACTIVITY_SEASON_MAP[activity];
        if (
            parkData.activity_types.includes(activity) &&
            activitySeason &&
            parkData.season.includes(activitySeason)
        ) {
            numMatches++;
        }
        if (userSeason === activitySeason) {
            numMatches++; // extra boost for matching activity season
        }
    }
    return (numMatches / userActivities.length) * ACTIVITY_SEASON_BOOST_SCORE;
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

const getRatingScore = (parkData) => {
    //uses the park's average rating from all users to calculate the score
    const maxRating = 5;
    if (!parkData.avgRating) {
        return 0;
    }
    return parkData.avgRating / maxRating;
};

const getAvgVisitorsScore = async (parkData, userSeason) => {
    //uses the park's average visitors for the season to calculate the score
    let minVisitorObj = {};
    let maxVisitorObj = {};
    let minAvgVisitors = 0;
    let maxAvgVisitors = 0;
    try {
        const response = await fetch(
            'http://localhost:3000/api/parks/get-min-avg-visitors',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ season: userSeason }),
            }
        );
        if (!response.ok) {
            throw new Error(`error status: ${response.status}`);
        }
        const data = await response.json();
        minVisitorObj = data;
    } catch (e) {
        console.error(e);
    }
    try {
        const response = await fetch(
            'http://localhost:3000/api/parks/get-max-avg-visitors',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ season: userSeason }),
            }
        );
        if (!response.ok) {
            throw new Error(`error status: ${response.status}`);
        }
        const data = await response.json();
        maxVisitorObj = data;
    } catch (e) {
        console.error(e);
    }
    let avgVisitors = 0;

    switch (userSeason) {
        case TravelSeasons.SPRING:
            avgVisitors = parkData.spring_avg_visitors;
            maxAvgVisitors = maxVisitorObj[0].spring_avg_visitors;
            minAvgVisitors = minVisitorObj[0].spring_avg_visitors;
            break;
        case TravelSeasons.FALL:
            avgVisitors = parkData.fall_avg_visitors;
            maxAvgVisitors = maxVisitorObj[0].fall_avg_visitors;
            minAvgVisitors = minVisitorObj[0].fall_avg_visitors;
            break;
        case TravelSeasons.SUMMER:
            avgVisitors = parkData.summer_avg_visitors;
            maxAvgVisitors = maxVisitorObj[0].summer_avg_visitors;
            minAvgVisitors = minVisitorObj[0].summer_avg_visitors;
            break;
        case TravelSeasons.WINTER:
            avgVisitors = parkData.winter_avg_visitors;
            maxAvgVisitors = maxVisitorObj[0].winter_avg_visitors;
            minAvgVisitors = minVisitorObj[0].winter_avg_visitors;
            break;
        default:
            return 0;
    }

    return (
        (avgVisitors - minAvgVisitors) / (maxAvgVisitors - minAvgVisitors) //normalize the avg visitors using the max and miv values for the season
    );
};

const considerVisitedReviews = (parkReview) => {
    //if the review is 3 or higher at 0.25 points per additional star, if less than 3, the score is 0.5
    const scoreFromRating = 0.5 + (parkReview - 3) * 0.25;
    return Math.max(scoreFromRating, 0.5);
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

const calculateParkScore = (
    parkData,
    userInput,
    wishlist,
    visited,
    reviews
) => {
    const scores = parkData.map((park) => {
        const activityScore =
            getActivityScore(park, userInput.activities) +
            getActivitySeasonBoostScore(
                park,
                userInput.activities,
                userInput.season
            );
        const seasonScore = getSeasonScore(park, userInput.season);
        const durationScore = getDurationScore(park, userInput.duration);
        const regionScore = getRegionScore(park, userInput.region);
        const ratingScore = getRatingScore(park);
        const avgVisitorsScore = getAvgVisitorsScore(park, userInput.season);
        let score =
            activityScore * WEIGHTS.activities +
            seasonScore * WEIGHTS.season +
            durationScore * WEIGHTS.duration +
            regionScore * WEIGHTS.region +
            ratingScore * WEIGHTS.rating +
            avgVisitorsScore * WEIGHTS.vistors;

        if (visited && visited.some((x) => x.id === park.id)) {
            if (reviews?.some((x) => x.locationId === park.id)) {
                //if park is visited by this user and they left a review, consider their rating
                const parkReview = reviews.find(
                    (x) => x.locationId === park.id
                );
                score = score * considerVisitedReviews(parkReview.rating);
            } else {
                score = score * 0.5;
            }
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
};
//main();
module.exports = calculateParkScore;
