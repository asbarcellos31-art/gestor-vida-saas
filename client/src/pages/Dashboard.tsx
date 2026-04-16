import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import {
  Clock,
  Wallet,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Lock,
  Zap,
  BarChart3,
} from "lucide-react";
import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

// ─── Paleta ────────────────────────────────────────────────────────────────
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E2C97E";
const NAVY_BORDER = "rgba(201,168,76,0.2)";
const NAVY_CARD = "rgba(255,255,255,0.04)";
const TEXT_PRIMARY = "#F0E6C8";
const TEXT_MUTED = "#8A9BB5";

const DONUT_COLORS = [GOLD, "#3A6B8A", "#2A4A6A"];
const BAR_COLORS = [GOLD, "#3A6B8A", "#8B3A3A"];

const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// ─── Helpers ───────────────────────────────────────────────────────────────
function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl px-3 py-2 text-sm shadow-lg"
        style={{ background: "#0D1B4B", border: "1px solid rgba(201,168,76,0.3)", color: TEXT_PRIMARY }}
      >
        {label && <p className="font-semibold mb-1" style={{ color: GOLD }}>{label}</p>}
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {typeof p.value === "number" && p.value > 100 ? formatCurrency(p.value) : `${p.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Componente principal ──────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const today = useMemo(() => getTodayStr(), []);
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;

  const { data: subscription } = trpc.subscription.get.useQuery();
  const plan = subscription?.plan;

  const hasTimeAccess = plan === "time_management" || plan === "combo";
  const hasBudgetAccess = plan === "budget" || plan === "combo";

  const { data: todayTasks } = trpc.tasks.byDate.useQuery(
    { date: today },
    { enabled: hasTimeAccess }
  );
  const { data: score } = trpc.tasks.score.useQuery(undefined, { enabled: hasTimeAccess });

  const { data: incomeData } = trpc.income.list.useQuery(
    { year: currentYear, month: currentMonthNum },
    { enabled: hasBudgetAccess }
  );
  const { data: expensesData } = trpc.expenses.list.useQuery(
    { year: currentYear, month: currentMonthNum },
    { enabled: hasBudgetAccess }
  );

  const budgetSummary = useMemo(() => {
    if (!hasBudgetAccess) return null;
    const income = (incomeData ?? []).reduce((s, e) => s + (parseFloat(String(e.amount ?? "0")) || 0), 0);
    const totalExpenses = (expensesData ?? []).reduce((s, e) => s + (parseFloat(String(e.amount)) || 0), 0);
    return { income, totalExpenses, balance: income - totalExpenses };
  }, [incomeData, expensesData, hasBudgetAccess]);

  const completedToday = todayTasks?.filter((t) => t.status === "completed").length ?? 0;
  const totalToday = todayTasks?.length ?? 0;
  const pendingToday = todayTasks?.filter((t) => t.status === "pending").length ?? 0;
  const scoreVal = score?.score ?? 0;

  // ── Dados para gráfico donut — Score de Produtividade ──────────────────
  const scoreDonutData = [
    { name: "Concluído", value: scoreVal },
    { name: "Restante", value: 100 - scoreVal },
  ];

  // ── Dados para gráfico donut — Tarefas de hoje ─────────────────────────
  const tasksDonutData = totalToday > 0
    ? [
        { name: "Concluídas", value: completedToday },
        { name: "Pendentes", value: pendingToday },
      ]
    : [{ name: "Sem tarefas", value: 1 }];

  // ── Dados para gráfico donut — Orçamento ──────────────────────────────
  const budgetDonutData = budgetSummary && budgetSummary.income > 0
    ? [
        { name: "Despesas", value: budgetSummary.totalExpenses },
        { name: "Saldo", value: Math.max(0, budgetSummary.balance) },
      ]
    : [{ name: "Sem dados", value: 1 }];

  // ── Dados para gráfico de barras — últimos 6 meses (simulado com dados do mês atual) ──
  const barData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonthNum - 1 - i, 1);
      const label = MONTHS_SHORT[d.getMonth()];
      // Para meses anteriores, mostramos 0 (dados reais só do mês atual)
      const isCurrentMonth = i === 0;
      months.push({
        mes: label,
        Receitas: isCurrentMonth ? (budgetSummary?.income ?? 0) : 0,
        Despesas: isCurrentMonth ? (budgetSummary?.totalExpenses ?? 0) : 0,
      });
    }
    return months;
  }, [budgetSummary, currentYear, currentMonthNum]);

  // ── Dados para gráfico de barras — tarefas por categoria ──────────────
  const taskBarData = useMemo(() => {
    if (!todayTasks) return [];
    const categories: Record<string, { total: number; done: number }> = {};
    todayTasks.forEach((t) => {
      const cat = t.category || "Geral";
      if (!categories[cat]) categories[cat] = { total: 0, done: 0 };
      categories[cat].total++;
      if (t.status === "completed") categories[cat].done++;
    });
    return Object.entries(categories).map(([name, v]) => ({
      categoria: name.length > 10 ? name.slice(0, 10) + "…" : name,
      Total: v.total,
      Concluídas: v.done,
    }));
  }, [todayTasks]);

  return (
    <AppLayout>
      <div className="p-3 sm:p-5 max-w-6xl mx-auto">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>
            Olá, {user?.name?.split(" ")[0] ?? "bem-vindo"} 👋
          </h1>
          <p className="mt-1" style={{ color: TEXT_MUTED }}>
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* ── Sem assinatura ──────────────────────────────────────────── */}
        {!subscription && (
          <Card className="mb-6" style={{ borderColor: "rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.08)" }}>
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(201,168,76,0.2)" }}>
                  <Zap className="w-6 h-6" style={{ color: GOLD }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: TEXT_PRIMARY }}>Você ainda não tem um plano ativo</h3>
                  <p className="text-sm" style={{ color: TEXT_MUTED }}>
                    Assine um plano para acessar os módulos de Gestão de Tempo e Orçamento Doméstico.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/planos")}
                className="shrink-0 font-semibold"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, color: "#0B1437" }}
              >
                Ver planos <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── KPI Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              icon: <BarChart3 className="w-5 h-5" style={{ color: GOLD }} />,
              value: hasTimeAccess ? `${scoreVal}%` : "—",
              label: "Score de Produtividade",
              locked: !hasTimeAccess,
            },
            {
              icon: <CheckCircle2 className="w-5 h-5" style={{ color: GOLD }} />,
              value: hasTimeAccess ? `${completedToday}/${totalToday}` : "—",
              label: "Tarefas concluídas hoje",
              locked: !hasTimeAccess,
            },
            {
              icon: <Wallet className="w-5 h-5" style={{ color: GOLD }} />,
              value: hasBudgetAccess ? formatCurrency(budgetSummary?.balance ?? 0) : "—",
              label: "Saldo do mês",
              locked: !hasBudgetAccess,
            },
            {
              icon: <TrendingUp className="w-5 h-5" style={{ color: GOLD }} />,
              value: hasBudgetAccess ? formatCurrency(budgetSummary?.income ?? 0) : "—",
              label: "Receita do mês",
              locked: !hasBudgetAccess,
            },
          ].map((kpi) => (
            <Card key={kpi.label} className={kpi.locked ? "opacity-60" : ""}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(201,168,76,0.15)" }}>
                    {kpi.icon}
                  </div>
                  {kpi.locked && <Lock className="w-4 h-4" style={{ color: TEXT_MUTED }} />}
                </div>
                <p className="text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>{kpi.value}</p>
                <p className="text-sm mt-1" style={{ color: TEXT_MUTED }}>{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Gráficos Donut ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Score donut */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold" style={{ color: TEXT_MUTED }}>Score de Produtividade</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {hasTimeAccess ? (
                <>
                  <div style={{ height: 160, width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={scoreDonutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={68}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          <Cell fill={GOLD} />
                          <Cell fill="rgba(255,255,255,0.06)" />
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-3xl font-extrabold -mt-2" style={{ color: GOLD }}>{scoreVal}%</p>
                  <p className="text-xs mt-1" style={{ color: TEXT_MUTED }}>últimos 30 dias</p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 gap-2">
                  <Lock className="w-8 h-8" style={{ color: TEXT_MUTED }} />
                  <p className="text-xs text-center" style={{ color: TEXT_MUTED }}>Plano Gestão de Tempo necessário</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tarefas donut */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold" style={{ color: TEXT_MUTED }}>Tarefas de Hoje</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {hasTimeAccess ? (
                <>
                  <div style={{ height: 160, width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tasksDonutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={68}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {tasksDonutData.map((_, i) => (
                            <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-3xl font-extrabold -mt-2" style={{ color: TEXT_PRIMARY }}>{completedToday}<span className="text-lg font-normal" style={{ color: TEXT_MUTED }}>/{totalToday}</span></p>
                  <p className="text-xs mt-1" style={{ color: TEXT_MUTED }}>concluídas hoje</p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 gap-2">
                  <Lock className="w-8 h-8" style={{ color: TEXT_MUTED }} />
                  <p className="text-xs text-center" style={{ color: TEXT_MUTED }}>Plano Gestão de Tempo necessário</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orçamento donut */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold" style={{ color: TEXT_MUTED }}>Orçamento do Mês</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {hasBudgetAccess ? (
                <>
                  <div style={{ height: 160, width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={budgetDonutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={68}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {budgetDonutData.map((_, i) => (
                            <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-lg font-extrabold -mt-2" style={{ color: (budgetSummary?.balance ?? 0) >= 0 ? GOLD : "#C0392B" }}>
                    {formatCurrency(budgetSummary?.balance ?? 0)}
                  </p>
                  <p className="text-xs mt-1" style={{ color: TEXT_MUTED }}>saldo do mês</p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 gap-2">
                  <Lock className="w-8 h-8" style={{ color: TEXT_MUTED }} />
                  <p className="text-xs text-center" style={{ color: TEXT_MUTED }}>Plano Orçamento necessário</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Gráficos de Barras ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Barras — Receitas vs Despesas (últimos 6 meses) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold" style={{ color: TEXT_MUTED }}>Receitas vs Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              {hasBudgetAccess ? (
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="mes" tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: TEXT_MUTED, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: TEXT_MUTED, fontSize: 11 }} />
                      <Bar dataKey="Receitas" fill={GOLD} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Despesas" fill={BAR_COLORS[2]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-52 gap-2">
                  <Lock className="w-8 h-8" style={{ color: TEXT_MUTED }} />
                  <p className="text-xs text-center" style={{ color: TEXT_MUTED }}>Plano Orçamento necessário</p>
                  <Button variant="outline" size="sm" onClick={() => navigate("/planos")} style={{ borderColor: NAVY_BORDER, color: GOLD, background: "transparent" }}>
                    Ver planos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Barras — Tarefas por categoria */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold" style={{ color: TEXT_MUTED }}>Tarefas por Categoria (hoje)</CardTitle>
            </CardHeader>
            <CardContent>
              {hasTimeAccess ? (
                taskBarData.length > 0 ? (
                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={taskBarData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="categoria" tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: TEXT_MUTED, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: TEXT_MUTED, fontSize: 11 }} />
                        <Bar dataKey="Total" fill={BAR_COLORS[1]} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Concluídas" fill={GOLD} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-52 gap-2">
                    <CheckCircle2 className="w-8 h-8" style={{ color: TEXT_MUTED }} />
                    <p className="text-xs text-center" style={{ color: TEXT_MUTED }}>Nenhuma tarefa para hoje ainda</p>
                    <Button size="sm" onClick={() => navigate("/gestao-tempo")} style={{ background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, color: "#0B1437" }}>
                      Adicionar tarefas
                    </Button>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-52 gap-2">
                  <Lock className="w-8 h-8" style={{ color: TEXT_MUTED }} />
                  <p className="text-xs text-center" style={{ color: TEXT_MUTED }}>Plano Gestão de Tempo necessário</p>
                  <Button variant="outline" size="sm" onClick={() => navigate("/planos")} style={{ borderColor: NAVY_BORDER, color: GOLD, background: "transparent" }}>
                    Ver planos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Módulos ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Gestão de Tempo */}
          <Card className={!hasTimeAccess ? "border-dashed" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(201,168,76,0.2)" }}>
                    <Clock className="w-5 h-5" style={{ color: GOLD }} />
                  </div>
                  <div>
                    <CardTitle className="text-base" style={{ color: TEXT_PRIMARY }}>Gestão de Tempo</CardTitle>
                    <p className="text-xs" style={{ color: TEXT_MUTED }}>Metodologia Gestão do Tempo</p>
                  </div>
                </div>
                {!hasTimeAccess && (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="w-3 h-3 mr-1" /> Bloqueado
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {hasTimeAccess ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: TEXT_MUTED }}>Tarefas pendentes hoje</span>
                    <span className="font-semibold" style={{ color: TEXT_PRIMARY }}>{pendingToday}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: TEXT_MUTED }}>Concluídas hoje</span>
                    <span className="font-semibold" style={{ color: GOLD }}>{completedToday}</span>
                  </div>
                  {totalToday > 0 && (
                    <div className="w-full rounded-full h-2" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ background: `linear-gradient(90deg,${GOLD},${GOLD_LIGHT})`, width: `${(completedToday / totalToday) * 100}%` }}
                      />
                    </div>
                  )}
                  <Button
                    onClick={() => navigate("/gestao-tempo")}
                    className="w-full mt-2 font-semibold"
                    style={{ background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, color: "#0B1437" }}
                  >
                    Abrir Gestão de Tempo <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm mb-3" style={{ color: TEXT_MUTED }}>
                    Faça upgrade para acessar a Gestão de Tempo com a metodologia Gestão do Tempo.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/planos")}
                    className="font-semibold"
                    style={{ borderColor: NAVY_BORDER, color: GOLD, background: "transparent" }}
                  >
                    Ver planos <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orçamento */}
          <Card className={!hasBudgetAccess ? "border-dashed" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(201,168,76,0.2)" }}>
                    <Wallet className="w-5 h-5" style={{ color: GOLD }} />
                  </div>
                  <div>
                    <CardTitle className="text-base" style={{ color: TEXT_PRIMARY }}>Orçamento Doméstico</CardTitle>
                    <p className="text-xs" style={{ color: TEXT_MUTED }}>Regra 50/30/20</p>
                  </div>
                </div>
                {!hasBudgetAccess && (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="w-3 h-3 mr-1" /> Bloqueado
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {hasBudgetAccess ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: TEXT_MUTED }}>Receitas</span>
                    <span className="font-semibold" style={{ color: GOLD }}>
                      {formatCurrency(budgetSummary?.income ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: TEXT_MUTED }}>Despesas</span>
                    <span className="font-semibold" style={{ color: "#C0392B" }}>
                      {formatCurrency(budgetSummary?.totalExpenses ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t pt-2" style={{ borderColor: NAVY_BORDER }}>
                    <span className="font-medium" style={{ color: TEXT_PRIMARY }}>Saldo</span>
                    <span
                      className="font-bold"
                      style={{ color: (budgetSummary?.balance ?? 0) >= 0 ? GOLD : "#C0392B" }}
                    >
                      {formatCurrency(budgetSummary?.balance ?? 0)}
                    </span>
                  </div>
                  <Button
                    onClick={() => navigate("/orcamento")}
                    className="w-full mt-2 font-semibold"
                    style={{ background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, color: "#0B1437" }}
                  >
                    Abrir Orçamento <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm mb-3" style={{ color: TEXT_MUTED }}>
                    Faça upgrade para acessar o Orçamento Doméstico com a regra 50/30/20.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/planos")}
                    className="font-semibold"
                    style={{ borderColor: NAVY_BORDER, color: GOLD, background: "transparent" }}
                  >
                    Ver planos <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
