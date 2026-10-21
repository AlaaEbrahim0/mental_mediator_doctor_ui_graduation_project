import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/authProvider";
import { getRoles, getToken } from "../auth/session";

export const ProtectedRoute = () => {
    const { token, roles } = useAuth();
    const location = useLocation();

    // Fall back to the persisted session so a navigation that happens right
    // after sign-in is not rejected while React state is still settling.
    const activeToken = token || getToken();
    const activeRoles = roles?.length > 0 ? roles : getRoles();

    if (!activeToken) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    const isDoctor = activeRoles.some(
        (role) => typeof role === "string" && role.toLowerCase() === "doctor"
    );

    if (!isDoctor) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
};
