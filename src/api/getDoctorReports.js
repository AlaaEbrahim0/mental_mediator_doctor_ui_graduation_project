import { useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../auth/authProvider";

const url = process.env.REACT_APP_API_URL;

const GetReport = async (token) => {
    try {
        let response = await axios.get(`${url}/api/doctors/me/report`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const useGetDoctorReport = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const { token } = useAuth();

    const execute = useCallback(async () => {
        if (!token) {
            setError(new Error("No authentication token available"));
            return;
        }

        try {
            setIsLoading(true);
            const reportData = await GetReport(token);
            setData(reportData);
            return reportData;
        } catch (e) {
            setError(e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    return {
        isLoading,
        error,
        data,
        execute,
    };
};
