const prisma = require('./db.js');

const {
    ACTIVITY_SEASON_MAP,
    TravelSeasons,
    ADJACENT_REGIONS,
    assignWeights,
} = require('./recommenderUtils.js');

const relatedActivities = require('./relatedActivities.js');
const {
    getParkVector,
    normalize,
    cosineSimilarity,
} = require('./consineSimilarity.js');

const data = {
    activities: ['Hiking', 'Swimming'],
    season: 'Summer',
    duration: 'Daytrip',
    region: ['West'],
};

const mmrDiversify = (rankedParks, N = 6, lambda = 0.7) => {
    if (rankedParks.length === 0) return [];
    const parkVectors = rankedParks.map((p) => getParkVector(p));
    const selectedIndices = new Set();
    const selected = [];

    while (selected.length < N && selected.length < rankedParks.length) {
        let bestIndex = -1;
        let bestScore = -Infinity;

        for (let i = 0; i < rankedParks.length; i++) {
            if (selectedIndices.has(i)) continue;

            const relevance = rankedParks[i].score;

            let diversityPenalty = 0;
            if (selected.length > 0) {
                const maxSim = Math.max(
                    ...selected.map((j) =>
                        cosineSimilarity(parkVectors[i], parkVectors[j])
                    )
                );
                diversityPenalty = maxSim;
            }

            const mmrScore =
                lambda * relevance - (1 - lambda) * diversityPenalty;

            if (mmrScore > bestScore) {
                bestScore = mmrScore;
                bestIndex = i;
            }
        }

        if (bestIndex === -1) break;

        selected.push(bestIndex);
        selectedIndices.add(bestIndex);
    }

    return selected.map((i) => rankedParks[i]);
};

const SELECTED_ACTIVITY_SCORE = 1; // score adds 1 if exact activity is included
const ADJACENT_ACTIVITY_SCORE = 0.5; //score adds 0.5 if activity is adjacent to one included

const getActivityScore = (parkData, userActivities) => {
    // also checks if related activity is included in the park and boosts score for that
    const relatedActivityMap = {};
    const userInterestCategories = new Set();
    let totalScore = 0;
    Object.entries(relatedActivities).forEach(([key, values]) => {
        // reverse lookup map of related activities
        for (const activity of values) {
            relatedActivityMap[activity] = key;
        }
    });

    for (const userActivity of userActivities) {
        const category = relatedActivityMap[userActivity] || userActivity;
        userInterestCategories.add(category);
    }

    for (const parkActivity of parkData.activity_types) {
        const category = relatedActivityMap[parkActivity] || parkActivity;
        if (userInterestCategories.has(category)) {
            if (userActivities.includes(parkActivity)) {
                totalScore += SELECTED_ACTIVITY_SCORE;
            } else {
                totalScore += ADJACENT_ACTIVITY_SCORE; // Related match
            }
        }
    }

    return totalScore / userActivities.length;
};

const SELECTED_SEASON_SCORE = 1;
const OUT_OF_SEASON_SCORE = -0.75; // adds a penalty for parks that are out of season

const getSeasonScore = (parkData, userSeason) => {
    if (parkData.season.includes(userSeason)) {
        return SELECTED_SEASON_SCORE;
    }
    return OUT_OF_SEASON_SCORE;
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
    let scoredRegion = [];

    const calculateRegionScore = (userRegions, depth = 0) => {
        const weight = 1 / Math.pow(2, depth);
        let score = 0;
        for (const region of userRegions) {
            if (scoredRegion.includes(region)) {
                continue;
            }
            scoredRegion.push(region);
            if (region === parkData.region) {
                score += weight;
            } else {
                const regionNode = ADJACENT_REGIONS.find(
                    (r) => r.region === region
                );
                if (regionNode) {
                    score += calculateRegionScore(
                        regionNode.adjacent,
                        depth + 1
                    );
                }
            }
        }
        return score;
    };
    const val = calculateRegionScore(userRegions);
    return val;
};

const getRatingScore = (parkData) => {
    //uses the park's average rating from all users to calculate the score
    const maxRating = 5;
    if (!parkData.avgRating) {
        return 0;
    }
    return parkData.avgRating / maxRating;
};

const fetchMinMax = async () => {
    try {
        const minMaxVisitors = await prisma.park.aggregate({
            _min: {
                spring_avg_visitors: true,
                summer_avg_visitors: true,
                fall_avg_visitors: true,
                winter_avg_visitors: true,
            },
            _max: {
                spring_avg_visitors: true,
                summer_avg_visitors: true,
                fall_avg_visitors: true,
                winter_avg_visitors: true,
            },
        });
        return minMaxVisitors;
    } catch (e) {
        console.error(e);
    }
};

const getAvgVisitorsScore = async (parkData, userSeason, minmax) => {
    //uses the park's average visitors for the season to calculate the score
    let avgVisitors;
    let maxAvgVisitors;
    let minAvgVisitors;
    switch (userSeason) {
        case TravelSeasons.SPRING:
            avgVisitors = parkData.spring_avg_visitors;
            maxAvgVisitors = minmax._max.spring_avg_visitors;
            minAvgVisitors = minmax._min.spring_avg_visitors;
            break;
        case TravelSeasons.FALL:
            avgVisitors = parkData.fall_avg_visitors;
            maxAvgVisitors = minmax._max.fall_avg_visitors;
            minAvgVisitors = minmax._min.fall_avg_visitors;
            break;
        case TravelSeasons.SUMMER:
            avgVisitors = parkData.summer_avg_visitors;
            maxAvgVisitors = minmax._max.summer_avg_visitors;
            minAvgVisitors = minmax._min.summer_avg_visitors;
            break;
        case TravelSeasons.WINTER:
            avgVisitors = parkData.winter_avg_visitors;
            maxAvgVisitors = minmax._max.winter_avg_visitors;
            minAvgVisitors = minmax._min.winter_avg_visitors;
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
        const parks = await prisma.park.findMany();
        return parks;
    } catch (e) {
        console.error(e);
    }
};

const calculateParkScore = async (
    parkData,
    userInput,
    wishlist,
    visited,
    reviews
) => {
    const minMaxData = await fetchMinMax();
    const WEIGHTS = assignWeights(userInput);
    const scores = await Promise.all(
        parkData.map(async (park) => {
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
            const avgVisitorsScore = await getAvgVisitorsScore(
                park,
                userInput.season,
                minMaxData
            );

            let score =
                activityScore * WEIGHTS.activities +
                seasonScore * WEIGHTS.season +
                durationScore * WEIGHTS.duration +
                regionScore * WEIGHTS.region +
                ratingScore * WEIGHTS.rating +
                avgVisitorsScore * WEIGHTS.vistors;

            if (visited && visited.some((x) => x.id === park.id)) {
                if (reviews?.some((x) => x.locationId === park.id)) {
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
                parkObject: park,
                name: park.name,
                springAvgVisitors: park.spring_avg_visitors,
                summerAvgVisitors: park.summer_avg_visitors,
                fallAvgVisitors: park.fall_avg_visitors,
                winterAvgVisitors: park.winter_avg_visitors,
                region: park.region,
                activity_types: park.activity_types,
                season: park.season,
                state: park.state,
                duration: park.duration,
                activityScore,
                seasonScore,
                durationScore,
                regionScore,
                score,
            };
        })
    );

    const maxScore = Math.max(...scores.map((x) => x.score));
    const minScore = Math.min(...scores.map((x) => x.score));

    const normalizedScores = scores.map((x) => {
        return {
            ...x,
            score: (x.score - minScore) / (maxScore - minScore),
        };
    });

    const rankedParks = normalizedScores.sort((a, b) =>
        sortScores(a, b, userInput.season)
    );

    const diversifiedScores = mmrDiversify(rankedParks);
    return diversifiedScores;
};

const main = async () => {
    const userInput = data;
    const parkData = await fetchNationalParks();

    const rankedParks = await calculateParkScore(parkData, userInput);
};
module.exports = calculateParkScore;
