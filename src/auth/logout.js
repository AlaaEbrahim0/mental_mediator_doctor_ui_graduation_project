import { useNavigate } from "react-router-dom";
import { useAuth } from "./authProvider";

export const Logout = () => {
    const { setToken } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        setToken();

        navigate("/login", { replace: true });
    };
    handleLogout();
};
