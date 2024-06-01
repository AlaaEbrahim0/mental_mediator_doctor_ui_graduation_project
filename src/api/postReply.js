import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const CreateReply = async (postId, commentId, reply) => {
    try {
        const response = await axios.post(
            `${url}/api/posts/${postId}/comments/${commentId}/replies`,
            {
                content: reply,
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

export const useCreateReply = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const execute = async (postId, commentId, reply) => {
        try {
            setIsLoading(true);
            const response = await CreateReply(postId, commentId, reply);
            setData(response);
            setIsLoading(false);
            return response;
        } catch (e) {
            setError(e); // Set the error state with the response data
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
