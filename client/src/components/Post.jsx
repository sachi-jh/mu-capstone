import {useState, useEffect} from 'react';
import '../styles/Post.css';
import {fetchLocation, fetchUserInfo} from '../utils/utils';
const apiURL = import.meta.env.VITE_API_URL;

const Post = ({post}) => {
    const [userInfo, setUserInfo] = useState("");
    const [location, setLocation] = useState("");

    useEffect(() => {
        fetchUserInfo(post.authorId, setUserInfo);
        fetchLocation(post.locationId, setLocation);
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
