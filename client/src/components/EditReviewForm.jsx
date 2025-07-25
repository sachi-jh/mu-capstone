import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchParks, getUserProfileInfo, newReview } from '../utils/utils';
import '../styles/EditReviewForm.css';
import { useNavigate, Link } from 'react-router';
import Rating from '@mui/material/Rating';

const EditReviewForm = () => {
    const [parkData, setParkData] = useState([]);
    const [selectedPark, setSelectedPark] = useState(null);
    const [rating, setRating] = useState(1);
    const [review, setReview] = useState('');
    const { user } = useAuth();
    const [userReviews, setUserReviews] = useState([]);
    const nav = useNavigate();

    const handleParkChange = (e) => {
        const id = e.target.value;
        setSelectedPark(id);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const reviewData = {
            locationId: selectedPark,
            rating,
            review,
        };
        const response = await newReview(reviewData);
        nav('/profile');
    };

    useEffect(() => {
        const getUserRole = async () => {
            if (user) {
                const userData = await getUserProfileInfo(user.id);
                setUserReviews(userData.reviews);
            }
        };
        getUserRole();
    }, [user]);

    useEffect(() => {
        fetchParks((fetchedParks) => {
            setParkData(fetchedParks);
            if (fetchedParks.length > 0) {
                const parkId = fetchedParks[0].id;
                setSelectedPark(parkId.toString());
            }
        });
    }, []);

    useEffect(() => {
        if (userReviews.length > 0 && selectedPark) {
            const selectedReview = userReviews.find(
                (review) => review.locationId.toString() === selectedPark
            );
            if (selectedReview) {
                setRating(parseInt(selectedReview.rating));
                setReview(selectedReview.review);
            } else {
                setRating(1);
                setReview('');
            }
        }
    }, [selectedPark, userReviews]);

    return (
        <div className="edit-review-form">
            <button className="back-button">
                <Link to={'/profile'}>Back</Link>
            </button>
            <form onSubmit={handleFormSubmit}>
                <label htmlFor="location">Choose Park</label>
                <select
                    name="location"
                    id="location"
                    value={selectedPark}
                    onChange={handleParkChange}
                    required
                >
                    {parkData.map((park) => (
                        <option value={park.id} key={park.id}>
                            {park.name}
                        </option>
                    ))}
                </select>

                <label htmlFor="rating">Rating:</label>
                <Rating
                    name="simple-controlled"
                    className="rating"
                    value={rating}
                    onChange={(event, newValue) =>
                        setRating(parseInt(newValue))
                    }
                    required
                />

                <label htmlFor="review">Review:</label>
                <textarea
                    name="review"
                    id="review"
                    cols="30"
                    rows="10"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                ></textarea>

                <button type="submit">Save</button>
            </form>
        </div>
    );
};
export default EditReviewForm;
