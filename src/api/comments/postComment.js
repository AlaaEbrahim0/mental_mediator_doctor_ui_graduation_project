import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const CreateComment = async (postId, content) => {
    try {
        const response = await axios.post(
            `${url}/api/posts/${postId}/comments`,
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

export const useCreateComment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const execute = async (postId, comment) => {
        try {
            debugger;
            setIsLoading(true);
            const response = await CreateComment(postId, comment);
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
