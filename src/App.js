import AuthProvider from "./auth/authProvider";
import { UserProfileProvider } from "./context/profileContext.js";
import Routes from "./routes/index.js";

function App() {
    return (
        <AuthProvider>
            <UserProfileProvider>
                <Routes />
            </UserProfileProvider>
        </AuthProvider>
    );
}

export default App;
