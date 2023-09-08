import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { clearToken, selectToken } from "../redux/authSlice";

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const token = useSelector(selectToken);

  useEffect(() => {
    axios
      .get("http://localhost:5244/api/poster")
      .then((response) => setPosts(response.data))
      .catch((error) => console.error("Error fetching posts:", error));
  }, []);

  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearToken());
    localStorage.removeItem("token");
  };

  // Function to get the latest 3 comments for a post
  const getLatestComments = (comments) => {
    return comments.slice(0, 3); // Slice the first 3 comments
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
                style={{ maxWidth: "512px", width: "100%", height: "75%" }}
              >
                <p>Posted by: {Post.username}</p>
                <Link to={`/posts/${Post.postId}`}>
                  <img
                    src={Post.imageUrl}
                    alt="poster image"
                    className="mx-auto"
                    style={{
                      width: "100%",
                      objectFit: "contain", // Change to "contain" for consistent size
                      height: "500px", // Set a fixed height for consistency
                    }}
                  />
                </Link>
                <h3>{Post.caption}</h3>
                <p>Likes: {Post.likeCount}</p>
                {Post.comments.length > 0 && (
                  <div>
                    <h4>Latest Comments:</h4>
                    <ul>
                      {getLatestComments(Post.comments).map((comment) => (
                        <li key={comment.commentId}>
                          {comment.username}: {comment.content}
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
