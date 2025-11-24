import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { usePresenceStore } from "@/store/presenceStore";
import { usePresence, usePresenceHeartbeat } from "@/hooks/usePresence";

export function useWebSocket(channelId: string, onMessage: (data: any) => void) {
    const ws = useRef<WebSocket | null>(null);
    const { token } = useAuthStore();
    const { setOnline, setOffline } = usePresenceStore();
    const { handlePresenceMessage } = usePresence();

    // Use ref for onMessage to avoid effect re-running when callback changes
    const onMessageRef = useRef(onMessage);
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    // Create sendMessage function ref for heartbeat
    const sendMessageRef = useRef<((msg: any) => void) | null>(null);

    useEffect(() => {
        if (!token || !channelId) return;

        const url = `ws://localhost:8000/v1/ws/${channelId}?token=${token}`;
        ws.current = new WebSocket(url);

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // Handle presence messages
            if (data.type === "presence" || data.type === "presence_init") {
                handlePresenceMessage(data);

                // Also update local store for backward compatibility
                if (data.type === "presence") {
                    if (data.status === "online") {
                        setOnline(data.user_id);
                    } else {
                        setOffline(data.user_id);
                    }
                }
            }

            // Call the original message handler
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
    }, [channelId, token, setOnline, setOffline, handlePresenceMessage]);

    const sendMessage = (msg: any) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(msg));
        }
    };

    // Update ref for heartbeat hook
    sendMessageRef.current = sendMessage;

    // Set up automatic heartbeat
    usePresenceHeartbeat(sendMessageRef.current);

    return { sendMessage };
}
