"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { UserPlus, Sparkles } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handle = async () => {
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsLoading(true);

    try {
      await api("/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      router.push("/login");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la création du compte");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
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
              Créer un compte
            </h1>
            <p className="text-muted-foreground text-base">
              Rejoignez LtChat dès aujourd'hui
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
                placeholder="Choisissez un nom d'utilisateur"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-12"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                placeholder="Minimum 6 caractères"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-12"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                Confirmer le mot de passe
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Retapez votre mot de passe"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
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
                  Création...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Créer mon compte
                </span>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border">
            <p className="text-center text-muted-foreground text-sm">
              Déjà un compte ?{" "}
              <Link
                href="/login"
                className="text-gradient-primary font-semibold transition-smooth hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}