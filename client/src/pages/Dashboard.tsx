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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

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

  return (
    <AppLayout>
      <div className="p-3 sm:p-5 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#F0E6C8' }}>
            Olá, {user?.name?.split(" ")[0] ?? "bem-vindo"} 👋
          </h1>
          <p className="mt-1" style={{ color: '#8A9BB5' }}>
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* No subscription */}
        {!subscription && (
          <Card className="mb-6" style={{ borderColor: 'rgba(201,168,76,0.4)', background: 'rgba(201,168,76,0.08)' }}>
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.2)' }}>
                  <Zap className="w-6 h-6" style={{ color: '#C9A84C' }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: '#F0E6C8' }}>Você ainda não tem um plano ativo</h3>
                  <p className="text-sm" style={{ color: '#8A9BB5' }}>
                    Assine um plano para acessar os módulos de Gestão de Tempo e Orçamento Doméstico.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/planos")}
                className="shrink-0 font-semibold" style={{ background: 'linear-gradient(135deg,#C9A84C,#E2C97E)', color: '#0B1437' }}
              >
                Ver planos
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {/* Score */}
          <Card className={!hasTimeAccess ? "opacity-60" : ""}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.15)' }}>
                  <BarChart3 className="w-5 h-5" style={{ color: '#C9A84C' }} />
                </div>
                {!hasTimeAccess && <Lock className="w-4 h-4 text-gray-400" />}
              </div>
              <p className="text-2xl font-bold" style={{ color: '#F0E6C8' }}>
                {hasTimeAccess ? `${score?.score ?? 0}%` : "—"}
              </p>
              <p className="text-sm mt-1" style={{ color: '#8A9BB5' }}>Score de Produtividade</p>
            </CardContent>
          </Card>

          {/* Today tasks */}
          <Card className={!hasTimeAccess ? "opacity-60" : ""}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.15)' }}>
                  <CheckCircle2 className="w-5 h-5" style={{ color: '#C9A84C' }} />
                </div>
                {!hasTimeAccess && <Lock className="w-4 h-4 text-gray-400" />}
              </div>
              <p className="text-2xl font-bold" style={{ color: '#F0E6C8' }}>
                {hasTimeAccess ? `${completedToday}/${totalToday}` : "—"}
              </p>
              <p className="text-sm mt-1" style={{ color: '#8A9BB5' }}>Tarefas concluídas hoje</p>
            </CardContent>
          </Card>

          {/* Balance */}
          <Card className={!hasBudgetAccess ? "opacity-60" : ""}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.15)' }}>
                  <Wallet className="w-5 h-5" style={{ color: '#C9A84C' }} />
                </div>
                {!hasBudgetAccess && <Lock className="w-4 h-4 text-gray-400" />}
              </div>
              <p className="text-2xl font-bold" style={{ color: '#F0E6C8' }}>
                {hasBudgetAccess ? formatCurrency(budgetSummary?.balance ?? 0) : "—"}
              </p>
              <p className="text-sm mt-1" style={{ color: '#8A9BB5' }}>Saldo do mês</p>
            </CardContent>
          </Card>

          {/* Income */}
          <Card className={!hasBudgetAccess ? "opacity-60" : ""}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.15)' }}>
                  <TrendingUp className="w-5 h-5" style={{ color: '#C9A84C' }} />
                </div>
                {!hasBudgetAccess && <Lock className="w-4 h-4 text-gray-400" />}
              </div>
              <p className="text-2xl font-bold" style={{ color: '#F0E6C8' }}>
                {hasBudgetAccess ? formatCurrency(budgetSummary?.income ?? 0) : "—"}
              </p>
              <p className="text-sm mt-1" style={{ color: '#8A9BB5' }}>Receita do mês</p>
            </CardContent>
          </Card>
        </div>

        {/* Modules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Time Management */}
          <Card className={!hasTimeAccess ? "border-dashed" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base" style={{ color: '#F0E6C8' }}>Gestão de Tempo</CardTitle>
                    <p className="text-xs" style={{ color: '#8A9BB5' }}>Gestão do Tempo</p>
                  </div>
                </div>
                {!hasTimeAccess && (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    Bloqueado
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {hasTimeAccess ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: '#8A9BB5' }}>Tarefas pendentes hoje</span>
                    <span className="font-semibold" style={{ color: '#F0E6C8' }}>{pendingToday}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: '#8A9BB5' }}>Concluídas hoje</span>
                    <span className="font-semibold" style={{ color: '#C9A84C' }}>{completedToday}</span>
                  </div>
                  {totalToday > 0 && (
                    <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ background: 'linear-gradient(90deg,#C9A84C,#E2C97E)', width: `${(completedToday / totalToday) * 100}%` }}
                      />
                    </div>
                  )}
                  <Button
                    onClick={() => navigate("/gestao-tempo")}
                    className="w-full mt-2 font-semibold" style={{ background: 'linear-gradient(135deg,#C9A84C,#E2C97E)', color: '#0B1437' }}
                  >
                    Abrir Gestão de Tempo
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm mb-3" style={{ color: '#8A9BB5' }}>
                    Faça upgrade para acessar a Gestão de Tempo com a metodologia Gestão do Tempo.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/planos")}
                    className="font-semibold" style={{ borderColor: 'rgba(201,168,76,0.4)', color: '#C9A84C', background: 'transparent' }}
                  >
                    Ver planos
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget */}
          <Card className={!hasBudgetAccess ? "border-dashed" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base" style={{ color: '#F0E6C8' }}>Orçamento Doméstico</CardTitle>
                    <p className="text-xs" style={{ color: '#8A9BB5' }}>Regra 50/30/20</p>
                  </div>
                </div>
                {!hasBudgetAccess && (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    Bloqueado
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {hasBudgetAccess ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: '#8A9BB5' }}>Receitas</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(budgetSummary?.income ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: '#8A9BB5' }}>Despesas</span>
                    <span className="font-semibold text-rose-600">
                      {formatCurrency(budgetSummary?.totalExpenses ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t pt-2" style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
                    <span className="font-medium" style={{ color: '#F0E6C8' }}>Saldo</span>
                    <span
                      className={`font-bold ${
                        (budgetSummary?.balance ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {formatCurrency(budgetSummary?.balance ?? 0)}
                    </span>
                  </div>
                  <Button
                    onClick={() => navigate("/orcamento")}
                    className="w-full mt-2 font-semibold" style={{ background: 'linear-gradient(135deg,#C9A84C,#E2C97E)', color: '#0B1437' }}
                  >
                    Abrir Orçamento
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm mb-3" style={{ color: '#8A9BB5' }}>
                    Faça upgrade para acessar o Orçamento Doméstico com a regra 50/30/20.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/planos")}
                    className="font-semibold" style={{ borderColor: 'rgba(201,168,76,0.4)', color: '#C9A84C', background: 'transparent' }}
                  >
                    Ver planos
                    <ArrowRight className="w-4 h-4 ml-1" />
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
