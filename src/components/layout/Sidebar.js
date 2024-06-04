import React, { useState, useRef, useEffect, useMemo } from "react";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { GrSchedules, GrSchedule } from "react-icons/gr";
import { BiMessageSquareDetail } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import { HiOutlineLogin } from "react-icons/hi";
import { NavLink } from "react-router-dom";
import { IoIosClose } from "react-icons/io";
import { useUserProfile } from "../../context/profileContext";

const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL;

export function Sidebar({ isOpen, setIsOpen }) {
    const [active, setActive] = useState(false);
    const iconStyles = "inline text-2xl mr-4";
    const sidebarRef = useRef(null);

    const { userProfileData, isLoading } = useUserProfile();

    const menuItems = useMemo(
        () => [
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
                name: "Forums",
                icon: <BiMessageSquareDetail className={iconStyles} />,
                link: "/forums",
            },
            {
                name: "Profile",
                icon: <FiSettings className={iconStyles} />,
                link: "/profile",
            },
            {
                name: "Logout",
                icon: <HiOutlineLogin className={iconStyles} />,
                link: "/logout",
            },
        ],
        []
    );

    const handleMenuItemClick = (index) => {
        setActive(index);
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    return (
        <div
            ref={sidebarRef}
            className={`bg-secondary fixed text-white lg:sticky top-0 left-0  h-screen z-40 overflow-y-auto transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0`}
        >
            {!isLoading && userProfileData && (
                <>
                    <div className="doctor-info flex flex-col justify-center align-center p-8 w-full">
                        <img
                            className="rounded-full w-52 h-52 object-cover bg-gradient-to-b from-primary"
                            src={
                                userProfileData.photoUrl ||
                                `${imagesDir}/profile.webp`
                            }
                            alt="Doctor"
                        />
                        <h3 className="text-center text-lg text-primary mt-3">
                            {`${userProfileData.firstName || ""} ${
                                userProfileData.lastName || ""
                            }`}
                        </h3>
                        <p className="text-center text-sm text-info">
                            {userProfileData.specialization?.match(
                                /[A-Z][a-z]+/g
                            )?.[0] || ""}
                        </p>
                    </div>
                    <ul>
                        {menuItems.map((item, index) => (
                            <li
                                key={index}
                                className={`text-xl px-8 py-4 w-full ${
                                    active === index
                                        ? "bg-primary text-black font-bold"
                                        : "text-white hover:bg-primary hover:text-black hover:font-bold"
                                }`}
                                onClick={() => handleMenuItemClick(index)}
                            >
                                {item.icon}
                                <NavLink to={item.link}>{item.name}</NavLink>
                            </li>
                        ))}
                    </ul>
                    <button
                        className="lg:hidden absolute top-0 right-0 m-4 text-white"
                        onClick={closeSidebar}
                    >
                        <IoIosClose className="text-4xl" />
                    </button>
                </>
            )}
        </div>
    );
}
