import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const deleteScheduleDay = async (doctorId, day) => {
    try {
        const response = await axios.delete(
            `${url}/api/doctors/${doctorId}/schedule/days/${day}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const useDeleteScheduleDay = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const execute = useCallback(async (doctorId, day) => {
        setIsLoading(true);
        try {
            const data = await deleteScheduleDay(doctorId, day);
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
