import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { clearToken, selectToken } from "../redux/authSlice"; // Import the clearToken action and selectToken selector

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const token = useSelector(selectToken); // Get token from Redux state

  useEffect(() => {
    axios
      .get("http://localhost:5244/api/poster")
      .then((response) => setPosts(response.data))
      .catch((error) => console.error("Error fetching posts:", error));
  }, []);

  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearToken()); // Clear token from Redux store
    localStorage.removeItem("token"); // Remove token from localStorage
  };

  return (
    <div>
      <h1 className="text-center">All Posts</h1>
      <Link to="/posts/create">Create a new post</Link>
      {token ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <div>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </div>
      )}
      {posts.length > 0 ? (
        <ul>
          {posts.map((Post) => (
            <li key={Post.postId}>
              <div
                className="border border-black border-solid p-4 mx-auto mb-4"
                style={{ maxWidth: "512px", width: "100%", height: "640px" }}
              >
                <p>Posted by: {Post.username}</p>
                <Link to={`/posts/${Post.postId}`}>
                  <img
                    src={Post.imageUrl}
                    alt="poster image"
                    width={512}
                    height={512}
                    className="mx-auto"
                    style={{ objectFit: "cover" }}
                  />
                </Link>
                <h3>{Post.caption}</h3>
                <p>Likes: {Post.likeCount}</p>
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
