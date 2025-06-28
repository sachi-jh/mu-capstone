import { useParams } from "react-router";

const ParkInfoPage = () => {
    
    const {id} = useParams()
    return(
        <>
        <h1>Park Info Page</h1>
        </>
    );
};
export default ParkInfoPage;
