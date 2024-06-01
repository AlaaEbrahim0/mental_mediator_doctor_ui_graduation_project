import { useState, useRef, useEffect } from "react";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { GrSchedules, GrSchedule } from "react-icons/gr";
import { BiMessageSquareDetail } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import { HiOutlineLogin } from "react-icons/hi";
import { NavLink } from "react-router-dom";
import { IoIosClose } from "react-icons/io";

export function Sidebar({ isOpen, setIsOpen }) {
    const [active, setActive] = useState(null);
    const iconStyles = "inline text-2xl mr-4";
    const sidebarRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, setIsOpen]);

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
            link: "/logout",
        },
    ];

    return (
        <div
            ref={sidebarRef}
            className={`bg-secondary text-white lg:sticky top-0 left-0 h-screen max-w-64 z-40 overflow-y-auto transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0`}
        >
            <div className="doctor-info flex flex-col justify-center align-center p-8">
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
                                ? "bg-primary text-black font-bold"
                                : "text-white hover:bg-primary hover:text-black hover:font-bold"
                        }`}
                        onClick={() => setActive(index)}
                    >
                        {item.icon}
                        <NavLink to={item.link}>{item.name}</NavLink>
                    </li>
                ))}
            </ul>
            <button
                className="lg:hidden absolute top-0 right-0 m-4 text-white"
                onClick={() => setIsOpen(false)}
            >
                <IoIosClose className="text-4xl" />
            </button>
        </div>
    );
}
