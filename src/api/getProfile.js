import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const GetProfile = async () => {
    try {
        const response = await axios.get(`${url}/api/doctors/me`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const useGetProfile = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await GetProfile();
            setIsLoading(false);
            return data;
        } catch (e) {
            setError(e);
            setIsLoading(false);
            throw e;
        }
    }, []);

    return {
        isLoading,
        error,
        execute,
    };
};
