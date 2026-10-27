import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiCalendar, FiClock, FiPlus, FiTrash2 } from "react-icons/fi";
import {
    Alert,
    Badge,
    Button,
    Card,
    ConfirmDialog,
    Field,
    Input,
} from "../ui";
import {
    addDaysIsoDate,
    todayIsoDateIn,
    useDoctorTimeOff,
} from "../../api/schedule.api";

const formatDate = (value) => {
    if (!value) return "—";
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const formatTime = (value) => String(value || "").slice(0, 5);

const spansMultipleDates = (item) =>
    Boolean(item.endDate) && item.endDate !== item.date;

const formatDateRange = (item) =>
    spansMultipleDates(item)
        ? `${formatDate(item.date)} – ${formatDate(item.endDate)}`
        : formatDate(item.date);

const formatAvailability = (item) => {
    if (item.isFullDay) {
        return spansMultipleDates(item) ? "All days" : "All day";
    }

    if (spansMultipleDates(item)) {
        return `${formatTime(item.startTime)} on the first day – ${formatTime(item.endTime)} on the last day`;
    }

    return `${formatTime(item.startTime)}–${formatTime(item.endTime)}`;
};

export const TimeOffSection = ({ doctorId, timeZoneId = "UTC", onChanged }) => {
    const {
        items: timeOffItems,
        isLoading: isLoadingTimeOff,
        load: loadTimeOff,
        create: createTimeOff,
        remove: removeTimeOff,
    } = useDoctorTimeOff();
    const today = todayIsoDateIn(timeZoneId);
    const [date, setDate] = useState(() => todayIsoDateIn(timeZoneId));
    const [endDate, setEndDate] = useState("");
    const [isFullDay, setIsFullDay] = useState(true);
    const [startTime, setStartTime] = useState("12:00");
    const [endTime, setEndTime] = useState("13:00");
    const [reason, setReason] = useState("");
    const [formError, setFormError] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const load = useCallback(() => {
        if (!doctorId) return;

        const from = todayIsoDateIn(timeZoneId);
        loadTimeOff(doctorId, from, addDaysIsoDate(from, 365)).catch((error) => {
            toast.error(error.message || "Could not load time off.");
        });
    }, [doctorId, loadTimeOff, timeZoneId]);

    useEffect(() => {
        load();
    }, [load]);

    const resetForm = () => {
        setDate(today);
        setEndDate("");
        setIsFullDay(true);
        setStartTime("12:00");
        setEndTime("13:00");
        setReason("");
        setFormError(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError(null);

        if (!date) {
            setFormError("Choose a date.");
            return;
        }

        if (endDate && endDate < date) {
            setFormError("The end date must not be before the start date.");
            return;
        }

        if (!isFullDay) {
            if (!startTime || !endTime) {
                setFormError("Start time and end time are required.");
                return;
            }

            const singleDate = !endDate || endDate === date;
            if (singleDate && startTime >= endTime) {
                setFormError("End time must be after start time.");
                return;
            }
        }

        try {
            await createTimeOff(doctorId, {
                date,
                endDate: endDate || null,
                isFullDay,
                startTime: isFullDay ? null : `${startTime}:00`,
                endTime: isFullDay ? null : `${endTime}:00`,
                reason: reason.trim() || null,
            });
            toast.success("Time off added.");
            resetForm();
            onChanged?.();
        } catch (error) {
            setFormError(error.message || "Could not add time off.");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setIsDeleting(true);
        try {
            await removeTimeOff(doctorId, deleteTarget.id);
            toast.success("Time off removed.");
            setDeleteTarget(null);
            onChanged?.();
        } catch (error) {
            toast.error(error.message || "Could not remove time off.");
            throw error;
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card as="section" aria-labelledby="time-off-title">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 id="time-off-title" className="text-lg font-bold text-neutral-900">
                        Time off
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-600">
                        One-off dates, date ranges, or partial days when you are unavailable. A range
                        blocks the whole interval from its first date through its last date. Existing
                        Pending or Confirmed appointments are never silently cancelled: a conflicting
                        request is rejected until those appointments are rescheduled or cancelled.
                    </p>
                </div>
                <Badge variant="neutral">{timeOffItems.length} upcoming</Badge>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Field id="time-off-date" label="From date" required>
                        <Input
                            id="time-off-date"
                            type="date"
                            value={date}
                            min={today}
                            onChange={(event) => {
                                const nextDate = event.target.value;
                                setDate(nextDate);
                                if (endDate && endDate < nextDate) {
                                    setEndDate(nextDate);
                                }
                                setFormError(null);
                            }}
                            required
                        />
                    </Field>

                    <Field
                        id="time-off-end-date"
                        label="To date"
                        hint="Leave empty for a single day."
                    >
                        <Input
                            id="time-off-end-date"
                            type="date"
                            value={endDate}
                            min={date || today}
                            onChange={(event) => {
                                setEndDate(event.target.value);
                                setFormError(null);
                            }}
                        />
                    </Field>

                    <div className="flex items-end pb-1">
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-neutral-800">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-primary checkbox-sm"
                                checked={isFullDay}
                                onChange={(event) => {
                                    setIsFullDay(event.target.checked);
                                    setFormError(null);
                                }}
                            />
                            Entire days
                        </label>
                    </div>

                    {!isFullDay && (
                        <>
                            <Field id="time-off-start" label="From" required>
                                <Input
                                    id="time-off-start"
                                    type="time"
                                    value={startTime}
                                    onChange={(event) => {
                                        setStartTime(event.target.value);
                                        setFormError(null);
                                    }}
                                    required
                                />
                            </Field>
                            <Field id="time-off-end" label="To" required>
                                <Input
                                    id="time-off-end"
                                    type="time"
                                    value={endTime}
                                    onChange={(event) => {
                                        setEndTime(event.target.value);
                                        setFormError(null);
                                    }}
                                    required
                                />
                            </Field>
                        </>
                    )}

                    <div className="sm:col-span-2 lg:col-span-3">
                        <Field id="time-off-reason" label="Reason (optional)">
                            <Input
                                id="time-off-reason"
                                type="text"
                                value={reason}
                                maxLength={500}
                                placeholder="Conference, personal leave…"
                                onChange={(event) => {
                                    setReason(event.target.value);
                                    setFormError(null);
                                }}
                            />
                        </Field>
                    </div>
                </div>

                {formError && (
                    <Alert variant="error" title="Time off was not added" className="mt-3">
                        {formError}
                    </Alert>
                )}

                <div className="mt-3 flex justify-end">
                    <Button type="submit" loading={isLoadingTimeOff} loadingText="Adding…">
                        <FiPlus aria-hidden="true" /> Add time off
                    </Button>
                </div>
            </form>

            <div className="mt-5">
                {isLoadingTimeOff && timeOffItems.length === 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                        {[0, 1].map((index) => (
                            <div key={index} className="h-20 animate-pulse rounded-xl bg-neutral-100" />
                        ))}
                    </div>
                ) : timeOffItems.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-neutral-300 bg-base-100 p-4 text-sm text-neutral-600">
                        No upcoming time off. Your weekly periods are the only limits right now.
                    </p>
                ) : (
                    <ul className="grid gap-2 sm:grid-cols-2">
                        {timeOffItems.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 bg-base-100 p-4"
                            >
                                <div className="min-w-0">
                                    <p className="flex items-center gap-2 font-semibold text-neutral-900">
                                        <FiCalendar aria-hidden="true" className="text-neutral-500" />
                                        {formatDateRange(item)}
                                    </p>
                                    <p className="mt-1 flex items-center gap-2 text-sm text-neutral-700">
                                        <FiClock aria-hidden="true" className="text-neutral-400" />
                                        {formatAvailability(item)}
                                    </p>
                                    {item.reason && (
                                        <p className="mt-1 truncate text-sm text-neutral-600">{item.reason}</p>
                                    )}
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Stored as {new Date(item.startTimeUtc).toISOString()}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    aria-label={`Remove time off on ${formatDateRange(item)}`}
                                    onClick={() => setDeleteTarget(item)}
                                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition hover:border-error/40 hover:bg-error/5 hover:text-error"
                                >
                                    <FiTrash2 aria-hidden="true" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <ConfirmDialog
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Remove time off?"
                message={
                    deleteTarget
                        ? `Remove ${formatDateRange(deleteTarget)} from your time off? The slots become bookable again.`
                        : ""
                }
                confirmLabel="Remove"
                loading={isDeleting}
            />
        </Card>
    );
};
