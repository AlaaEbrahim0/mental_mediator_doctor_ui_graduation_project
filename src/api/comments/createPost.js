import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const CreatePost = async (title, content, postPhoto) => {
    try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("photoPost", postPhoto);

        const response = await axios.post(`${url}/api/posts`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        throw error.response.data; // Throw the response data in case of error
    }
};

export const useCreatePost = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const execute = async (title, content, postPhoto) => {
        try {
            setIsLoading(true);
            const response = await CreatePost(title, content, postPhoto);
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
