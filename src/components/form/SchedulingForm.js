import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import {
    SCHEDULING_BLOCK_TYPES,
    SCHEDULING_OVERRIDE_TYPES,
} from "../../api/scheduling.api";

const WEEKDAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

const timeRequired = Yup.string().required("This time is required");

const Schemas = {
    break: Yup.object().shape({
        dayOfWeek: Yup.string().required("Weekday is required"),
        startTime: timeRequired,
        endTime: timeRequired.test(
            "is-greater",
            "End time must be greater than start time",
            function (value) {
                return value > this.parent.startTime;
            }
        ),
        name: Yup.string().max(200, "Name must not exceed 200 characters"),
    }),

    override: Yup.object().shape({
        date: Yup.string().required("Date is required"),
        type: Yup.string().required("Override type is required"),
        startTime: Yup.string().when("type", {
            is: (value) =>
                value === SCHEDULING_OVERRIDE_TYPES.UnavailableInterval ||
                value === SCHEDULING_OVERRIDE_TYPES.ReplaceWorkingHours ||
                value === SCHEDULING_OVERRIDE_TYPES.AdditionalWorkingSession,
            then: (schema) => schema.required("Start time is required"),
            otherwise: (schema) => schema.notRequired(),
        }),
        endTime: Yup.string()
            .when("type", {
                is: (value) =>
                    value === SCHEDULING_OVERRIDE_TYPES.UnavailableInterval ||
                    value === SCHEDULING_OVERRIDE_TYPES.ReplaceWorkingHours ||
                    value === SCHEDULING_OVERRIDE_TYPES.AdditionalWorkingSession,
                then: (schema) => schema.required("End time is required"),
                otherwise: (schema) => schema.notRequired(),
            })
            .test(
                "is-greater",
                "End time must be greater than start time",
                function (value) {
                    const { startTime } = this.parent;
                    if (!value || !startTime) return true;
                    return value > startTime;
                }
            ),
        privateReason: Yup.string().max(500, "Reason must not exceed 500 characters"),
    }),

    block: Yup.object().shape({
        startAt: Yup.string().required("Start date and time are required"),
        endAt: Yup.string()
            .required("End date and time are required")
            .test(
                "is-greater",
                "End must be after the start",
                function (value) {
                    return value > this.parent.startAt;
                }
            ),
        type: Yup.string().required("Block type is required"),
        privateReason: Yup.string().max(500, "Reason must not exceed 500 characters"),
    }),

    settings: Yup.object().shape({
        timeZoneId: Yup.string().required("Time zone is required"),
        slotIncrementMinutes: Yup.number()
            .required("Slot increment is required")
            .min(5, "Slot increment must be at least 5 minutes")
            .max(120, "Slot increment must not exceed 120 minutes"),
        bufferBeforeMinutes: Yup.number()
            .min(0, "Buffer before cannot be negative")
            .max(120, "Buffer before must not exceed 120 minutes"),
        bufferAfterMinutes: Yup.number()
            .min(0, "Buffer after cannot be negative")
            .max(120, "Buffer after must not exceed 120 minutes"),
        minimumNoticeMinutes: Yup.number()
            .min(0, "Minimum notice cannot be negative")
            .max(1440, "Minimum notice must not exceed 1440 minutes"),
        maxBookingDaysAhead: Yup.number()
            .required("Booking window is required")
            .min(1, "Booking window must be at least 1 day")
            .max(730, "Booking window must not exceed 730 days"),
    }),
};

const initialValues = {
    break: { dayOfWeek: "", startTime: "", endTime: "", name: "" },
    override: {
        date: "",
        type: "",
        startTime: "",
        endTime: "",
        privateReason: "",
    },
    block: { startAt: "", endAt: "", type: "", privateReason: "" },
    settings: {
        timeZoneId: "UTC",
        slotIncrementMinutes: 30,
        bufferBeforeMinutes: 0,
        bufferAfterMinutes: 0,
        minimumNoticeMinutes: 30,
        maxBookingDaysAhead: 90,
    },
};

const inputClass =
    "input input-bordered mt-1.5 w-full bg-base-100 text-neutral-900 placeholder:text-neutral-500 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20";
const labelClass = "block text-sm font-semibold text-neutral-700";
const errorClass = "mt-1.5 text-sm font-medium text-danger-700";

const FieldRow = ({ name, label, children }) => (
    <label className={labelClass}>
        {label}
        {children}
    </label>
);

/**
 * One form that covers every scheduling primitive. Splitting it per mode keeps
 * the validation rules (which differ per primitive) next to the fields they
 * govern instead of scattered across separate components.
 */
export const SchedulingForm = ({ mode, initialData, onSubmit, onCancel, loading = false }) => {
    const schema = Schemas[mode];
    const title = {
        break: "Add recurring break",
        override: "Add availability override",
        block: "Add time block",
        settings: "Scheduling settings",
    }[mode];

    const helperText = {
        break: "This time is removed from your weekly working hours on every matching weekday.",
        override: "A one-off change for a specific date, such as a full day of leave.",
        block: "A one-off block of time in UTC, for an errand or an external commitment.",
        settings: "Defaults the slot calculator uses when working out what to offer.",
    }[mode];

    const values = { ...initialValues[mode], ...initialData };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`scheduling-${mode}-title`}
            className="my-auto max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl border border-neutral-200 bg-base-100 p-5 shadow-2xl sm:p-7"
        >
            <Formik
                initialValues={values}
                validationSchema={schema}
                onSubmit={async (formValues, { setSubmitting }) => {
                    try {
                        await onSubmit(formValues);
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting, values: current }) => (
                    <Form className="space-y-5">
                        <div>
                            <h2
                                id={`scheduling-${mode}-title`}
                                className="text-xl font-bold text-neutral-900"
                            >
                                {title}
                            </h2>
                            <p className="mt-1 text-sm text-neutral-600">{helperText}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {mode === "break" && (
                                <>
                                    <FieldRow name="dayOfWeek" label="Day of week">
                                        <Field as="select" name="dayOfWeek" className={inputClass}>
                                            <option value="">Select a day</option>
                                            {WEEKDAYS.map((day) => (
                                                <option key={day} value={day}>
                                                    {day}
                                                </option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="dayOfWeek" component="div" className={errorClass} />
                                    </FieldRow>
                                    <FieldRow name="name" label="Name (optional)">
                                        <Field
                                            type="text"
                                            name="name"
                                            className={inputClass}
                                            placeholder="Lunch break"
                                        />
                                        <ErrorMessage name="name" component="div" className={errorClass} />
                                    </FieldRow>
                                    <FieldRow name="startTime" label="Start time">
                                        <Field type="time" name="startTime" className={inputClass} />
                                        <ErrorMessage name="startTime" component="div" className={errorClass} />
                                    </FieldRow>
                                    <FieldRow name="endTime" label="End time">
                                        <Field type="time" name="endTime" className={inputClass} />
                                        <ErrorMessage name="endTime" component="div" className={errorClass} />
                                    </FieldRow>
                                </>
                            )}

                            {mode === "override" && (
                                <>
                                    <FieldRow name="date" label="Date">
                                        <Field type="date" name="date" className={inputClass} />
                                        <ErrorMessage name="date" component="div" className={errorClass} />
                                    </FieldRow>
                                    <FieldRow name="type" label="Override type">
                                        <Field as="select" name="type" className={inputClass}>
                                            <option value="">Select a type</option>
                                            <option value={SCHEDULING_OVERRIDE_TYPES.FullDayLeave}>
                                                Full day leave
                                            </option>
                                            <option value={SCHEDULING_OVERRIDE_TYPES.UnavailableInterval}>
                                                Unavailable interval
                                            </option>
                                            <option value={SCHEDULING_OVERRIDE_TYPES.ReplaceWorkingHours}>
                                                Replace working hours
                                            </option>
                                            <option value={SCHEDULING_OVERRIDE_TYPES.AdditionalWorkingSession}>
                                                Additional working session
                                            </option>
                                        </Field>
                                        <ErrorMessage name="type" component="div" className={errorClass} />
                                    </FieldRow>

                                    {current.type !== SCHEDULING_OVERRIDE_TYPES.FullDayLeave && (
                                        <>
                                            <FieldRow name="startTime" label="Start time">
                                                <Field type="time" name="startTime" className={inputClass} />
                                                <ErrorMessage
                                                    name="startTime"
                                                    component="div"
                                                    className={errorClass}
                                                />
                                            </FieldRow>
                                            <FieldRow name="endTime" label="End time">
                                                <Field type="time" name="endTime" className={inputClass} />
                                                <ErrorMessage
                                                    name="endTime"
                                                    component="div"
                                                    className={errorClass}
                                                />
                                            </FieldRow>
                                        </>
                                    )}
                                </>
                            )}

                            {mode === "block" && (
                                <>
                                    <FieldRow name="startAt" label="Starts">
                                        <Field type="datetime-local" name="startAt" className={inputClass} />
                                        <ErrorMessage name="startAt" component="div" className={errorClass} />
                                    </FieldRow>
                                    <FieldRow name="endAt" label="Ends">
                                        <Field type="datetime-local" name="endAt" className={inputClass} />
                                        <ErrorMessage name="endAt" component="div" className={errorClass} />
                                    </FieldRow>
                                    <FieldRow name="type" label="Block type">
                                        <Field as="select" name="type" className={inputClass}>
                                            <option value="">Select a type</option>
                                            {Object.values(SCHEDULING_BLOCK_TYPES).map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="type" component="div" className={errorClass} />
                                    </FieldRow>
                                </>
                            )}

                            {mode === "settings" && (
                                <>
                                    <FieldRow name="timeZoneId" label="Time zone">
                                        <Field
                                            type="text"
                                            name="timeZoneId"
                                            className={inputClass}
                                            placeholder="Africa/Cairo"
                                        />
                                        <ErrorMessage
                                            name="timeZoneId"
                                            component="div"
                                            className={errorClass}
                                        />
                                    </FieldRow>
                                    <FieldRow name="slotIncrementMinutes" label="Slot increment (minutes)">
                                        <Field
                                            type="number"
                                            name="slotIncrementMinutes"
                                            className={inputClass}
                                        />
                                        <ErrorMessage
                                            name="slotIncrementMinutes"
                                            component="div"
                                            className={errorClass}
                                        />
                                    </FieldRow>
                                    <FieldRow name="bufferBeforeMinutes" label="Buffer before (minutes)">
                                        <Field
                                            type="number"
                                            name="bufferBeforeMinutes"
                                            className={inputClass}
                                        />
                                        <ErrorMessage
                                            name="bufferBeforeMinutes"
                                            component="div"
                                            className={errorClass}
                                        />
                                    </FieldRow>
                                    <FieldRow name="bufferAfterMinutes" label="Buffer after (minutes)">
                                        <Field
                                            type="number"
                                            name="bufferAfterMinutes"
                                            className={inputClass}
                                        />
                                        <ErrorMessage
                                            name="bufferAfterMinutes"
                                            component="div"
                                            className={errorClass}
                                        />
                                    </FieldRow>
                                    <FieldRow
                                        name="minimumNoticeMinutes"
                                        label="Minimum notice (minutes)"
                                    >
                                        <Field
                                            type="number"
                                            name="minimumNoticeMinutes"
                                            className={inputClass}
                                        />
                                        <ErrorMessage
                                            name="minimumNoticeMinutes"
                                            component="div"
                                            className={errorClass}
                                        />
                                    </FieldRow>
                                    <FieldRow name="maxBookingDaysAhead" label="Book up to (days ahead)">
                                        <Field type="number" name="maxBookingDaysAhead" className={inputClass} />
                                        <ErrorMessage
                                            name="maxBookingDaysAhead"
                                            component="div"
                                            className={errorClass}
                                        />
                                    </FieldRow>
                                </>
                            )}

                            {mode !== "settings" && (
                                <div className="sm:col-span-2">
                                    <FieldRow name="privateReason" label="Reason (optional)">
                                        <Field
                                            as="textarea"
                                            name="privateReason"
                                            className={`${inputClass} h-20`}
                                            placeholder="Visible only to you"
                                        />
                                        <ErrorMessage
                                            name="privateReason"
                                            component="div"
                                            className={errorClass}
                                        />
                                    </FieldRow>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:justify-end">
                            <button
                                type="submit"
                                className="btn btn-sm btn-primary"
                                disabled={isSubmitting || loading}
                            >
                                {(loading || isSubmitting) && <span className="loading loading-spinner" />}
                                {loading || isSubmitting ? "Saving…" : "Save"}
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
