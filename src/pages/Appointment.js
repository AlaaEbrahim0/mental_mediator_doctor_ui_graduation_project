import { useState, useEffect } from "react";
import { useGetAppointments } from "../api/getAppoinments";
import { MdOutlineNavigateNext } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";
import { motion } from "framer-motion";
import { FiFilter } from "react-icons/fi";
import toast from "react-hot-toast";
import {
    CustomConfirmationModal,
    CustomDeletionModal,
} from "../components/ui/CustomDeletionModal";
import { useConfirmAppointment } from "../api/posts/confirmAppointment";
import { useRejectAppointment } from "../api/posts/rejectAppointment";
import { AppointmentsFilterationComponent } from "../components/ui/FilterationComponent";

export function Appointments({ pageSize = 7 }) {
    const { isLoading, error, data, totalPages, execute } =
        useGetAppointments();
    const {
        isLoading: confirmIsLoading,
        error: confirmError,
        execute: confirmExecute,
    } = useConfirmAppointment();
    const {
        isLoading: rejectIsLoading,
        error: rejectError,
        execute: rejectExecute,
    } = useRejectAppointment();

    const [pageNumber, setPageNumber] = useState(1);

    const [currentAppointment, setCurrentAppointment] = useState(null);
    const [isFilterVisible, setFilterVisible] = useState(false);
    const [isConfirmationModalVisible, setConfirmationModalVisible] =
        useState(false);
    const [isRejectionModalVisible, setIsRejectionModalVisible] =
        useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const [filterData, setFilterData] = useState({
        clientName: null,
        startDate: "",
        endDate: "",
        status: null,
        pageSize: pageSize,
        pageNumber: pageNumber,
    });

    useEffect(() => {
        debugger;

        execute(filterData);
    }, [execute, filterData]);

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
        debugger;

        if (pageNumber > 1) {
            debugger;
            setPageNumber(pageNumber - 1);
            setFilterData((prevData) => ({
                ...prevData,
                pageNumber: pageNumber - 1,
            }));
        }
    };

    const handleNextPage = () => {
        debugger;

        if (data.length >= pageSize) {
            setPageNumber(pageNumber + 1);
            setFilterData((prevData) => ({
                ...prevData,
                pageNumber: pageNumber + 1,
            }));
        }
    };

    const handleConfirm = async (appointmentId) => {
        await confirmExecute(appointmentId);
        setConfirmationModalVisible(false);
        await execute(filterData);
    };

    const handleReject = async (appointmentId) => {
        debugger;
        await rejectExecute(appointmentId, rejectionReason);
        setIsRejectionModalVisible(false);
        await execute(filterData);
    };
    const handleFilter = async (filters) => {
        debugger;
        setPageNumber(1);
        setFilterData({ ...filterData, ...filters, pageNumber: 1 });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center mt-52">
                <span className="loading loading-spinner"></span>
            </div>
        );
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="col-span-2 bg-white bg-opacity-50 shadow-lg p-8 rounded-2xl">
            {isFilterVisible && (
                <div className="fixed inset-0 z-50 flex items-center  justify-center bg-black bg-opacity-50">
                    <AppointmentsFilterationComponent
                        onClose={() => setFilterVisible(false)}
                        onFilter={async (filters) => {
                            await handleFilter(filters);
                        }}
                    />
                </div>
            )}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="flex flex-row items-center justify-between mx-2 ">
                    <h3 className="text-2xl text-secondary font-bold">
                        Appointments
                    </h3>
                    <button
                        className="btn btn-sm btn-outline md:btn md:btn-outline"
                        onClick={() => setFilterVisible(true)}
                    >
                        <FiFilter />
                        Filter
                    </button>
                </div>
                <div className="overflow-x-auto w-full my-4">
                    <table className="table">
                        <thead className="uppercase font-bold text-secondary">
                            <tr>
                                <th>Id</th>
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
                                    <th>{appointment.id}</th>
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
                                                <button
                                                    className="btn btn-sm btn-success btn-outline"
                                                    onClick={() => {
                                                        setCurrentAppointment(
                                                            appointment
                                                        );
                                                        setConfirmationModalVisible(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    className="btn btn-sm text-white btn-error"
                                                    onClick={() => {
                                                        setCurrentAppointment(
                                                            appointment
                                                        );
                                                        setIsRejectionModalVisible(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {isConfirmationModalVisible && currentAppointment && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            id={`confirmation-modal-${currentAppointment.id}`}
                            className="fixed inset-0 flex items-center justify-center bg-secondary bg-opacity-20 overflow-auto z-50"
                        >
                            <div className="bg-white p-6 rounded-lg w-full shadow-lg z-50 max-w-xl mx-4 relative">
                                <h3 className="font-bold mb-4 text-secondary text-xl text-center">
                                    Confirm Appointment
                                </h3>
                                <div className="flex flox-row">
                                    <div className="flex flex-row client-info">
                                        <img
                                            src={
                                                currentAppointment.clientPhotoUrl
                                            }
                                            className="w-16 h-16"
                                            alt=""
                                        />
                                        <div className="ml-4 flex flex-col justify-center">
                                            <div className="h-6 font-bold">
                                                {currentAppointment.clientName}
                                            </div>
                                            <div className="h-4 text-info">
                                                {currentAppointment.clientEmail}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="properties flex flex-col gap-y-4 my-8 divide-y-2">
                                    <div className="flex flex-row justify-between items-center mx-4">
                                        <div className="text-md font-bold text-secondary">
                                            Date/Time
                                        </div>
                                        <div className="text-md font-bold  text-secondary">
                                            {formatDateTime(
                                                currentAppointment.startTime
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-row justify-between items-center mx-4">
                                        <div className="text-md font-bold text-secondary">
                                            Location
                                        </div>
                                        <div className="text-md font-bold  text-secondary">
                                            {currentAppointment.location}
                                        </div>
                                    </div>
                                    <div className="flex flex-row justify-between items-center mx-4">
                                        <div className="text-md font-bold text-secondary">
                                            Fees
                                        </div>
                                        <div className="text-md font-bold  text-secondary">
                                            {currentAppointment.fees} EGP
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flow-row justify-between mt-4">
                                    <button
                                        disabled={confirmIsLoading}
                                        className="btn btn-sm btn-success btn-outline"
                                        onClick={async () => {
                                            await handleConfirm(
                                                currentAppointment.id
                                            );
                                            toast.success(
                                                "Appointment Confirmed"
                                            );
                                        }}
                                    >
                                        {confirmIsLoading && (
                                            <span className="loading loading-spinner"></span>
                                        )}
                                        Confirm
                                    </button>
                                    <button
                                        className="btn btn-sm btn-ghost btn-outline"
                                        onClick={() =>
                                            setConfirmationModalVisible(false)
                                        }
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {isRejectionModalVisible && currentAppointment && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            id={`confirmation-modal-${currentAppointment.id}`}
                            className="fixed inset-0 flex items-center justify-center bg-secondary bg-opacity-20 overflow-auto z-50"
                        >
                            <div className="bg-white p-6 rounded-lg w-full shadow-lg z-50 max-w-xl mx-4 relative">
                                <h3 className="font-bold mb-4 text-secondary text-xl text-center">
                                    Reject Appointment
                                </h3>
                                <div className="flex flox-row">
                                    <div className="flex flex-row client-info">
                                        <img
                                            src={
                                                currentAppointment.clientPhotoUrl
                                            }
                                            className="w-16 h-16"
                                            alt=""
                                        />
                                        <div className="ml-4 flex flex-col justify-center">
                                            <div className="h-6 font-bold">
                                                {currentAppointment.clientName}
                                            </div>
                                            <div className="h-4 text-info">
                                                {currentAppointment.clientEmail}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="properties flex flex-col gap-y-4 mt-4 divide-y">
                                    <div className="flex flex-row justify-between items-center mx-4">
                                        <div className="text-md font-bold text-secondary">
                                            Date/Time
                                        </div>
                                        <div className="text-md font-bold  text-secondary">
                                            {formatDateTime(
                                                currentAppointment.startTime
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-row justify-between items-center mx-4">
                                        <div className="text-md font-bold text-secondary">
                                            Location
                                        </div>
                                        <div className="text-md font-bold  text-secondary">
                                            {currentAppointment.location}
                                        </div>
                                    </div>
                                    <div className="flex flex-row justify-between items-center mx-4">
                                        <div className="text-md font-bold text-secondary">
                                            Fees
                                        </div>
                                        <div className="text-md font-bold  text-secondary">
                                            {currentAppointment.fees} EGP
                                        </div>
                                    </div>
                                    <label className="form-control w-full">
                                        <div className="label">
                                            <span className="label-text text-secondary text-lg">
                                                Rejection Reason
                                            </span>
                                        </div>
                                        <textarea
                                            name="reason"
                                            type="text"
                                            placeholder="This is optional"
                                            className="textarea textarea-bordered textarea-sm w-full"
                                            onChange={(e) => {
                                                setRejectionReason(
                                                    e.target.value
                                                );
                                            }}
                                        />
                                    </label>
                                </div>

                                <div className="flex flow-row justify-between mt-4">
                                    <button
                                        disabled={rejectIsLoading}
                                        className="btn btn-sm btn-error btn-outline"
                                        onClick={async () => {
                                            await handleReject(
                                                currentAppointment.id
                                            );
                                            toast.success(
                                                "Appointment Rejected"
                                            );
                                        }}
                                    >
                                        {rejectIsLoading && (
                                            <span className="loading loading-spinner"></span>
                                        )}
                                        Reject
                                    </button>
                                    <button
                                        className="btn btn-sm btn-ghost btn-outline"
                                        onClick={() =>
                                            setIsRejectionModalVisible(false)
                                        }
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
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
        </div>
    );
}
