import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserInfo } from '../utils/utils';

const ProfilePage = () => {
    const { user } = useAuth();
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        fetchUserInfo(user, setUserInfo);
    }, [fetchUserInfo]);

    console.log(userInfo);

    return <></>;
};
export default ProfilePage;
