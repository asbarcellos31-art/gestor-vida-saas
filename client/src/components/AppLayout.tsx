import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useState } from "react";
import {
  Clock,
  Wallet,
  LayoutDashboard,
  LogOut,
  Lock,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  TrendingUp,
  CreditCard,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
export const MONTHS_FULL = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

function hasModuleAccess(plan: string | undefined, module: "time_management" | "budget"): boolean {
  if (!plan) return false;
  if (plan === "combo") return true;
  return plan === module;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { data: subscription } = trpc.subscription.get.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
    onError: () => toast.error("Erro ao sair"),
  });

  const plan = (subscription as { plan?: string } | null)?.plan;
  const hasBudget = hasModuleAccess(plan, "budget");
  const hasTime = hasModuleAccess(plan, "time_management");

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  function isMonthActive(m: number) {
    return location === `/orcamento/${selectedYear}/${m}` ||
      (location === "/orcamento" && selectedYear === currentYear && m === currentMonth);
  }

  const go = (path: string) => { navigate(path); onNavigate?.(); };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-sidebar-primary rounded flex items-center justify-center">
            <Wallet className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-bold text-sidebar-foreground text-sm">Gestor de Vida</span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="px-3 pt-3 pb-2 space-y-0.5">
        {[
          { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, module: undefined as undefined },
          { label: "Gestão de Tempo", path: "/gestao-tempo", icon: Clock, module: "time_management" as const },
        ].map((item) => {
          const locked = item.module && !hasModuleAccess(plan, item.module);
          const active = location === item.path || location.startsWith(item.path + "/");
          return (
            <button
              key={item.path}
              onClick={() => {
                if (locked) { toast.error("Seu plano não inclui este módulo"); go("/planos"); return; }
                go(item.path);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : locked
                  ? "text-sidebar-foreground/30"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {locked && <Lock className="w-3 h-3" />}
            </button>
          );
        })}
      </nav>

      {/* Orçamento section */}
      <div className="px-3 pb-2">
        <div className="border-t border-sidebar-border pt-3">
          {hasBudget ? (
            <>
              {/* Budget sub-nav */}
              <div className="space-y-0.5 mb-3">
                {[
                  { label: "Dashboard Anual", path: "/orcamento/dashboard", icon: LayoutDashboard },
                  { label: "Parcelados", path: "/parcelados", icon: CreditCard },
                  { label: "Aposentadoria", path: "/aposentadoria", icon: TrendingUp },
                ].map((item) => (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location === item.path
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Month picker */}
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                  Orçamento Mensal
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setSelectedYear((y) => y - 1)} className="w-5 h-5 flex items-center justify-center rounded text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-sidebar-foreground">{selectedYear}</span>
                  <button onClick={() => setSelectedYear((y) => y + 1)} className="w-5 h-5 flex items-center justify-center rounded text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {MONTHS.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => go(`/orcamento/${selectedYear}/${i + 1}`)}
                    className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                      isMonthActive(i + 1)
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <button
              onClick={() => go("/planos")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/30 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Wallet className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">Orçamento</span>
              <Lock className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Planos */}
      <div className="px-3 pb-2">
        <button
          onClick={() => go("/planos")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            location === "/planos"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }`}
        >
          <Settings2 className="w-4 h-4 flex-shrink-0" />
          Meu Plano
        </button>
      </div>

      {/* User info */}
      <div className="mt-auto p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-sidebar-accent-foreground">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.name || "Usuário"}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{user?.email || ""}</p>
          </div>
          <button onClick={() => logoutMutation.mutate()} className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors" title="Sair">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="hidden lg:flex w-60 flex-col bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
            <div className="flex items-center justify-end p-3">
              <button onClick={() => setSidebarOpen(false)} className="text-sidebar-foreground/60 hover:text-sidebar-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent onNavigate={() => setSidebarOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-foreground text-base">{title || "Gestor de Vida"}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
