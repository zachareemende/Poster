import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { useSelector } from "react-redux";

// Import your component pages
import AllPosts from "./components/AllPosts";
import SinglePostPage from "./components/SinglePostPage";
import RegisterUser from "./components/RegisterUser";
import LoginUser from "./components/LoginUser";
import CreatePost from "./components/CreatePost";
import ErrorPage from "./components/ErrorPage";
import NotFound from "./components/NotFound";
import SingleUser from "./components/SingleUser";

const App = () => {
  const token = useSelector((state) => state.auth.token);

  return (
    <div>
      <Routes>
        {/* public routes */}
        <Route path="/login" element={<LoginUser />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/posts/:postId" element={<SinglePostPage />} />
        <Route path="/users/:userId" element={<SingleUser />} />
        <Route path="/" element={<AllPosts />} />

        {/* error handling */}
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/users/undefined" element={<NotFound />} />

        {/* private routes */}
        <Route path="/posts/create" element={<ProtectedRoute />}>
          {token !== null && (
            <Route
              path="/posts/create"
              element={<CreatePost token={token} />}
            />
          )}
        </Route>
      </Routes>
    </div>
  );
};

export default App;
