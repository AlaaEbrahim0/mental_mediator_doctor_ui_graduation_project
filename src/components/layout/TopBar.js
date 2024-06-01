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
                <h3 className="btn btn-ghost text-2xl">{title}</h3>
            </div>

            <div className="gap-x-5">
                <div className="form-control">
                    <label className="input bg-neutral input-bordered flex items-center gap-2 w-full">
                        <IoSearchSharp className="text-xl text-info" />
                        <input
                            type="text"
                            className="grow w-full placeholder:text-sm"
                            placeholder="Search Appointment, Confessions etc..."
                        />
                    </label>
                </div>
                <button>
                    <FaBell className="text-xl text-secondary" />
                </button>

                <div className="dropdown dropdown-end">
                    <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-circle avatar"
                    >
                        <div className="w-10 rounded-full">
                            <img
                                alt="Tailwind CSS Navbar component"
                                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                            />
                        </div>
                    </div>
                    <ul
                        tabIndex={0}
                        className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
                    >
                        <li>
                            <a className="justify-between">
                                Profile
                                <span className="badge">New</span>
                            </a>
                        </li>
                        <li>
                            <a>Settings</a>
                        </li>
                        <li>
                            <a>Logout</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
