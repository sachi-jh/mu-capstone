const WEIGHTS = {
    activities: 0.35,
    season: 0.28,
    region: 0.17,
    duration: 0.8,
    rating: 0.07,
    vistors: 0.05,
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

module.exports = {
    ACTIVITY_SEASON_MAP,
    TravelSeasons,
    Regions,
    WEIGHTS,
    ADJACENT_REGIONS,
};
