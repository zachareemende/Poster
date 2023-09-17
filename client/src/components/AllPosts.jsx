import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  clearToken,
  selectToken,
  selectUsername,
  selectUserId,
} from "../redux/authSlice";

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLiked, setIsLiked] = useState({}); // Initialize isLiked state

  const token = useSelector(selectToken);
  const username = useSelector(selectUsername);
  const userId = useSelector(selectUserId);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5244/api/poster")
      .then((response) => setPosts(response.data))
      .catch((error) => console.error("Error fetching posts:", error));
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5244/api/poster/users"
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearToken());

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
  };

  // Function to get the latest 3 comments for a post
  const getLatestComments = (comments) => {
    return comments.slice(0, 3); // Slice the first 3 comments
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

  // Function to check if a post is liked by the current user
  const checkIsLiked = async (postId) => {
    try {
      const response = await axios.get(
        `http://localhost:5244/api/poster/posts/${postId}/likes/check`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return false;
    }
  };

  // Function to initialize isLiked state for all posts
  const initializeLikes = async () => {
    const likes = {};
    for (const post of posts) {
      likes[post.postId] = await checkIsLiked(post.postId);
    }
    setIsLiked(likes);
  };

  // Function to handle liking/unliking a post
  const handleLikeClick = async (postId) => {
    if (!token) {
      // Check if the user is logged in
      navigate("/login", {
        state: { error: "You must be logged in to do this!" },
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
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

      // Update posts with the new like status and like count for the specific post
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
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

  useEffect(() => {
    initializeLikes();
  }, [posts, token]);

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen"> {/* Apply container styles */}
      <div>
        <h2 className="text-xl font-semibold mb-4">List of Users</h2>
        <ul className="overflow-y-scroll h-36 w-56 bg-gray-100 rounded">
          {users.map((user) => (
            <li key={user.userId}>
              <Link
                to={`users/${user.userId}`}
                className="block mb-2 text-blue-500 hover:underline" // Apply link styles
              >
                {user.username}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <h1 className="text-2xl text-center mb-4">All Posts</h1>
      <Link to="/posts/create" className="block mb-4 text-blue-500 hover:underline">Create a new post</Link>
      {token ? (
        <div>
          <p className="mb-2">Logged in as: <Link className="text-blue-500 hover:underline" to={`users/${userId}`}>{username}</Link></p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md mb-2"
          >
            Logout
          </button>
        </div>
      ) : (
        <div>
          <Link to="/register" className="text-blue-500 hover:underline mr-4">Register</Link>
          <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
        </div>
      )}
      {posts.length > 0 ? (
        <ul>
          {posts.map((Post) => (
            <li key={Post.postId}>
              <div
                className="md:border border-black border-solid border-t md:p-4 md:rounded-lg shadow-md mb-4 md:max-w-screen-sm w-screen pb-2" // Apply card styles
              >
                <p className="mb-2">
                  Posted by:{" "}
                  <Link
                    to={`users/${Post.userId}`}
                    className="text-blue-500 hover:underline" // Apply link styles
                  >
                    {Post.username}
                  </Link>
                </p>
                <p className="mb-2">Posted: {timeAgo(Post.postedAt)}</p>
                <Link to={`/posts/${Post.postId}`}>
                  <img
                    src={Post.imageUrl}
                    alt="poster image"
                    className="mx-auto object-contain h-auto w-full md:max-h-96"
                  />
                </Link>
                <h3 className="text-lg font-semibold mb-2">{Post.caption}</h3>
                <p className="mb-2 text-gray-600">Likes: {Post.likeCount}</p>
                <button
                  className={
                    isLiked[Post.postId]
                      ? "bg-red-600 text-white px-4 py-2 rounded-md"
                      : "bg-blue-500 text-white px-4 py-2 rounded-md"
                  }
                  onClick={() => handleLikeClick(Post.postId)}
                >
                  {isLiked[Post.postId] ? "Unlike" : "Like"}
                </button>
                {Post.comments.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Latest Comments:</h4>
                    <ul>
                      {getLatestComments(Post.comments).map((comment) => (
                        <li key={comment.commentId} className="mb-2 border-b">
                          <p className="text-black-600 mb-1">
                            {comment.username}: {comment.content}
                          </p>
                          <p className="text-gray-600 text-xs">
                            {timeAgo(comment.timestamp)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts available.</p>
      )}
    </div>
  );
};

export default AllPosts;