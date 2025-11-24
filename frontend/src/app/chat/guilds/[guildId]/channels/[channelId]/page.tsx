"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useMessagesStore } from "@/store/messagesStore";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { Send, Hash, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
    const params = useParams();
    const channelId = params?.channelId as string;
    const { user } = useAuthStore();
    const { messages, addMessage } = useMessagesStore();
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { sendMessage } = useWebSocket(channelId, (data) => {
        if (data.type === "message") {
            addMessage(channelId, data);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        // Simulate typing indicator (in real app, send to WebSocket)
        if (!isTyping && e.target.value) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 2000);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full relative">
            {/* Header */}
            <div className="glass border-b border-white/10 shadow-lg backdrop-blur-xl relative z-10">
                <div className="h-16 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-subtle shadow-glow">
                            <Hash className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-foreground font-display text-lg">général</h2>
                            <p className="text-xs text-muted-foreground">
                                {channelMessages.length} {channelMessages.length === 1 ? "message" : "messages"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground text-sm">
                        <Users className="w-5 h-5" />
                        <span className="hidden sm:inline">En ligne</span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 relative" ref={scrollRef}>
                {channelMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center animate-scale-in">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-subtle flex items-center justify-center mb-6 shadow-glow-lg animate-glow-pulse">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gradient mb-3 font-display">
                            Bienvenue dans #général
                        </h3>
                        <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                            C'est le début de votre conversation. Envoyez votre premier message pour commencer à échanger !
                        </p>
                    </div>
                ) : (
                    channelMessages.map((msg, i) => {
                        const isMe = msg.username === user?.username;
                        const isSystem = msg.type === "system";

                        if (isSystem) {
                            return (
                                <div key={i} className="text-center my-6 animate-fade-in">
                                    <div className="inline-block px-5 py-2.5 rounded-full glass border-gradient shadow-md">
                                        <span className="text-xs text-muted-foreground font-medium">{msg.content}</span>
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

                {/* Typing Indicator (example - would be controlled by WebSocket) */}
                {/* {isTyping && <TypingIndicator />} */}
            </div>

            {/* Input Area */}
            <div className="glass border-t border-white/10 p-4 backdrop-blur-xl relative z-10">
                <div className="flex gap-3 items-end max-w-4xl mx-auto">
                    <div className="flex-1">
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                            placeholder="Envoyer un message dans #général"
                            className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-12 shadow-sm"
                        />
                    </div>
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        size="icon"
                        className="bg-gradient-subtle text-white hover-lift shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed h-12 w-12 rounded-xl"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
