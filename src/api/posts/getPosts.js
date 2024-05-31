import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const getPosts = async (pageNumber, pageSize) => {
    try {
        const response = await axios.get(`${url}/api/posts`, {
            params: { pageNumber, pageSize },
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const useGetPosts = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);

    const execute = async (pageNumber = 1, pageSize = 20) => {
        try {
            setIsLoading(true);
            const posts = await getPosts(pageNumber, pageSize);
            setData((prevData) => [...prevData, ...posts]);
            setIsLoading(false);
            setPage(pageNumber);

            return posts;
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
        page,
        execute: useCallback(execute, []),
    };
};
