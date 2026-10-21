import { useCallback, useState } from "react";
import { useAuth } from "../auth/authProvider";
import apiClient from "./client";

export const getDoctorAppointments = async (filters) => {
    const { data } = await apiClient.get("/api/appointments/doctors/me", { params: filters });
    return data;
};

export const confirmAppointment = async (appointmentId) => {
    const { data } = await apiClient.put(`/api/appointments/${appointmentId}/confirm`);
    return data;
};

export const rejectAppointment = async (appointmentId, rejectionReason = "") => {
    const { data } = await apiClient.put(`/api/appointments/${appointmentId}/reject`, { rejectionReason });
    return data;
};

export const completeAppointment = async (appointmentId) => {
    const { data } = await apiClient.put(`/api/appointments/${appointmentId}/complete`);
    return data;
};

export const getDoctorReport = async () => {
    const { data } = await apiClient.get("/api/doctors/me/report");
    return data;
};

export function useGetAppointments() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const { token } = useAuth();
    const execute = useCallback(async (filters) => {
        if (!token) {
            setError(new Error("No authentication token available"));
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const appointments = await getDoctorAppointments(filters);
            setData(appointments);
            return appointments;
        } catch (requestError) {
            setError(requestError.response?.data || requestError);
            return undefined;
        } finally {
            setIsLoading(false);
        }
    }, [token]);
    return { isLoading, error, data, execute };
}

function useAppointmentDecision(action) {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const execute = useCallback(async (...args) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await action(...args);
            setData(result);
            return result ?? true;
        } catch (requestError) {
            setError(requestError);
            throw requestError;
        } finally {
            setIsLoading(false);
        }
    }, [action]);
    return { isLoading, data, setData, error, execute };
}

export function useConfirmAppointment() {
    return useAppointmentDecision(confirmAppointment);
}

export function useRejectAppointment() {
    return useAppointmentDecision(rejectAppointment);
}

export function useCompleteAppointment() {
    return useAppointmentDecision(completeAppointment);
}

export function useGetDoctorReport() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const { token } = useAuth();
    const execute = useCallback(async () => {
        if (!token) {
            setError(new Error("No authentication token available"));
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const report = await getDoctorReport();
            setData(report);
            return report;
        } catch (requestError) {
            setError(requestError.response?.data || requestError);
            throw requestError;
        } finally {
            setIsLoading(false);
        }
    }, [token]);
    return { isLoading, error, data, execute };
}
