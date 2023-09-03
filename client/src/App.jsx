import { Route, Routes } from "react-router-dom"; // Import Routes for exclusive routing
import { useState } from "react";

import AllPosts from "./components/AllPosts";
import SinglePostPage from "./components/SinglePostPage";
import RegisterUser from "./components/RegisterUser";
import LoginUser from "./components/LoginUser";
import CreatePost from "./components/CreatePost";

const App = () => {
  const [token, setToken] = useState(null);

  return (
    <div>
      <Routes>
        <Route path="/login" element={<LoginUser setToken={setToken} />} /> {/* Pass the setToken function as a prop to LoginUser */}
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/posts/create" token={token} element={<CreatePost />} />
        <Route path="/posts/:postId" element={<SinglePostPage />} />
        <Route path="/" element={<AllPosts />} />
      </Routes>
    </div>
  );
};

export default App;
