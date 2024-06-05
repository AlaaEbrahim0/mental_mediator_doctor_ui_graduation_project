// src/components/NotificationsList.js
import React from "react";
import { Notification } from "../ui/Notification";
import { useNotifications } from "../../context/notificationsContext";

export const NotificationsList = ({ notifications }) => {
    const { loading, markAsRead, markAllAsRead } = useNotifications();

    return (
        <>
            <div className="flex flex-row justify-between p-4">
                <h1 className="text-xl text-left font-bold">Notifications</h1>
                <button onClick={markAllAsRead} className="text-sm text-info">
                    Mark All As Read
                </button>
            </div>

            {loading ? (
                <span className="loading loading-spinner"></span>
            ) : (
                <ul tabIndex={0} className="mt-4 overflow-y-auto max-h-96">
                    {notifications.map((notification) => (
                        <li className="mb-2" key={notification.id}>
                            <Notification {...notification} />
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
};
