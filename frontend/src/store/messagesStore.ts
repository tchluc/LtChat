import { create } from "zustand";

type Message = {
  id: string;
  content: string;
  username: string;
  user_id: number;
  created_at: string;
  channel_id: string;
};

type MessagesState = {
  messages: Record<string, Message[]>;
  addMessage: (channelId: string, msg: Message) => void;
  clearChannel: (channelId: string) => void;
};

export const useMessagesStore = create<MessagesState>((set) => ({
  messages: {},
  addMessage: (channelId, msg) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: [...(state.messages[channelId] || []), msg].slice(-500), // garde les 500 derniers
      },
    })),
  clearChannel: (channelId) =>
    set((state) => ({
      messages: { ...state.messages, [channelId]: [] },
    })),
}));