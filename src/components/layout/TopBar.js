import { NavLink } from "react-router-dom";
import { IoSearchSharp } from "react-icons/io5";
import { FaBell } from "react-icons/fa";
import { FaBars } from "react-icons/fa";

export const TopBar = ({ title = "Nexus", toggleSidebar }) => {
    return (
        <div className="navbar bg-base-100 shadow-sm sticky p-3 z-10 top-0">
            <button className="lg:hidden text-2xl" onClick={toggleSidebar}>
                <FaBars />
            </button>
            <div className="flex-1">
                <h3 className="btn btn-ghost text-xl md:text-2xl">{title}</h3>
            </div>

            <div className="form-control">
                <label className="input bg-neutral input-bordered flex items-center w-full">
                    <IoSearchSharp className="text-xl text-info mr-2" />
                    <input
                        type="text"
                        className="grow w-full placeholder:text-sm"
                        placeholder="Search "
                    />
                </label>
            </div>
        </div>
    );
};
