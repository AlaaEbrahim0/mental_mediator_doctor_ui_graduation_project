import {
    Navigate,
    Outlet,
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

const Routes = () => {
    const { token } = useAuth();

    const routesForPublic = [
        { path: "forgetPassword", element: <ResetPassword /> },
    ];

    const routesForAuthenticatedOnly = [
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
                        { path: "Community", element: <Forums /> },
                        { path: "forums/:id", element: <ForumsDetails /> },
                        { path: "logout", element: <Logout /> },
                    ],
                },
            ],
        },
    ];

    const routesForNotAuthenticatedOnly = [
        {
            path: "/login",
            element: <Login />,
        },
    ];

    const router = createBrowserRouter([
        ...routesForPublic,
        ...(!token ? routesForNotAuthenticatedOnly : []),
        ...routesForAuthenticatedOnly,
        { path: "*", element: <Navigate to="/" /> },
    ]);

    return <RouterProvider router={router} />;
};

export default Routes;
