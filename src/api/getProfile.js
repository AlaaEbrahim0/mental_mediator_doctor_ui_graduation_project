import { useState, useCallback } from "react";
import axios from "axios";

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
        console.log(error);
        throw error.response.data;
    }
};

export const useGetProfile = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (token) => {
        try {
            setIsLoading(true);
            const data = await GetProfile(token);
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
