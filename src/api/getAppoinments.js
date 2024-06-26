import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const getAppointments = async (filters) => {
    try {
        debugger;
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
            const appointments = await getAppointments(filters);
            setData(appointments);
            setIsLoading(false);
        } catch (e) {
            setError(e);
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        data,
        execute: useCallback(execute, []),
    };
};
