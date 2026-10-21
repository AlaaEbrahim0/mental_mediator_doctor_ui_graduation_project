import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";

const ScheduleValidationSchema = Yup.object().shape({
    dayOfWeek: Yup.string().required("Weekday is required"),
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

export const NewDayForm = ({ onSubmit, onCancel, loading = false }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-availability-title"
            className="my-auto max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl border border-neutral-200 bg-base-100 p-5 shadow-2xl sm:p-7"
        >
            <Formik
                initialValues={{
                    startTime: "",
                    endTime: "",
                    sessionDuration: "",
                    dayOfWeek: "",
                }}
                validationSchema={ScheduleValidationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    try {
                        await onSubmit(values);
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-5">
                        <div>
                            <h2 id="add-availability-title" className="text-xl font-bold text-neutral-900">Add availability</h2>
                            <p className="mt-1 text-sm text-neutral-600">Choose a day, then set the session hours and duration.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="block text-sm font-semibold text-neutral-700">Day of week
                            <Field
                                as="select"
                                name="dayOfWeek"
                                className="select select-bordered mt-1.5 w-full bg-base-100 text-neutral-900 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
                            >
                                <option value="">Select a day</option>
                                <option value="Sunday">Sunday</option>
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                            </Field>
                            <ErrorMessage
                                name="dayOfWeek"
                                component="div"
                                className="mt-1.5 text-sm font-medium text-danger-700"
                            />
                        </label>
                        <label className="block text-sm font-semibold text-neutral-700">Start time
                            <Field
                                type="time"
                                name="startTime"
                                className="input input-bordered mt-1.5 w-full bg-base-100 text-neutral-900 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
                            />
                            <ErrorMessage
                                name="startTime"
                                component="div"
                                className="mt-1.5 text-sm font-medium text-danger-700"
                            />
                        </label>
                        <label className="block text-sm font-semibold text-neutral-700">End time
                            <Field
                                type="time"
                                name="endTime"
                                className="input input-bordered mt-1.5 w-full bg-base-100 text-neutral-900 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
                            />
                            <ErrorMessage
                                name="endTime"
                                component="div"
                                className="mt-1.5 text-sm font-medium text-danger-700"
                            />
                        </label>
                        <label className="block text-sm font-semibold text-neutral-700">Session duration (hh:mm:ss)
                            <Field
                                type="text"
                                name="sessionDuration"
                                className="input input-bordered mt-1.5 w-full bg-base-100 text-neutral-900 placeholder:text-neutral-500 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
                                placeholder="hh:mm:ss"
                            />
                            <ErrorMessage
                                name="sessionDuration"
                                component="div"
                                className="mt-1.5 text-sm font-medium text-danger-700"
                            />
                        </label>
                        </div>
                        <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:justify-end">
                            <button
                                type="submit"
                                className="btn btn-sm btn-primary"
                                disabled={isSubmitting || loading}
                            >
                                {(loading || isSubmitting) && <span className="loading loading-spinner" />}
                                {loading || isSubmitting ? "Saving…" : "Save availability"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                onClick={onCancel}
                                disabled={isSubmitting || loading}
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
