import { IoClose } from "react-icons/io5";
import { useState } from "react";
import { motion } from "framer-motion";

export function FilterationComponent({ onClose, onFilter }) {
    const [filters, setFilters] = useState({
        username: "",
        title: "",
        content: "",
        from: "",
        to: "",
        showConfessions: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters({
            ...filters,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleFilter = () => {
        onFilter(filters);
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-base-100 shadow-lg glass p-4 rounded-xl z-10"
        >
            <div className="flex items-center">
                <h3 className="text-xl font-semibold">Filters</h3>
                <IoClose
                    className="text-xl ml-auto"
                    onClick={onClose}
                    style={{ cursor: "pointer" }}
                />
            </div>
            <hr className="my-4" />
            {["username", "title", "content"].map((field) => (
                <label key={field} className="form-control w-full max-w-full">
                    <div className="label">
                        <span className="label-text text-lg">
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                        </span>
                    </div>
                    <input
                        type="text"
                        name={field}
                        value={filters[field]}
                        onChange={handleChange}
                        placeholder="Type here"
                        className="input input-bordered w-full max-w-full"
                    />
                </label>
            ))}
            <div className="grid grid-cols-2 gap-4">
                {["from", "to"].map((field) => (
                    <label
                        key={field}
                        className="form-control w-full max-w-full"
                    >
                        <div className="label">
                            <span className="label-text text-lg">
                                {field.charAt(0).toUpperCase() + field.slice(1)}
                            </span>
                        </div>
                        <input
                            type="date"
                            name={field}
                            value={filters[field]}
                            onChange={handleChange}
                            className="input input-bordered w-full max-w-full"
                        />
                    </label>
                ))}
            </div>
            <div className="flex items-center justify-between mt-4">
                <span className="mr-2 text-sm md:text-lg">
                    Show Confessions
                </span>
                <input
                    type="checkbox"
                    name="showConfessions"
                    checked={filters.showConfessions}
                    onChange={handleChange}
                    className="toggle toggle-md"
                />
            </div>
            <button
                className="btn btn-secondary btn-outline w-full mt-4 uppercase"
                onClick={handleFilter}
            >
                Filter
            </button>
        </motion.div>
    );
}
