// src/hooks/useSignalR.js
import * as signalR from "@microsoft/signalr";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/authProvider";
import toast from "react-hot-toast";
import { Notification } from "../components/ui/Notification";

const url = process.env.REACT_APP_API_URL;

export const useSignalR = (onReceiveNotification) => {
    const [connection, setConnection] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${url}/notification-hub`, {
                accessTokenFactory: () => token,
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
        const startConnection = async () => {
            if (
                connection &&
                connection.state === signalR.HubConnectionState.Disconnected
            ) {
                try {
                    await connection.start();
                    console.log("Connected to SignalR hub");

                    connection.on("ReceiveNotification", (notification) => {
                        debugger;
                        console.log("Notification received:", notification);
                        if (onReceiveNotification) {
                            onReceiveNotification(notification);
                            toast.success("Notification received");
                        }
                    });

                    connection.on("ReceiveMessage", (message) => {
                        console.log("Message received:", message);
                    });
                } catch (err) {
                    console.error("Error connecting to SignalR hub:", err);
                    // Implement retry logic if needed
                }
            }
        };

        if (connection) {
            startConnection();

            return () => {
                connection.off("ReceiveNotification");
                connection.off("ReceiveMessage");
                connection.stop();
            };
        }
    }, [connection, onReceiveNotification]);

    return connection;
};
