"use client"
import { redirect } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export default function Home() {
  const { token } = useAuthStore.getState();

  useEffect(() => {
    if (token) redirect("/chat");
    else redirect("/login");
  }, []);

  return null;
}