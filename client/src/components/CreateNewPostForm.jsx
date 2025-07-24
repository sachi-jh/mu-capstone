import {
    fetchParks,
    getUserProfileInfo,
    newPost,
    newReview,
} from '../utils/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';

const createNewPostForm = () => {
    const [userRole, setUserRole] = useState('');
    const [parks, setParks] = useState([]);
    const [selectedPark, setSelectedPark] = useState(null);
    const [postType, setPostType] = useState('post');
    const [postContent, setPostContent] = useState({ text: '' });
    const [alertContent, setAlertContent] = useState({
        name: '',
        description: '',
        category: '',
    });
    const [eventContent, setEventContent] = useState({
        name: '',
        description: '',
        startDate: '',
        startTime: '',
        endTime: '',
    });
    const { user } = useAuth();
    const nav = useNavigate();

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        try {
            switch (postType) {
                case 'post':
                    await newPost('post', postContent, selectedPark);
                    break;
                case 'alert':
                    await newPost('alert', alertContent, selectedPark);
                    break;
                case 'event':
                    await newPost('event', eventContent, selectedPark);
                    break;
                default:
                    console.error('Invalid post type');
                    break;
            }
            nav('/');
        } catch (error) {
            console.error(error);
        }
    };

    const handleAlertChange = (event) => {
        const { name, value } = event.target;
        setAlertContent((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handlePostChange = (event) => {
        const { name, value } = event.target;
        setPostContent((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleEventChange = (event) => {
        const { name, value } = event.target;
        setEventContent((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    useEffect(() => {
        const getUserRole = async () => {
            if (user) {
                const userData = await getUserProfileInfo(user.id);
                setUserRole(userData.role);
            }
        };
        getUserRole();
    }, [user]);
    useEffect(() => {
        fetchParks((fetchedParks) => {
            setParks(fetchedParks);
            if (fetchedParks.length > 0) {
                setSelectedPark(fetchedParks[0].id);
            }
        });
    }, []);

    return (
        <>
            <h1>Create New Post</h1>
            <form onSubmit={handlePostSubmit}>
                <label htmlFor="post-type">Post Type:</label>
                <select
                    name="post-type"
                    id="post-type"
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                >
                    {userRole === 'Ranger' && (
                        <div>
                            <option value="event">Event</option>
                            <option value="alert">Alert</option>
                        </div>
                    )}
                    <option value="post">Post</option>
                </select>
                <label htmlFor="location">Location:</label>
                <select
                    name="location"
                    id="location"
                    value={selectedPark}
                    required
                    onChange={(e) => setSelectedPark(e.target.value)}
                >
                    <option value="" disabled hidden>
                        Select Park
                    </option>
                    {parks.length > 0 &&
                        parks.map((park) => (
                            <option value={park.id}>{park.name}</option>
                        ))}
                </select>
                {postType === 'post' && (
                    <div>
                        <label></label>
                        <textarea
                            name="text"
                            id="text"
                            value={postContent.text}
                            onChange={handlePostChange}
                        ></textarea>
                    </div>
                )}
                {postType === 'alert' && (
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={alertContent.name}
                            onChange={handleAlertChange}
                        />

                        <label>Description:</label>
                        <textarea
                            name="description"
                            id="description"
                            value={alertContent.description}
                            onChange={handleAlertChange}
                        ></textarea>

                        <label>Category:</label>
                        <select
                            name="category"
                            id="category"
                            value={alertContent.category}
                            onChange={handleAlertChange}
                        >
                            <option value="Information">Information</option>
                            <option value="Caution">Caution</option>
                            <option value="Danger">Danger</option>
                            <option value="Park Closure">Park Closure</option>
                        </select>
                    </div>
                )}
                {postType === 'event' && (
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={eventContent.name}
                            onChange={handleEventChange}
                        />

                        <label>Description:</label>
                        <textarea
                            name="description"
                            id="description"
                            value={eventContent.description}
                            onChange={handleEventChange}
                        ></textarea>

                        <label>Date:</label>
                        <input
                            type="date"
                            name="startDate"
                            id="startDate"
                            value={eventContent.startDate}
                            onChange={handleEventChange}
                        />

                        <label>Start Time:</label>
                        <input
                            type="time"
                            name="startTime"
                            id="startTime"
                            value={eventContent.startTime}
                            onChange={handleEventChange}
                        />

                        <label>End Time:</label>
                        <input
                            type="time"
                            name="endTime"
                            id="endTime"
                            value={eventContent.endTime}
                            onChange={handleEventChange}
                        />
                    </div>
                )}

                <button type="submit">Post</button>
            </form>
        </>
    );
};
export default createNewPostForm;
