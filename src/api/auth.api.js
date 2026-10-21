import { useCallback, useState } from "react";
import apiClient, { getApiErrorMessages } from "./client";

export const signIn = async ({ email, password }) => {
    const { data } = await apiClient.post("/api/auth/signin", { email, password });
    return data;
};

export const requestPasswordReset = async (email) => {
    const { data } = await apiClient.post("/api/auth/send-reset-password-link", null, { params: { email } });
    return data;
};

export const getDoctorProfile = async () => {
    const { data } = await apiClient.get("/api/doctors/me");
    return data;
};

export const updateDoctorProfile = async (updateData) => {
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
    formData.append("PhoneNumber", updateData.phoneNumber || "");
    formData.append("Qualifications", updateData.qualifications || "");
    formData.append("IsAvailable", String(Boolean(updateData.isAvailable)));
    if (updateData.photo) formData.append("Photo", updateData.photo);
    const { data } = await apiClient.put("/api/doctors/me", formData);
    return data;
};

export function useSignIn() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errorMessages, setErrorMessages] = useState([]);
    const execute = useCallback(async (credentials) => {
        setIsLoading(true);
        setError(null);
        setErrorMessages([]);
        try {
            const response = await signIn(credentials);
            if (!response?.roles?.includes("Doctor")) {
                const authError = new Error("This account is not registered as a doctor. Use a doctor account to sign in.");
                authError.errors = [{ code: "Unauthorized", description: authError.message }];
                throw authError;
            }
            return response;
        } catch (requestError) {
            setError(requestError);
            // The API answers failed sign-ins with RFC 7807 problem details.
            // Surface those messages instead of a generic network error.
            const messages = getApiErrorMessages(requestError);
            setErrorMessages(
                messages.length ? messages : [requestError?.message || "Unable to sign in. Please try again."]
            );
            throw requestError;
        } finally {
            setIsLoading(false);
        }
    }, []);
    return { isLoading, error, errorMessages, execute };
}

export function useForgetPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const execute = useCallback(async (email) => {
        setIsLoading(true);
        setError(null);
        try {
            return await requestPasswordReset(email);
        } catch (requestError) {
            setError(requestError);
            throw requestError;
        } finally {
            setIsLoading(false);
        }
    }, []);
    return { isLoading, error, execute };
}

export function useGetProfile() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const execute = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const profile = await getDoctorProfile();
            setData(profile);
            return profile;
        } catch (requestError) {
            setError(requestError);
            throw requestError;
        } finally {
            setIsLoading(false);
        }
    }, []);
    return { isLoading, error, data, setData, execute };
}

export function useUpdateProfile() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const execute = useCallback(async (profile) => {
        setIsLoading(true);
        setError(null);
        try {
            return await updateDoctorProfile(profile);
        } catch (requestError) {
            setError(requestError);
            throw requestError;
        } finally {
            setIsLoading(false);
        }
    }, []);
    return { isLoading, error, execute };
}
