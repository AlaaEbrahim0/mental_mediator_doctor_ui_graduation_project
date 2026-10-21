import React from "react";
import { Formik, Field, Form, FieldArray } from "formik";
import * as Yup from "yup";
import { useCreateSchedule } from "../../api/schedule.api";
import { useAuth } from "../../auth/authProvider";

import { AnimatePresence, motion } from "framer-motion";

const ScheduleValidationSchema = Yup.object().shape({
    weekDays: Yup.array()
        .of(
            Yup.object().shape({
                dayOfWeek: Yup.number().required("Weekday is required"),
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
            })
        )
        .min(1, "You must add at least one weekday")
        .max(7, "You can add up to 7 weekdays")
        .test(
            "no-duplicate-days",
            "Weekdays must be unique",
            function (weekDays) {
                const daySet = new Set(weekDays.map((day) => day.dayOfWeek));
                return daySet.size === weekDays.length;
            }
        ),
});

const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;
};

export const ScheduleForm = ({ onClose, onCreate }) => {
    const { userId } = useAuth();
    const { execute: createSchedule, isLoading } = useCreateSchedule();

    return (
        <Formik
            initialValues={{
                weekDays: [],
            }}
            validationSchema={ScheduleValidationSchema}
            onSubmit={async (values, { setSubmitting }) => {
                const formattedValues = {
                    weekDays: values.weekDays.map((day) => ({
                        ...day,
                        startTime: formatTime(day.startTime),
                        endTime: formatTime(day.endTime),
                    })),
                };

                try {
                    await createSchedule(userId, formattedValues);
                    setSubmitting(false);
                    onClose();
                    onCreate();
                } catch (error) {
                    console.error(
                        "There was an error creating the schedule:",
                        error
                    );
                    setSubmitting(false);
                }
            }}
        >
            {({ values, errors, touched, isSubmitting }) => (
                <Form className="space-y-5 rounded-2xl border border-neutral-200 bg-base-100 p-4 shadow-sm sm:p-6">
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-900">Weekly availability</h2>
                        <p className="mt-1 text-sm text-neutral-600">Add the days and appointment times you offer.</p>
                    </div>
                    {typeof errors.weekDays === "string" && <p role="alert" className="text-sm font-medium text-danger-700">{errors.weekDays}</p>}
                    <FieldArray name="weekDays">
                        {({ push, remove }) => (
                            <div>
                                <AnimatePresence>
                                    {values.weekDays.map((_, index) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            key={index}
                                            className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5"
                                        >
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <label className="block text-sm font-semibold text-neutral-700">
                                                Day of week
                                                <Field
                                                    as="select"
                                                    name={`weekDays[${index}].dayOfWeek`}
                                                    className="select select-bordered mt-1.5 w-full bg-base-100 text-neutral-900 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
                                                >
                                                    <option value="">
                                                        Select Day
                                                    </option>
                                                    <option value="0">
                                                        Sunday
                                                    </option>
                                                    <option value="1">
                                                        Monday
                                                    </option>
                                                    <option value="2">
                                                        Tuesday
                                                    </option>
                                                    <option value="3">
                                                        Wednesday
                                                    </option>
                                                    <option value="4">
                                                        Thursday
                                                    </option>
                                                    <option value="5">
                                                        Friday
                                                    </option>
                                                    <option value="6">
                                                        Saturday
                                                    </option>
                                                </Field>
                                                {touched.weekDays?.[index]
                                                    ?.dayOfWeek &&
                                                    errors.weekDays?.[index]
                                                        ?.dayOfWeek && (
                                                        <div role="alert" className="mt-1 text-sm font-medium text-danger-700">
                                                            {
                                                                errors.weekDays[
                                                                    index
                                                                ].dayOfWeek
                                                            }
                                                        </div>
                                                    )}
                                            </label>
                                            <label className="block text-sm font-semibold text-neutral-700">
                                                Start Time
                                                <Field
                                                    type="time"
                                                    name={`weekDays[${index}].startTime`}
                                                    className="input input-bordered mt-1.5 w-full bg-base-100 text-neutral-900 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
                                                />
                                                {touched.weekDays?.[index]
                                                    ?.startTime &&
                                                    errors.weekDays?.[index]
                                                        ?.startTime && (
                                                        <div role="alert" className="mt-1 text-sm font-medium text-danger-700">
                                                            {
                                                                errors.weekDays[
                                                                    index
                                                                ].startTime
                                                            }
                                                        </div>
                                                    )}
                                            </label>
                                            <label className="block text-sm font-semibold text-neutral-700">
                                                End Time
                                                <Field
                                                    type="time"
                                                    name={`weekDays[${index}].endTime`}
                                                    className="input input-bordered mt-1.5 w-full bg-base-100 text-neutral-900 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
                                                />
                                                {touched.weekDays?.[index]
                                                    ?.endTime &&
                                                    errors.weekDays?.[index]
                                                        ?.endTime && (
                                                        <div role="alert" className="mt-1 text-sm font-medium text-danger-700">
                                                            {
                                                                errors.weekDays[
                                                                    index
                                                                ].endTime
                                                            }
                                                        </div>
                                                    )}
                                            </label>
                                            <label className="block text-sm font-semibold text-neutral-700">
                                                Session Duration (hh:mm:ss)
                                                <Field
                                                    type="text"
                                                    name={`weekDays[${index}].sessionDuration`}
                                                    className="input input-bordered mt-1.5 w-full bg-base-100 text-neutral-900 placeholder:text-neutral-600 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
                                                    placeholder="hh:mm:ss"
                                                />
                                                {touched.weekDays?.[index]
                                                    ?.sessionDuration &&
                                                    errors.weekDays?.[index]
                                                        ?.sessionDuration && (
                                                        <div role="alert" className="mt-1 text-sm font-medium text-danger-700">
                                                            {
                                                                errors.weekDays[
                                                                    index
                                                                ]
                                                                    .sessionDuration
                                                            }
                                                        </div>
                                                    )}
                                            </label>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline btn-error mt-4"
                                                onClick={() => remove(index)}
                                            >
                                                Remove
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline border-primary-700 text-primary-800 hover:bg-primary-50"
                                    onClick={() =>
                                        push({
                                            dayOfWeek: "",
                                            startTime: "",
                                            endTime: "",
                                            sessionDuration: "",
                                        })
                                    }
                                    disabled={values.weekDays.length >= 7}
                                >
                                    Add Day
                                </button>
                            </div>
                        )}
                    </FieldArray>
                    <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:justify-end">
                    <button type="button" className="btn btn-ghost text-neutral-700" onClick={onClose} disabled={isSubmitting || isLoading}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn border-0 bg-primary-700 text-white hover:bg-primary-800"
                        disabled={isSubmitting || isLoading}
                    >
                        {isLoading && (
                            <span className="loading loading-spinner"></span>
                        )}
                        {isLoading || isSubmitting ? "Saving…" : "Save schedule"}
                    </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};
