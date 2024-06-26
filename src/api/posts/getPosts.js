import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const getPosts = async (pageNumber, pageSize, filters) => {
    try {
        const response = await axios.get(`${url}/api/posts`, {
            params: {
                pageNumber,
                pageSize,
                title: filters.title,
                content: filters.content,
                username: filters.username,
                startTime: filters.from || "0001-01-01",
                endTime: filters.to || "0001-01-01",
                confessionsOnly: filters.showConfessions,
            },
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
    const [hasMore, setHasMore] = useState(true);

    const execute = async (pageNumber = 1, pageSize = 50, filters) => {
        try {
            setIsLoading(true);
            const posts = await getPosts(pageNumber, pageSize, filters);
            setData((prevData) => [...prevData, ...posts]);
            setIsLoading(false);
            setPage(pageNumber);
            setHasMore(posts.length === pageSize);

            return posts;
        } catch (e) {
            setError(e);
            setIsLoading(false);
            throw e;
        }
    };

    const reset = () => {
        setData([]);
        setPage(1);
        setHasMore(true);
    };

    return {
        isLoading,
        error,
        data,
        setData,
        page,
        hasMore,
        execute: useCallback(execute, []),
        reset,
    };
};
