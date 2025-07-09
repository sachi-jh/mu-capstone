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
                    <label>
                        <input
                            type="radio"
                            name="season"
                            value={TravelSeasons.spring}
                            onChange={(e) => setSelectedSeason(e.target.value)}
                        />
                        {' ' + TravelSeasons.spring}
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="season"
                            value={TravelSeasons.summer}
                            onChange={(e) => setSelectedSeason(e.target.value)}
                        />
                        {' ' + TravelSeasons.summer}
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="season"
                            value={TravelSeasons.fall}
                            onChange={(e) => setSelectedSeason(e.target.value)}
                        />
                        {' ' + TravelSeasons.fall}
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="season"
                            value={TravelSeasons.winter}
                            onChange={(e) => setSelectedSeason(e.target.value)}
                        />
                        {' ' + TravelSeasons.winter}
                    </label>
                </fieldset>
                <fieldset>
                    <legend>How long will you visit for?</legend>
                    <label>
                        <input
                            type="radio"
                            name="duration"
                            value={TripDuration.daytrip}
                            onChange={(e) =>
                                setSelectedDuration(e.target.value)
                            }
                        />
                        {' ' + TripDuration.daytrip}
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="duration"
                            value={TripDuration.weekend}
                            onChange={(e) =>
                                setSelectedDuration(e.target.value)
                            }
                        />
                        {' ' + TripDuration.weekend}
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="duration"
                            value={TripDuration.weekplus}
                            onChange={(e) =>
                                setSelectedDuration(e.target.value)
                            }
                        />
                        {' ' + TripDuration.weekplus}
                    </label>
                </fieldset>
                <fieldset>
                    <legend>
                        Which regions of the country do you want to visit
                    </legend>
                    <label>
                        <input
                            type="checkbox"
                            name="region"
                            value={Regions.northeast}
                            onChange={handleSelectedRegionChange}
                        />
                        {' ' + Regions.northeast}
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="region"
                            value={Regions.southeast}
                            onChange={handleSelectedRegionChange}
                        />
                        {' ' + Regions.southeast}
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="region"
                            value={Regions.southwest}
                            onChange={handleSelectedRegionChange}
                        />
                        {' ' + Regions.southwest}
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="region"
                            value={Regions.midwest}
                            onChange={handleSelectedRegionChange}
                        />
                        {' ' + Regions.midwest}
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="region"
                            value={Regions.west}
                            onChange={handleSelectedRegionChange}
                        />
                        {' ' + Regions.west}
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="region"
                            value={Regions.outside}
                            onChange={handleSelectedRegionChange}
                        />
                        {' ' +
                            Regions.outside +
                            ' the mainland (Hawaii, Alaska, & territories)'}
                    </label>
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
