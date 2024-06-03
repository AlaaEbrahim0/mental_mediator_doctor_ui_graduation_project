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
import { Forums } from "../pages/ForumsPage/Forums";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import { Logout } from "../auth/logout";
import { ForumsDetails } from "../pages/ForumsPage/ForumsDetails";
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
                        { path: "forums", element: <Forums /> },
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
    ]);

    return <RouterProvider router={router} />;
};

export default Routes;
