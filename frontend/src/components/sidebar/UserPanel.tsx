"use client";
import { useAuthStore } from "@/store/authStore";
import { LogOut } from "lucide-react";

export function UserPanel() {
  const { user, logout } = useAuthStore();

  return (
    <div className="h-14 bg-gray-850 flex items-center px-2 gap-2">
      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold">
        {user?.username[0].toUpperCase()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{user?.username}</p>
        <p className="text-xs text-gray-400">En ligne</p>
      </div>
      <button onClick={logout} className="p-2 hover:bg-gray-700 rounded">
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}