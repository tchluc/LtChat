"use client";
import { useEffect, useState } from "react";
import { api, getGuildMembers } from "@/lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import { usePresenceStore } from "@/store/presenceStore";

interface MemberListProps {
    guildId: number;
    inviteCode: string;
    onClose: () => void;
}

export function MemberList({ guildId, inviteCode, onClose }: MemberListProps) {
    const [members, setMembers] = useState<any[]>([]);
    const [copied, setCopied] = useState(false);
    const { isOnline } = usePresenceStore();

    useEffect(() => {
        getGuildMembers(guildId).then(setMembers).catch(console.error);
    }, [guildId]);

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="glass shadow-glow-lg rounded-2xl p-4 sm:p-6 w-full max-w-md animate-scale-in border-gradient flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gradient font-display">Membres</h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <div className="bg-muted/30 rounded-xl p-4 mb-4 border border-white/5">
                    <p className="text-xs text-muted-foreground mb-2 uppercase font-bold tracking-wider">Code d'invitation</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 bg-black/20 p-2 rounded-lg font-mono text-sm text-center select-all">
                            {inviteCode}
                        </code>
                        <button
                            onClick={handleCopy}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                copied ? "bg-green-500/20 text-green-500" : "bg-white/5 hover:bg-white/10 text-foreground"
                            )}
                            title="Copier le code"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {members.map((member) => {
                        const online = isOnline(member.id);
                        return (
                            <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors">
                                <div className="relative">
                                    <Avatar className="w-10 h-10 border border-white/10">
                                        <AvatarFallback className="bg-gradient-subtle text-white">
                                            {member.username.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={cn(
                                        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                                        online ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-gray-500"
                                    )} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground flex items-center gap-2">
                                        {member.username}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{member.email}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
