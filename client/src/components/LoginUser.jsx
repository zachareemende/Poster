import { useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const LoginUser = ({ setToken }) => {
  const [LEmail, setLEmail] = useState("");
  const [LPassword, setLPassword] = useState("");
  const [error, setError] = useState("");

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
        setToken(token); // Set the token in your app's state or context
      }
      console.log("Login successful:", response.data);
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>
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
        {error && <p>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

LoginUser.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default LoginUser;
