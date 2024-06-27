import React, { useEffect, useState } from "react";
import { ScheduleForm } from "../components/form/ScheduleForm";
import { CustomDeletionModal } from "../components/ui/CustomDeletionModal";
import { HiOutlineMenu } from "react-icons/hi";
import { motion } from "framer-motion";
import { useSchedule } from "../api/getWeeklySchedule";
import { useDeleteSchedule } from "../api/deleteWeeklySchedule";
import { useDeleteScheduleDay } from "../api/deleteWeeklyScheduleDay";
import { useAuth } from "../auth/authProvider";
import { useEditScheduleDay } from "../api/editWeeklyScheduleDay";
import { FaPlus } from "react-icons/fa";
import { useCreateSchedule } from "../api/createWeeklySchedule";
import { NewDayForm } from "../components/form/NewDayForm";
import { useCreateScheduleDay } from "../api/createWeeklyScheduleDay";
import toast from "react-hot-toast";
import { Formik, Form, Field, ErrorMessage, validateYupSchema } from "formik";
import * as Yup from "yup";

const ScheduleValidationSchema = Yup.object().shape({
    startTime: Yup.string().required("Start time is required"),
    endTime: Yup.string()
        .required("End time is required")
        .test(
            "is-greater",
            "End time must be greater than start time",
            function (value) {
                const { startTime } = this.parent;
                return value > startTime;
            }
        ),
    sessionDuration: Yup.string()
        .required("Session duration is required")
        .matches(
            /^(0?[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
            "Invalid duration format (hh:mm:ss)"
        )
        .test(
            "is-valid-duration",
            "Session duration must not exceed 1 hour",
            function (value) {
                const [hours, minutes, seconds] = value.split(":");
                const totalSeconds =
                    parseInt(hours) * 3600 +
                    parseInt(minutes) * 60 +
                    parseInt(seconds);
                return totalSeconds <= 3600;
            }
        ),
});

const EditDayForm = ({ initialData, onCancel, onSubmit }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="my-4 p-4 border border-gray-300 rounded-lg"
        >
            <Formik
                initialValues={initialData}
                validationSchema={ScheduleValidationSchema}
                onSubmit={(values) => {
                    onSubmit(values);
                }}
            >
                {({ handleSubmit }) => (
                    <Form onSubmit={handleSubmit}>
                        <div className="mb-2">
                            <label className="block mb-1">Start Time</label>
                            <Field
                                type="time"
                                name="startTime"
                                className="input input-bordered w-full"
                            />
                            <ErrorMessage
                                name="startTime"
                                component="div"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block mb-1">End Time</label>
                            <Field
                                type="time"
                                name="endTime"
                                className="input input-bordered w-full"
                            />
                            <ErrorMessage
                                name="endTime"
                                component="div"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block mb-1">
                                Session Duration (hh:mm:ss)
                            </label>
                            <Field
                                type="text"
                                name="sessionDuration"
                                className="input input-bordered w-full"
                                placeholder="hh:mm:ss"
                            />
                            <ErrorMessage
                                name="sessionDuration"
                                component="div"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>
                        <div className="flex justify-between mt-4">
                            <button
                                type="submit"
                                className="btn btn-sm btn-primary"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                onClick={onCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </motion.div>
    );
};

export const Schedule = () => {
    const {
        isLoading: isScheduleLoading,
        data: schedule,
        setData: setSchedule,
        error: scheduleError,
        execute: getSchedule,
    } = useSchedule();

    const {
        isLoading: isCreatingScheduleDayLoading,
        setData: setScheduleDay,
        error: CreatingScheduleDayError,
        execute: createScheduleDay,
    } = useCreateScheduleDay();

    const {
        isLoading: isDeleteScheduleLoading,
        error: scheduleDeletionError,
        execute: deleteSchedule,
    } = useDeleteSchedule();

    const {
        isLoading: isDeleteScheduleDayLoading,
        error: scheduleDayDeletionError,
        execute: deleteScheduleDay,
    } = useDeleteScheduleDay();

    const { userId } = useAuth();
    const { execute: editScheduleDay, isLoading: editScheduleDayLoading } =
        useEditScheduleDay();
    const { execute: createSchedule, isLoading: createScheduleLoading } =
        useCreateSchedule();

    const [editDayIndex, setEditDayIndex] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isNewDayFormVisible, setIsNewDayFormVisible] = useState(false);

    useEffect(() => {
        getSchedule(userId);
    }, [userId, getSchedule]);

    const handleDelete = async (id) => {
        await deleteSchedule(id);
        setSchedule(null);
    };

    const handleDayDelete = async (day) => {
        debugger;
        await deleteScheduleDay(userId, day);
        await getSchedule(userId);
    };

    const handleEditDay = (dayIndex) => {
        setEditDayIndex(dayIndex);
    };

    const handleCancelEdit = () => {
        setEditDayIndex(null);
    };

    const formatTime = (time) => {
        const [hours, minutes] = time.split(":");
        return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;
    };

    const handleSubmitEdit = async (editedDay) => {
        try {
            const editedData = {
                startTime: formatTime(editedDay.startTime),
                endTime: formatTime(editedDay.endTime),
                sessionDuration: editedDay.sessionDuration,
            };
            await editScheduleDay(
                userId,
                schedule.weekDays[editDayIndex].dayOfWeek,
                editedData
            );
            setEditDayIndex(null);
            getSchedule(userId);
        } catch (error) {
            console.error("Error editing day:", error);
        }
    };

    const handleAddNewDay = async (newDayData) => {
        try {
            debugger;
            const formattedData = {
                startTime: formatTime(newDayData.startTime),
                endTime: formatTime(newDayData.endTime),
                sessionDuration: newDayData.sessionDuration,
                dayOfWeek: newDayData.dayOfWeek,
            };
            await createScheduleDay(userId, formattedData);
            setIsNewDayFormVisible(false);
            getSchedule(userId);
        } catch (error) {
            console.error("Error adding new day:", error);
            toast.error("Cannot add duplicate days");
        }
    };

    return (
        <div className="container mx-auto md:px-4">
            {(!schedule || schedule.weekDays.length === 0) && (
                <div className="flex justify-center items-center mb-4 mt-2">
                    <button
                        className="btn"
                        onClick={() => setIsModalVisible(true)}
                    >
                        Create Schedule
                    </button>
                </div>
            )}
            {isModalVisible && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-2xl">
                        <h3 className="font-bold text-lg mb-3">
                            Create Schedule
                        </h3>
                        <ScheduleForm
                            onClose={() => setIsModalVisible(false)}
                            onCreate={async () => await getSchedule(userId)}
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

            <div className="flex flex-col rounded-xl shadow-lg p-6 max-w-6xl mx-auto">
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
                                            disabled={isDeleteScheduleLoading}
                                        >
                                            {isDeleteScheduleLoading && (
                                                <span className="loading loading-spinner"></span>
                                            )}{" "}
                                            Delete
                                        </button>
                                    </>
                                </li>
                                <CustomDeletionModal
                                    id="delete-schedule-modal"
                                    handleConfirm={async () => {
                                        await handleDelete(schedule.doctorId);
                                    }}
                                    loading={isDeleteScheduleLoading}
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
                                    className="p-8 hover:bg-base-200 rounded-xl shadow-lg"
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
                                                            onClick={() =>
                                                                handleEditDay(
                                                                    index
                                                                )
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
                                                        handleConfirm={async () =>
                                                            handleDayDelete(
                                                                schedule
                                                                    .weekDays[
                                                                    index
                                                                ].dayOfWeek
                                                            )
                                                        }
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
                                            <strong>End Time:</strong>{" "}
                                            {day.endTime}
                                        </p>
                                        <p>
                                            <strong>Session Duration:</strong>{" "}
                                            {day.sessionDuration}
                                        </p>
                                    </div>
                                    {editDayIndex === index && (
                                        <EditDayForm
                                            initialData={{
                                                startTime: day.startTime,
                                                endTime: day.endTime,
                                                sessionDuration:
                                                    day.sessionDuration,
                                            }}
                                            onCancel={handleCancelEdit}
                                            onSubmit={handleSubmitEdit}
                                        />
                                    )}
                                </motion.div>
                            ))}
                            <button
                                className="btn btn-secondary btn-outline h-full"
                                onClick={() => setIsNewDayFormVisible(true)}
                            >
                                <FaPlus />
                            </button>
                        </>
                    )}
                </div>

                {isNewDayFormVisible && (
                    <div className="fixed inset-0 z-20 flex items-center bg-black justify-center bg-opacity-50">
                        <NewDayForm
                            onSubmit={handleAddNewDay}
                            onCancel={() => setIsNewDayFormVisible(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
