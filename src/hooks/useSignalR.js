// src/services/signalRService.js
import * as signalR from "@microsoft/signalr";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/authProvider";
import toast from "react-hot-toast";
import { Notification } from "../components/ui/Notification";
const url = process.env.REACT_APP_API_URL;
const useSignalR = (onReceiveNotification) => {
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${url}/notification-hub`, {
                accessTokenFactory: () => localStorage.getItem("token"),
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection && connection.isConnected) {
            connection
                .start()
                .then(() => {
                    console.log("Connected to SignalR hub");
                    connection.on("ReceiveNotification", (notification) => {
                        console.log("Notification received:", notification);

                        if (onReceiveNotification) {
                            onReceiveNotification(notification);
                        }
                    });

                    connection.on("ReceiveMessage", (message) => {
                        console.log("Message received:", message);
                    });
                })
                .catch((err) =>
                    console.log("Error connecting to SignalR hub:", err)
                );
        }
    }, [connection, onReceiveNotification]);

    return connection;
};

export default useSignalR;
