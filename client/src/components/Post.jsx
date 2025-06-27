import {useState, useEffect, useCallback} from 'react';
import '../styles/Post.css';
const apiURL = import.meta.env.VITE_API_URL;

const Post = ({post}) => {
    const id = post.id;
    const [userInfo, setUserInfo] = useState("");
    const [location, setLocation] = useState("");

    const fetchUserName = useCallback(async () => {
        try{
            const response = await fetch(`${apiURL}/api/user/${post.authorId}/profile`);
            if (!response.ok) {
                throw new Error('Could not fetch user name');
            }
            const body = await response.json();
            setUserInfo(body);
        } catch (error) {
            console.error(error);
        }
    }, [])

    const fetchLocation = useCallback(async () => {
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
    })

    useEffect(() => {
        fetchUserName();
        fetchLocation();
    }, []);
    
    return (
      <>
        <div className='post'>
            <div className='post-header'>
                <div className='user-info'>
                    <img src={userInfo.image_url}/>
                    <p>{userInfo.email}</p>
                </div>
                <p>{location}</p>
            </div>

          <p>{post.text}</p>
        </div>
      </>
    );
};
export default Post;
