data = [
    {
        activities: ['Hiking', 'Swimming'],
        season: 'Summer',
        duration: 'Daytrip',
        region: ['Midwest', 'West'],
    },
];

let parkdata;
const regionsByState = [
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
        region: 'Outside',
        states: ['AK', 'HI', 'AS'],
    },
];

const weights = {
    activities: 0.5,
    season: 0.3,
    duration: 0.2,
};

const activityScore = (data, activities) => {
    const matches = data.activity_types.filter((activity) =>
        activities.includes(activity)
    );
    const score = matches.length / activities.length;
    return score;
};

const getRegion = (state) => {
    for (const region of regionsByState) {
        if (region.states.includes(state.split(',')[0].trim())) {
            return region.region;
        }
    }
    return 'Outside';
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

    let recommendedparks = parkdata.filter((park) =>
        userInput.region.includes(park.region)
    );

    const scores = recommendedparks.map((park) => {
        const activityscore = activityScore(park, userInput.activities);
        return {
            name: park.name,
            score: activityscore,
        };
    });

    const rankedParks = scores.sort((a, b) => b.score - a.score);

    // Included log statement since there is no output on client yet
    console.log(rankedParks);
};

main();
