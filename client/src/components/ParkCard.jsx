import '../styles/ParkCard.css';
import Rating from '@mui/material/Rating';

const ParkCard = ({ image_url, name, description, rating, date }) => {
    return (
        <>
            <div className="park-card">
                <img src={image_url} alt={`${name} image`} />
                <div className="card-text">
                    <h2>{name}</h2>
                    {rating && (
                        <Rating value={rating} readOnly precision={0.125} />
                    )}
                    <p>{description}</p>
                    <p>{date}</p>
                </div>
            </div>
        </>
    );
};
export default ParkCard;
