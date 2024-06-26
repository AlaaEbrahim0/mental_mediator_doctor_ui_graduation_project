import { useState, useCallback, useEffect } from "react";
import axios from "axios";
const url = process.env.REACT_APP_API_URL;

const createSchedule = async (doctorId, schedule) => {
    try {
        const response = await axios.post(
            `${url}/api/doctors/${doctorId}/schedule`,
            schedule
        );
        const data = await response.data;
        return data;
    } catch (error) {
        throw error;
    }
};

export const useCreateSchedule = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const execute = async (doctorId, schedule) => {
        try {
            setIsLoading(true);
            const response = await createSchedule(doctorId, schedule);
            setData(response);
            setIsLoading(false);
            return response;
        } catch (e) {
            setError(e);
            setIsLoading(false);
            throw e;
        }
    };

    return {
        isLoading,
        data,
        setData,
        error,
        execute: useCallback(execute, []),
    };
};
