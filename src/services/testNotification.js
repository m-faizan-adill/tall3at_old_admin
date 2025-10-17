import * as signalR from "@microsoft/signalr";
import { API_CONFIG } from "../constants/config";

export const testSignalRConnection = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("⚠️ No token found");
        return;
    }
console.log("🔑 Using token:", token);
    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_CONFIG.BASE_URL}/chathub`, {
            accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information) // console me logs show karega
        .build();

    // Server se koi bhi event listen karne ke liye
    connection.on("ReceiveNotification", (data) => {
        console.log("🔔 Test Notification:", data);
    });

    try {
        await connection.start();
        // console.log("✅ SignalR connected successfully");
        // Ek test call bhejna (backend Hub method)
        await connection.invoke("SendNotification", "2bd7e0e9-187d-4715-aa53-60d795db4ffa", "Test Title", "Hello from frontend!");
    } catch (err) {
        console.error("❌ SignalR connection failed:", err);
    }
};
