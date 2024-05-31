import { useState } from "react";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { GrSchedules } from "react-icons/gr";
import { GrSchedule } from "react-icons/gr";
import { BiMessageSquareDetail } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import { HiOutlineLogin } from "react-icons/hi";
import { NavLink } from "react-router-dom";

export function Sidebar() {
    const [active, setActive] = useState(null);
    const iconStyles = "inline text-2xl mr-4";

    const menuItems = [
        {
            name: "Overview",
            icon: <MdOutlineSpaceDashboard className={iconStyles} />,
            link: "/",
        },
        {
            name: "Appointments",
            icon: <GrSchedules className={iconStyles} />,
            link: "/appointments",
        },
        {
            name: "Schedule",
            icon: <GrSchedule className={iconStyles} />,
            link: "/schedule",
        },
        {
            name: "Confessions",
            icon: <BiMessageSquareDetail className={iconStyles} />,
            link: "/confessions",
        },
        {
            name: "Settings",
            icon: <FiSettings className={iconStyles} />,
            link: "/settings",
        },
        {
            name: "Logout",
            icon: <HiOutlineLogin className={iconStyles} />,
            link: "/login",
        },
    ];

    return (
        <div className="bg-secondary text-white fixed top-0 left-0 h-screen w-64 overflow-y-auto">
            <div className="doctor-info flex flex-col justify-center align center p-8">
                <img
                    className="rounded-full bg-gradient-to-b from-primary"
                    src="images/doctorPhoto.png"
                    alt="Doctor"
                />
                <h3 className="text-center text-lg text-primary mt-3">
                    Dr. John Doe
                </h3>
                <p className="text-center text-sm text-info">Cardiologist</p>
            </div>
            <ul>
                {menuItems.map((item, index) => (
                    <li
                        key={index}
                        className={`text-lg px-4 p-3 my-1 w-full ${
                            active === index
                                ? "bg-primary  text-black font-bold"
                                : "text-white hover:bg-primary hover:text-black hover:font-bold"
                        }`}
                        onClick={() => setActive(index)}
                    >
                        {item.icon}
                        <NavLink to={item.link}>{item.name}</NavLink>
                    </li>
                ))}
            </ul>
        </div>
    );
}
