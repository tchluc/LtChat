"use client";
import { Home, Plus } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api, joinGuild } from "@/lib/api";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function ServerList() {
  const router = useRouter();
  const pathname = usePathname();
  const [guilds, setGuilds] = useState<any[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const handleJoin = async () => {
    try {
      await joinGuild(inviteCode);
      setShowJoinModal(false);
      setInviteCode("");
      // Refresh guilds
      api("/v1/guilds").then(setGuilds).catch(console.error);
    } catch (error) {
      alert("Failed to join guild: " + error);
    }
  };


  useEffect(() => {
    api("/v1/guilds").then(setGuilds).catch(console.error);
  }, []);

  return (
    <div className="w-20 bg-gray-950 flex flex-col items-center py-4 gap-2 overflow-y-auto scrollbar-hide">
      <button
        onClick={() => router.push("/chat")}
        className={cn(
          "w-12 h-12 rounded-3xl flex items-center justify-center transition-all hover:rounded-2xl",
          pathname === "/chat" ? "bg-purple-600 rounded-2xl" : "bg-gray-700 hover:bg-purple-600"
        )}
      >
        <Home className="w-6 h-6" />
      </button>

      <div className="h-px w-8 bg-gray-700 my-2" />

      {guilds.map(g => {
        const isActive = pathname.includes(`/guilds/${g.id}`);
        return (
          <Link
            key={g.id}
            href={`/chat/guilds/${g.id}/channels/${g.id}`} // TODO: redirect to first channel
            className={cn(
              "w-12 h-12 rounded-3xl flex items-center justify-center transition-all hover:rounded-2xl font-bold text-sm",
              isActive ? "bg-purple-600 rounded-2xl" : "bg-gray-700 hover:bg-purple-600"
            )}
          >
            {g.name.slice(0, 2).toUpperCase()}
          </Link>
        );
      })}

      <button
        onClick={() => setShowJoinModal(true)}
        className="w-12 h-12 bg-gray-700 rounded-3xl hover:bg-green-600 hover:rounded-2xl transition-all flex items-center justify-center text-green-500 hover:text-white"
        title="Join Server"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold text-white mb-4">Join a Server</h2>
            <input
              type="text"
              placeholder="Invite Code"
              className="w-full bg-gray-900 text-white p-2 rounded mb-4 border border-gray-700 focus:border-purple-500 outline-none"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}