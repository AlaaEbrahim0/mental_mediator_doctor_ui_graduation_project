import React, { useEffect, useState } from "react";
import { ScheduleForm } from "../components/form/ScheduleForm";
import { CustomDeletionModal } from "../components/ui/CustomDeletionModal";
import { HiOutlineMenu } from "react-icons/hi";
import { motion } from "framer-motion";
import { useSchedule } from "../api/getWeeklySchedule";
import { useAuth } from "../auth/authProvider";
const WeekdaySchedule = () => {
    const {
        isLoading: isScheduleLoading,
        data: schedule,
        setData: setSchedule,
        error: scheduleError,
        execute: getSchedule,
    } = useSchedule();

    const { userId } = useAuth();

    useEffect(() => {
        debugger;
        getSchedule(userId);
    }, [userId, getSchedule]);

    useEffect(() => {
        if (schedule) {
            console.log("Fetched schedule:", schedule);
        }
    }, [schedule]);

    const handleDelete = (id) => {
        console.log("Delete:", id);
    };

    console.log("Schedule:", schedule);
    return (
        <div className="flex flex-col rounded-xl shadow-lg p-6  max-w-6xl mx-auto">
            <div className="flex flex-row justify-between">
                <h1 className="text-xl text-center font-bold mb-2">
                    Weekly Schedule
                </h1>
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="m-1">
                        <HiOutlineMenu className="text-md md:text-xl" />
                    </div>
                    <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32"
                    >
                        <>
                            <li className="mb-1">
                                <button
                                    className="btn btn-sm btn-secondary btn-outline text-md"
                                    // onClick={() =>
                                    //     setUpdateModalVisible(true)
                                    // } // Show update modal on click
                                >
                                    Edit
                                </button>
                            </li>
                            <li className="mb-1">
                                <>
                                    <button
                                        className="btn btn-sm btn-error btn-outline text-md"
                                        onClick={() =>
                                            document
                                                .getElementById(
                                                    "delete-schedule-modal"
                                                )
                                                .showModal()
                                        }
                                    >
                                        Delete
                                    </button>
                                </>
                            </li>
                            <CustomDeletionModal
                                id={"delete-schedule-modal"}
                                // handleConfirm={async () => handleDelete(id)}
                                // loading={postDeletionLoading}
                            />
                        </>
                    </ul>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {isScheduleLoading && (
                    <span className="loading loading-spinner"></span>
                )}
                {!isScheduleLoading && schedule && (
                    <>
                        {schedule.weekDays.map((day, index) => (
                            <motion.div
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.05 }}
                                key={index}
                                className="p-8  hover:bg-base-200 rounded-xl shadow-lg"
                            >
                                <div className="flex flex-row justify-between">
                                    <h2 className="text-xl text-center font-bold mb-2">
                                        {day.dayOfWeek}
                                    </h2>
                                    <div className="dropdown dropdown-end">
                                        <div
                                            tabIndex={0}
                                            role="button"
                                            className="m-1"
                                        >
                                            <HiOutlineMenu className="text-md md:text-xl" />
                                        </div>
                                        <ul
                                            tabIndex={0}
                                            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32"
                                        >
                                            <>
                                                <li className="mb-1">
                                                    <button
                                                        className="btn btn-sm btn-secondary btn-outline text-md"
                                                        onClick={
                                                            () => 5
                                                            // setUpdateModalVisible(true)
                                                        }
                                                    >
                                                        Edit
                                                    </button>
                                                </li>
                                                <li className="mb-1">
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-error btn-outline text-md"
                                                            onClick={() =>
                                                                document
                                                                    .getElementById(
                                                                        "delete-day-modal-" +
                                                                            index
                                                                    )
                                                                    .showModal()
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                </li>
                                                <CustomDeletionModal
                                                    id={
                                                        "delete-day-modal-" +
                                                        index
                                                    }
                                                    handleConfirm={async (id) =>
                                                        handleDelete(id)
                                                    }
                                                    // loading={
                                                    //     postDeletionLoading
                                                    // }
                                                />
                                            </>
                                        </ul>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p>
                                        <strong>Start Time:</strong>{" "}
                                        {day.startTime}
                                    </p>
                                    <p>
                                        <strong>End Time:</strong> {day.endTime}
                                    </p>
                                    <p>
                                        <strong>Session Duration:</strong>{" "}
                                        {day.sessionDuration}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </>
                )}

                {!isScheduleLoading && !schedule === 0 && (
                    <div>Your schedule is empty</div>
                )}
            </div>
        </div>
    );
};

export const Schedule = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    return (
        <div className="container mx-auto md:px-4">
            <div className="flex justify-center items-center mb-4 mt-2">
                <button className="btn" onClick={() => setIsModalVisible(true)}>
                    Create Schedule
                </button>
            </div>
            {isModalVisible && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-2xl">
                        <h3 className="font-bold text-lg mb-3">
                            Create Schedule
                        </h3>
                        <ScheduleForm
                            onClose={() => setIsModalVisible(false)}
                        />
                        <div className="modal-action">
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setIsModalVisible(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <WeekdaySchedule />
        </div>
    );
};

const EditScheduleForm = ({ initialValues, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialValues);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-control">
                <label htmlFor="dayOfWeek">Day of Week:</label>
                <input
                    type="text"
                    id="dayOfWeek"
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-control">
                <label htmlFor="startTime">Start Time:</label>
                <input
                    type="text"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-control">
                <label htmlFor="endTime">End Time:</label>
                <input
                    type="text"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-control">
                <label htmlFor="sessionDuration">Session Duration:</label>
                <input
                    type="text"
                    id="sessionDuration"
                    name="sessionDuration"
                    value={formData.sessionDuration}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-actions">
                <button type="submit" className="btn btn-primary mr-2">
                    Save
                </button>
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};
