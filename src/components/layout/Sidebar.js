import React, { useState, useRef, useEffect, useMemo } from "react";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { GrSchedules, GrSchedule } from "react-icons/gr";
import { BiMessageSquareDetail } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import { HiOutlineLogin } from "react-icons/hi";
import { NavLink } from "react-router-dom";
import { IoIosClose, IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { useUserProfile } from "../../context/profileContext";
import { motion } from "framer-motion";
import { useAuth } from "../../auth/authProvider";

const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL;

export function Sidebar({ isOpen, setIsOpen }) {
    const [active, setActive] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
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
                name: "Community",
                icon: <BiMessageSquareDetail className={iconStyles} />,
                link: "/community",
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
        closeSidebar();
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    const toggleExpand = () => {
        setIsExpanded((prev) => !prev);
    };

    useEffect(() => {
        const handleResize = () => {
            if (sidebarRef.current && !isExpanded) {
                sidebarRef.current.style.height = "auto";
            }
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [isExpanded]);

    return (
        <div
            ref={sidebarRef}
            className={`animated-gradient fixed text-white lg:sticky top-0 left-0 h-screen z-40 overflow-y-auto transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 ${isExpanded ? "w-64" : "w-20"}`}
            style={{ maxHeight: "100vh" }} // Set max height to viewport height
        >
            {isLoading ? (
                <div className="doctor-info flex flex-col justify-center align-center py-4 px-8 w-full">
                    <div className="skeleton rounded-full w-52 h-52 bg-gray-300 opacity-50"></div>
                    <div className="skeleton h-6 mt-3 bg-gray-300 opacity-50 w-3/4 mx-auto"></div>
                    <div className="skeleton h-4 mt-2 bg-gray-300 opacity-50 w-1/2 mx-auto"></div>
                </div>
            ) : (
                userProfileData && (
                    <>
                        <motion.div
                            animate={{ opacity: 1 }}
                            initial={{ opacity: 0 }}
                            className="doctor-info flex flex-col justify-center align-center py-4 px-8 w-full"
                        >
                            <>
                                <motion.img
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="rounded-full w-52 h-52 object-cover mt-2 bg-gradient-to-b from-primary mx-auto"
                                    src={
                                        userProfileData.photoUrl ||
                                        `${imagesDir}/profile.webp`
                                    }
                                    alt="Doctor"
                                />
                                <h3 className="text-center text-lg text-white mt-3">
                                    {`Dr. ${userProfileData.firstName || ""} ${
                                        userProfileData.lastName || ""
                                    }`}
                                </h3>
                                <p className="text-center text-sm text-info">
                                    {userProfileData.specialization?.match(
                                        /[A-Z][a-z]+/g
                                    )?.[0] || ""}
                                    {" Psychology"}
                                </p>
                            </>
                        </motion.div>
                        <ul className="flex flex-col">
                            {menuItems.map((item, index) => (
                                <NavLink to={item.link} key={index}>
                                    <motion.li
                                        initial={{ opacity: 0, x: "-100vw" }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            type: "tween",
                                        }}
                                        className={`text-xl px-8 py-4 w-full ${
                                            active === index
                                                ? "bg-primary text-black font-bold"
                                                : "text-white hover:bg-primary hover:text-black hover:font-bold"
                                        }`}
                                        onClick={() =>
                                            handleMenuItemClick(index)
                                        }
                                    >
                                        {item.icon}
                                        {isExpanded && item.name}
                                    </motion.li>
                                </NavLink>
                            ))}
                        </ul>
                        <button
                            className="lg:hidden absolute top-0 right-0 m-4 text-white"
                            onClick={closeSidebar}
                        >
                            <IoIosClose className="text-4xl mb-8" />
                        </button>
                    </>
                )
            )}
        </div>
    );
}
