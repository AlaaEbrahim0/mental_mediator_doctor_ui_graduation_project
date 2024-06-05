import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const UpdateComment = async (postId, commentId, content) => {
    try {
        const response = await axios.put(
            `${url}/api/posts/${postId}/comments/${commentId}`,
            {
                content,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data; // Throw the response data in case of error
    }
};

export const useUpdateComment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const execute = async (postId, commentId, comment) => {
        try {
            setIsLoading(true);
            const response = await UpdateComment(postId, commentId, comment);
            setData(response);
            setIsLoading(false);
            return response;
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
