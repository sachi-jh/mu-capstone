import {useState, useEffect} from 'react';
const apiURL = import.meta.env.VITE_API_URL;

const Post = ({post}) => {
    const id = post.id;
    const [userName, setUserName] = useState("");
    const [location, setLocation] = useState("");

    useEffect(() => {
        const fetchUserName = async () => {
            try{
                const response = await fetch(`${apiURL}/api/user/${post.authorId}/profile`);
                if (!response.ok) {
                    throw new Error('Could not fetch user name');
                }
                const body = await response.json();
                setUserName(body.email);
            } catch (error) {
                console.error(error);
            }
        }

        const fetchLocation = async () => {
            try{
                const response = await fetch(`${apiURL}/api/parks/${post.locationId}`);
                if (!response.ok) {
                    throw new Error('Could not fetch location');
                }
                const body = await response.json();
                setLocation(body.name);
            } catch (error) {
                console.error(error);
            }
        }
        fetchUserName();
        fetchLocation();
    }, []);
    return (
      <>
          <p>Posted by: {userName}</p>
          <p>Location: {location}</p>
          <p>{post.text}</p>
      </>
    );
};
export default Post;
