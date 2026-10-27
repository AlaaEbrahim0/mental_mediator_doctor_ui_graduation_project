import React, { useCallback, useEffect, useState } from "react";
import { FiCalendar, FiClock } from "react-icons/fi";
import {
    Alert,
    Badge,
    Card,
    Field,
    Skeleton,
} from "../ui";
import {
    getDoctorAvailability,
    todayIsoDateIn,
} from "../../api/schedule.api";

/**
 * What a patient will actually be offered on a date.
 *
 * The server returns UTC instants plus the doctor's time zone. Rendering with
 * `Intl.DateTimeFormat({ timeZone })` keeps the preview in the same wall-clock
 * the doctor configured, regardless of the browser's own zone.
 */
export const AvailableSlotsPreview = ({
    doctorId,
    timeZoneId = "UTC",
    refreshKey = 0,
}) => {
    const [date, setDate] = useState(() => todayIsoDateIn(timeZoneId));
    const [availability, setAvailability] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        if (!doctorId || !date) return;

        setIsLoading(true);
        setError(null);
        try {
            setAvailability(await getDoctorAvailability(doctorId, { date }));
        } catch (requestError) {
            setError(requestError.message || "Could not load available slots.");
            setAvailability(null);
        } finally {
            setIsLoading(false);
        }
    }, [doctorId, date]);

    useEffect(() => {
        load();
    }, [load, refreshKey]);

    const slots = availability?.days?.[0]?.slots || [];
    const timeZone = availability?.timeZoneId || "UTC";

    const formatTime = (value) => {
        if (!(value instanceof Date) || Number.isNaN(value.getTime())) return "—";
        return new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone,
        }).format(value);
    };

    const formatDate = (value) => {
        if (!value) return "";
        return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <Card as="section" aria-labelledby="slots-preview-title">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 id="slots-preview-title" className="text-lg font-bold text-neutral-900">
                        Offered slots
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">
                        Preview the bookable windows after weekly periods, time off and active
                        appointments are applied.
                    </p>
                </div>
                <div className="w-full sm:w-48">
                    <Field id="slots-preview-date" label="Date">
                        <input
                            id="slots-preview-date"
                            type="date"
                            value={date}
                            onChange={(event) => setDate(event.target.value)}
                            className="input input-bordered h-12 w-full rounded-xl border-neutral-300 bg-base-100 text-neutral-900"
                        />
                    </Field>
                </div>
            </div>

            <div className="mt-4">
                {isLoading ? (
                    <div className="flex flex-wrap gap-2">
                        {[0, 1, 2, 3, 4].map((index) => (
                            <Skeleton key={index} className="h-10 w-24" />
                        ))}
                    </div>
                ) : error ? (
                    <Alert variant="error" title="Preview unavailable">
                        {error}
                    </Alert>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="info">
                                <FiCalendar aria-hidden="true" /> {formatDate(date)}
                            </Badge>
                            <Badge variant="neutral">
                                <FiClock aria-hidden="true" /> {availability?.consultationDurationMinutes || 30} min
                            </Badge>
                            <Badge variant={slots.length ? "success" : "warning"}>
                                {slots.length} slot{slots.length === 1 ? "" : "s"}
                            </Badge>
                        </div>

                        {slots.length === 0 ? (
                            <p className="mt-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
                                Nothing bookable on this date. Check the weekday periods, the time
                                zone and any time off.
                            </p>
                        ) : (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {slots.map((slot) => (
                                    <span
                                        key={slot.startTime}
                                        className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-semibold text-neutral-800"
                                    >
                                        {formatTime(slot.start)}–{formatTime(slot.end)}
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
};
