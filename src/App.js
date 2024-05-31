import AuthProvider from "./auth/authProvider";
import Routes from "./routes/index.js";

function App() {
    return (
        <AuthProvider>
            <Routes />
        </AuthProvider>
    );
}

export default App;
