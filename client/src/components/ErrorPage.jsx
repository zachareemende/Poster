import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

const ErrorPage = () => {
  const location = useLocation();
  const errorMessage = location.state && location.state.message;

  return (
    <div>
      <h2>Error</h2>
      {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      <Link className="mb-2 text-blue-500 hover:underline" to='/'>Home</Link>

    </div>
  );
};

export default ErrorPage;
