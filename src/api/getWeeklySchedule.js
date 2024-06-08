import { useState, useCallback, useEffect } from "react";
import axios from "axios";
const url = process.env.REACT_APP_API_URL;

const getSchedule = async (doctorId) => {
    try {
        const response = await axios.get(
            `${url}/api/doctors/${doctorId}/schedule`
        );
        const data = await response.data;
        return data;
    } catch (error) {
        throw error;
    }
};

export const useSchedule = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const execute = async (userId) => {
        try {
            setIsLoading(true);
            debugger;
            const response = await getSchedule(userId);
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
