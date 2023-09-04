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


const App = () => {
  const token = useSelector((state) => state.auth.token);

  return (
    <div>
      <Routes>
        <Route path="/login" element={<LoginUser />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/posts/:postId" element={<SinglePostPage />} />
        <Route path="/" element={<AllPosts />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path='*' element={<NotFound />}/>


        {/* Use PrivateRoute for the /posts/create route */}
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
