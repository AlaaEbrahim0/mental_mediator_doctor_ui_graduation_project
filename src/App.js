// src/App.js
import AuthProvider from "./auth/authProvider";
import { ThemeProvider } from "./theme/ThemeProvider";
import { UserProfileProvider } from "./context/profileContext.js";
import { NotificationsProvider } from "./context/notificationsContext.js";
import Routes from "./routes/index.js";
function App() {
    return (
        <ThemeProvider>
        <AuthProvider>
            <UserProfileProvider>
                <NotificationsProvider>
                    <Routes />
                </NotificationsProvider>
            </UserProfileProvider>
        </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
