const {
    ADJACENT_REGIONS,
    TravelSeasons,
    States,
} = require('./recommenderUtils.js');

const relatedActivities = require('./relatedActivities.js');

const getRegionVector = (region) => {
    const allRegions = ADJACENT_REGIONS.map((r) => r.region);
    const regionEntry = ADJACENT_REGIONS.find((r) => r.region === region);
    const adjacentToRegion = regionEntry ? regionEntry.adjacent : [];
    const vector = allRegions.map((r) => {
        if (r === region) {
            return 1;
        }
        if (adjacentToRegion.includes(r)) {
            return 0.5;
        }
        return 0;
    });
    return vector;
};

const getActivityVector = (activityList) => {
    const lowerActivityList = activityList.map((a) => a.toLowerCase());
    const groups = Object.keys(relatedActivities);

    return groups.map((group) => {
        const groupActivities = relatedActivities[group];
        const hasMatch = groupActivities.some((g) =>
            lowerActivityList.includes(g.toLowerCase())
        );
        return hasMatch ? 1 : 0;
    });
};

const getSeasonVector = (seasonList) => {
    const allSeasons = Object.values(TravelSeasons);
    return allSeasons.map((season) => (seasonList.includes(season) ? 1 : 0));
};

const getStateVector = (parkState) => {
    const allStates = Object.values(States);
    return allStates.map((state) => (parkState.startsWith(state) ? 1 : 0));
};
function normalize(value, min, max) {
    return (value - min) / (max - min);
}

function getParkVector(park) {
    const regionVec = getRegionVector(park.region);
    const activityVec = getActivityVector(park.activity_types);
    const seasonVec = getSeasonVector(park.season);
    const stateVec = getStateVector(park.state);
    const durationMap = { Weekend: 1, '1 week or more': 2 };
    const durationVal = durationMap[park.duration[0]] || 0;
    return [
        ...regionVec,
        ...activityVec,
        ...seasonVec,
        ...stateVec,
        durationVal,
    ];
}

function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

module.exports = {
    getParkVector,
    normalize,
    cosineSimilarity,
};
