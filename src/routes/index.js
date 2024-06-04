import {
    Navigate,
    Outlet,
    RouterProvider,
    createBrowserRouter,
} from "react-router-dom";
import { useAuth } from "../auth/authProvider";
import { MainLayout } from "../components/layout/MainLayout";
import { Home } from "../pages/Home";
import { Appointments } from "../pages/Home";
import { Login } from "../auth/login";
import { Forums } from "../pages/Forums";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import { Logout } from "../auth/logout";
import { Schedule } from "../pages/Home";
import { ForumsDetails } from "../pages/ForumsDetails";
import { Profile } from "../pages/Profile";

const Routes = () => {
    const { token } = useAuth();

    const routesForPublic = [
        {
            path: "/login",
            element: <Login />,
        },
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
                        { path: "forums", element: <Forums /> },
                        { path: "forums/:id", element: <ForumsDetails /> },
                        { path: "logout", element: <Logout /> },
                    ],
                },
            ],
        },
    ];

    const routesForNotAuthenticatedOnly = [
        // {
        //     path: "/login",
        //     element: <Login />,
        // },
    ];

    const router = createBrowserRouter([
        ...routesForPublic,
        ...(!token ? routesForNotAuthenticatedOnly : []),
        ...routesForAuthenticatedOnly,
    ]);

    return <RouterProvider router={router} />;
};

export default Routes;
