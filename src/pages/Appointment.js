import { useState, useEffect } from "react";
import { useGetAppointments } from "../api/getAppoinments";
import { MdOutlineNavigateNext } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";
import { motion } from "framer-motion";

export function Appointments() {
    const { isLoading, error, data, totalPages, execute } =
        useGetAppointments();
    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 7;

    useEffect(() => {
        execute({ PageSize: pageSize, PageNumber: pageNumber });
    }, [pageNumber, execute]);

    // Function to format the date and time
    const formatDateTime = (dateTimeString) => {
        const options = {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        };
        return new Date(dateTimeString).toLocaleString("en-US", options);
    };

    function formatDuration(duration) {
        const [hours, minutes, seconds] = duration.split(":").map(Number);

        const totalMinutes = hours * 60 + minutes;

        if (hours > 0) {
            return `${hours} hour${hours > 1 ? "s" : ""} and ${minutes} minute${
                minutes !== 1 ? "s" : ""
            }`;
        } else {
            return `${totalMinutes} minute${totalMinutes !== 1 ? "s" : ""}`;
        }
    }

    const handlePreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }
    };

    const handleNextPage = () => {
        if (data.length >= pageSize) {
            setPageNumber(pageNumber + 1);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center mt-52">
                {/* Example spinner */}
                <span className="loading loading-spinner"></span>
            </div>
        );
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="overflow-x-auto w-full">
                <table className="table">
                    <thead className="uppercase font-bold text-secondary">
                        <tr>
                            <th>
                                <label>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                    />
                                </label>
                            </th>
                            <th>Client</th>
                            <th>Date Time</th>
                            <th>Duration</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((appointment) => (
                            <motion.tr
                                className="appointment-row"
                                whileHover={{
                                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                                    cursor: "pointer",
                                }}
                                key={appointment.id}
                            >
                                <th>
                                    <label>
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                        />
                                    </label>
                                </th>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle h-12 w-12">
                                                <img
                                                    src={
                                                        appointment.clientPhotoUrl
                                                    }
                                                    alt="Client Avatar"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-extrabold text-secondary ">
                                                {appointment.clientName}
                                            </div>
                                            <div className="text-sm opacity-50">
                                                {appointment.clientEmail}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="font-semibold text-secondary">
                                    {formatDateTime(appointment.startTime)}
                                </td>
                                <td className="font-semibold text-secondary">
                                    {formatDuration(appointment.duration)}
                                </td>
                                <td>
                                    {appointment.status === "Pending" && (
                                        <div className="badge badge-outline badge-primary p-2">
                                            {appointment.status}
                                        </div>
                                    )}
                                    {appointment.status === "Confirmed" && (
                                        <div className="badge badge-outline badge-success p-2">
                                            {appointment.status}
                                        </div>
                                    )}
                                    {appointment.status === "Rejected" && (
                                        <div className="badge badge-outline badge-error p-2">
                                            {appointment.status}
                                        </div>
                                    )}
                                    {appointment.status === "Cancelled" && (
                                        <div className="badge badge-outline badge-error p-2">
                                            {appointment.status}
                                        </div>
                                    )}
                                </td>
                                <td>
                                    {appointment.status === "Pending" && (
                                        <div className="flex gap-2">
                                            <button className="btn btn-sm btn-success btn-outline">
                                                Confirm
                                            </button>
                                            <button className="btn btn-sm text-white btn-error">
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination Controls */}
            </div>
            <div className="flex justify-between items-center mt-1 px-8">
                <button
                    className="btn btn-sm btn-ghost btn-outline"
                    onClick={handlePreviousPage}
                    disabled={pageNumber === 1}
                >
                    <GrFormPrevious />
                </button>
                <span className="text-info text-sm">Page {pageNumber}</span>
                <button
                    className="btn btn-sm btn-ghost btn-outline"
                    onClick={handleNextPage}
                    disabled={data.length < pageSize}
                >
                    <MdOutlineNavigateNext className="text-lg" />
                    {/* Next */}
                </button>
            </div>
        </motion.div>
    );
}
