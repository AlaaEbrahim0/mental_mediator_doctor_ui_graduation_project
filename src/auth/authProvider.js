import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    // State to hold the authentication token and user data
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [userData, setUserData] = useState(
        JSON.parse(localStorage.getItem("userData"))
    );

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = "Bearer " + token;
            localStorage.setItem("token", token);
            localStorage.setItem("userData", JSON.stringify(userData));
        } else {
            delete axios.defaults.headers.common["Authorization"];
            localStorage.removeItem("token");
            localStorage.removeItem("userData");
        }
    }, [token, userData]);

    const updateUserData = (newUserData) => {
        localStorage.setItem("userData", JSON.stringify(newUserData));
        setUserData(newUserData);
    };

    const contextValue = useMemo(
        () => ({
            token,
            setToken,
            userData,
            updateUserData,
        }),
        [token, userData]
    );

    // Provide the authentication context to the children components
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthProvider;
