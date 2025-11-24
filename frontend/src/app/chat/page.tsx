"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function GuildsList() {
  const [guilds, setGuilds] = useState<any[]>([]);

  useEffect(() => {
    api("/v1/guilds")
      .then(setGuilds)
      .catch(err => toast.error("Erreur chargement serveurs"));
  }, []);

  const createGuild = async () => {
    const name = prompt("Nom du serveur ?");
    if (!name) return;
    try {
      const guild = await api("/v1/guilds?name=" + encodeURIComponent(name), { method: "POST" });
      setGuilds([...guilds, guild]);
      toast.success("Serveur créé !");
    } catch (e) {
      toast.error("Erreur création serveur");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-10 p-8 relative overflow-hidden">
      {/* Hero Section */}
      <div className="text-center space-y-4 animate-scale-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-subtle shadow-glow-lg mb-4 animate-glow-pulse">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-gradient font-display">
          Vos Serveurs
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Sélectionnez un serveur pour commencer à discuter
        </p>
      </div>

      {/* Guilds Grid */}
      <div className="flex gap-6 flex-wrap justify-center max-w-4xl">
        {guilds.map((g, idx) => (
          <Link
            key={g.id}
            href={`/chat/guilds/${g.id}/channels/${g.id}`}
            className="group relative"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="w-32 h-32 glass border-gradient rounded-3xl flex flex-col items-center justify-center text-center p-4 hover-lift hover-glow transition-all shadow-lg animate-bounce-in">
              <div className="text-3xl font-bold text-gradient mb-2">
                {g.name.slice(0, 2).toUpperCase()}
              </div>
              <p className="text-xs text-muted-foreground font-medium truncate w-full">
                {g.name}
              </p>
            </div>
          </Link>
        ))}

        {/* Add Server Button */}
        <button
          onClick={createGuild}
          className="w-32 h-32 glass rounded-3xl flex flex-col items-center justify-center gap-2 hover-lift border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all shadow-lg group animate-bounce-in"
          style={{ animationDelay: `${guilds.length * 100}ms` }}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-subtle flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
            Créer
          </span>
        </button>
      </div>

      {guilds.length === 0 && (
        <p className="text-sm text-muted-foreground animate-fade-in">
          Vous n'avez pas encore de serveurs. Créez-en un pour commencer !
        </p>
      )}
    </div>
  );
}