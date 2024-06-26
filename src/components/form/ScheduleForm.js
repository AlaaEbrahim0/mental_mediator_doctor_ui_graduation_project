import React from "react";
import { Formik, Field, Form, FieldArray } from "formik";
import * as Yup from "yup";
import { useCreateSchedule } from "../../api/createWeeklySchedule";
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
                <Form className="p-4 rounded-lg shadow-lg">
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
                                            className="mb-4 p-4 border border-gray-300 rounded-lg"
                                        >
                                            <label className="block mb-2">
                                                Day of Week
                                                <Field
                                                    as="select"
                                                    name={`weekDays[${index}].dayOfWeek`}
                                                    className="select select-bordered w-full mt-1"
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
                                                        <div className="text-red-500">
                                                            {
                                                                errors.weekDays[
                                                                    index
                                                                ].dayOfWeek
                                                            }
                                                        </div>
                                                    )}
                                            </label>
                                            <label className="block mb-2">
                                                Start Time
                                                <Field
                                                    type="time"
                                                    name={`weekDays[${index}].startTime`}
                                                    className="input input-bordered w-full mt-1"
                                                />
                                                {touched.weekDays?.[index]
                                                    ?.startTime &&
                                                    errors.weekDays?.[index]
                                                        ?.startTime && (
                                                        <div className="text-red-500">
                                                            {
                                                                errors.weekDays[
                                                                    index
                                                                ].startTime
                                                            }
                                                        </div>
                                                    )}
                                            </label>
                                            <label className="block mb-2">
                                                End Time
                                                <Field
                                                    type="time"
                                                    name={`weekDays[${index}].endTime`}
                                                    className="input input-bordered w-full mt-1"
                                                />
                                                {touched.weekDays?.[index]
                                                    ?.endTime &&
                                                    errors.weekDays?.[index]
                                                        ?.endTime && (
                                                        <div className="text-red-500">
                                                            {
                                                                errors.weekDays[
                                                                    index
                                                                ].endTime
                                                            }
                                                        </div>
                                                    )}
                                            </label>
                                            <label className="block mb-2">
                                                Session Duration (hh:mm:ss)
                                                <Field
                                                    type="text"
                                                    name={`weekDays[${index}].sessionDuration`}
                                                    className="input input-bordered w-full mt-1"
                                                    placeholder="hh:mm:ss"
                                                />
                                                {touched.weekDays?.[index]
                                                    ?.sessionDuration &&
                                                    errors.weekDays?.[index]
                                                        ?.sessionDuration && (
                                                        <div className="text-red-500">
                                                            {
                                                                errors.weekDays[
                                                                    index
                                                                ]
                                                                    .sessionDuration
                                                            }
                                                        </div>
                                                    )}
                                            </label>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-error mt-2"
                                                onClick={() => remove(index)}
                                            >
                                                Remove
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary btn-outline mt-4"
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
                    <button
                        type="submit"
                        className="btn btn-sm btn-success mt-4"
                        disabled={isSubmitting || isLoading}
                    >
                        {isLoading && (
                            <span className="loading loading-spinner"></span>
                        )}
                        Submit
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-secondary mt-4 ml-2"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </Form>
            )}
        </Formik>
    );
};
