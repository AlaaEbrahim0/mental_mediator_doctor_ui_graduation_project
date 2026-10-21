import {
    Navigate,
    RouterProvider,
    createBrowserRouter,
} from "react-router-dom";
import { useAuth } from "../auth/authProvider";
import { MainLayout } from "../components/layout/MainLayout";
import { Home } from "../pages/Home";
import { Appointments } from "../pages/Appointment";
import { Login } from "../auth/login";
import { Forums } from "../pages/Forums";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import { Logout } from "../auth/logout";
import { Schedule } from "../pages/Schedule";
import { ForumsDetails } from "../pages/ForumsDetails";
import { Profile } from "../pages/Profile";
import { ResetPassword } from "../auth/forgetPassword";
import { Notifications } from "../pages/Notifications";

const LoginRoute = () => {
    const { token, roles } = useAuth();
    return token && roles.includes("Doctor") ? <Navigate to="/" replace /> : <Login />;
};

// Keep one router instance for the lifetime of the app. Recreating a data
// router whenever auth state changes can repeatedly remount <Navigate> and
// trigger a redirect/update loop.
const router = createBrowserRouter([
    { path: "forgetPassword", element: <ResetPassword /> },
    { path: "/login", element: <LoginRoute /> },
    {
        path: "/",
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: <MainLayout />,
                children: [
                    { path: "/", element: <Home /> },
                    { path: "appointments", element: <Appointments /> },
                    { path: "schedule", element: <Schedule /> },
                    { path: "profile", element: <Profile /> },
                    { path: "notifications", element: <Notifications /> },
                    { path: "Community", element: <Forums /> },
                    { path: "forums/:id", element: <ForumsDetails /> },
                    { path: "logout", element: <Logout /> },
                ],
            },
        ],
    },
    { path: "*", element: <Navigate to="/" replace /> },
]);

const Routes = () => <RouterProvider router={router} />;

export default Routes;
