import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [userId, setUserId] = useState(localStorage.getItem("userId"));

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
        }
    }, [token, userId]);

    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                if (token) {
                    config.headers["Authorization"] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, [token]);

    const contextValue = useMemo(
        () => ({
            token,
            setToken,
            userId,
            setUserId,
        }),
        [token, userId]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
