"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { LogIn, Sparkles } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore(s => s.login);
  const router = useRouter();

  const handle = async () => {
    if (!username || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);

    try {
      const data = await api<{ access_token: string }>("/v1/auth/login", {
        method: "POST",
        body: form,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const { access_token } = data;
      login(access_token, { username });
      toast.success("Bienvenue " + username + " !");
      router.push("/chat");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated mesh background */}
      <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

      <Card className="w-full max-w-md glass border-gradient shadow-glow-lg relative z-10 animate-scale-in">
        <div className="p-8 space-y-6">
          {/* Logo & Title */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-subtle mb-4 shadow-glow-lg animate-glow-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gradient font-display">
              LtChat
            </h1>
            <p className="text-muted-foreground text-base">
              Connectez-vous pour continuer
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold text-foreground">
                Nom d'utilisateur
              </label>
              <Input
                id="username"
                placeholder="Entrez votre nom d'utilisateur"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handle()}
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-12"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-foreground">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handle()}
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-12"
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={handle}
              disabled={isLoading}
              className="w-full bg-gradient-subtle text-white hover-lift shadow-glow font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed h-12 text-base"
              size="lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </span>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="space-y-4 pt-4 border-t border-border">
            <p className="text-center text-muted-foreground text-sm">
              Pas de compte ?{" "}
              <Link
                href="/register"
                className="text-gradient-primary font-semibold transition-smooth hover:underline"
              >
                S'inscrire
              </Link>
            </p>
            <div className="glass rounded-xl p-4 border border-border/50">
              <p className="text-center text-muted-foreground text-xs">
                <span className="font-semibold text-foreground block mb-1">Compte test :</span>
                leo / 123456
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}