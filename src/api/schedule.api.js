import { useCallback, useState } from "react";
import { useAuth } from "../auth/authProvider";
import apiClient from "./client";

const weekdayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const weekdayPosition = (day) => {
    const value = day?.dayOfWeek ?? day?.weekDay;
    if (typeof value === "number" || /^\d+$/.test(String(value))) return Number(value);
    const position = weekdayOrder.findIndex((weekday) => weekday.toLowerCase() === String(value || "").toLowerCase());
    return position < 0 ? weekdayOrder.length : position;
};

export const getDoctorSchedule = async (doctorId) => {
    const { data } = await apiClient.get(`/api/doctors/${doctorId}/schedule`);
    return data;
};
export const createDoctorSchedule = async (doctorId, schedule) => {
    const { data } = await apiClient.post(`/api/doctors/${doctorId}/schedule`, schedule);
    return data;
};
export const deleteDoctorSchedule = async (doctorId) => {
    const { data } = await apiClient.delete(`/api/doctors/${doctorId}/schedule`);
    return data;
};
export const createDoctorScheduleDay = async (doctorId, dayData) => {
    const { data } = await apiClient.post(`/api/doctors/${doctorId}/schedule/days`, dayData);
    return data;
};
export const updateDoctorScheduleDay = async (doctorId, day, dayData) => {
    const { data } = await apiClient.put(`/api/doctors/${doctorId}/schedule/days/${day}`, dayData);
    return data;
};
export const deleteDoctorScheduleDay = async (doctorId, day) => {
    const { data } = await apiClient.delete(`/api/doctors/${doctorId}/schedule/days/${day}`);
    return data;
};

function useScheduleMutation(request) {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const execute = useCallback(async (...args) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await request(...args);
            setData(result);
            return result;
        } catch (requestError) {
            setError(requestError);
            throw requestError;
        } finally {
            setIsLoading(false);
        }
    }, [request]);
    return { isLoading, data, setData, error, execute };
}

export function useSchedule() {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const { token } = useAuth();
    const execute = useCallback(async (doctorId) => {
        if (!token) {
            const authError = new Error("No authentication token available");
            setError(authError);
            return;
        }
        setIsLoading(true);
        try {
            const response = await getDoctorSchedule(doctorId);
            const schedule = Array.isArray(response) ? { weekDays: response } : response && typeof response === "object" ? response : { weekDays: [] };
            const normalized = {
                ...schedule,
                weekDays: Array.isArray(schedule.weekDays) ? [...schedule.weekDays].sort((a, b) => weekdayPosition(a) - weekdayPosition(b)) : [],
            };
            setData(normalized);
            setError(null);
            return normalized;
        } catch (requestError) {
            setError(requestError);
            throw requestError;
        } finally {
            setIsLoading(false);
        }
    }, [token]);
    return { isLoading, data, setData, error, execute };
}

export const useCreateSchedule = () => useScheduleMutation(createDoctorSchedule);
export const useDeleteSchedule = () => useScheduleMutation(deleteDoctorSchedule);
export const useCreateScheduleDay = () => useScheduleMutation(createDoctorScheduleDay);
export const useEditScheduleDay = () => useScheduleMutation(updateDoctorScheduleDay);
export const useDeleteScheduleDay = () => useScheduleMutation(deleteDoctorScheduleDay);
