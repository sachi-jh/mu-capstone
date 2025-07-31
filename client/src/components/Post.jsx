import '../styles/Post.css';
const apiURL = import.meta.env.VITE_API_URL;

const Post = ({ post }) => {
    const hasImage = Boolean(post.image_url);
    const postDate = post.startDate
        ? new Date(post.startDate).toDateString()
        : null;

    return (
        <div className="post">
            <div className={`post-header ${post.category ? 'alert' : ''}`}>
                <div className="post-user-info">
                    <img
                        src={
                            post.author?.image_url ||
                            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_A5ybHIiL2Obh1u7khSeVxGOsMHmdi7vyEQ&s'
                        }
                        alt={post.author?.name || 'User avatar'}
                    />
                    <p>{postDate || post.author?.name || post.category}</p>
                </div>
                <div className="location-and-category">
                    <p>{post.location?.name || post.locationId}</p>
                    {post.category && (
                        <span
                            className={`post-category-badge ${post.category}`}
                        >
                            {post.category}
                        </span>
                    )}
                </div>
            </div>
            <div className={`post-content ${hasImage ? '' : 'no-image'}`}>
                <div className="post-text">
                    <h3>{post.name}</h3>
                    {post.startTime && post.endTime && (
                        <p>
                            {`${new Date(post.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                            ${new Date(post.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                    )}
                    <p>{post.text || post.description}</p>
                </div>
                {hasImage && (
                    <img
                        src={post.image_url}
                        alt={post.name}
                        className="post-image"
                    />
                )}
            </div>
        </div>
    );
};

export default Post;
