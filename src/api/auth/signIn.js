import { useState } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const SignIn = async (data) => {
    const { email, password } = data;
    try {
        const response = await axios.post(
            `${url}/api/auth/signin`,
            {
                email,
                password,
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

export const useSignIn = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = async (data) => {
        try {
            setIsLoading(true);
            const response = await SignIn(data);
            if (!response.roles.includes("Doctor")) {
                const error = {
                    errors: [
                        {
                            code: "Unauthorized",
                            description:
                                "You cannot be authenticated unless you are a doctor",
                        },
                    ],
                };
                throw error;
            }
            return response;
        } catch (e) {
            setError(e); // Set the error state with the response data
            setIsLoading(false);
            throw e;
        }
    };

    return {
        isLoading,
        error, // Expose the error state
        execute,
    };
};
