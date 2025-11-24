"use client";
import { Hash, Volume2, Settings, ChevronDown, Plus, X } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebarStore";

export function ChannelList() {
  const router = useRouter();
  const params = useParams();
  const [channels, setChannels] = useState<any[]>([]);
  const currentGuildId = params?.guildId as string;
  const currentChannelId = params?.channelId as string;
  const { isOpen, close } = useSidebarStore();

  useEffect(() => {
    if (currentGuildId) {
      api(`/v1/guilds/${currentGuildId}/channels`)
        .then(setChannels)
        .catch((err: any) => console.error("Error loading channels:", err));
    }
  }, [currentGuildId]);

  // Close sidebar on channel selection (mobile only)
  const handleChannelClick = (channelId: string) => {
    router.push(`/chat/guilds/${currentGuildId}/channels/${channelId}`);
    if (window.innerWidth < 1024) {
      close();
    }
  };

  if (!currentGuildId) {
    return null;
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "glass border-r border-white/10 flex flex-col shadow-lg relative z-50 transition-transform duration-300",
          // Mobile: fixed overlay
          "fixed inset-y-0 left-0 w-4/5 max-w-sm",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: static sidebar
          "lg:relative lg:translate-x-0 lg:w-64"
        )}
      >
        {/* Mobile Close Button */}
        <button
          onClick={close}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Guild Header */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 hover:bg-muted/30 cursor-pointer transition-smooth group">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-subtle flex items-center justify-center text-sm font-bold text-white shadow-glow">
              {currentGuildId?.slice(0, 2).toUpperCase()}
            </div>
            <span className="font-semibold text-sm text-foreground truncate">Serveur</span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-smooth" />
        </div>

        {/* Channels Section */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Salons textuels
            </span>
            <button className="p-1 rounded hover:bg-muted/50 transition-smooth touch-target">
              <Plus className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          {channels.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Hash className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-xs text-muted-foreground">Aucun salon</p>
            </div>
          ) : (
            channels.map((ch) => {
              const isActive = ch.id === currentChannelId;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleChannelClick(ch.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all group relative overflow-hidden touch-target",
                    isActive
                      ? "bg-gradient-subtle text-white shadow-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-subtle shadow-glow" />
                  )}
                  <Hash className={cn(
                    "w-4 h-4 transition-smooth",
                    isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span className="text-sm font-medium truncate">
                    {ch.name || "général"}
                  </span>
                </button>
              );
            })
          )}

          {/* Voice Channels Section */}
          <div className="flex items-center justify-between mb-2 px-2 mt-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Salons vocaux
            </span>
            <button className="p-1 rounded hover:bg-muted/50 transition-smooth touch-target">
              <Plus className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          <div className="text-center py-6 px-4 opacity-50">
            <Volume2 className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Bientôt disponible</p>
          </div>
        </div>

        {/* User Panel at bottom */}
        <div className="border-t border-white/10 p-3 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-subtle flex items-center justify-center text-sm font-bold text-white shadow-glow">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Utilisateur</p>
              <p className="text-xs text-muted-foreground truncate">En ligne</p>
            </div>
            <button className="p-1.5 rounded hover:bg-muted/50 transition-smooth touch-target">
              <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}