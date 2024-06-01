import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const deleteComment = async (postId, commentId) => {
    try {
        const response = await axios.delete(
            `${url}/api/posts/${postId}/comments/${commentId}`
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const useDeleteComment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);

    const execute = async (postId, commentId) => {
        try {
            setIsLoading(true);
            const comment = await deleteComment(postId, commentId);
            setData(comment);
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
