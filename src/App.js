// src/App.js
import AuthProvider from "./auth/authProvider";
import { UserProfileProvider } from "./context/profileContext.js";
import { NotificationsProvider } from "./context/notificationsContext.js";
import Routes from "./routes/index.js";

function App() {
    return (
        <AuthProvider>
            <UserProfileProvider>
                <NotificationsProvider>
                    <Routes />  
                </NotificationsProvider>
            </UserProfileProvider>
        </AuthProvider>
    );
}

export default App;
