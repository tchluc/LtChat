import { create } from 'zustand';

interface PresenceState {
    onlineUsers: Set<number>;
    setOnline: (userId: number) => void;
    setOffline: (userId: number) => void;
    setOnlineUsers: (userIds: number[]) => void;
    isOnline: (userId: number) => boolean;
    clearAll: () => void;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
    onlineUsers: new Set(),

    setOnline: (userId: number) => set((state) => {
        const newSet = new Set(state.onlineUsers);
        newSet.add(userId);
        return { onlineUsers: newSet };
    }),

    setOffline: (userId: number) => set((state) => {
        const newSet = new Set(state.onlineUsers);
        newSet.delete(userId);
        return { onlineUsers: newSet };
    }),

    setOnlineUsers: (userIds: number[]) => set(() => {
        return { onlineUsers: new Set(userIds) };
    }),

    isOnline: (userId: number) => get().onlineUsers.has(userId),

    clearAll: () => set({ onlineUsers: new Set() }),
}));
