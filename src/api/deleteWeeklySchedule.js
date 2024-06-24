import { useState, useCallback, useEffect } from "react";
import axios from "axios";
const url = process.env.REACT_APP_API_URL;

const deleteSchedule = async (doctorId) => {
    try {
        const response = await axios.delete(
            `${url}/api/doctors/${doctorId}/schedule`
        );
        const data = await response.data;
        return data;
    } catch (error) {
        throw error;
    }
};

export const useSchedule = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const execute = async (userId) => {
        try {
            debugger;
            setIsLoading(true);
            const response = await deleteSchedule(userId);
            setData(response);
            setIsLoading(false);
            return response;
        } catch (e) {
            setError(e);
            setIsLoading(false);
            console.log(e);
        }
    };

    return {
        isLoading,
        data,
        setData,
        error,
        execute: useCallback(execute, []),
    };
};
