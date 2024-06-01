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
import { Posts } from "../pages/Posts";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import { Logout } from "../auth/logout";
// import { Schedule } from "../pages/Schedule";
// import { Confessions } from "../pages/Confessions";
// import { Settings } from "../pages/Settings";

const Routes = () => {
    const { token } = useAuth();

    const routesForPublic = [
        // {
        //     path: "/login",
        //     element: <Login />,
        // },
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
                        // { path: "schedule", element: <Schedule /> },
                        { path: "confessions", element: <Posts /> },
                        // { path: "settings", element: <Settings /> },
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
    ]);

    return <RouterProvider router={router} />;
};

export default Routes;
