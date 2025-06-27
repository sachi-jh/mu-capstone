import '../styles/ParkCard.css'
const ParkCard = ({park}) => {
  return (
    <>
      <div className="park-card">
        <img src={park.image_url} alt={park.name} />
        <div className="card-text">
          <h2>{park.name}</h2>
          <p>{park.description}</p>
        </div>
      </div>
    </>
  );
};
export default ParkCard;
