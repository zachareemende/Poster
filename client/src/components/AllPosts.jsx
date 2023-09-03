import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const AllPosts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5244/api/poster")
      .then((response) => setPosts(response.data))
      .catch((error) => console.error("Error fetching posts:", error));
  }, []);

  return (
    <div>
      <h1 className="text-center">All Posts</h1>
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
                <p>Likes: {Post.likeCount}</p> {/* Display the like count */}
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
