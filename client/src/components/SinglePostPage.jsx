import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import defaultProfilePicture from "../assets/images/defaultProfilePicture.png";
import { selectUserId } from "../redux/authSlice";

const SinglePostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [visibleComments] = useState(5);
  const [allCommentsVisible, setAllCommentsVisible] = useState(false);
  const [commentUserProfilePictures, setCommentUserProfilePictures] = useState(
    {}
  );

  const user = useSelector((state) => state.auth);
  const loggedInUserId = useSelector(selectUserId);

  const navigate = useNavigate();

  const loadPost = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5244/api/poster/posts/${postId}`
      );
      setPost(response.data);

      // Fetch the user profiles for comments
      fetchCommentUserProfiles(postId);
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  };

  const handleDeletePost = async (postId) => {
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

      // Send a request to delete the post
      await axios.delete(
        `http://localhost:5244/api/poster/posts/${postId}`,
        config
      );

      // Fetch the updated posts after successfully deleting a post
      const updatedPost = await axios.get(
        `http://localhost:5244/api/poster/posts/${postId}`
      );

      // Update the userPosts state with the updated posts
      setPost(updatedPost.data);
    } catch (error) {
      console.error("Post deletion failed:", error);
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
      const isPostLiked = isLiked[postId];

      if (isPostLiked) {
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

      // Update userPosts with the new like status and like count for the specific post
      setPost(updatedPost.data);

      // Update the isLiked state with the new like status for the specific post
      setIsLiked((prevIsLiked) => ({
        ...prevIsLiked,
        [postId]: !isPostLiked,
      }));
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
        Text: commentText,
      };

      await axios.post(
        `http://localhost:5244/api/poster/posts/${postId}/comments/create`,
        newComment,
        config
      );

      // Directly fetch the updated post after successfully creating a new comment
      const updatedPost = await axios.get(
        `http://localhost:5244/api/poster/posts/${postId}`
      );
      setPost(updatedPost.data);

      // Fetch the comment user profiles for updated post
      fetchCommentUserProfiles(postId);

      // Clear the comment Text
      setCommentText("");
    } catch (error) {
      console.error("Comment submission failed:", error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
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

      // Send a request to delete the comment
      await axios.delete(
        `http://localhost:5244/api/poster/posts/${postId}/comments/delete/${commentId}`,
        config
      );

      // Directly fetch the updated post after successfully deleting a comment
      const updatedPost = await axios.get(
        `http://localhost:5244/api/poster/posts/${postId}`
      );
      setPost(updatedPost.data);

      // Fetch the comment user profiles for updated post
      fetchCommentUserProfiles(postId);
    } catch (error) {
      console.error("Comment deletion failed:", error);
    }
  };

  const fetchCommentUserProfilePicture = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5244/api/poster/users/${userId}/profilepicture`
      );
      if (response.data.startsWith("data:image/jpeg;base64,")) {
        // Update the commentUserProfilePictures state with the profile picture
        setCommentUserProfilePictures((prevPictures) => ({
          ...prevPictures,
          [userId]: response.data,
        }));
      } else {
        // Set profilePicture to null if no profile picture is available
        setCommentUserProfilePictures((prevPictures) => ({
          ...prevPictures,
          [userId]: null,
        }));
      }
    } catch (error) {
      console.error(
        `Error fetching comment user ${userId}'s profile picture:`,
        error
      );
    }
  };

  const fetchCommentUserProfiles = async (postId) => {
    try {
      const response = await axios.get(
        `http://localhost:5244/api/poster/posts/${postId}/comments`
      );
      const comments = response.data;

      // Fetch the profile picture for each comment
      for (const comment of comments) {
        fetchCommentUserProfilePicture(comment.userId);
      }
    } catch (error) {
      console.error("Error fetching comment user profiles:", error);
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
      return response.data;
    } catch (error) {
      console.error("Error checking like status:", error);
      return false;
    }
  };

  useEffect(() => {
    // Check if the post is liked
    checkIsLiked(postId).then((isLiked) => {
      setIsLiked((prevIsLiked) => ({
        ...prevIsLiked,
        [postId]: isLiked,
      }));
    });
  }, [postId, user.token]);

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

  useEffect(() => {
    loadPost();
  }, [postId, loggedInUserId]);

  return (
    <div className="container mx-auto p-4">
      <Link to="/" className="block mb-4 text-blue-500 hover:underline">
        Back to all posts
      </Link>

      {post ? (
        <div key={post.postId} className="mb-4">
          <div className="border border-black border-solid p-4 rounded-lg shadow-md">
            <p className="mb-2 text-gray-600">Posted by: {post.username}</p>
            {loggedInUserId
              ? loggedInUserId === post.userId && (
                  // Show the delete button for posts created by the logged-in user
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleDeletePost(post.postId)}
                  >
                    Delete
                  </button>
                )
              : null}
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
                isLiked[post.postId]
                  ? "bg-red-600 text-white px-4 py-2 rounded-md"
                  : "bg-blue-500 text-white px-4 py-2 rounded-md"
              }
              onClick={() => handleLikeClick(post.postId)}
            >
              {isLiked[post.postId] ? "Unlike" : "Like"}
            </button>
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Add a Comment:</h4>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
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
                {post.comments
                  .slice(
                    0,
                    allCommentsVisible ? post.comments.length : visibleComments
                  )
                  .map((comment) => (
                    <li key={comment.commentId} className="mb-4 border-b">
                      <div className="flex items-center">
                        <Link to={`/users/${comment.userId}`} className="mr-2">
                          <img
                            src={
                              commentUserProfilePictures[comment.userId] ||
                              defaultProfilePicture
                            }
                            alt={comment.username}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                        </Link>
                        <p className="text-black-600 mb-1">
                          <Link
                            to={`/users/${comment.userId}`}
                            className="mr-2"
                          >
                            {comment.username}
                          </Link>
                          : {comment.text}
                        </p>
                      </div>
                      <p className="text-gray-600 text-xs">
                        {timeAgo(comment.timestamp)}
                      </p>
                      {loggedInUserId === comment.userId && (
                        // Show the delete button for comments created by the logged-in user
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() =>
                            handleDeleteComment(post.postId, comment.commentId)
                          }
                        >
                          Delete
                        </button>
                      )}
                    </li>
                  ))}
              </ul>
              {post.comments.length > visibleComments && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
                  onClick={() => setAllCommentsVisible(!allCommentsVisible)}
                >
                  {allCommentsVisible ? "Hide Comments" : "See More Comments"}
                </button>
              )}
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
