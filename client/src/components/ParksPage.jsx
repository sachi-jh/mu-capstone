import { useState, useEffect, useCallback } from 'react';
import ParkCard from './ParkCard';
import '../styles/ParksPage.css'
import { Link } from 'react-router';
const apiURL = import.meta.env.VITE_API_URL;

const ParksPage = () => {
    const [parks, setParks] = useState([]);

    const fetchParks = useCallback(async () => {
        const fetchAllParksURL = `${apiURL}/api/parks`;
        try {
          const response = await fetch(fetchAllParksURL);
          if (response.status === 204) {
            setParks([]);
            return;
          }
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          const body = await response.json();
          setParks(body);
        } catch (error) {
          console.error(error);
        }
    })

    useEffect(() => {
        fetchParks();
    }, [fetchParks]);

    return (
      <>
        <div className="hero-section-parks">
          <h3>Home to 63 National Parks</h3>
        </div>
        <div className="park-cards">
          {parks.length !== 0 ? (parks.map((park) => (
            <div key={park.id}>

              <Link to={`/parks/${park.id}`} className="park-link"><ParkCard park={park}/></Link>
            </div>
          ))) : (
            <h3>No parks found</h3>
          )}
        </div>
      </>
    );
};
export default ParksPage;
