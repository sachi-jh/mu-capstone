import '../styles/Post.css';
const apiURL = import.meta.env.VITE_API_URL;

const Post = ({ post }) => {
    return (
        <>
            <div className="post">
                <div className={`post-header ${post.category && `alert`}`}>
                    <div className="post-user-info">
                        <img
                            src={
                                post.author?.image_url ||
                                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_A5ybHIiL2Obh1u7khSeVxGOsMHmdi7vyEQ&s'
                            }
                        />
                        <p>
                            {post.startDate
                                ? new Date(post.startDate).toDateString()
                                : post.category
                                  ? post.category
                                  : post.author?.name}
                        </p>
                    </div>
                    <p>{post.location?.name || post.locationId}</p>
                </div>
                <h3>{post.name}</h3>
                {post.startTime && post.endTime && (
                    <p>
                        {`${new Date(post.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                        ${new Date(post.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                )}
                <p>{post.text || post.description}</p>
            </div>
        </>
    );
};
export default Post;
