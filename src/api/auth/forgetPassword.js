import { useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const url = process.env.REACT_APP_API_URL;

const forgetPassword = async (email) => {
    try {
        const response = await axios.post(
            `${url}/api/auth/send-reset-password-link?email=${email}`
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const useForgetPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);

    const execute = async (email) => {
        try {
            setIsLoading(true);
            await forgetPassword(email);
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
