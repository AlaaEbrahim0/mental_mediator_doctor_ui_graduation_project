import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [userId, setUserId] = useState(localStorage.getItem("userId"));
    const [roles, setRoles] = useState(() => JSON.parse(localStorage.getItem("roles") || "[]"));
    const [expiresOn, setExpiresOn] = useState(localStorage.getItem("expiresOn"));

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);
            localStorage.setItem("roles", JSON.stringify(roles));
            if (expiresOn) localStorage.setItem("expiresOn", expiresOn);
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("roles");
            localStorage.removeItem("expiresOn");
        }
    }, [token, userId, roles, expiresOn]);

    useEffect(() => {
        const expire = () => { setToken(null); setUserId(null); setRoles([]); setExpiresOn(null); };
        const expiry = expiresOn ? new Date(expiresOn).getTime() : 0;
        if (token && expiry && expiry <= Date.now()) expire();
        const timer = token && expiry > Date.now() ? window.setTimeout(expire, expiry - Date.now()) : null;
        window.addEventListener("auth:expired", expire);
        return () => { if (timer) window.clearTimeout(timer); window.removeEventListener("auth:expired", expire); };
    }, [token, expiresOn]);

    const contextValue = useMemo(
        () => ({
            token,
            setToken,
            userId,
            setUserId,
            roles,
            setRoles,
            expiresOn,
            setExpiresOn,
        }),
        [token, userId, roles, expiresOn]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
