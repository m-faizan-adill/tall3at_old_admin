// services/notificationService.js
import * as signalR from "@microsoft/signalr";
import { API_CONFIG, STORAGE_KEYS } from "../constants/config";

let connection = null;

export const startConnection = async (token) => {
    connection = new signalR.HubConnectionBuilder() // 👈 global connection assign
        .withUrl(`${API_CONFIG.BASE_URL}/chathub`, {
            accessTokenFactory: () => localStorage.getItem(STORAGE_KEYS.TOKEN) || ""
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

    connection.onclose(e => {
        setTimeout(() => startConnection(token), 5000);
    });

    await connection.start();
    console.log("✅ SignalR connected, connectionId:", connection.connectionId);
};

export const subscribeToNotifications = (callback) => {
    if (!connection) return;
   
    console.log("Subscribing to notifications");

    connection.on("ReceiveNotification", callback);
};

export const stopConnection = () => {
    if (connection) {
        connection.stop();
    }
};
