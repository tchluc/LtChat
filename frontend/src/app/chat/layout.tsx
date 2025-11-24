"use client";

import { TopBar } from "@/components/navigation/TopBar";
import { ChannelList } from "@/components/sidebar/ChannelList";
import { UserPanel } from "@/components/sidebar/UserPanel";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) {
    return null; // ou un loader
  }

  return (
    <div className="flex flex-col h-screen bg-background dark overflow-hidden">
      {/* Modern Top Navigation */}
      <TopBar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Animated background */}
        <div className="fixed inset-0 bg-mesh opacity-10 pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

        {/* Channels Sidebar */}
        <ChannelList />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}