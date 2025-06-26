import {useState, useEffect} from 'react';
import '../styles/Post.css';
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
        <div className='post'>
            <div className='post-header'>
                <div className='user-info'>
                    <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png'/>
                    <p>{userName}</p>
                </div>
                <p>{location}</p>
            </div>

          <p>{post.text}</p>
        </div>
      </>
    );
};
export default Post;
