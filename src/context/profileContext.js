import React, { createContext, useState, useEffect, useContext } from "react";
import { useGetProfile } from "../api/getProfile";
import { useUpdateProfile } from "../api/updateProfile";
import toast from "react-hot-toast";
import { useAuth } from "../auth/authProvider";

const UserProfileContext = createContext();

export const UserProfileProvider = ({ children }) => {
    const [userProfileData, setUserProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const { data: profileData, execute: getProfile } = useGetProfile();
    const {
        updatedData,
        execute: updateProfile,
        updateIsLoading,
    } = useUpdateProfile();

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (token) {
                try {
                    setIsLoading(true);
                    const data = await getProfile();
                    setUserProfileData(data);
                } catch (err) {
                    setError(err);
                    toast.error("Failed to load profile");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchUserProfile();
    }, [token, getProfile]);

    const reset = () => {
        setUserProfileData(null);
    };

    const initializeUserProfile = async () => {
        try {
            debugger;
            const data = await getProfile();
            setUserProfileData(data);
        } catch (err) {
            setError(err);
            toast.error("Failed to initialize profile");
        }
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
                initializeUserProfile,
            }}
        >
            {children}
        </UserProfileContext.Provider>
    );
};

export const useUserProfile = () => useContext(UserProfileContext);
