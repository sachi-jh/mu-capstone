import { useEffect, useState } from 'react';
import '../styles/HomePage.css';
import Post from './Post';
const apiURL = import.meta.env.VITE_API_URL;

const HomePage = () => {
    const [allPosts, setAllPosts] = useState([])



    useEffect(() => {
        const fetchPosts = async () => {
            const fetchAllPostsURL = `${apiURL}/api/posts`;
            try {
                const response = await fetch(fetchAllPostsURL);
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const body = await response.json();
                setAllPosts(body);
            } catch (error) {
                console.error(error);
            }
        }
        fetchPosts();
    }, []);


    return(
        <>
            {/*will be a carousel*/}
            <div className="hero-section">
                <h3>Welcome</h3>
            </div>
            <div className="posts">
                <h3>Posts</h3>
                {allPosts.map((post) => (
                    <div className="post-" key={post.id}>
                        <Post post={post}/>
                    </div>
                ))}

            </div>
        </>
    );
};
export default HomePage;
