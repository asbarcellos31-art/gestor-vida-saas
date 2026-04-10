import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import {
  Clock,
  Wallet,
  LayoutDashboard,
  LogOut,
  Zap,
  Lock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc as trpcClient } from "@/lib/trpc";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  module?: "time_management" | "budget";
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Gestão de Tempo", path: "/gestao-tempo", icon: Clock, module: "time_management" },
  { label: "Orçamento", path: "/orcamento", icon: Wallet, module: "budget" },
];

function hasModuleAccess(plan: string | undefined, module: string | undefined): boolean {
  if (!module) return true;
  if (!plan) return false;
  if (plan === "combo") return true;
  return plan === module;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [location, navigate] = useLocation();
  const { data: subscription } = trpc.subscription.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const logoutMutation = trpcClient.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  const plan = subscription?.plan;
  const planLabel =
    plan === "time_management"
      ? "Gestão de Tempo"
      : plan === "budget"
      ? "Orçamento"
      : plan === "combo"
      ? "Combo Completo"
      : "Sem plano";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ─── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{ background: "oklch(0.12 0.03 265)" }}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b" style={{ borderColor: "oklch(0.22 0.03 265)" }}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mr-3">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Gestor de Vida
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = location === item.path || location.startsWith(item.path + "/");
            const hasAccess = hasModuleAccess(plan, item.module);
            const locked = item.module && !hasAccess;

            if (locked) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate("/planos")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium opacity-50 cursor-pointer"
                      style={{ color: "oklch(0.75 0.01 240)" }}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <Lock className="w-3 h-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Faça upgrade para acessar este módulo</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "hover:text-white"
                }`}
                style={{
                  background: active ? "oklch(0.45 0.18 265)" : "transparent",
                  color: active ? "white" : "oklch(0.75 0.01 240)",
                }}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {active && <ChevronRight className="w-3 h-3" />}
              </button>
            );
          })}
        </nav>

        {/* Plan badge + user */}
        <div className="p-3 border-t" style={{ borderColor: "oklch(0.22 0.03 265)" }}>
          {subscription && (
            <div className="mb-3 px-3">
              <Badge
                className="text-xs border-0"
                style={{ background: "oklch(0.20 0.04 265)", color: "oklch(0.80 0.10 265)" }}
              >
                Plano: {planLabel}
              </Badge>
            </div>
          )}
          {!subscription && (
            <button
              onClick={() => navigate("/planos")}
              className="w-full mb-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
            >
              <Zap className="w-3 h-3" />
              Assinar um plano
            </button>
          )}
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg"
            style={{ background: "oklch(0.18 0.03 265)" }}
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-violet-600 text-white text-xs">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.name ?? "Usuário"}</p>
              <p className="text-xs truncate" style={{ color: "oklch(0.60 0.02 240)" }}>
                {user?.email ?? ""}
              </p>
            </div>
            <button
              onClick={() => logoutMutation.mutate()}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Sair"
            >
              <LogOut className="w-3.5 h-3.5" style={{ color: "oklch(0.60 0.02 240)" }} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
