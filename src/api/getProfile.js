import { useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../auth/authProvider";

const url = process.env.REACT_APP_API_URL;

const GetProfile = async (token) => {
    try {
        const response = await axios.get(`${url}/api/doctors/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const useGetProfile = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const execute = useCallback(async () => {
        if (!token) {
            setError(new Error("No authentication token available"));
            return;
        }
        try {
            setIsLoading(true);
            const data = await GetProfile(token);
            return data;
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
        execute,
    };
};
