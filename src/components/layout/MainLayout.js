import { Sidebar } from "./Sidebar";
import { CustomToast } from "../ui/CustomToast";
import { TopBar } from "./TopBar";
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

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
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <CustomToast />
            <div className="min-h-screen bg-neutral flex flex-col lg:flex-row ">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
                <div
                    className={`flex-1 transition-all lg:static absolute top-0 left-0 w-full duration-300`}
                >
                    <TopBar
                        className="sticky"
                        title={title}
                        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                    />
                    <div className="p-2 lg:p-4 overflow-auto h-full">
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    );
}
