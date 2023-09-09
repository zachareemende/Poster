import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom"; // Import useParams from react-router-dom
import { useSelector } from "react-redux";

const SingleUser = () => {
  // Use useParams to get the userId from the URL parameter
  const { userId } = useParams();
  const [userPosts, setUserPosts] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const user = useSelector((state) => state.auth);

  const navigate = useNavigate();

  const loadPosts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5244/api/poster/users/${userId}/posts`
      );
      setUserPosts(response.data);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const checkIsLiked = async (postId) => {
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
      return response.data;
    } catch (error) {
      console.error("Error checking like status:", error);
      return false;
    }
  };

  const handleLikeClick = async (postId) => {
    if (!user.token) {
      navigate("/login", {
        state: { error: "You must be logged in to do this!" },
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      // Check if the post is liked
      const isLiked = await checkIsLiked(postId);

      if (isLiked) {
        // Unlike the post
        await axios.delete(
          `http://localhost:5244/api/poster/posts/${postId}/likes/delete`,
          config
        );
      } else {
        // Like the post
        await axios.post(
          `http://localhost:5244/api/poster/posts/${postId}/likes/create`,
          {},
          config
        );
      }

      // Fetch the updated like count
      const updatedPost = await axios.get(
        `http://localhost:5244/api/poster/posts/${postId}`
      );
      setUserPosts((prevUserPosts) =>
        prevUserPosts.map((post) => {
          if (post.postId === postId) {
            return {
              ...post,
              likeCount: updatedPost.data.likeCount,
            };
          }
          return post;
        })
      );

      // Update the isLiked state
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Like/Unlike failed:", error);
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!user.token) {
      navigate("/login", {
        state: { error: "You must be logged in to do this!" },
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const newComment = {
        Text: commentContent,
      };

      await axios.post(
        `http://localhost:5244/api/poster/posts/${postId}/comments/create`,
        newComment,
        config
      );

      // Fetch the updated comments after successfully creating a new comment
      const updatedComments = await fetchCommentsWithUsernames(postId);

      // Update the post with the new comments
      setUserPosts((prevUserPosts) =>
        prevUserPosts.map((post) => {
          if (post.postId === postId) {
            return { ...post, comments: updatedComments };
          }
          return post;
        })
      );

      // Clear the comment content
      setCommentContent("");
    } catch (error) {
      console.error("Comment submission failed:", error);
    }
  };

  // Other functions (timeAgo, fetchCommentsWithUsernames, etc.) remain the same

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

  const fetchCommentsWithUsernames = async (postId) => {
    try {
      const response = await axios.get(
        `http://localhost:5244/api/poster/posts/${postId}/comments`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };

  useEffect(() => {
    const initializeIsLiked = async () => {
      if (userPosts.length > 0) {
        const postId = userPosts[0].postId; // You can use any valid postId
        const liked = await checkIsLiked(postId);
        setIsLiked(liked);
      }
    };

    loadPosts();
    initializeIsLiked();
  }, [userId]);

  return (
    <div className="container mx-auto p-4">
      <Link to="/" className="block mb-4 text-blue-500 hover:underline">
        Back to all posts
      </Link>

      <h1 className="text-2xl font-semibold mb-4">Posts</h1>

      {userPosts.map((post) => (
        <div key={post.postId} className="mb-4">
          <div className="border border-black border-solid p-4 rounded-lg shadow-md">
            <p className="mb-2 text-gray-600">Posted by: {post.username}</p>
            <p className="mb-2 text-gray-600">
              Posted: {timeAgo(post.postedAt)}
            </p>
            <div className="mb-2 rounded-lg overflow-hidden">
              <img
                src={post.imageUrl}
                alt="poster image"
                className="mx-auto"
                style={{
                  width: "100%",
                  objectFit: "contain",
                  height: "500px",
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
              onClick={() => handleLikeClick(post.postId)}
            >
              {isLiked ? "Unlike" : "Like"}
            </button>
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Add a Comment:</h4>
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write your comment here..."
                className="w-full p-2 border border-gray-300 rounded"
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
                onClick={() => handleCommentSubmit(post.postId)}
              >
                Submit Comment
              </button>
            </div>
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Comments:</h4>
              <ul>
                {post.comments.map((comment) => (
                  <li key={comment.commentId} className="mb-4 border-b">
                    <p className="text-black-600 mb-1">
                      {comment.username}: {comment.content}
                      {console.log(comment)}
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
      ))}
    </div>
  );
};

export default SingleUser;
