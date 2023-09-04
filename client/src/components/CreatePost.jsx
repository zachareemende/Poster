import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const CreatePost = ({ token }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const history = useNavigate();

  const handleImageChange = (event) => {
    setImageUrl(event.target.value);
  };

  const handleCaptionChange = (event) => {
    setCaption(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5244/api/poster/posts/create",
        {
          imageUrl,
          caption,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Post created:", response.data);

      // Clear form fields after successful post creation
      setImageUrl("");
      setCaption("");

      // Redirect to the posts page or handle navigation as needed
      history("/");
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <div>
      <h2>Create a New Post</h2>
      <Link to="/">Back to all posts</Link>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="imageUrl">Image URL:</label>
          <input
            type="text"
            id="imageUrl"
            value={imageUrl}
            onChange={handleImageChange}
            required
          />
        </div>
        <div>
          <label htmlFor="caption">Caption:</label>
          <input
            type="text"
            id="caption"
            value={caption}
            onChange={handleCaptionChange}
            required
          />
        </div>
        <button type="submit">Create Post</button>
      </form>
    </div>
  );
};

CreatePost.propTypes = {
  token: PropTypes.string.isRequired,
};

export default CreatePost;
