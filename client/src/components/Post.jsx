import { useState, useEffect } from 'react';
import '../styles/Post.css';
import { fetchLocation, fetchUserInfoFromId } from '../utils/utils';
import { useAuth } from '../contexts/AuthContext';
const apiURL = import.meta.env.VITE_API_URL;

const Post = ({ post }) => {
    const [userInfo, setUserInfo] = useState('');
    const [location, setLocation] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchUserInfoFromId(post.authorId, setUserInfo);
        fetchLocation(post.locationId, setLocation);
    }, []);

    return (
        <>
            <div className="post">
                <div className="post-header">
                    <div className="post-user-info">
                        <img src={userInfo.image_url} />
                        <p>{userInfo.name}</p>
                    </div>
                    <p>{location}</p>
                </div>

                <p>{post.text}</p>
            </div>
        </>
    );
};
export default Post;
