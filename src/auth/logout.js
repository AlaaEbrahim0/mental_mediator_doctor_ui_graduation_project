import React, { useEffect } from "react";
import { useAuth } from "./authProvider";
import { useNavigate } from "react-router-dom";

export const Logout = () => {
    const { setToken, setUserId } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setToken(null);
        setUserId(null);

        navigate("/login");
    }, [setToken, navigate, setUserId]);

    return <div>Logging out...</div>;
};
