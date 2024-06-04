import React, { useEffect } from "react";
import { useAuth } from "./authProvider";
import { useNavigate } from "react-router-dom";

export const Logout = () => {
    const { setToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setToken(null);

        navigate("/login");
    }, [setToken, navigate]);

    return <div>Logging out...</div>;
};
