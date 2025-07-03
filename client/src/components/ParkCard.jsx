import '../styles/ParkCard.css'
const ParkCard = ({image_url, name, description}) => {
  return (
    <>
      <div className="park-card">
        <img src={image_url} alt={name} />
        <div className="card-text">
          <h2>{name}</h2>
          <p>{description}</p>
        </div>
      </div>
    </>
  );
};
export default ParkCard;
