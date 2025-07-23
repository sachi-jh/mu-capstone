import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { editUserProfile, fetchUserInfo } from '../utils/utils';
import '../styles/EditProfileModal.css';
const EditProfileModal = ({ userInfo, setUserInfo, closeModal }) => {
    const [userName, setUserName] = useState(userInfo.name);
    const [userBio, setUserBio] = useState(userInfo.bio);
    const { user } = useAuth();

    const handleFormSubmit = async (e) => {
        const userLocationLat = 0;
        const userLocationLong = 0;
        e.preventDefault();
        await editUserProfile(
            userName,
            userLocationLat,
            userLocationLong,
            userBio
        );
        await fetchUserInfo(user.id, setUserInfo);
        closeModal();
    };

    return (
        <>
            <div id="Modal" className="modal">
                <div className="modal-content">
                    <span className="close" onClick={closeModal}>
                        &times;
                    </span>
                    <h2>Profile</h2>
                    <form onSubmit={handleFormSubmit}>
                        <img src={userInfo.image_url} alt="profile pic" />
                        <label htmlFor="userName">Name:</label>
                        <input
                            type="text"
                            id="userName"
                            name="userName"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />

                        <label htmlFor="userBio">Bio:</label>
                        <input
                            type="text"
                            id="userBio"
                            name="userBio"
                            value={userBio}
                            onChange={(e) => setUserBio(e.target.value)}
                        />
                        <button className="save" type="submit">
                            Save
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};
export default EditProfileModal;
