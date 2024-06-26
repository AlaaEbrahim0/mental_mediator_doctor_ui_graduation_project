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

export const NewDayForm = ({ onSubmit, onCancel }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="my-4 p-4 border border-gray-300 rounded-lg"
        >
            <Formik
                initialValues={{
                    startTime: "",
                    endTime: "",
                    sessionDuration: "",
                    dayOfWeek: "",
                }}
                validationSchema={ScheduleValidationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    onSubmit(values);
                    setSubmitting(false);
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <div className="form-group">
                            <label className="block mb-2">Day of Week</label>
                            <Field
                                as="select"
                                name="dayOfWeek"
                                className="input input-bordered w-full mt-1"
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
                                className="text-red-600 mt-1"
                            />
                        </div>
                        <div className="form-group">
                            <label className="block mb-2">Start Time</label>
                            <Field
                                type="time"
                                name="startTime"
                                className="input input-bordered w-full mt-1"
                            />
                            <ErrorMessage
                                name="startTime"
                                component="div"
                                className="text-red-600 mt-1"
                            />
                        </div>
                        <div className="form-group">
                            <label className="block mb-2">End Time</label>
                            <Field
                                type="time"
                                name="endTime"
                                className="input input-bordered w-full mt-1"
                            />
                            <ErrorMessage
                                name="endTime"
                                component="div"
                                className="text-red-600 mt-1"
                            />
                        </div>
                        <div className="form-group">
                            <label className="block mb-2">
                                Session Duration (hh:mm:ss)
                            </label>
                            <Field
                                type="text"
                                name="sessionDuration"
                                className="input input-bordered w-full mt-1"
                                placeholder="hh:mm:ss"
                            />
                            <ErrorMessage
                                name="sessionDuration"
                                component="div"
                                className="text-red-600 mt-1"
                            />
                        </div>
                        <div className="flex justify-between">
                            <button
                                type="submit"
                                className="btn btn-sm btn-primary"
                                disabled={isSubmitting}
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
