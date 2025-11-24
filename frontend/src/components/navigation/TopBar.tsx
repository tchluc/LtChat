"use client";
import { Home, Plus, Search, Settings, LogOut, User, Sun, Moon, Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api, joinGuild } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useSidebarStore } from "@/store/sidebarStore";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopBar() {
    const router = useRouter();
    const pathname = usePathname();
    const [guilds, setGuilds] = useState<any[]>([]);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [guildName, setGuildName] = useState("");
    const [guildDescription, setGuildDescription] = useState("");
    const [mounted, setMounted] = useState(false);
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme, initializeTheme } = useThemeStore();
    const { toggle: toggleSidebar } = useSidebarStore();

    // Initialize theme on mount
    useEffect(() => {
        setMounted(true);
        initializeTheme();
    }, [initializeTheme]);

    const handleJoin = async () => {
        try {
            await joinGuild(inviteCode);
            setShowJoinModal(false);
            setInviteCode("");
            // Refresh guilds
            api("/v1/guilds").then(setGuilds).catch(console.error);
        } catch (error) {
            alert("Échec de l'adhésion au serveur: " + error);
        }
    };

    const handleCreate = async () => {
        if (!guildName.trim()) {
            alert("Veuillez entrer un nom de serveur");
            return;
        }
        try {
            await api("/v1/guilds", {
                method: "POST",
                body: JSON.stringify({
                    name: guildName,
                    description: guildDescription || undefined,
                }),
                headers: { "Content-Type": "application/json" },
            });
            setShowCreateModal(false);
            setGuildName("");
            setGuildDescription("");
            // Refresh guilds
            api("/v1/guilds").then(setGuilds).catch(console.error);
        } catch (error) {
            alert("Échec de la création du serveur: " + error);
        }
    };

    useEffect(() => {
        api("/v1/guilds").then(setGuilds).catch(console.error);
    }, []);

    const initials = user?.username
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";

    return (
        <>
            <div className="h-16 glass border-b border-white/10 flex items-center px-3 sm:px-6 gap-2 sm:gap-4 shadow-lg relative overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-subtle opacity-5 animate-gradient" />

                {/* Hamburger Menu (Mobile) */}
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 rounded-lg hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground z-10 touch-target"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Logo */}
                <Link
                    href="/chat"
                    className="flex items-center gap-2 hover-lift cursor-pointer z-10"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-subtle flex items-center justify-center shadow-glow">
                        <span className="text-xl font-bold text-white">Lt</span>
                    </div>
                    <span className="text-xl font-bold text-gradient-primary font-display hidden sm:block">
                        LtChat
                    </span>
                </Link>

                {/* Divider */}
                <div className="hidden sm:block h-8 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

                {/* Navigation Pills */}
                <div className="hidden md:flex flex-1 items-center gap-2 overflow-x-auto scrollbar-hide z-10">
                    {/* Home */}
                    <Link
                        href="/chat"
                        className={cn(
                            "px-3 lg:px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all text-sm whitespace-nowrap",
                            pathname === "/chat"
                                ? "bg-gradient-subtle text-white shadow-glow"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <Home className="w-4 h-4" />
                        <span className="hidden lg:inline">Accueil</span>
                    </Link>

                    {/* Guilds/Servers */}
                    {guilds.map((g) => {
                        const isActive = pathname.includes(`/guilds/${g.id}`);
                        return (
                            <Link
                                key={g.id}
                                href={`/chat/guilds/${g.id}/channels/${g.id}`}
                                className={cn(
                                    "px-3 lg:px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all text-sm whitespace-nowrap",
                                    isActive
                                        ? "bg-gradient-subtle text-white shadow-glow animate-scale-in"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <div className={cn(
                                    "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold",
                                    isActive ? "bg-white/20" : "bg-muted"
                                )}>
                                    {g.name.slice(0, 2).toUpperCase()}
                                </div>
                                <span className="hidden lg:inline">{g.name}</span>
                            </Link>
                        );
                    })}

                    {/* Add Server Buttons */}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-2 lg:px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 whitespace-nowrap touch-target"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden xl:inline">Créer</span>
                    </button>
                    <button
                        onClick={() => setShowJoinModal(true)}
                        className="px-2 lg:px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 whitespace-nowrap touch-target"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden xl:inline">Rejoindre</span>
                    </button>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-1 sm:gap-3 z-10">
                    {/* Theme Toggle - only render after mount to avoid hydration issues */}
                    {mounted && (
                        <button
                            onClick={toggleTheme}
                            className="hidden sm:flex p-2 rounded-lg hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground touch-target"
                            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    )}

                    {/* Search */}
                    <button className="hidden md:flex p-2 rounded-lg hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground touch-target">
                        <Search className="w-5 h-5" />
                    </button>

                    {/* User Menu */}
                    <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/10">
                        <Avatar className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-gradient shadow-glow">
                            <AvatarFallback className="bg-gradient-subtle text-white font-semibold text-sm">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="hidden lg:flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                                {user?.username}
                            </span>
                            <span className="text-xs text-muted-foreground">En ligne</span>
                        </div>
                        <button
                            onClick={() => {
                                logout();
                                router.push("/login");
                            }}
                            className="hidden sm:flex p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all touch-target"
                            title="Se déconnecter"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4" onClick={() => setShowCreateModal(false)}>
                    <div className="glass shadow-glow-lg rounded-2xl p-4 sm:p-6 w-full max-w-md animate-scale-in border-gradient" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl sm:text-2xl font-bold text-gradient mb-2 font-display">
                            Créer un serveur
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                            Créez votre propre serveur et invitez vos amis
                        </p>
                        <input
                            type="text"
                            placeholder="Nom du serveur"
                            className="w-full bg-muted/50 text-foreground p-2.5 sm:p-3 rounded-xl mb-3 sm:mb-4 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm sm:text-base"
                            value={guildName}
                            onChange={(e) => setGuildName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        />
                        <textarea
                            placeholder="Description (optionnelle)"
                            className="w-full bg-muted/50 text-foreground p-2.5 sm:p-3 rounded-xl mb-4 sm:mb-6 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-sm sm:text-base"
                            rows={3}
                            value={guildDescription}
                            onChange={(e) => setGuildDescription(e.target.value)}
                        />
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-smooth rounded-lg hover:bg-muted/30 touch-target"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreate}
                                className="px-6 py-2 bg-gradient-subtle text-white rounded-xl hover-lift shadow-glow font-medium touch-target"
                            >
                                Créer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Join Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4" onClick={() => setShowJoinModal(false)}>
                    <div className="glass shadow-glow-lg rounded-2xl p-4 sm:p-6 w-full max-w-md animate-scale-in border-gradient" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl sm:text-2xl font-bold text-gradient mb-2 font-display">
                            Rejoindre un serveur
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                            Entrez le code d'invitation pour rejoindre un serveur existant
                        </p>
                        <input
                            type="text"
                            placeholder="Code d'invitation"
                            className="w-full bg-muted/50 text-foreground p-2.5 sm:p-3 rounded-xl mb-4 sm:mb-6 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm sm:text-base"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                        />
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                            <button
                                onClick={() => setShowJoinModal(false)}
                                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-smooth rounded-lg hover:bg-muted/30 touch-target"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleJoin}
                                className="px-6 py-2 bg-gradient-subtle text-white rounded-xl hover-lift shadow-glow font-medium touch-target"
                            >
                                Rejoindre
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
