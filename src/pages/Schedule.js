import React, { useEffect, useState } from "react";
import { ScheduleForm } from "../components/form/ScheduleForm";
import { CustomDeletionModal } from "../components/ui/CustomDeletionModal";
import { HiOutlineMenu } from "react-icons/hi";
import { motion } from "framer-motion";
import { useCreateScheduleDay, useDeleteSchedule, useDeleteScheduleDay, useEditScheduleDay, useSchedule } from "../api/schedule.api";
import { useAuth } from "../auth/authProvider";
import { FaPlus } from "react-icons/fa";
import { NewDayForm } from "../components/form/NewDayForm";
import toast from "react-hot-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
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

const EditDayForm = ({ initialData, onCancel, onSubmit, loading = false }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="my-4 rounded-xl border border-neutral-200 bg-base-100 p-4 shadow-sm"
        >
            <Formik
                initialValues={initialData}
                validationSchema={ScheduleValidationSchema}
                onSubmit={(values) => {
                    onSubmit(values);
                }}
            >
                {({ handleSubmit, isSubmitting }) => (
                    <Form onSubmit={handleSubmit} className="space-y-3">
                        <div className="mb-2">
                            <label className="block mb-1">Start Time</label>
                            <Field
                                type="time"
                                name="startTime"
                                className="input input-bordered w-full bg-base-100 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
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
                                className="input input-bordered w-full bg-base-100 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
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
                                className="input input-bordered w-full bg-base-100 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
                                placeholder="hh:mm:ss"
                            />
                            <ErrorMessage
                                name="sessionDuration"
                                component="div"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>
                        <div className="mt-4 flex flex-col-reverse justify-end gap-2 border-t border-neutral-200 pt-4 sm:flex-row">
                            <button
                                type="submit"
                                className="btn btn-sm btn-primary"
                                disabled={loading || isSubmitting}
                            >
                                {(loading || isSubmitting) && <span className="loading loading-spinner" />}
                                {loading || isSubmitting ? "Saving…" : "Save changes"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                onClick={onCancel}
                                disabled={loading || isSubmitting}
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
        execute: getSchedule,
    } = useSchedule();

    const {
        isLoading: isCreatingScheduleDayLoading,
        execute: createScheduleDay,
    } = useCreateScheduleDay();

    const {
        isLoading: isDeleteScheduleLoading,
        execute: deleteSchedule,
    } = useDeleteSchedule();

    const {
        execute: deleteScheduleDay,
    } = useDeleteScheduleDay();

    const { userId } = useAuth();
    const { execute: editScheduleDay, isLoading: editScheduleDayLoading } =
        useEditScheduleDay();
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
        <div className="mx-auto w-full min-w-0 px-0 text-neutral-800 sm:px-2">
            {!isScheduleLoading && (!schedule || schedule.weekDays.length === 0) && (
                <section className="mx-auto mt-4 flex max-w-3xl flex-col items-center rounded-2xl border border-neutral-200 bg-base-100 px-6 py-10 text-center shadow-sm sm:px-10" aria-labelledby="schedule-empty-title">
                    <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-neutral-100 text-primary-800"><FaPlus className="text-xl" /></div>
                    <h1 id="schedule-empty-title" className="text-2xl font-bold text-neutral-900">Set up your weekly availability</h1>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-neutral-600">Add the days and hours you are available so clients can request appointments that fit your schedule.</p>
                    <button className="btn btn-primary mt-6" onClick={() => setIsModalVisible(true)}>Create schedule</button>
                </section>
            )}
            {isModalVisible && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-2xl border border-neutral-200 bg-base-100 p-4 shadow-2xl sm:p-6">
                        <h3 className="font-bold text-lg mb-3">
                            Create Schedule
                        </h3>
                        <ScheduleForm
                            onClose={() => setIsModalVisible(false)}
                            onCreate={async () => await getSchedule(userId)}
                        />
                    </div>
                </div>
            )}

            {(isScheduleLoading || (schedule && schedule.weekDays.length > 0)) && <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col rounded-2xl border border-neutral-200 bg-base-100 p-4 shadow-sm sm:p-6">
                <div className="flex flex-row justify-between">
                    <div>
                    <h1 className="mb-1 text-xl font-bold text-neutral-900">
                        Weekly Schedule
                    </h1>
                    <p className="text-sm font-medium text-neutral-600">{schedule?.weekDays?.length || 0} available days</p>
                    </div>
                    {schedule && <div className="dropdown dropdown-end">
                        <button type="button" aria-label="Schedule actions" className="btn btn-ghost btn-sm m-1">
                            <HiOutlineMenu className="text-md md:text-xl" />
                        </button>
                        <ul
                            tabIndex={0}
                            className="dropdown-content z-[1] menu p-2 shadow rounded-box w-32"
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
                    </div>}
                </div>
                <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {isScheduleLoading && Array.from({ length: 3 }, (_, index) => <div key={index} className="h-44 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100" />)}
                    {!isScheduleLoading && schedule && (
                        <>
                            {schedule.weekDays.map((day, index) => (
                                <motion.div
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -2 }}
                                    key={index}
                                    className="min-w-0 rounded-xl border border-neutral-200 bg-base-100 p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h2 className="mb-2 text-xl font-bold text-neutral-900">{day.dayOfWeek}</h2>
                                            <span className="badge badge-outline badge-success text-xs font-semibold">Available</span>
                                        </div>
                                        <div className="dropdown dropdown-end">
                                            <button type="button" aria-label={`Actions for ${day.dayOfWeek}`} className="btn btn-ghost btn-sm m-1">
                                                <HiOutlineMenu className="text-md md:text-xl" />
                                            </button>
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
                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <div className="min-w-0 rounded-lg bg-neutral-50 p-3">
                                            <span className="block text-xs font-semibold uppercase tracking-wide text-neutral-600">Starts</span>
                                            <span className="mt-1 block truncate text-sm font-bold text-neutral-900">{day.startTime}</span>
                                        </div>
                                        <div className="min-w-0 rounded-lg bg-neutral-50 p-3">
                                            <span className="block text-xs font-semibold uppercase tracking-wide text-neutral-600">Ends</span>
                                            <span className="mt-1 block truncate text-sm font-bold text-neutral-900">{day.endTime}</span>
                                        </div>
                                        <p className="col-span-2 px-1 pt-1 text-sm text-neutral-700"><strong>Session duration:</strong> {day.sessionDuration}</p>
                                    </div>
                                    {editDayIndex === index && (
                                        <EditDayForm
                                            loading={editScheduleDayLoading}
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
                            {schedule.weekDays.length < 7 && <button
                                className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-neutral-700 transition-all duration-200 hover:border-primary/40 hover:bg-base-100 hover:shadow-md"
                                onClick={() => setIsNewDayFormVisible(true)}
                                type="button"
                                aria-label="Add availability for another day"
                            >
                                <FaPlus />
                                <span className="font-semibold">Add available day</span>
                            </button>}
                        </>
                    )}
                </div>

                {isNewDayFormVisible && (
                    <div className="fixed inset-0 z-modal flex items-center justify-center overflow-y-auto bg-slate-950/55 p-3 sm:p-6">
                        <NewDayForm
                            onSubmit={handleAddNewDay}
                            onCancel={() => setIsNewDayFormVisible(false)}
                            loading={isCreatingScheduleDayLoading}
                        />
                    </div>
                )}
            </div>}
        </div>
    );
};
