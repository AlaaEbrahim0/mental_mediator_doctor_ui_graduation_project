import { useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../auth/authProvider";

const url = process.env.REACT_APP_API_URL;
const GetReport = async () => {
    try {
        let response = await axios.get(`${url}/api/doctors/me/report`);
        return response.data;
    } catch (error) {
        console.log(error);
        // throw error.response.data;
    }
};

export const useGetDoctorReport = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const execute = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await GetReport();
            setData(data);
            setIsLoading(false);
            return data;
        } catch (e) {
            setError(e);
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        data,
        execute,
    };
};
