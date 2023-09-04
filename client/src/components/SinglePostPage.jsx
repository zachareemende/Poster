import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const SinglePostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  const navigate = useNavigate();
  const user = useSelector((state) => state.auth);

  useEffect(() => {
    axios
      .get(`http://localhost:5244/api/poster/posts/${postId}`)
      .then((response) => setPost(response.data))
      .catch((error) => console.error("Error fetching post:", error));
  }, [postId]);

  useEffect(() => {
    if (user.token) {
      checkIsLiked();
    }
  }, [user.token]);

  const checkIsLiked = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5244/api/poster/posts/${postId}/likes/check`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setIsLiked(response.data);
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const handleLikeClick = async () => {
    if (!user.token) {
      navigate("/login", {
        state: { error: "You must be logged in to do this!" },
      }); // Redirect to login page with error message
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      if (isLiked) {
        // Unlike the post
        await axios.delete(
          `http://localhost:5244/api/poster/posts/${postId}/likes/delete`,
          config
        );
        setPost({ ...post, likeCount: post.likeCount - 1 });
      } else {
        // Like the post
        await axios.post(
          `http://localhost:5244/api/poster/posts/${postId}/likes/create`,
          {},
          config
        );
        setPost({ ...post, likeCount: post.likeCount + 1 });
      }

      setIsLiked(!isLiked); // Toggle the like status
    } catch (error) {
      console.error("Like/Unlike failed:", error);
    }
  };

  const timeAgo = (timestamp) => {
    const currentTimestamp = new Date().getTime();
    const commentTimestamp = new Date(timestamp).getTime();
    const timeDifference = currentTimestamp - commentTimestamp;

    const seconds = Math.floor(timeDifference / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(timeDifference / (1000 * 60));
    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    if (hours < 24) {
      return `${hours}h`;
    }

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return `${days}d`;
  };

  return (
    <div className="container mx-auto p-4">
      <Link to="/" className="block mb-4 text-blue-500 hover:underline">
        Back to all posts
      </Link>

      {post ? (
        <div>
          <h1 className="text-2xl font-semibold mb-4">Post Details</h1>
          <div className="border border-black border-solid p-4 rounded-lg shadow-md">
            <p className="mb-2 text-gray-600">Posted by: {post.username}</p>
            <div className="mb-2 rounded-lg overflow-hidden">
              <img
                src={post.imageUrl}
                alt="poster image"
                className="mx-auto"
                style={{
                  width: "100%",
                  objectFit: "contain", // Change this to "contain" to fit without cropping
                  height: "500px", // Set a fixed height for consistency
                }}
              />
            </div>

            <h3 className="text-lg font-semibold mb-2">{post.caption}</h3>
            <p className="mb-2 text-gray-600">Likes: {post.likeCount}</p>
            <button
              className={
                isLiked
                  ? "bg-red-600 text-white px-4 py-2 rounded-md"
                  : "bg-blue-500 text-white px-4 py-2 rounded-md"
              }
              onClick={handleLikeClick}
            >
              {isLiked ? "Unlike" : "Like"}
            </button>
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Comments:</h4>
              <ul>
                {post.comments.map((comment) => (
                  <li key={comment.commentId} className="mb-4 border-b">
                    <p className="text-black-600 mb-1">
                      {comment.username}:
                      <span className="text-gray-600 mb-1">
                        {" "}
                        {comment.content}
                      </span>
                    </p>
                    <p className="text-gray-600 text-xs">
                      {timeAgo(comment.timestamp)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default SinglePostPage;
