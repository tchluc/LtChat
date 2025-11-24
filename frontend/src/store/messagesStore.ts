import { create } from "zustand";

type Message = {
  id: string;
  content: string;
  username: string;
  user_id: number;
  created_at: string;
  channel_id: string;
  type?: "message" | "system";
  status?: "sent" | "delivered" | "read";
};

type MessagesState = {
  messages: Record<string, Message[]>;
  addMessage: (channelId: string, msg: Message) => void;
  updateMessageStatus: (channelId: string, messageId: string, status: "sent" | "delivered" | "read") => void;
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
  updateMessageStatus: (channelId, messageId, status) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, status } : msg
        ),
      },
    })),
  clearChannel: (channelId) =>
    set((state) => ({
      messages: { ...state.messages, [channelId]: [] },
    })),
}));