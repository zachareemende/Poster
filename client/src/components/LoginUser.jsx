import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setToken, setUsername } from "../redux/authSlice";
import { Link, useLocation, useNavigate } from "react-router-dom";

const LoginUser = () => {
  const [LEmail, setLEmail] = useState("");
  const [LPassword, setLPassword] = useState("");
  const [error, setError] = useState("");

  const location = useLocation();
  const errorMessage = location.state && location.state.error;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Check if the user is already logged in
  const token = useSelector((state) => state.auth.token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5244/api/poster/users/login",
        {
          LEmail,
          LPassword,
        }
      );

      if (response.status === 200) {
        const token = response.data.token;
        const username = response.data.username;

        dispatch(setToken(token));
        dispatch(setUsername(username));

        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        
        navigate("/");
      }
      console.log("Login successful:", response.data);
    } catch (error) {
      console.error("Login failed:", error);

      if (error.response && error.response.status === 400) {
        setError("Invalid credentials. Please try again."); // Set specific error message for invalid credentials
      } else {
        setError(errorMessage || "Login failed");
      }
    }
  };

  useEffect(() => {
    if (token !== null) {
      navigate("/error", { state: { message: "You are already logged in." } });
    }
  }, []);

  return (
    <div>
      <h2>Login</h2>
      <Link to="/">Back to all posts</Link>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={LEmail}
            onChange={(e) => setLEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={LPassword}
            onChange={(e) => setLPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-600">{error}</p>}
        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginUser;
