import { useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../auth/authProvider";

const getNews = async () => {
    try {
        let response = await axios.get("https://newsapi.org/v2/everything", {
            params: {
                q: "psychology OR Neuroscience OR Therapy OR Mental health OR Medical research OR Clinical psychology",
                sortBy: "relevancy",
                apiKey: "ca9c5ed021cb495cab719bfba0455567",
                pageSize: 20,
            },
        });
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
