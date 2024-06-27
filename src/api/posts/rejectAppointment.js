import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const rejectAppointment = async (appointmentId, rejectionReason) => {
    try {
        const response = await axios.put(
            `${url}/api/appointments/${appointmentId}/reject`,
            {
                rejectionReason,
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const useRejectAppointment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const execute = useCallback(async (appointmentId, rejectionReason = "") => {
        setIsLoading(true);
        try {
            const data = await rejectAppointment(
                appointmentId,
                rejectionReason
            );
            setData(data);
            setIsLoading(false);
            return data;
        } catch (e) {
            setError(e);
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        data,
        setData,
        error,
        execute,
    };
};
