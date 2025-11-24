import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { usePresenceStore } from "@/store/presenceStore";

export function useWebSocket(channelId: string, onMessage: (data: any) => void) {
    const ws = useRef<WebSocket | null>(null);
    const { token } = useAuthStore();
    const { setOnline, setOffline } = usePresenceStore();

    // Use ref for onMessage to avoid effect re-running when callback changes
    const onMessageRef = useRef(onMessage);
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        if (!token || !channelId) return;

        const url = `ws://localhost:8000/v1/ws/${channelId}?token=${token}`;
        ws.current = new WebSocket(url);

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "presence") {
                if (data.status === "online") {
                    setOnline(data.user_id);
                } else {
                    setOffline(data.user_id);
                }
            }

            if (onMessageRef.current) {
                onMessageRef.current(data);
            }
        };

        ws.current.onclose = () => {
            console.log("WS closed");
        };

        return () => {
            ws.current?.close();
        };
    }, [channelId, token, setOnline, setOffline]); // Removed onMessage from deps

    const sendMessage = (msg: any) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(msg));
        }
    };

    return { sendMessage };
}
