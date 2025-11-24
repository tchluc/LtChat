import React from "react";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
    className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
    return (
        <div className={cn("flex items-center gap-1 px-4 py-2", className)}>
            <div className="flex gap-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3">
                <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                />
                <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                />
                <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                />
            </div>
        </div>
    );
}
