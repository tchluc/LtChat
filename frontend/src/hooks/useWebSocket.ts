import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";

export function useWebSocket(channelId: string, onMessage: (data: any) => void) {
    const ws = useRef<WebSocket | null>(null);
    const { token } = useAuthStore();

    useEffect(() => {
        if (!token || !channelId) return;

        const url = `ws://localhost:8000/v1/ws/${channelId}?token=${token}`;
        ws.current = new WebSocket(url);

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onMessage(data);
        };

        ws.current.onclose = () => {
            console.log("WS closed");
        };

        return () => {
            ws.current?.close();
        };
    }, [channelId, token, onMessage]);

    const sendMessage = (msg: any) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(msg));
        }
    };

    return { sendMessage };
}
