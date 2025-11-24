import { useEffect } from 'react';
import { usePresenceStore } from '@/store/presenceStore';

interface PresenceMessage {
    type: 'presence' | 'presence_init';
    user_id?: number;
    status?: 'online' | 'offline';
    online_users?: number[];
}

/**
 * Hook to handle presence updates from WebSocket messages
 * 
 * @param onMessage - Callback function that receives WebSocket messages
 * @returns Object with handlePresenceMessage function
 */
export const usePresence = () => {
    const { setOnline, setOffline, setOnlineUsers } = usePresenceStore();

    const handlePresenceMessage = (data: PresenceMessage) => {
        if (data.type === 'presence_init') {
            // Initial online users list from server
            if (data.online_users) {
                setOnlineUsers(data.online_users);
            }
        } else if (data.type === 'presence') {
            // Individual presence update
            if (data.user_id) {
                if (data.status === 'online') {
                    setOnline(data.user_id);
                } else if (data.status === 'offline') {
                    setOffline(data.user_id);
                }
            }
        }
    };

    return { handlePresenceMessage };
};

/**
 * Hook to send periodic heartbeats via WebSocket
 * 
 * @param sendMessage - Function to send WebSocket messages
 * @param intervalMs - Heartbeat interval in milliseconds (default: 15000 = 15s)
 */
export const usePresenceHeartbeat = (
    sendMessage: ((message: any) => void) | null,
    intervalMs: number = 15000
) => {
    useEffect(() => {
        if (!sendMessage) return;

        // Send initial heartbeat
        sendMessage({ type: 'heartbeat' });

        // Set up periodic heartbeat
        const interval = setInterval(() => {
            sendMessage({ type: 'heartbeat' });
        }, intervalMs);

        return () => clearInterval(interval);
    }, [sendMessage, intervalMs]);
};
