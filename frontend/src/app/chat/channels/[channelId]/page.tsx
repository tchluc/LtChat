"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useMessagesStore } from "@/store/messagesStore";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { Send, MessageSquare, Users } from "lucide-react";

export default function DMChatPage() {
    const params = useParams();
    const channelId = params?.channelId as string;
    const { user } = useAuthStore();
    const { updateMessageStatus, messages, addMessage } = useMessagesStore();

    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { sendMessage } = useWebSocket(channelId, (data) => {
        if (data.type === "message") {
            addMessage(channelId, data);
            // Send read receipt if message is not from me
            if (user && data.user_id !== Number(user.id)) {
                sendMessage({
                    type: "read",
                    message_id: data.id,
                    channel_id: channelId
                });
            }
        } else if (data.type === "status_update") {
            updateMessageStatus(channelId, data.message_id, data.status);
        }
    });

    const channelMessages = messages[channelId] || [];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [channelMessages]);

    const handleSend = () => {
        if (!input.trim()) return;

        // Optimistic UI: Add message immediately
        const optimisticMessage = {
            type: "message" as const,
            content: input,
            user_id: user?.id ? Number(user.id) : 0,
            username: user?.username || "Unknown",
            channel_id: channelId,
            id: `temp-${Date.now()}`,
            created_at: new Date().toISOString()
        };

        addMessage(channelId, optimisticMessage);

        sendMessage({
            type: "message",
            content: input,
            username: user?.username
        });

        setInput("");
        inputRef.current?.focus();
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            {/* Header */}
            <div className="glass-dark border-b border-white/10 shadow-lg">
                <div className="h-12 sm:h-14 flex items-center justify-between px-3 sm:px-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5">
                            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300" />
                        </div>
                        <div>
                            <h2 className="font-bold text-white font-display text-sm sm:text-base">Direct Message</h2>
                            <p className="text-xs text-gray-400 hidden sm:block">Channel #{channelId}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{channelMessages.length > 0 ? "En ligne" : "Aucun message"}</span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4" ref={scrollRef}>
                {channelMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-subtle flex items-center justify-center mb-3 sm:mb-4 animate-glow-pulse">
                            <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-display">
                            Nouvelle conversation
                        </h3>
                        <p className="text-gray-400 text-xs sm:text-sm max-w-md">
                            C'est le début de votre conversation privée. Envoyez votre premier message !
                        </p>
                    </div>
                ) : (
                    channelMessages.map((msg, i) => {
                        const isMe = msg.username === user?.username;
                        const isSystem = msg.type === "system";

                        if (isSystem) {
                            return (
                                <div key={i} className="text-center my-3 sm:my-4">
                                    <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10">
                                        <span className="text-xs text-gray-400">{msg.content}</span>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <MessageBubble
                                key={msg.id || i}
                                message={msg}
                                isMe={isMe}
                                showAvatar={true}
                            />
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="glass-dark border-t border-white/10 p-3 sm:p-4">
                <div className="flex gap-2 sm:gap-3 items-end">
                    <div className="flex-1">
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                            placeholder="Envoyer un message privé"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 focus:ring-white/20 transition-smooth resize-none text-sm sm:text-base"
                        />
                    </div>
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        size="icon"
                        className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover-lift transition-smooth disabled:opacity-50 disabled:cursor-not-allowed h-9 w-9 sm:h-10 sm:w-10 touch-target"
                    >
                        <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
