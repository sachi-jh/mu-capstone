import { useEffect, useState } from 'react';
import {
    fetchActivityTypes,
    getRecommendedParks,
    Regions,
    TravelSeasons,
    TripDuration,
} from '../utils/utils';

const ParkRecommenderForm = () => {
    const [activities, setActivities] = useState([]);
    const [selectedActivities, setSelectedActivities] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [recommendedParks, setRecommendedParks] = useState([]);
    const TOP_PARKS_TO_SHOW = 5;

    const handleSelectedActivitiesChange = (event) => {
        const selectedVals = Array.from(
            event.target.selectedOptions,
            (option) => option.value
        );
        setSelectedActivities(selectedVals);
    };

    const handleSelectedRegionChange = (event) => {
        const { value, checked } = event.target;
        setSelectedRegions((prev) =>
            checked
                ? [...prev, value]
                : prev.filter((region) => region !== value)
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = {
            activities: selectedActivities,
            season: selectedSeason,
            duration: selectedDuration,
            region: selectedRegions,
        };
        const recommendedParks = await getRecommendedParks(formData);
        setRecommendedParks(recommendedParks.slice(0, TOP_PARKS_TO_SHOW));
    };

    useEffect(() => {
        fetchActivityTypes(setActivities);
    }, []);

    return (
        <>
            <h1> Park Recommender Form </h1>
            <p>Dont know where to go?</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="activities">
                    What Activities are you interested in?{' '}
                </label>
                <select
                    multiple
                    name=""
                    id="activities"
                    value={selectedActivities}
                    onChange={handleSelectedActivitiesChange}
                >
                    {activities.map((activitiy) => (
                        <option key={activitiy.id} value={activitiy.name}>
                            {activitiy.name}
                        </option>
                    ))}
                </select>
                <fieldset>
                    <legend>What season do you plan to travel during?</legend>
                    {Object.values(TravelSeasons).map((season) => (
                        <label>
                            <input
                                type="radio"
                                name="season"
                                value={season}
                                onChange={(e) =>
                                    setSelectedSeason(e.target.value)
                                }
                            />
                            {' ' + season}
                        </label>
                    ))}
                </fieldset>
                <fieldset>
                    <legend>How long will you visit for?</legend>
                    {Object.values(TripDuration).map((duration) => (
                        <label>
                            <input
                                type="radio"
                                name="duration"
                                value={duration}
                                onChange={(e) =>
                                    setSelectedDuration(e.target.value)
                                }
                            />
                            {' ' + duration}
                        </label>
                    ))}
                </fieldset>
                <fieldset>
                    <legend>
                        Which regions of the country do you want to visit
                    </legend>
                    {Object.values(Regions).map((region) => (
                        <label>
                            <input
                                type="checkbox"
                                name="region"
                                value={region}
                                onChange={handleSelectedRegionChange}
                            />
                            {' ' + region}
                            {region === Regions.OUTSIDE &&
                                ' the mainland (Hawaii, Alaska, & territories)'}
                        </label>
                    ))}
                </fieldset>
                <button type="submit">Submit</button>
            </form>
            {recommendedParks.length > 0 &&
                recommendedParks.map((park, i) => (
                    <h2 key={park.id}>
                        {i + 1}. {park.name}
                    </h2>
                ))}
        </>
    );
};
export default ParkRecommenderForm;
