import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const deleteReply = async (postId, commentId, replyId) => {
    try {
        const response = await axios.delete(
            `${url}/api/posts/${postId}/comments/${commentId}/replies/${replyId}`
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const useDeleteReply = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);

    const execute = async (postId, commentId, replyId) => {
        try {
            setIsLoading(true);
            const reply = await deleteReply(postId, commentId, replyId);
            setData(reply);
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
