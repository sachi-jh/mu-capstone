import { useState, useEffect, useCallback } from 'react';
import ParkCard from './ParkCard';
import '../styles/ParksPage.css'
import { Link } from 'react-router';
import { fetchParks } from '../utils/utils'
const apiURL = import.meta.env.VITE_API_URL;

const ParksPage = () => {
    const [parks, setParks] = useState([]);

    useEffect(() => {
        fetchParks(setParks);
    }, [fetchParks]);

    return (
      <>
        <div className="hero-section-parks">
          <h3>Home to 63 National Parks</h3>
        </div>
        <div className="park-cards">
          {parks.length !== 0 ? (parks.map((park) => (
            <div key={park.id}>
              <ParkCard park={park}/>
              <Link to={`/parks/${park.id}`} className="park-link">View Details</Link>
            </div>
          ))) : (
            <h3>No parks found</h3>
          )}
        </div>
      </>
    );
};
export default ParksPage;
