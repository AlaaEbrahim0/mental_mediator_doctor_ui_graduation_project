import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const getAppointments = async (filters) => {
    try {
        const response = await axios.get(`${url}/api/appointments/doctors/me`, {
            params: filters,
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const useGetAppointments = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);

    const execute = async (filters) => {
        try {
            setIsLoading(true);
            const replies = await getAppointments(filters);
            setData(replies);
            setIsLoading(false);
        } catch (e) {
            setError(e);
            setIsLoading(false);
            throw e;
        }
    };

    return {
        isLoading,
        error,
        data,
        execute: useCallback(execute, []),
    };
};
