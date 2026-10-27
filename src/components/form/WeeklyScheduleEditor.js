import React, { useEffect, useMemo, useState } from "react";
import {
    FiAlertCircle,
    FiClock,
    FiPlus,
    FiRotateCcw,
    FiSave,
    FiTrash2,
} from "react-icons/fi";
import {
    Alert,
    Badge,
    Button,
    Card,
    Field,
    Select,
} from "../ui";
import {
    CONSULTATION_DURATIONS,
    DEFAULT_TIME_ZONES,
    WEEKDAYS,
} from "../../api/schedule.api";

const emptyWeek = () =>
    WEEKDAYS.reduce((result, day) => ({ ...result, [day]: [] }), {});

const timeFromApi = (value) => String(value || "").slice(0, 5);
const timeToApi = (value) => (value.length === 5 ? `${value}:00` : value);

const minutesFromTime = (value) => {
    const [hours, minutes] = String(value || "").split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
};

const addMinutesToTime = (value, amount) => {
    const total = minutesFromTime(value);
    if (total == null) return "17:00";
    const next = Math.min(total + amount, 23 * 60 + 59);
    return `${String(Math.floor(next / 60)).padStart(2, "0")}:${String(next % 60).padStart(2, "0")}`;
};

const buildWeek = (schedule) => {
    const week = emptyWeek();
    (schedule?.periods || []).forEach((period) => {
        const day = period.dayOfWeek;
        if (!week[day]) return;
        week[day].push({
            id: period.id,
            startTime: timeFromApi(period.startTime),
            endTime: timeFromApi(period.endTime),
        });
    });

    Object.values(week).forEach((periods) =>
        periods.sort((a, b) => a.startTime.localeCompare(b.startTime))
    );

    return week;
};

const serialize = (week, timeZoneId, duration) =>
    JSON.stringify({ week, timeZoneId, duration });

export const WeeklyScheduleEditor = ({ schedule, onSave, isSaving = false }) => {
    const [week, setWeek] = useState(() => buildWeek(schedule));
    const [timeZoneId, setTimeZoneId] = useState(schedule?.timeZoneId || "UTC");
    const [duration, setDuration] = useState(schedule?.consultationDurationMinutes || 30);
    const [initial, setInitial] = useState(() =>
        serialize(
            buildWeek(schedule),
            schedule?.timeZoneId || "UTC",
            schedule?.consultationDurationMinutes || 30
        )
    );
    const [dayErrors, setDayErrors] = useState({});
    const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
        const nextWeek = buildWeek(schedule);
        const nextZone = schedule?.timeZoneId || "UTC";
        const nextDuration = schedule?.consultationDurationMinutes || 30;

        setWeek(nextWeek);
        setTimeZoneId(nextZone);
        setDuration(nextDuration);
        setInitial(serialize(nextWeek, nextZone, nextDuration));
        setDayErrors({});
        setSubmitError(null);
    }, [schedule]);

    const isDirty = useMemo(
        () => serialize(week, timeZoneId, duration) !== initial,
        [week, timeZoneId, duration, initial]
    );

    const timeZones = useMemo(() => {
        const supported =
            typeof Intl !== "undefined" && typeof Intl.supportedValuesOf === "function"
                ? Intl.supportedValuesOf("timeZone")
                : [];
        return Array.from(new Set([...DEFAULT_TIME_ZONES, ...supported, timeZoneId])).sort(
            (a, b) => a.localeCompare(b)
        );
    }, [timeZoneId]);

    const periodCount = WEEKDAYS.reduce((total, day) => total + week[day].length, 0);
    const workingDays = WEEKDAYS.filter((day) => week[day].length > 0).length;

    const updatePeriod = (day, index, patch) => {
        setWeek((current) => ({
            ...current,
            [day]: current[day].map((period, periodIndex) =>
                periodIndex === index ? { ...period, ...patch } : period
            ),
        }));
        setDayErrors((current) => ({ ...current, [day]: null }));
        setSubmitError(null);
    };

    const addPeriod = (day) => {
        setWeek((current) => {
            const periods = current[day];
            const last = periods[periods.length - 1];
            const startTime = last ? last.endTime : "09:00";
            const endTime = last
                ? addMinutesToTime(startTime, 120)
                : "17:00";

            return {
                ...current,
                [day]: [...periods, { startTime, endTime }],
            };
        });
        setDayErrors((current) => ({ ...current, [day]: null }));
        setSubmitError(null);
    };

    const removePeriod = (day, index) => {
        setWeek((current) => ({
            ...current,
            [day]: current[day].filter((_, periodIndex) => periodIndex !== index),
        }));
        setDayErrors((current) => ({ ...current, [day]: null }));
        setSubmitError(null);
    };

    const validate = () => {
        const errors = {};

        WEEKDAYS.forEach((day) => {
            const periods = [...week[day]].sort((a, b) =>
                a.startTime.localeCompare(b.startTime)
            );

            for (const period of periods) {
                if (!period.startTime || !period.endTime) {
                    errors[day] = "Each period needs a start and end time.";
                    return;
                }

                if (period.startTime >= period.endTime) {
                    errors[day] = "End time must be after start time.";
                    return;
                }
            }

            for (let index = 1; index < periods.length; index += 1) {
                if (periods[index].startTime < periods[index - 1].endTime) {
                    errors[day] = "Periods on the same day cannot overlap or be duplicated.";
                    return;
                }
            }
        });

        setDayErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleReset = () => {
        const nextWeek = buildWeek(schedule);
        setWeek(nextWeek);
        setTimeZoneId(schedule?.timeZoneId || "UTC");
        setDuration(schedule?.consultationDurationMinutes || 30);
        setDayErrors({});
        setSubmitError(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitError(null);

        if (!validate()) {
            return;
        }

        const payload = {
            timeZoneId,
            consultationDurationMinutes: Number(duration),
            periods: WEEKDAYS.flatMap((day) =>
                [...week[day]]
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((period) => ({
                        dayOfWeek: day,
                        startTime: timeToApi(period.startTime),
                        endTime: timeToApi(period.endTime),
                    }))
            ),
        };

        try {
            await onSave(payload);
        } catch (error) {
            setSubmitError(error.message || "Could not save the schedule.");
        }
    };

    return (
        <Card as="section" aria-labelledby="weekly-schedule-title">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h2 id="weekly-schedule-title" className="text-lg font-bold text-neutral-900">
                        Weekly availability
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-600">
                        Add every period you are bookable. Two periods on the same day create a
                        gap between them, so a lunch break needs no separate rule.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="primary">{workingDays} working days</Badge>
                    <Badge variant="neutral">{periodCount} periods</Badge>
                    <Badge variant="info">{duration} min consultations</Badge>
                </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field
                    id="schedule-time-zone"
                    label="Time zone"
                    hint="Weekly times and time off are interpreted in this zone."
                >
                    <Select
                        id="schedule-time-zone"
                        value={timeZoneId}
                        onChange={(event) => {
                            setTimeZoneId(event.target.value);
                            setSubmitError(null);
                        }}
                    >
                        {timeZones.map((zone) => (
                            <option key={zone} value={zone}>
                                {zone}
                            </option>
                        ))}
                    </Select>
                </Field>

                <Field
                    id="schedule-duration"
                    label="Consultation duration"
                    hint="The server always stores this duration; a patient cannot override it."
                >
                    <div
                        id="schedule-duration"
                        role="group"
                        aria-label="Consultation duration"
                        className="flex flex-wrap gap-2"
                    >
                        {CONSULTATION_DURATIONS.map((value) => (
                            <button
                                key={value}
                                type="button"
                                aria-pressed={duration === value}
                                onClick={() => {
                                    setDuration(value);
                                    setSubmitError(null);
                                }}
                                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                                    duration === value
                                        ? "border-primary-700 bg-primary-50 text-primary-900"
                                        : "border-neutral-300 bg-base-100 text-neutral-700 hover:border-neutral-400"
                                }`}
                            >
                                {value} min
                            </button>
                        ))}
                    </div>
                </Field>
            </div>

            <div className="mt-6 space-y-3">
                {WEEKDAYS.map((day) => {
                    const periods = week[day];
                    const error = dayErrors[day];

                    return (
                        <div
                            key={day}
                            className={`rounded-xl border p-3 transition-colors sm:p-4 ${
                                error
                                    ? "border-error/40 bg-error/5"
                                    : periods.length
                                      ? "border-neutral-200 bg-neutral-50/60"
                                      : "border-dashed border-neutral-300 bg-base-100"
                            }`}
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-neutral-900">{day}</h3>
                                    {periods.length ? (
                                        <Badge variant="success" size="sm">
                                            {periods.length} period{periods.length === 1 ? "" : "s"}
                                        </Badge>
                                    ) : (
                                        <Badge variant="neutral" size="sm">
                                            Unavailable
                                        </Badge>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addPeriod(day)}
                                >
                                    <FiPlus aria-hidden="true" /> Add period
                                </Button>
                            </div>

                            {periods.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {periods.map((period, index) => (
                                        <div
                                            key={`${day}-${index}`}
                                            className="flex flex-wrap items-center gap-2"
                                        >
                                            <label className="sr-only" htmlFor={`${day}-${index}-start`}>
                                                {day} period {index + 1} start time
                                            </label>
                                            <input
                                                id={`${day}-${index}-start`}
                                                type="time"
                                                value={period.startTime}
                                                onChange={(event) =>
                                                    updatePeriod(day, index, {
                                                        startTime: event.target.value,
                                                    })
                                                }
                                                className="input input-bordered h-10 w-32 bg-base-100 text-sm text-neutral-900"
                                            />
                                            <span className="text-sm font-medium text-neutral-500">to</span>
                                            <label className="sr-only" htmlFor={`${day}-${index}-end`}>
                                                {day} period {index + 1} end time
                                            </label>
                                            <input
                                                id={`${day}-${index}-end`}
                                                type="time"
                                                value={period.endTime}
                                                onChange={(event) =>
                                                    updatePeriod(day, index, {
                                                        endTime: event.target.value,
                                                    })
                                                }
                                                className="input input-bordered h-10 w-32 bg-base-100 text-sm text-neutral-900"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePeriod(day, index)}
                                                aria-label={`Remove ${day} period ${index + 1}`}
                                                className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-base-100 text-neutral-600 transition hover:border-error/40 hover:bg-error/5 hover:text-error"
                                            >
                                                <FiTrash2 aria-hidden="true" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {error && (
                                <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm font-medium text-error">
                                    <FiAlertCircle aria-hidden="true" /> {error}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {submitError && (
                <Alert variant="error" title="Schedule was not saved" className="mt-5">
                    {submitError}
                </Alert>
            )}

            <div className="mt-5 flex flex-col-reverse justify-between gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center">
                <p className="flex items-center gap-2 text-xs text-neutral-600">
                    <FiClock aria-hidden="true" />
                    {periodCount === 0
                        ? "No periods: patients will not see any bookable slots."
                        : `${periodCount} period${periodCount === 1 ? "" : "s"} across ${workingDays} day${workingDays === 1 ? "" : "s"}.`}
                </p>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={!isDirty || isSaving}
                    >
                        <FiRotateCcw aria-hidden="true" /> Reset
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        loading={isSaving}
                        loadingText="Saving…"
                        disabled={!isDirty && Boolean(schedule)}
                    >
                        <FiSave aria-hidden="true" /> Save schedule
                    </Button>
                </div>
            </div>
        </Card>
    );
};
