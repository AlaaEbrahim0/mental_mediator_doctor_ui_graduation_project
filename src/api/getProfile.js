import { useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../auth/authProvider";

const url = process.env.REACT_APP_API_URL;
const GetProfile = async (token) => {
    try {
        let response = await axios.get(`${url}/api/doctors/me`);
        return response.data;
    } catch (error) {
        console.log(error);
        // throw error.response.data;
    }
};

export const useGetProfile = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const execute = useCallback(async () => {
        if (!token) return;
        try {
            setIsLoading(true);
            debugger;
            const data = await GetProfile(token);
            setIsLoading(false);
            return data;
        } catch (e) {
            setError(e);
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        execute,
    };
};
