import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../auth/authProvider"; // Adjust the import path as needed

const url = process.env.REACT_APP_API_URL;

const getAppointments = async (filters, token) => {
    try {
        const response = await axios.get(`${url}/api/appointments/doctors/me`, {
            params: filters,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const useGetAppointments = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const { token } = useAuth();

    const execute = useCallback(
        async (filters) => {
            if (!token) {
                setError(new Error("No authentication token available"));
                return;
            }

            try {
                setIsLoading(true);
                const appointments = await getAppointments(filters, token);
                setData(appointments);
            } catch (e) {
                setError(e);
            } finally {
                setIsLoading(false);
            }
        },
        [token]
    );

    useEffect(() => {
        if (token) {
            execute();
        }
    }, [token, execute]);

    return {
        isLoading,
        error,
        data,
        execute,
    };
};
