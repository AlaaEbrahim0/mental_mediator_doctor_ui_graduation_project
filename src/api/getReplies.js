import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const getReplies = async (postId, commentId) => {
    try {
        const response = await axios.get(
            `${url}/api/posts/${postId}/comments/${commentId}/replies`
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const useGetReplies = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);

    const execute = async (postId, commentId) => {
        try {
            setIsLoading(true);
            const replies = await getReplies(postId, commentId);
            setData(replies);
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
