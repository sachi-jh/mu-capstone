import {
    fetchParks,
    getUserProfileInfo,
    newPost,
    AlertCategories,
    PostTypes,
} from '../utils/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../utils/supabaseClient';
import imageCompression from 'browser-image-compression';
import '../styles/CreateNewPostForm.css';

const createNewPostForm = () => {
    const [userRole, setUserRole] = useState('');
    const [parks, setParks] = useState([]);
    const [selectedPark, setSelectedPark] = useState(null);
    const [postType, setPostType] = useState(PostTypes.POST);
    const [postContent, setPostContent] = useState({ text: '' });
    const [postImage, setPostImage] = useState(null);
    const [alertContent, setAlertContent] = useState({
        title: '',
        description: '',
        category: AlertCategories.INFORMATION,
    });
    const [eventContent, setEventContent] = useState({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        endTime: '',
    });
    const { user } = useAuth();
    const { loading, setLoading } = useLoading();
    const nav = useNavigate();

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = null;
            if (postImage) {
                imageUrl = await handleImageUpload(postImage);
            }

            switch (postType) {
                case PostTypes.POST:
                    await newPost(
                        PostTypes.POST,
                        { ...postContent, image_url: imageUrl },
                        selectedPark
                    );
                    break;
                case PostTypes.ALERT:
                    await newPost(PostTypes.ALERT, alertContent, selectedPark);
                    break;
                case PostTypes.EVENT:
                    await newPost(PostTypes.EVENT, eventContent, selectedPark);
                    break;
                default:
                    console.error('Invalid post type');
                    break;
            }
            nav('/');
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handlePostImage = async (e) => {
        const file = e.target.files[0];
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };
        try {
            const compressedFile = await imageCompression(file, options);
            setPostImage(compressedFile);
        } catch (error) {
            console.error(error);
            return;
        }
    };

    const handleImageUpload = async (image) => {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from('photos')
            .upload(filePath, image);

        if (error) {
            console.error(error);
            return null;
        }

        const { data: publicUrlData } = supabase.storage
            .from('photos')
            .getPublicUrl(filePath);
        return publicUrlData?.publicUrl || null;
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
            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : (
                <form onSubmit={handlePostSubmit} className="new-post-form">
                    <div className="form-group">
                        <label htmlFor="post-type">Post Type:</label>
                        <select
                            name="post-type"
                            id="post-type"
                            value={postType}
                            onChange={(e) => setPostType(e.target.value)}
                        >
                            {userRole === 'Ranger' && (
                                <>
                                    <option value={PostTypes.EVENT}>
                                        Event
                                    </option>
                                    <option value={PostTypes.ALERT}>
                                        Alert
                                    </option>
                                </>
                            )}
                            <option value={PostTypes.POST}>Post</option>
                        </select>
                    </div>

                    <div className="form-group">
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
                            {parks.map((park) => (
                                <option key={park.id} value={park.id}>
                                    {park.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {postType === PostTypes.POST && (
                        <div className="form-section">
                            <div className="form-group">
                                <label htmlFor="text">Text:</label>
                                <textarea
                                    required
                                    name="text"
                                    id="text"
                                    value={postContent.text}
                                    onChange={handlePostChange}
                                />

                                <label htmlFor="picture">Upload Photo</label>
                                <input
                                    type="file"
                                    id="file"
                                    onChange={handlePostImage}
                                />
                                {error && <div className="error">{error}</div>}
                            </div>
                        </div>
                    )}

                    {postType === PostTypes.ALERT && (
                        <div className="form-section">
                            <div className="form-group">
                                <label htmlFor="alert-title">Title:</label>
                                <input
                                    required
                                    type="text"
                                    name="title"
                                    id="alert-title"
                                    value={alertContent.title}
                                    onChange={handleAlertChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="alert-description">
                                    Description:
                                </label>
                                <textarea
                                    required
                                    name="description"
                                    id="alert-description"
                                    value={alertContent.description}
                                    onChange={handleAlertChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="alert-category">
                                    Category:
                                </label>
                                <select
                                    name="category"
                                    id="alert-category"
                                    value={alertContent.category}
                                    onChange={handleAlertChange}
                                >
                                    {Object.values(AlertCategories).map(
                                        (category) => (
                                            <option
                                                key={category}
                                                value={category}
                                            >
                                                {category}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>
                    )}

                    {postType === PostTypes.EVENT && (
                        <div className="form-section">
                            <div className="form-group">
                                <label htmlFor="event-title">Title:</label>
                                <input
                                    required
                                    type="text"
                                    name="title"
                                    id="event-title"
                                    value={eventContent.title}
                                    onChange={handleEventChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="event-description">
                                    Description:
                                </label>
                                <textarea
                                    required
                                    name="description"
                                    id="event-description"
                                    value={eventContent.description}
                                    onChange={handleEventChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="event-date">Date:</label>
                                <input
                                    required
                                    type="date"
                                    name="startDate"
                                    id="event-date"
                                    value={eventContent.startDate}
                                    onChange={handleEventChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="event-start-time">
                                    Start Time:
                                </label>
                                <input
                                    required
                                    type="time"
                                    name="startTime"
                                    id="event-start-time"
                                    value={eventContent.startTime}
                                    onChange={handleEventChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="event-end-time">
                                    End Time:
                                </label>
                                <input
                                    required
                                    type="time"
                                    name="endTime"
                                    id="event-end-time"
                                    value={eventContent.endTime}
                                    onChange={handleEventChange}
                                />
                            </div>
                        </div>
                    )}

                    <button type="submit">Post</button>
                </form>
            )}
        </>
    );
};
export default createNewPostForm;
