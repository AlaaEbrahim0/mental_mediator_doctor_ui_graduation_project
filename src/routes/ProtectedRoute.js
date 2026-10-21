import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/authProvider";

export const ProtectedRoute = () => {
    const { token, roles } = useAuth();

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (!roles.includes("Doctor")) return <Navigate to="/login" replace />;

    return <Outlet />;
};
