import { Sidebar } from "./Sidebar";
import { CustomToast } from "../ui/CustomToast";
import { TopBar } from "./TopBar";
import { Outlet, useLocation } from "react-router-dom";

const getTitle = (path) => {
    switch (path) {
        case "/appointments":
            return "Appointments";
        case "/schedule":
            return "Schedule";
        case "/confessions":
            return "Confessions";
        case "/settings":
            return "Settings";
        case "/":
        default:
            return "Overview";
    }
};

export function MainLayout() {
    const location = useLocation();
    const title = getTitle(location.pathname);

    return (
        <>
            <CustomToast />
            <div className="min-h-screen bg-neutral">
                <Sidebar />
                <div className="ml-64">
                    <TopBar title={title} />
                    <div className="p-4">
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    );
}
