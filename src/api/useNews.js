import { useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../auth/authProvider";

const url = process.env.REACT_APP_API_URL;
const getNews = async () => {
    try {
        let response = await axios.get(`${url}/api/articles`, {});
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const useGetNews = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [news, setNews] = useState(null);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const execute = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await getNews(token);
            setNews(data);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    return {
        isLoading,
        error,
        news,
        execute,
    };
};
