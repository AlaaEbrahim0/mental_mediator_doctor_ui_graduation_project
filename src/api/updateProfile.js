import { useState, useCallback } from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("token");

const UpdateProfile = async (updateData) => {
    try {
        const formData = new FormData();
        formData.append("FirstName", updateData.firstName);
        formData.append("LastName", updateData.lastName);
        formData.append("BirthDate", updateData.birthDate);
        formData.append("Gender", updateData.gender);
        formData.append("Biography", updateData.biography);
        formData.append("Specialization", updateData.specialization);
        formData.append("SessionFees", updateData.fees);
        formData.append("Location", updateData.location);
        formData.append("City", updateData.city);
        if (updateData.photo) {
            formData.append("Photo", updateData.photo);
        }

        const response = await axios.put(`${url}/api/doctors/me`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const useUpdateProfile = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (updateData) => {
        try {
            setIsLoading(true);
            const updatedProfile = await UpdateProfile(updateData);
            setIsLoading(false);
            return updatedProfile;
        } catch (e) {
            setError(e);
            setIsLoading(false);
            throw e;
        }
    }, []);

    return {
        isLoading,
        error,
        execute,
    };
};
