import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/authProvider";

export const ProtectedRoute = () => {
    const { token, roles } = useAuth();

    // Fallback to localStorage to prevent race conditions during immediate navigation
    const activeToken = token || localStorage.getItem("token");
    const activeRoles = roles?.length > 0 ? roles : JSON.parse(localStorage.getItem("roles") || "[]");

    if (!activeToken) {
        return <Navigate to="/login" replace />;
    }

    const isDoctor = activeRoles.some(
        (role) => typeof role === "string" && role.toLowerCase() === "doctor"
    );

    if (!isDoctor) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};