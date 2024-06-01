import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const getComments = async (postId) => {
    try {
        const response = await axios.get(`${url}/api/posts/${postId}/comments`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const useGetComments = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);

    const execute = async (postId) => {
        try {
            setIsLoading(true);
            const comments = await getComments(postId);
            setData(comments);
            setIsLoading(false);
        } catch (e) {
            setError(e);
            setIsLoading(false);
            throw e;
        }
    };

    return {
        isLoading,
        error,
        data,
        execute: useCallback(execute, []),
    };
};
