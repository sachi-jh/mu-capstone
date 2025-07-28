import { useEffect, useState } from 'react';
import {
    fetchActivityTypes,
    getRecommendedParks,
    Regions,
    TravelSeasons,
    TripDuration,
} from '../utils/utils';
import '../styles/ParkRecommenderForm.css';
import { useLoading } from '../contexts/LoadingContext';
import { Link } from 'react-router';
import ParkCard from './ParkCard';
import ToolTip from './ToolTip';

const ParkRecommenderForm = () => {
    const [activities, setActivities] = useState([]);
    const [selectedActivities, setSelectedActivities] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [recommendedParks, setRecommendedParks] = useState([]);
    const { loading, setLoading } = useLoading();
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setLoading(true);
        const recommendedParks = await getRecommendedParks(formData);
        setRecommendedParks(recommendedParks.slice(0, TOP_PARKS_TO_SHOW));
        console.log(recommendedParks);
        setLoading(false);
    };

    useEffect(() => {
        fetchActivityTypes(setActivities);
    }, []);

    return (
        <>
            <h1> Park Recommender Form </h1>
            <p>Dont know where to go?</p>
            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : (
                recommendedParks.length > 0 && (
                    <div className="recommended-park-container">
                        {recommendedParks.map((park, i) => (
                            <div className="recommended-park">
                                <ParkCard
                                    image_url={
                                        park.parkObject.image_url[5] ||
                                        park.parkObject.image_url[0]
                                    }
                                    name={park.name}
                                    className="parkcard"
                                />
                                <button>
                                    <Link to={`/parks/${park.parkObject.id}`}>
                                        More Info
                                    </Link>
                                </button>
                            </div>
                        ))}
                    </div>
                )
            )}
            <form onSubmit={handleSubmit} className="park-recommender-form">
                <label htmlFor="activities">
                    What Activities are you interested in?{' '}
                </label>
                <select
                    className="activities-select"
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
                    <div className="season-values">
                        {Object.values(TravelSeasons).map((season) => (
                            <label>
                                <input
                                    type="radio"
                                    name="season"
                                    value={season}
                                    onChange={(e) =>
                                        setSelectedSeason(e.target.value)
                                    }
                                    required
                                />
                                {' ' + season}
                            </label>
                        ))}
                    </div>
                </fieldset>
                <fieldset>
                    <legend>How long will you visit for?</legend>
                    <div className="duration-values">
                        {Object.values(TripDuration).map((duration) => (
                            <label>
                                <input
                                    type="radio"
                                    name="duration"
                                    value={duration}
                                    onChange={(e) =>
                                        setSelectedDuration(e.target.value)
                                    }
                                    required
                                />
                                {' ' + duration}
                            </label>
                        ))}
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        Which regions of the country do you want to visit?
                    </legend>
                    <div className="region-values">
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
                        ))}{' '}
                    </div>
                </fieldset>
                <button type="submit">Submit</button>
            </form>
        </>
    );
};
export default ParkRecommenderForm;
