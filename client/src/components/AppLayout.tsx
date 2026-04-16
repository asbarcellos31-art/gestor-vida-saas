import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";

import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import {
  Clock,
  Wallet,
  LayoutDashboard,
  LogOut,
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  TrendingUp,
  CreditCard,
  Settings2,
  Zap,
  BookOpen,
  Crown,
  SlidersHorizontal,
  Wrench,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "sonner";

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-sidebar-accent/40">
      <button
        onClick={() => setTheme("dark")}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-xs font-medium transition-colors ${
          theme === "dark"
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground/50 hover:text-sidebar-foreground"
        }`}
      >
        <Moon className="w-3 h-3" />
        Dark
      </button>
      <button
        onClick={() => setTheme("light")}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-xs font-medium transition-colors ${
          theme === "light"
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground/50 hover:text-sidebar-foreground"
        }`}
      >
        <Sun className="w-3 h-3" />
        Light
      </button>
    </div>
  );
}

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

  // Indicador de tarefa ativa (lido do localStorage)
  const [hasActiveTimer, setHasActiveTimer] = useState(() => {
    try { return !!localStorage.getItem("gestor_active_timer"); } catch { return false; }
  });
  const [timerElapsed, setTimerElapsed] = useState(0);
  useEffect(() => {
    const check = () => {
      try {
        const saved = localStorage.getItem("gestor_active_timer");
        if (saved) {
          const parsed = JSON.parse(saved);
          const startedAt = new Date(parsed.startedAt).getTime();
          setTimerElapsed(Math.floor((Date.now() - startedAt) / 1000));
          setHasActiveTimer(true);
        } else {
          setHasActiveTimer(false);
          setTimerElapsed(0);
        }
      } catch { setHasActiveTimer(false); }
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, []);

  const fmtTimer = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  // Grupos colapsáveis
  const [budgetOpen, setBudgetOpen] = useState(
    location.startsWith("/orcamento") || location === "/parcelados" || location === "/aposentadoria"
  );

  function isMonthActive(m: number) {
    return location === `/orcamento/${selectedYear}/${m}` ||
      (location === "/orcamento" && selectedYear === currentYear && m === currentMonth);
  }

  const go = (path: string) => { navigate(path); onNavigate?.(); };

  const navItem = (
    path: string,
    label: string,
    Icon: React.ElementType,
    locked = false,
    active = false
  ) => (
    <button
      key={path}
      onClick={() => {
        if (locked) { toast.error("Seu plano não inclui este módulo"); go("/planos"); return; }
        go(path);
      }}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : locked
          ? "text-sidebar-foreground/30 cursor-not-allowed"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {locked && <Lock className="w-3 h-3" />}
    </button>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/icon-gv-navy-gold_6e5b968f.png"
            alt="Gestor de Vida"
            className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
          />
          <span className="font-bold text-sidebar-foreground text-sm tracking-tight">Gestor de Vida</span>
        </div>
      </div>

      <nav className="flex-1 px-3 pt-4 pb-3 space-y-1 overflow-y-auto">

        {/* Dashboard */}
        {navItem("/dashboard", "Dashboard", LayoutDashboard, false, location === "/dashboard")}

        {/* ── Gestão de Tempo ── */}
        <div className="pt-2">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Gestão de Tempo
          </p>
          {hasTime ? (
            <button
              onClick={() => go("/gestao-tempo")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location === "/gestao-tempo" || location.startsWith("/gestao-tempo")
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">Gestão do Tempo</span>
              {hasActiveTimer && (
                <span className="flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span className="text-[10px] font-mono text-green-400 font-bold">{fmtTimer(timerElapsed)}</span>
                </span>
              )}
            </button>
          ) : (
            navItem("/planos", "Gestão do Tempo", Clock, true, false)
          )}
        </div>

        {/* ── Orçamento Doméstico ── */}
        <div className="pt-2">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Orçamento Doméstico
          </p>

          {hasBudget ? (
            <>
              {/* Cabeçalho colapsável */}
              <button
                onClick={() => setBudgetOpen((o) => !o)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <Wallet className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">Orçamento</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${budgetOpen ? "rotate-180" : ""}`} />
              </button>

              {budgetOpen && (
                <div className="ml-3 pl-3 border-l border-sidebar-border mt-1 space-y-0.5">
                  {/* Mês atual rápido */}
                  <button
                    onClick={() => go(`/orcamento/${currentYear}/${currentMonth}`)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                      isMonthActive(currentMonth) && selectedYear === currentYear
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    Mês Atual
                  </button>

                  {/* Sub-itens */}
                  {[
                    { label: "Dashboard Anual", path: "/orcamento/dashboard", Icon: LayoutDashboard },
                    { label: "Parcelados", path: "/parcelados", Icon: CreditCard },
                    { label: "Aposentadoria", path: "/aposentadoria", Icon: TrendingUp },
                    { label: "Configurações", path: "/orcamento/configuracoes", Icon: SlidersHorizontal },
                  ].map(({ label, path, Icon }) => (
                    <button
                      key={path}
                      onClick={() => go(path)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                        location === path
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      {label}
                    </button>
                  ))}

                  {/* Seletor de mês */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <span className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider">Mês</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedYear((y) => y - 1)} className="w-5 h-5 flex items-center justify-center rounded text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <span className="text-[11px] font-bold text-sidebar-foreground">{selectedYear}</span>
                        <button onClick={() => setSelectedYear((y) => y + 1)} className="w-5 h-5 flex items-center justify-center rounded text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {MONTHS.map((m, i) => (
                        <button
                          key={i}
                          onClick={() => go(`/orcamento/${selectedYear}/${i + 1}`)}
                          className={`px-1 py-1.5 rounded text-[11px] font-medium transition-colors ${
                            isMonthActive(i + 1)
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            navItem("/planos", "Orçamento", Wallet, true, false)
          )}
        </div>

        {/* ── Conta ── */}
        <div className="pt-2">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Conta
          </p>
          {navItem("/planos", "Meu Plano", Settings2, false, location === "/planos")}
          {navItem("/ferramentas", "Ferramentas", Wrench, false, location.startsWith("/ferramentas"))}
          {(user as any)?.role === "admin" && navItem("/admin", "Admin", Crown, false, location === "/admin")}
        </div>
      </nav>

      {/* User info + seletor de tema */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {/* Seletor de tema */}
        <ThemeToggle />
        {/* Usuário */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-8 h-8 bg-sidebar-primary/20 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-sidebar-primary">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.name || "Usuário"}</p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">{user?.email || ""}</p>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
            title="Sair"
          >
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
  const [, navigate] = useLocation();

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
    navigate("/login");
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-60 flex-col bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
            <div className="flex items-center justify-end p-3 border-b border-sidebar-border">
              <button onClick={() => setSidebarOpen(false)} className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent onNavigate={() => setSidebarOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
          >
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
