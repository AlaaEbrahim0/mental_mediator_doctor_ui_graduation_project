import { useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../auth/authProvider";

const url = process.env.REACT_APP_API_URL;

const getSchedule = async (doctorId, token) => {
    try {
        const response = await axios.get(
            `${url}/api/doctors/${doctorId}/schedule`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
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
    const { token } = useAuth();

    const execute = useCallback(async (doctorId) => {
        setIsLoading(true);
        try {
            const data = await getSchedule(doctorId, token);
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
