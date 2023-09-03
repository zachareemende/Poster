import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectToken } from '../redux/authSlice';

export const ProtectedRoute = () => {
    const token = useSelector(selectToken); // Get token from Redux state

    return token ? <Outlet /> : <Navigate to="/login" state={{ error: "You must be logged in to do this!" }} />;
};