import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const RegisterUser = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5244/api/poster/users/create",
        {
          username,
          email,
          password,
          confirm: confirmPassword,
        }
      );

      if (response.status === 201) {
        setRegistrationSuccess(true);
        navigate("/"); // Redirect to the main page
      }
    } catch (error) {
      setError("Registration failed");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <Link to="/">Back to all posts</Link>

      {registrationSuccess ? (
        <p>
          Registration successful! You can now{" "}
          <Link to={"/login"}>log in.</Link>
        </p>
      ) : (
        <>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div>
              <label>Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label>Confirm Password:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit">Register</button>
          </form>
        </>
      )}
    </div>
  );
};

export default RegisterUser;
