import React, { createContext, useState, useEffect, useContext } from "react";
import { useGetProfile, useUpdateProfile } from "../api/auth.api";
import toast from "react-hot-toast";
import { useAuth } from "../auth/authProvider";

const UserProfileContext = createContext();

export const UserProfileProvider = ({ children }) => {
    const [userProfileData, setUserProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const { execute: getProfile } = useGetProfile();
    const {
        execute: updateProfile,
        isLoading: updateIsLoading,
    } = useUpdateProfile();

    useEffect(() => {
        let cancelled = false;

        const fetchUserProfile = async () => {
            if (!token) {
                setUserProfileData(null);
                setError(null);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const data = await getProfile();
                if (!cancelled) setUserProfileData(data);
            } catch (err) {
                if (!cancelled) {
                    setError(err);
                    toast.error(err.response?.status === 403
                        ? "This account is not authorized as a doctor. Sign in with a Doctor account."
                        : "Failed to load doctor profile");
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        fetchUserProfile();
        return () => { cancelled = true; };
    }, [token, getProfile]);

    const reset = () => {
        setUserProfileData(null);
    };

    const updateUserProfile = async (profileUpdates) => {
        try {
            const updatedProfile = await updateProfile(profileUpdates);
            setUserProfileData(updatedProfile);
            toast.success("Profile updated successfully");
        } catch (err) {
            setError(err);
            toast.error("Failed to update profile");
        }
    };

    return (
        <UserProfileContext.Provider
            value={{
                userProfileData,
                isLoading,
                error,
                updateUserProfile,
                updateLoading: updateIsLoading,
                reset,
            }}
        >
            {children}
        </UserProfileContext.Provider>
    );
};

export const useUserProfile = () => useContext(UserProfileContext);
