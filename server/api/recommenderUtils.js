const WEIGHTS = {
    activities: 0.35,
    season: 0.28,
    region: 0.17,
    duration: 0.8,
    rating: 0.07,
    vistors: 0.05,
};

const assignWeights = (userInput) => {
    let DynamicWeights = {
        activities: 1,
        season: 1,
        region: 1,
        duration: 1,
        rating: 1,
        vistors: 1,
    };
    if (
        userInput.duration === 'Daytrip' &&
        userInput.activities.includes('Camping')
    ) {
        DynamicWeights.activities = 0.02;
        DynamicWeights.season = 0.7;
        DynamicWeights.region = 1.8;
        DynamicWeights.duration = 1.8;
        DynamicWeights.rating = 1.2;
        DynamicWeights.vistors = 0.5;
    } else if (userInput.duration === 'Daytrip') {
        DynamicWeights.activities = 0.5;
        DynamicWeights.season = 0.7;
        DynamicWeights.region = 1.8;
        DynamicWeights.duration = 1.8;
        DynamicWeights.rating = 1.2;
        DynamicWeights.vistors = 0.5;
    } else if (userInput.duration === 'Weekend') {
        DynamicWeights.activities = 0.8;
        DynamicWeights.season = 1.2;
        DynamicWeights.region = 0.75;
        DynamicWeights.duration = 1;
        DynamicWeights.rating = 1.2;
        DynamicWeights.vistors = 0.5;
    } else if (userInput.duration === '1 week or more') {
        DynamicWeights.activities = 1.8;
        DynamicWeights.season = 1.8;
        DynamicWeights.region = 1;
        DynamicWeights.duration = 1.8;
        DynamicWeights.rating = 0.5;
        DynamicWeights.visitor = 0.2;
    }
    return DynamicWeights;
};

const Regions = {
    NORTHEAST: 'Northeast',
    MIDWEST: 'Midwest',
    SOUTHEAST: 'Southeast',
    SOUTHWEST: 'Southwest',
    WEST: 'West',
    OUTSIDE: 'Outside',
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

const TravelSeasons = {
    SPRING: 'Spring',
    SUMMER: 'Summer',
    FALL: 'Fall',
    WINTER: 'Winter',
};

const ACTIVITY_SEASON_MAP = {
    'Arts and Culture': [
        TravelSeasons.SPRING,
        TravelSeasons.SUMMER,
        TravelSeasons.FALL,
        TravelSeasons.WINTER,
    ],
    Astronomy: [TravelSeasons.SUMMER, TravelSeasons.FALL, TravelSeasons.WINTER],
    'Auto and ATV': [
        TravelSeasons.SPRING,
        TravelSeasons.SUMMER,
        TravelSeasons.FALL,
    ],
    Biking: [TravelSeasons.SPRING, TravelSeasons.SUMMER, TravelSeasons.FALL],
    Boating: [TravelSeasons.SUMMER],
    Camping: [TravelSeasons.SPRING, TravelSeasons.SUMMER, TravelSeasons.FALL],
    Canyoneering: [
        TravelSeasons.SPRING,
        TravelSeasons.SUMMER,
        TravelSeasons.FALL,
    ],
    Caving: [
        TravelSeasons.SPRING,
        TravelSeasons.SUMMER,
        TravelSeasons.FALL,
        TravelSeasons.WINTER,
    ],
    Climbing: [TravelSeasons.SPRING, TravelSeasons.SUMMER, TravelSeasons.FALL],
    'Compass and GPS': [
        TravelSeasons.SPRING,
        TravelSeasons.SUMMER,
        TravelSeasons.FALL,
    ],
    'Dog Sledding': [TravelSeasons.WINTER],
    Fishing: [TravelSeasons.SPRING, TravelSeasons.SUMMER, TravelSeasons.FALL],
    Flying: [TravelSeasons.SPRING, TravelSeasons.SUMMER, TravelSeasons.FALL],
    Food: [
        TravelSeasons.SPRING,
        TravelSeasons.SUMMER,
        TravelSeasons.FALL,
        TravelSeasons.WINTER,
    ],
    Golf: [TravelSeasons.SPRING, TravelSeasons.SUMMER, TravelSeasons.FALL],
    'Guided Tours': [
        TravelSeasons.SPRING,
        TravelSeasons.SUMMER,
        TravelSeasons.FALL,
        TravelSeasons.WINTER,
    ],
    'Hands-On': [
        TravelSeasons.SPRING,
        TravelSeasons.SUMMER,
        TravelSeasons.FALL,
        TravelSeasons.WINTER,
    ],
    Hiking: [TravelSeasons.SPRING, TravelSeasons.SUMMER, TravelSeasons.FALL],
    'Horse Trekking': [
        TravelSeasons.SPRING,
        TravelSeasons.SUMMER,
        TravelSeasons.FALL,
    ],
    'Hunting and Gathering': [TravelSeasons.FALL],
    'Ice Skating': [TravelSeasons.WINTER],
    'Junior Ranger Program': [
        TravelSeasons.SPRING,
        TravelSeasons.SUMMER,
        TravelSeasons.FALL,
    ],
    'Living History': [
        TravelSeasons.SPRING,
        TravelSeasons.SUMMER,
        TravelSeasons.FALL,
    ],
    'Museum Exhibits': [
        TravelSeasons.SPRING,
        TravelSeasons.SUMMER,
        TravelSeasons.FALL,
        TravelSeasons.WINTER,
    ],
    Paddling: [TravelSeasons.SUMMER],
    'Park Film': [
        TravelSeasons.SPRING,
        TravelSeasons.SUMMER,
        TravelSeasons.FALL,
        TravelSeasons.WINTER,
    ],
    Playground: [
        TravelSeasons.SPRING,
        TravelSeasons.SUMMER,
        TravelSeasons.FALL,
    ],
    'SCUBA Diving': [TravelSeasons.SUMMER],
    Shopping: [
        TravelSeasons.SPRING,
        TravelSeasons.SUMMER,
        TravelSeasons.FALL,
        TravelSeasons.WINTER,
    ],
    Skiing: [TravelSeasons.WINTER],
    Snorkeling: [TravelSeasons.SUMMER],
    'Snow Play': [TravelSeasons.WINTER],
    Snowmobiling: [TravelSeasons.WINTER],
    Snowshoeing: [TravelSeasons.WINTER],
    Surfing: [TravelSeasons.SUMMER],
    Swimming: [TravelSeasons.SUMMER],
    'Team Sports': [
        TravelSeasons.SPRING,
        TravelSeasons.SUMMER,
        TravelSeasons.FALL,
    ],
    Tubing: [TravelSeasons.WINTER],
    'Water Skiing': [TravelSeasons.SUMMER],
    'Wildlife Watching': [
        TravelSeasons.SPRING,
        TravelSeasons.SUMMER,
        TravelSeasons.FALL,
    ],
};

const States = {
    AL: 'AL',
    AK: 'AK',
    AZ: 'AZ',
    AR: 'AR',
    AS: 'AS',
    CA: 'CA',
    CO: 'CO',
    CT: 'CT',
    DE: 'DE',
    DC: 'DC',
    FL: 'FL',
    GA: 'GA',
    GU: 'GU',
    HI: 'HI',
    ID: 'ID',
    IL: 'IL',
    IN: 'IN',
    IA: 'IA',
    KS: 'KS',
    KY: 'KY',
    LA: 'LA',
    ME: 'ME',
    MD: 'MD',
    MA: 'MA',
    MI: 'MI',
    MN: 'MN',
    MS: 'MS',
    MO: 'MO',
    MT: 'MT',
    NE: 'NE',
    NV: 'NV',
    NH: 'NH',
    NJ: 'NJ',
    NM: 'NM',
    NY: 'NY',
    NC: 'NC',
    ND: 'ND',
    MP: 'MP',
    OH: 'OH',
    OK: 'OK',
    OR: 'OR',
    PA: 'PA',
    PR: 'PR',
    RI: 'RI',
    SC: 'SC',
    SD: 'SD',
    TN: 'TN',
    TX: 'TX',
    TT: 'TT',
    UT: 'UT',
    VT: 'VT',
    VI: 'VI',
    VA: 'VA',
    WA: 'WA',
    WV: 'WV',
    WI: 'WI',
    WY: 'WY',
};

module.exports = {
    ACTIVITY_SEASON_MAP,
    TravelSeasons,
    Regions,
    WEIGHTS,
    ADJACENT_REGIONS,
    States,
    assignWeights,
};
