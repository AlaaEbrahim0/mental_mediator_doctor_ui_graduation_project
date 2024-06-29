import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const getSchedule = async (doctorId) => {
    try {
        const response = await axios.get(
            `${url}/api/doctors/${doctorId}/schedule`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const useSchedule = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const execute = useCallback(async (doctorId) => {
        setIsLoading(true);
        try {
            const data = await getSchedule(doctorId);
            setData(data);
            setIsLoading(false);
            return data.sort((a) => a.weekDay);
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
