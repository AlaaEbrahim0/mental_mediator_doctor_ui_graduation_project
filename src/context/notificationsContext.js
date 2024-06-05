// src/context/notificationsContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import useSignalR from "../hooks/useSignalR";

const url = process.env.REACT_APP_API_URL;
const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        try {
            debugger;
            setLoading(true);
            const response = await axios.get(
                `${url}/api/notifications/users/me`,
                {
                    params: { pageSize: 20 },
                }
            );
            const notificationsData = response.data;
            setNotifications(notificationsData);
            setCount(notificationsData.filter((x) => !x.isRead).length);
            setLoading(false);
        } catch (err) {
            console.log(err);
            setError(err);
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(`${url}/api/notifications/users/me/read`);
            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) => ({
                    ...notification,
                    isRead: true,
                }))
            );
            setCount(0);
        } catch (err) {
            console.log(err);
        }
    };

    const markAsRead = async (id) => {
        try {
            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification.id === id
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
            await axios.put(`${url}/api/notifications/${id}/read`);
            setCount((prev) => prev - 1);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleNewNotification = (notification) => {
        setNotifications((prevNotifications) => [
            {
                ...notification,
            },
            ...prevNotifications,
        ]);
        setCount((prevCount) => prevCount + 1);
    };
    useSignalR(handleNewNotification);

    return (
        <NotificationsContext.Provider
            value={{
                notifications,
                loading,
                error,
                fetchNotifications,
                setNotifications,
                markAllAsRead,
                markAsRead,
                count,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationsContext);
