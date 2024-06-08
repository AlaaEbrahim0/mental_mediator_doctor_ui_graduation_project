// src/App.js
import React, { useState, useEffect } from "react";
import AuthProvider from "./auth/authProvider";
import { UserProfileProvider } from "./context/profileContext.js";
import { NotificationsProvider } from "./context/notificationsContext.js";
import Routes from "./routes/index.js";

function App() {
    const [theme, setTheme] = useState("customTheme");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === "customTheme" ? "darkTheme" : "customTheme");
    };

    return (
        <AuthProvider>
            <UserProfileProvider>
                <NotificationsProvider>
                    <div className="app-container">
                        <button
                            onClick={toggleTheme}
                            className="theme-toggle-button"
                        >
                            Toggle Theme
                        </button>
                        <Routes />
                    </div>
                </NotificationsProvider>
            </UserProfileProvider>
        </AuthProvider>
    );
}

export default App;
