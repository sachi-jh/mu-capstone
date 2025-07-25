import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { fetchParkInfo } from '../utils/utils';
import { useLoading } from '../contexts/LoadingContext';
import '../styles/ParkInfoPage.css';

const ParkInfoPage = () => {
    const { id } = useParams();
    const { loading, setLoading } = useLoading();
    const [parkData, setParkData] = useState(null);
    const [slideIndex, setSlideIndex] = useState(1);

    const slideCounter = (n) => {
        let newIndex = slideIndex + n;
        if (newIndex > parkData.image_url.length) {
            newIndex = 1;
        } else if (newIndex < 1) {
            newIndex = parkData.image_url.length;
        }
        setSlideIndex(newIndex);
    };

    const showSlides = (n) => {
        setSlideIndex(n);
    };

    useEffect(() => {
        const getParkInfo = async () => {
            setLoading(true);
            const parkInfo = await fetchParkInfo(id);
            setParkData(parkInfo);
            setLoading(false);
        };
        getParkInfo();
    }, [id]);

    useEffect(() => {
        if (parkData) {
            showSlides(slideIndex);
        }
    }, [parkData, slideIndex]);

    return (
        <>
            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : (
                parkData && (
                    <>
                        <h1>{parkData.name}</h1>
                        <div className="slideshow-container">
                            {parkData.image_url.map((image, index) => (
                                <div
                                    className={`mySlides fade ${slideIndex === index + 1 ? 'curr-slide' : ''}`}
                                >
                                    <div className="numbertext">
                                        {' '}
                                        {index}/ {parkData.image_url.length}
                                    </div>
                                    <img src={image} />
                                </div>
                            ))}

                            <a
                                className="prev"
                                onClick={() => slideCounter(-1)}
                            >
                                &#10094;
                            </a>
                            <a className="next" onClick={() => slideCounter(1)}>
                                &#10095;
                            </a>
                        </div>
                        <br />
                        <div>
                            {parkData.image_url.map((image, index) => (
                                <span
                                    className={`dot ${slideIndex === index + 1 ? 'curr-slide' : ''}`}
                                    onClick={() => showSlides(index + 1)}
                                ></span>
                            ))}
                        </div>
                        <p>{parkData.description}</p>
                    </>
                )
            )}
        </>
    );
};
export default ParkInfoPage;
