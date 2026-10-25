import { useCallback, useState } from "react";
import apiClient, { getApiErrorMessage } from "./client";

/**
 * Client for the reconciled doctor-scheduling API.
 *
 * The backend computes availability from four inputs (weekly working hours,
 * recurring breaks, date overrides, UTC time blocks). These helpers manage the
 * *inputs*; the slot calculation itself lives on the server so the doctor
 * portal and any other client share one definition of "available".
 */

// The API sends enums as strings (JsonStringEnumConverter) but older payloads
// have been seen as integers. The maps carry the numeric member value so a
// numeric payload can be mapped back to its name.
const normalizeEnumValue = (value, byName) => {
    if (typeof value === "string" && byName[value] !== undefined) return value;
    if (typeof value === "number") {
        const match = Object.entries(byName).find(([, memberValue]) => memberValue === value);
        if (match) return match[0];
    }
    return value;
};

export const SCHEDULING_OVERRIDE_TYPES = {
    FullDayLeave: 0,
    UnavailableInterval: 1,
    ReplaceWorkingHours: 2,
    AdditionalWorkingSession: 3,
};

export const SCHEDULING_BLOCK_TYPES = {
    Break: 0,
    PersonalCommitment: 1,
    Administrative: 2,
    Emergency: 3,
    Other: 4,
};

/** ISO date (yyyy-mm-dd) for query strings; the API takes DateOnly. */
const toIsoDate = (date) => (date instanceof Date ? date.toISOString().slice(0, 10) : String(date));

/** The backend stores time blocks in UTC; the UI works in local wall-clock. */
const toIsoUtc = (value) => (value instanceof Date ? value.toISOString() : value);

const unwrap = async (request) => {
    try {
        const { data } = await request;
        return data;
    } catch (error) {
        throw new Error(getApiErrorMessage(error));
    }
};

export const getSchedulingSettings = (doctorId) =>
    unwrap(apiClient.get(`/api/doctors/${doctorId}/scheduling/settings`));

export const updateSchedulingSettings = (doctorId, settings) =>
    unwrap(apiClient.put(`/api/doctors/${doctorId}/scheduling/settings`, settings));

export const getRecurringBreaks = (doctorId) =>
    unwrap(apiClient.get(`/api/doctors/${doctorId}/scheduling/breaks`));

export const createRecurringBreak = (doctorId, payload) =>
    unwrap(apiClient.post(`/api/doctors/${doctorId}/scheduling/breaks`, payload));

export const deleteRecurringBreak = (doctorId, id) =>
    unwrap(apiClient.delete(`/api/doctors/${doctorId}/scheduling/breaks/${id}`));

export const getAvailabilityOverrides = (doctorId, from, to) =>
    unwrap(
        apiClient.get(`/api/doctors/${doctorId}/scheduling/overrides`, {
            params: { from: toIsoDate(from), to: toIsoDate(to) },
        })
    );

export const createAvailabilityOverride = (doctorId, payload) =>
    unwrap(apiClient.post(`/api/doctors/${doctorId}/scheduling/overrides`, payload));

export const deleteAvailabilityOverride = (doctorId, id) =>
    unwrap(apiClient.delete(`/api/doctors/${doctorId}/scheduling/overrides/${id}`));

export const getTimeBlocks = (doctorId, fromUtc, toUtc) =>
    unwrap(
        apiClient.get(`/api/doctors/${doctorId}/scheduling/blocks`, {
            params: { fromUtc: toIsoUtc(fromUtc), toUtc: toIsoUtc(toUtc) },
        })
    );

export const createTimeBlock = (doctorId, payload) =>
    unwrap(apiClient.post(`/api/doctors/${doctorId}/scheduling/blocks`, payload));

export const cancelTimeBlock = (doctorId, id) =>
    unwrap(apiClient.put(`/api/doctors/${doctorId}/scheduling/blocks/${id}/cancel`));

/**
 * Bookable instants for a doctor on a local date. The server returns UTC ISO
 * strings; convert to Date so the UI can render them in the doctor's zone.
 */
export const getAvailableSlots = async (doctorId, date) => {
    const slots = await unwrap(
        apiClient.get(`/api/doctors/${doctorId}/slots`, {
            params: { dateTime: toIsoDate(date) },
        })
    );

    return (slots || []).map((slot) => new Date(slot));
};

/**
 * Shared mutation hook used by the scheduling sections. Each section owns its
 * own request function; this only supplies the loading/error/data plumbing.
 */
function useSchedulingMutation(request) {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const execute = useCallback(
        async (...args) => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await request(...args);
                setData(result);
                return result;
            } catch (requestError) {
                const message = getApiErrorMessage(requestError);
                setError(message);
                throw new Error(message);
            } finally {
                setIsLoading(false);
            }
        },
        [request]
    );

    return { isLoading, data, setData, error, execute };
}

export const useGetSchedulingSettings = () =>
    useSchedulingMutation(getSchedulingSettings);
export const useUpdateSchedulingSettings = () =>
    useSchedulingMutation(updateSchedulingSettings);
export const useGetRecurringBreaks = () => useSchedulingMutation(getRecurringBreaks);
export const useCreateRecurringBreak = () => useSchedulingMutation(createRecurringBreak);
export const useDeleteRecurringBreak = () => useSchedulingMutation(deleteRecurringBreak);
export const useGetAvailabilityOverrides = () =>
    useSchedulingMutation(getAvailabilityOverrides);
export const useCreateAvailabilityOverride = () =>
    useSchedulingMutation(createAvailabilityOverride);
export const useDeleteAvailabilityOverride = () =>
    useSchedulingMutation(deleteAvailabilityOverride);
export const useGetTimeBlocks = () => useSchedulingMutation(getTimeBlocks);
export const useCreateTimeBlock = () => useSchedulingMutation(createTimeBlock);
export const useCancelTimeBlock = () => useSchedulingMutation(cancelTimeBlock);
export const useGetAvailableSlots = () => useSchedulingMutation(getAvailableSlots);

export { normalizeEnumValue };
