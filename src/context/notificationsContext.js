// src/context/notificationsContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "../auth/authProvider";
import { getToken } from "../auth/session";
import { API_BASE_URL } from "../api/client";
import toast from "react-hot-toast";
import { getUserNotifications, getUnreadCount, markAllNotificationsRead, markNotificationRead } from "../api/notifications.api";

const url = API_BASE_URL;
const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();
    const [connection, setConnection] = useState(null);

    const fetchUnreadCount = useCallback(async () => {
        if (!token) {
            setCount(0);
            return;
        }
        try {
            const serverCount = await getUnreadCount();
            setCount(serverCount);
        } catch (err) {
            // Fall back to client-side count if the server endpoint fails.
            setCount(notifications.filter((x) => !x.isRead).length);
        }
    }, [token, notifications]);

    const fetchNotifications = useCallback(async (pageNumber = 1, pageSize = 20) => {
        if (!token) {
            setNotifications([]);
            setCount(0);
            setError(null);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const notificationsData = await getUserNotifications(pageNumber, pageSize);
            setNotifications(notificationsData);
            // Use the server-side unread count after a full fetch so the
            // badge stays accurate even if real-time updates were missed.
            const unread = notificationsData.filter((x) => !x.isRead).length;
            setCount(unread);
            setLoading(false);
        } catch (err) {
            console.log(err);
            setError(err);
            setLoading(false);
        }
    }, [token]);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Clear everything when the token disappears (logout)
    useEffect(() => {
        if (!token) {
            setNotifications([]);
            setCount(0);
            setError(null);
            setLoading(false);
        }
    }, [token]);

    const markAllAsRead = async () => {
        try {
            await markAllNotificationsRead();
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
            await markNotificationRead(id);
            setCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.log(err);
        }
    };

    const handleNewNotification = (notification) => {
        setNotifications((prevNotifications) => [
            notification,
            ...prevNotifications,
        ]);
        setCount((prevCount) => prevCount + 1);
    };

    // SignalR connection lifecycle
    useEffect(() => {
        if (!token) {
            setConnection(null);
            return undefined;
        }

        // Read the token from the persisted session: SignalR reconnects on its
        // own and the token factory may be called long after the React state
        // that created the connection was unmounted.
        const accessTokenFactory = () => getToken() || token;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${url}/notification-hub`, {
                accessTokenFactory,
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        return () => {
            if (newConnection) {
                newConnection.stop();
            }
        };
    }, [token]);

    useEffect(() => {
        if (!connection) return;

        let isSubscribed = true;

        const startConnection = async () => {
            if (connection.state !== signalR.HubConnectionState.Disconnected) return;

            try {
                await connection.start();
                console.log("Connected to SignalR hub");

                connection.on("ReceiveNotification", (notification) => {
                    if (!isSubscribed) return;
                    console.log("Notification received:", notification);
                    handleNewNotification(notification);
                    toast.success("Notification received");
                });

                connection.on("ReceiveMessage", (message) => {
                    if (!isSubscribed) return;
                    console.log("Message received:", message);
                });

                // On reconnection, refetch persisted notifications so the
                // client catches up on anything delivered while disconnected.
                connection.onclose(() => {
                    if (!isSubscribed) return;
                    console.log("SignalR connection closed, will refetch on reconnect");
                });

            } catch (err) {
                console.error("Error connecting to SignalR hub:", err);
            }
        };

        const handleReconnecting = () => {
            if (!isSubscribed) return;
            console.log("SignalR reconnecting...");
        };

        const handleReconnected = () => {
            if (!isSubscribed) return;
            console.log("SignalR reconnected, fetching persisted notifications");
            fetchNotifications();
            fetchUnreadCount();
        };

        connection.onreconnecting(handleReconnecting);
        connection.onreconnected(handleReconnected);

        startConnection();

        return () => {
            isSubscribed = false;
            connection.off("ReceiveNotification");
            connection.off("ReceiveMessage");
            connection.offreconnecting(handleReconnecting);
            connection.offreconnected(handleReconnected);
            connection.stop();
        };
    }, [connection, fetchNotifications, fetchUnreadCount]);

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
                fetchUnreadCount,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationsContext);
