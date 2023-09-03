import { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setToken } from "../redux/authSlice";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const LoginUser = () => {
  const [LEmail, setLEmail] = useState("");
  const [LPassword, setLPassword] = useState("");
  const [error, setError] = useState("");

  const location = useLocation();
  const errorMessage = location.state && location.state.error;

  const dispatch = useDispatch();

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
        dispatch(setToken(token)); // Dispatch the token to Redux
      }
      console.log("Login successful:", response.data);
    } catch (error) {
      console.error("Login failed:", error);
    setError(errorMessage || "Login failed");
    }
  };

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
        {error && <p className="text-red-600" >{error}</p>}
        {errorMessage && <p className="text-red-600" >{errorMessage}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginUser;
