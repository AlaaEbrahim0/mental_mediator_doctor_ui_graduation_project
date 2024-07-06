// src/components/TopBar.js
import { IoSearchSharp } from "react-icons/io5";
import { FaBars } from "react-icons/fa";
import { MdOutlineNotificationsNone } from "react-icons/md";
import { useNotifications } from "../../context/notificationsContext";
import { motion } from "framer-motion";
import { NotificationsList } from "../ui/NotificationList";

const imagesDir = process.env.REACT_APP_IMAGE_BASE_URL;

export const TopBar = ({ title = "Nexus", toggleSidebar }) => {
    const { notifications, count } = useNotifications();

    return (
        <div className="navbar bg-base-100 shadow-sm sticky p-3 z-10 top-0">
            <button className="lg:hidden text-2xl" onClick={toggleSidebar}>
                <FaBars />
            </button>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1"
            >
                <img
                    src={`${imagesDir}/logooo.png`}
                    alt=""
                    className="w-20 ml-4"
                />
                {/* <h3 className="btn btn-ghost text-xl md:text-2xl"></h3> */}
            </motion.div>
            {/* <div className="form-control">
                <label className="input bg-neutral input-bordered flex items-center w-full">
                    <IoSearchSharp className="text-xl text-info mr-2" />
                    <input
                        type="text"
                        className="grow w-full placeholder:text-sm"
                        placeholder="Search "
                    />
                </label>
            </div> */}
            <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="m-1">
                    <div className="indicator">
                        {count > 0 && (
                            <span className="indicator-item badge badge-error text-white ">
                                {count}
                            </span>
                        )}
                        <MdOutlineNotificationsNone className="text-3xl text-secondary" />
                    </div>
                </div>
                <div className="dropdown-content mt-4 z-[1] menu p-1 shadow-lg bg-white rounded-box w-96">
                    <NotificationsList notifications={notifications} />
                </div>
            </div>
        </div>
    );
};
