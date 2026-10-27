import { useCallback, useState } from "react";
import apiClient, { getApiErrorMessage } from "./client";

/**
 * Client for the single doctor-scheduling API.
 *
 * The server owns the definition of availability: weekly periods, time off and
 * the doctor's consultation duration are the only inputs. Slots are derived on
 * every request, so the portal never stores or guesses bookable times.
 */

export const WEEKDAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export const CONSULTATION_DURATIONS = [30, 45, 60];

export const DEFAULT_TIME_ZONES = [
    "UTC",
    "Africa/Cairo",
    "Africa/Nairobi",
    "Asia/Amman",
    "Asia/Beirut",
    "Asia/Dubai",
    "Asia/Karachi",
    "Asia/Kolkata",
    "Asia/Riyadh",
    "Europe/Berlin",
    "Europe/London",
    "Europe/Paris",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Australia/Sydney",
];

/** Local yyyy-mm-dd, without the UTC shift `toISOString()` would introduce. */
export const toIsoDate = (value) => {
    if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    return String(value).slice(0, 10);
};

export const todayIsoDate = () => toIsoDate(new Date());

/** Today's calendar date in a specific IANA zone, as yyyy-mm-dd. */
export const todayIsoDateIn = (timeZoneId) => {
    try {
        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: timeZoneId || "UTC",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).formatToParts(new Date());
        const value = (type) => parts.find((part) => part.type === type)?.value;
        return `${value("year")}-${value("month")}-${value("day")}`;
    } catch {
        return todayIsoDate();
    }
};

/** Add whole days to a yyyy-mm-dd string without a local-time shift. */
export const addDaysIsoDate = (value, amount) => {
    const date = new Date(`${toIsoDate(value)}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return toIsoDate(value);
    date.setUTCDate(date.getUTCDate() + amount);
    return date.toISOString().slice(0, 10);
};

const unwrap = async (request) => {
    try {
        const { data } = await request;
        return data;
    } catch (error) {
        throw new Error(getApiErrorMessage(error));
    }
};

export const getDoctorSchedule = (doctorId) =>
    unwrap(apiClient.get(`/api/doctors/${doctorId}/schedule`));

export const updateDoctorSchedule = (doctorId, schedule) =>
    unwrap(apiClient.put(`/api/doctors/${doctorId}/schedule`, schedule));

export const getDoctorTimeOff = (doctorId, from, to) =>
    unwrap(
        apiClient.get(`/api/doctors/${doctorId}/time-off`, {
            params: {
                ...(from ? { from: toIsoDate(from) } : {}),
                ...(to ? { to: toIsoDate(to) } : {}),
            },
        })
    );

export const createDoctorTimeOff = (doctorId, payload) =>
    unwrap(apiClient.post(`/api/doctors/${doctorId}/time-off`, payload));

export const deleteDoctorTimeOff = (doctorId, id) =>
    unwrap(apiClient.delete(`/api/doctors/${doctorId}/time-off/${id}`));

/**
 * Bookable slots for one local date, or a local date range.
 * The server returns `{ doctorId, timeZoneId, consultationDurationMinutes,
 * days: [{ date, slots: [{ startTime, endTime, durationMinutes }] }] }`.
 */
export const getDoctorAvailability = async (doctorId, { date, from, to } = {}) => {
    const params = date
        ? { date: toIsoDate(date) }
        : { from: toIsoDate(from), to: toIsoDate(to) };

    const response = await unwrap(
        apiClient.get(`/api/doctors/${doctorId}/slots`, { params })
    );

    return {
        ...response,
        days: (response?.days || []).map((day) => ({
            ...day,
            slots: (day.slots || []).map((slot) => ({
                ...slot,
                start: new Date(slot.startTime),
                end: new Date(slot.endTime),
            })),
        })),
    };
};

function useAsyncState() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const run = useCallback(async (request) => {
        setIsLoading(true);
        setError(null);
        try {
            return await request();
        } catch (requestError) {
            setError(requestError.message);
            throw requestError;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { isLoading, error, setError, run };
}

/** Loads and saves the weekly schedule, keeping one source of truth in state. */
export function useDoctorSchedule() {
    const [data, setData] = useState(null);
    const { isLoading, error, setError, run } = useAsyncState();

    const load = useCallback(
        (doctorId) =>
            run(async () => {
                const schedule = await getDoctorSchedule(doctorId);
                setData(schedule);
                return schedule;
            }),
        [run]
    );

    const save = useCallback(
        (doctorId, schedule) =>
            run(async () => {
                const saved = await updateDoctorSchedule(doctorId, schedule);
                setData(saved);
                return saved;
            }),
        [run]
    );

    return { data, setData, isLoading, error, setError, load, save };
}

/** Loads, creates and deletes time off. */
export function useDoctorTimeOff() {
    const [items, setItems] = useState([]);
    const { isLoading, error, setError, run } = useAsyncState();

    const load = useCallback(
        (doctorId, from, to) =>
            run(async () => {
                const timeOff = await getDoctorTimeOff(doctorId, from, to);
                setItems(timeOff || []);
                return timeOff;
            }),
        [run]
    );

    const create = useCallback(
        (doctorId, payload) =>
            run(async () => {
                const created = await createDoctorTimeOff(doctorId, payload);
                setItems((current) =>
                    [...current, created].sort((a, b) =>
                        `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)
                    )
                );
                return created;
            }),
        [run]
    );

    const remove = useCallback(
        (doctorId, id) =>
            run(async () => {
                await deleteDoctorTimeOff(doctorId, id);
                setItems((current) => current.filter((item) => item.id !== id));
            }),
        [run]
    );

    return { items, setItems, isLoading, error, setError, load, create, remove };
}
