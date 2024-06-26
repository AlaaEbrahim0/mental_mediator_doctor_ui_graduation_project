import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const editScheduleDay = async (doctorId, day, data) => {
    try {
        const response = await axios.put(
            `${url}/api/doctors/${doctorId}/schedule/days/${day}`,
            data
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const useEditScheduleDay = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const execute = useCallback(async (doctorId, day, newDay) => {
        setIsLoading(true);
        try {
            const data = await editScheduleDay(doctorId, day, newDay);
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
