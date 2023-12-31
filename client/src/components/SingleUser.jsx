import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom"; // Import useParams from react-router-dom
import { useSelector } from "react-redux";
import defaultProfilePicture from "../assets/images/defaultProfilePicture.png";

const SingleUser = () => {
  const { userId } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [canUploadProfilePicture, setCanUploadProfilePicture] = useState(false);
  const [isLiked, setIsLiked] = useState({});
  const [commentText, setCommentText] = useState("");
  const [allCommentsVisible, setAllCommentsVisible] = useState(false);
  const [visibleComments] = useState(5);

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

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5244/api/poster/users/${userId}`
      );
      setUserProfile(response.data);
    } catch (error) {
      console.error("Error fetching user profile", error);
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

  const fetchUserProfilePicture = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5244/api/poster/users/${userId}/profilepicture`
      );

      if (response.data.startsWith("data:image/jpeg;base64,")) {
        setProfilePicture(response.data);
      } else {
        setProfilePicture(null); // Set profilePicture to null if no profile picture is available
      }

      if (user.userId.toString() === userId) {
        console.log("User is the owner.");
        setCanUploadProfilePicture(true);
      } else {
        console.log("User is not the owner.");
      }
      
    } catch (error) {
      console.error(error);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const targetFile = e.target.files[0];
    const file = new FormData();
    file.append("file", targetFile);

    console.log(targetFile);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          ContentType: "multipart/form-data",
        },
      };

      await axios.post(
        `http://localhost:5244/api/poster/users/${user.userId}/profilepicture/upload`,
        file,
        config
      );

      console.log("Profile picture uploaded successfully!");

      // set the profile picture
      console.log(targetFile);
      setProfilePicture(targetFile);

      // Fetch the updated profile picture
      await fetchUserProfilePicture();
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const initializeLikes = async () => {
    const likes = {};
    for (const post of userPosts) {
      likes[post.postId] = await checkIsLiked(post.postId);
    }
    setIsLiked(likes);
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

      // Update the isLiked state with the new like status for the specific post
      setIsLiked((prevIsLiked) => ({
        ...prevIsLiked,
        [postId]: !isPostLiked,
      }));
    } catch (error) {
      console.error("Like/Unlike failed:", error);
    }
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

      // Fetch the updated comments after successfully creating a new comment
      const updatedComments = await fetchCommentsWithUsernames(postId);

      console.log("Updated Comments:", updatedComments);

      // Update the post with the new comments
      setUserPosts((prevUserPosts) =>
        prevUserPosts.map((post) => {
          if (post.postId === postId) {
            return { ...post, comments: updatedComments };
          }
          return post;
        })
      );

      // Clear the comment Text
      setCommentText("");
    } catch (error) {
      console.error("Comment submission failed:", error);
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
        `http://localhost:5244/api/poster/posts/${postId}/delete`,
        config
      );

      // Fetch the updated posts after successfully deleting a post
      const updatedPosts = await loadPosts();

      // Update the userPosts state with the new posts
      if (updatedPosts !== undefined) {
        setUserPosts(updatedPosts);
      } else {
        console.error("No data received when updating posts.");
      }
    } catch (error) {
      console.error("Post deletion failed:", error);
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

      // Fetch the updated comments after successfully deleting a comment
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
    } catch (error) {
      console.error("Comment deletion failed:", error);
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

  const dateOf = (timestamp) => {
    const date = new Date(timestamp).toDateString();
    return date;
  };

  useEffect(() => {
    loadPosts();
    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    fetchUserProfilePicture();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      initializeLikes();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Link to="/" className="block mb-4 text-blue-500 hover:underline">
        Back to all posts
      </Link>
      {userProfile && (
        <div className="mb-4">
          <h1 className="text-2xl font-semibold mb-2">
            {userProfile.username}
          </h1>
          <div>
            <img
              src={profilePicture ?? defaultProfilePicture}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
          </div>
          {canUploadProfilePicture && (
            <div className="mb-4">
              <input type="file" onChange={handleProfilePictureUpload} />
            </div>
          )}
          <p className="text-gray-600 mb-2">
            Member since: {dateOf(userProfile.createdAt)}
          </p>
          <p className="text-gray-600 mb-2">Posts: {userPosts.length}</p>
        </div>
      )}

      <h1 className="text-2xl font-semibold mb-4">Posts</h1>

      {userPosts.map((post) => (
        <div key={post.postId} className="mb-4">
          <div className="border border-black border-solid p-4 rounded-lg shadow-md">
            {user.userId === post.userId.toString() && (
              // Show the delete button for posts created by the logged-in user
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => handleDeletePost(post.postId)}
              >
                Delete
              </button>
            )}
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
                    // Render your comment components here
                    <li key={comment.commentId} className="mb-4 border-b">
                      <p className="text-black-600 mb-1">
                        {comment.username}: {comment.text}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {timeAgo(comment.timestamp)}
                      </p>
                      {user.userId === comment.userId.toString() && (
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
      ))}
      {userPosts.length === 0 && <p>This user has no posts yet.</p>}
    </div>
  );
};

export default SingleUser;
