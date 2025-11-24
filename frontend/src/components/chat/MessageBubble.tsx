import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
    message: any; // Using any to avoid type conflicts with different Message types
    isMe: boolean;
    showAvatar?: boolean;
    className?: string;
}

export function MessageBubble({
    message,
    isMe,
    showAvatar = true,
    className,
}: MessageBubbleProps) {
    const initials = message.username
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";

    const timestamp = message.created_at
        ? new Date(message.created_at).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        })
        : new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <div
            className={cn(
                "flex gap-3 group animate-slide-up",
                isMe ? "flex-row-reverse" : "flex-row",
                className
            )}
        >
            {/* Avatar */}
            {showAvatar && (
                <div className="flex-shrink-0">
                    <Avatar className="w-11 h-11 border-2 border-gradient shadow-glow ring-2 ring-primary/20">
                        <AvatarFallback className="bg-gradient-subtle text-white font-bold text-sm">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>
            )}

            {/* Message Content */}
            <div
                className={cn(
                    "flex flex-col max-w-[70%]",
                    isMe ? "items-end" : "items-start"
                )}
            >
                {/* Username & Timestamp */}
                <div
                    className={cn(
                        "flex items-baseline gap-2 mb-1.5 px-1 opacity-0 group-hover:opacity-100 transition-all duration-300",
                        isMe ? "flex-row-reverse" : "flex-row"
                    )}
                >
                    <span className={cn(
                        "text-xs font-semibold",
                        isMe ? "text-gradient-primary" : "text-muted-foreground"
                    )}>
                        {message.username}
                    </span>
                    <span className="text-xs text-muted-foreground/70">{timestamp}</span>
                </div>

                {/* Message Bubble */}
                <div
                    className={cn(
                        "px-4 py-3 rounded-2xl break-words transition-all duration-300 hover-lift shadow-md",
                        isMe
                            ? "bg-gradient-subtle text-white rounded-tr-md shadow-glow"
                            : "glass text-foreground rounded-tl-md"
                    )}
                >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
            </div>
        </div>
    );
}
