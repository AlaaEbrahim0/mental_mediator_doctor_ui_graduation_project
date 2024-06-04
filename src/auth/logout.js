import { useNavigate } from "react-router-dom";
import { useAuth } from "./authProvider";
import { useUserProfile } from "../context/profileContext";

export const Logout = () => {
    const { setToken } = useAuth();
    const navigate = useNavigate();
    const { reset } = useUserProfile();

    const handleLogout = () => {
        debugger;
        setToken(null);
        localStorage.removeItem("token");
        reset();
        navigate("/login", { replace: true });
    };
    handleLogout();
};
