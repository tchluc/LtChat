// src/lib/api.ts
import { useAuthStore } from "@/store/authStore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function api<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { token, logout } = useAuthStore.getState();

  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  // Si réponse vide (ex: 204), on retourne rien
  const text = await res.text();
  return text ? JSON.parse(text) : (null as T);
}

// Helper functions for common HTTP methods using the base api function
const apiMethods = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    api<T>(endpoint, { ...options, method: "GET" }),
  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    api<T>(endpoint, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    api<T>(endpoint, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    api<T>(endpoint, { ...options, method: "DELETE" }),
};

export const createGuild = async (name: string) => {
  const response = await apiMethods.post("/v1/guilds/", { name });
  return response;
};

export const joinGuild = async (inviteCode: string) => {
  const response = await apiMethods.post("/v1/guilds/join", { invite_code: inviteCode });
  return response;
};

export const getMyGuilds = async () => {
  const response = await apiMethods.get("/v1/guilds/");
  return response;
};

export const getGuildChannels = async (guildId: number) => {
  const response = await apiMethods.get(`/v1/guilds/${guildId}/channels`);
  return response;
};

export const createDM = async (targetUserId: number) => {
  const response = await apiMethods.post("/v1/channels/dm", { target_user_id: targetUserId });
  return response;
};

export const getDMs = async () => {
  const response = await apiMethods.get("/v1/channels/dm");
  return response;
};

export const createChannel = async (guildId: number, name: string, type: string = "text") => {
  const response = await apiMethods.post(`/v1/guilds/${guildId}/channels`, { name, type });
  return response;
};