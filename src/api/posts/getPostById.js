import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const getPostById = async (id) => {
    try {
        debugger;
        const response = await axios.get(`${url}/api/posts/${id}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const useGetPostById = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);

    const execute = async (id) => {
        try {
            setIsLoading(true);
            debugger;
            const post = await getPostById(id);
            setData(post);
            setIsLoading(false);
            return post;
        } catch (e) {
            setError(e);
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        data,
        setData,
        execute: useCallback(execute, []),
    };
};
