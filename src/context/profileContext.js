import React, { createContext, useState, useEffect, useContext } from "react";
import { useGetProfile } from "../api/getProfile";
import { useUpdateProfile } from "../api/updateProfile";
import toast from "react-hot-toast";

const UserProfileContext = createContext();

export const UserProfileProvider = ({ children }) => {
    const [userProfileData, setUserProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    const { data, execute: getProfile } = useGetProfile();
    const { updatedData, execute: updateProfile } = useUpdateProfile();

    useEffect(() => {
        const getUserProfile = async () => {
            try {
                setUpdateLoading(true);
                const data = await getProfile();
                setUserProfileData(data);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };
        if (!userProfileData) {
            getUserProfile();
        }
    }, [getProfile, userProfileData]);

    const updateUserProfile = async (profileUpdates) => {
        try {
            setUpdateLoading(true);
            const updatedProfile = await updateProfile(profileUpdates);
            setUserProfileData(updatedProfile);
        } catch (err) {
            setError(err);
        } finally {
            setUpdateLoading(false);
        }
    };

    return (
        <UserProfileContext.Provider
            value={{
                userProfileData,
                isLoading,
                error,
                updateUserProfile,
                updateLoading,
            }}
        >
            {children}
        </UserProfileContext.Provider>
    );
};

export const useUserProfile = () => useContext(UserProfileContext);
