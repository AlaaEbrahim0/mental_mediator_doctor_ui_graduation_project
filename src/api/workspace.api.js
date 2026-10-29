import { useCallback, useEffect, useRef, useState } from "react";
import apiClient from "./client";

// Doctor workspace API client: dashboard metrics, the activity feed, and the
// notes / follow-ups the doctor owns. Every route is scoped to the caller on
// the server (`/api/doctors/me`), so no doctor id is ever sent from here.

const request = async (promise) => (await promise).data;

export const getDoctorDashboard = () =>
    request(apiClient.get("/api/doctors/me/dashboard"));

export const getDoctorActivity = (params = {}) =>
    request(apiClient.get("/api/doctors/me/activity", { params }));

export const getPatientNotes = (params = {}) =>
    request(apiClient.get("/api/doctors/me/notes", { params }));

export const createPatientNote = (payload) =>
    request(apiClient.post("/api/doctors/me/notes", payload));

export const updatePatientNote = (noteId, payload) =>
    request(apiClient.patch(`/api/doctors/me/notes/${noteId}`, payload));

export const getFollowUps = (params = {}) =>
    request(apiClient.get("/api/doctors/me/follow-ups", { params }));

export const createFollowUp = (payload) =>
    request(apiClient.post("/api/doctors/me/follow-ups", payload));

export const updateFollowUp = (followUpId, payload) =>
    request(apiClient.patch(`/api/doctors/me/follow-ups/${followUpId}`, payload));

/**
 * The dashboard snapshot.
 *
 * A refresh keeps the previous numbers on screen while the new ones load, so
 * the cards do not collapse to skeletons on every visit; the error is exposed
 * separately and does not clear the last good snapshot.
 */
export function useDoctorDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const requestIdRef = useRef(0);

    const load = useCallback(async () => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;

        setIsLoading(true);
        setError(null);

        try {
            const result = await getDoctorDashboard();
            if (requestIdRef.current !== requestId) return null;

            setDashboard(result);
            return result;
        } catch (requestError) {
            if (requestIdRef.current === requestId) {
                setError(requestError);
            }
            throw requestError;
        } finally {
            if (requestIdRef.current === requestId) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        load().catch(() => {});
    }, [load]);

    return { dashboard, isLoading, error, refresh: load };
}

/**
 * The merged activity feed. Same keep-last-good rule as the dashboard.
 */
export function useDoctorActivity(limit = 12) {
    const [activity, setActivity] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const requestIdRef = useRef(0);

    const load = useCallback(async () => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;

        setIsLoading(true);
        setError(null);

        try {
            const result = await getDoctorActivity({ limit });
            if (requestIdRef.current !== requestId) return null;

            setActivity(Array.isArray(result) ? result : []);
            return result;
        } catch (requestError) {
            if (requestIdRef.current === requestId) {
                setError(requestError);
            }
            throw requestError;
        } finally {
            if (requestIdRef.current === requestId) {
                setIsLoading(false);
            }
        }
    }, [limit]);

    useEffect(() => {
        load().catch(() => {});
    }, [load]);

    return { activity, isLoading, error, refresh: load };
}
