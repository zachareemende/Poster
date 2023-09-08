import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const SinglePostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const user = useSelector((state) => state.auth);
  const [visibleComments] = useState(5);
  const [allCommentsVisible, setAllCommentsVisible] = useState(false);

  const navigate = useNavigate();

  const loadComments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5244/api/poster/posts/${postId}/comments`
      );
      const commentsWithUsernames = response.data.map((comment) => ({
        ...comment,
        username: comment.Username,
      }));
      setPost((prevPost) => ({ ...prevPost, comments: commentsWithUsernames }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

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

  useEffect(() => {
    axios
      .get(`http://localhost:5244/api/poster/posts/${postId}`)
      .then((response) => setPost(response.data))
      .catch((error) => console.error("Error fetching post:", error));

    if (user.token) {
      checkIsLiked();
    }

    loadComments(); // Load comments when component mounts

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, user.token]);

  useEffect(() => {
    if (user.token) {
      checkIsLiked();
    }
  }, [user.token]);

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

  const handleCommentSubmit = async () => {
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
      setPost((prevPost) => ({
        ...prevPost,
        comments: updatedComments,
      }));

      // Clear the comment content
      setCommentContent("");
    } catch (error) {
      console.error("Comment submission failed:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
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

      await axios.delete(
        `http://localhost:5244/api/poster/posts/${postId}/comments/delete/${commentId}`,
        config
      );

      // Fetch the updated comments after successfully deleting a comment
      const updatedComments = await fetchCommentsWithUsernames(postId);

      // Update the post with the new comments
      setPost((prevPost) => ({
        ...prevPost,
        comments: updatedComments,
      }));
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
    fetchCommentsWithUsernames(postId)
      .then((comments) => {
        setPost((prevPost) => ({
          ...prevPost,
          comments: comments,
        }));
      })
      .catch((error) => console.error("Error fetching comments:", error));
  }, [postId]);

  const toggleAllCommentsVisible = () => {
    setAllCommentsVisible(!allCommentsVisible);
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
              onClick={handleLikeClick}
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
                onClick={handleCommentSubmit}
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
                      <p className="text-black-600 mb-1">
                        {comment.username}: {comment.text}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {timeAgo(comment.timestamp)}
                      </p>
                      {
                        // Only show the delete button if the comment belongs to the logged in user
                        comment.username === user.username && (
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded-md"
                            onClick={() =>
                              handleDeleteComment(comment.commentId)
                            }
                          >
                            Delete
                          </button>
                        )
                      }
                    </li>
                  ))}
              </ul>
              {post.comments.length > visibleComments && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
                  onClick={toggleAllCommentsVisible}
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
