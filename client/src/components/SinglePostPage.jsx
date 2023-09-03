import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

const SinglePostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5244/api/poster/posts/${postId}`)
      .then((response) => setPost(response.data))
      .catch((error) => console.error("Error fetching post:", error));
  }, [postId]);

  return (
    <div>
      <Link to="/">Back to all posts</Link>

      {post ? (
        <div>
          <h1>Post Details</h1>
          <div className="border border-black border-solid p-4 mx-auto mb-4">
            <p>Posted by: {post.username}</p>
            <img
              src={post.imageUrl}
              alt="poster image"
              width={512}
              height={512}
              className="mx-auto"
              style={{ objectFit: "cover" }}
            />
            <h3>{post.caption}</h3>
            <p>Likes: {post.likeCount}</p>
            {/* Display comments and other details here */}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default SinglePostPage;
