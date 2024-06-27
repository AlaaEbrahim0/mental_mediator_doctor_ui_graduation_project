import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const confirmAppointment = async (appointmentId) => {
    try {
        const response = await axios.put(
            `${url}/api/appointments/${appointmentId}/confirm`  
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const useConfirmAppointment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const execute = useCallback(async (appointmentId) => {
        setIsLoading(true);
        try {
            const data = await confirmAppointment(appointmentId);
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
