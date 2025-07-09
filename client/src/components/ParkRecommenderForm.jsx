import { useEffect, useState } from 'react';
import { fetchActivityTypes, getRecommendedParks } from '../utils/utils';

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
                            value="Spring"
                            onChange={(e) => setSelectedSeason(e.target.value)}
                        />{' '}
                        Spring
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="season"
                            value="Summer"
                            onChange={(e) => setSelectedSeason(e.target.value)}
                        />{' '}
                        Summer
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="season"
                            value="Fall"
                            onChange={(e) => setSelectedSeason(e.target.value)}
                        />{' '}
                        Fall
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="season"
                            value="Winter"
                            onChange={(e) => setSelectedSeason(e.target.value)}
                        />{' '}
                        Winter
                    </label>
                </fieldset>
                <fieldset>
                    <legend>How long will you visit for?</legend>
                    <label>
                        <input
                            type="radio"
                            name="duration"
                            value="Day trip"
                            onChange={(e) =>
                                setSelectedDuration(e.target.value)
                            }
                        />{' '}
                        Day Trip
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="duration"
                            value="Weekend"
                            onChange={(e) =>
                                setSelectedDuration(e.target.value)
                            }
                        />{' '}
                        Weekend
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="duration"
                            value="1 week or more"
                            onChange={(e) =>
                                setSelectedDuration(e.target.value)
                            }
                        />{' '}
                        1 week or more
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
                            value="Northeast"
                            onChange={handleSelectedRegionChange}
                        />{' '}
                        Northeast
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="region"
                            value="Southeast"
                            onChange={handleSelectedRegionChange}
                        />{' '}
                        Southeast
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="region"
                            value="Southwest"
                            onChange={handleSelectedRegionChange}
                        />{' '}
                        Southwest
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="region"
                            value="Midwest"
                            onChange={handleSelectedRegionChange}
                        />{' '}
                        Midwest
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="region"
                            value="West"
                            onChange={handleSelectedRegionChange}
                        />{' '}
                        West
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="region"
                            value="Outside"
                            onChange={handleSelectedRegionChange}
                        />{' '}
                        Outside the mainland (Hawai'i, Alaska, & territories)
                    </label>
                </fieldset>
                <button type="submit">Submit</button>
            </form>
            {recommendedParks.length > 0 &&
                recommendedParks.map((park, i) => (
                    <div key={park.id}>
                        <h2 key={park.id}>
                            {i + 1}. {park.name}
                        </h2>
                    </div>
                ))}
        </>
    );
};
export default ParkRecommenderForm;
