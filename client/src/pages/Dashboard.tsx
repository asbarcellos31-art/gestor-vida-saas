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
  Target,
  BarChart3,
} from "lucide-react";
import { useMemo, useState } from "react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function getCurrentMonth() {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  return `${m}/${y}`;
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const today = useMemo(() => getTodayStr(), []);
  const currentMonth = useMemo(() => getCurrentMonth(), []);

  const { data: subscription } = trpc.subscription.get.useQuery();
  const plan = subscription?.plan;

  const hasTimeAccess = plan === "time_management" || plan === "combo";
  const hasBudgetAccess = plan === "budget" || plan === "combo";

  const { data: todayTasks } = trpc.tasks.byDate.useQuery(
    { date: today },
    { enabled: hasTimeAccess }
  );
  const { data: score } = trpc.tasks.score.useQuery(undefined, { enabled: hasTimeAccess });
  const { data: budgetData } = trpc.budget.byMonth.useQuery(
    { month: currentMonth },
    { enabled: hasBudgetAccess }
  );

  const completedToday = todayTasks?.filter((t) => t.status === "completed").length ?? 0;
  const totalToday = todayTasks?.length ?? 0;
  const pendingToday = todayTasks?.filter((t) => t.status === "pending").length ?? 0;

  const planLabel =
    plan === "time_management"
      ? "Gestão de Tempo"
      : plan === "budget"
      ? "Orçamento Doméstico"
      : plan === "combo"
      ? "Combo Completo"
      : null;

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {user?.name?.split(" ")[0] ?? "bem-vindo"} 👋
          </h1>
          <p className="text-gray-500 mt-1">
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
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Você ainda não tem um plano ativo</h3>
                  <p className="text-sm text-gray-600">
                    Assine um plano para acessar os módulos de Gestão de Tempo e Orçamento Doméstico.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/planos")}
                className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
              >
                Ver planos
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Score */}
          <Card className={!hasTimeAccess ? "opacity-60" : ""}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-violet-600" />
                </div>
                {!hasTimeAccess && <Lock className="w-4 h-4 text-gray-400" />}
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {hasTimeAccess ? `${score?.score ?? 0}%` : "—"}
              </p>
              <p className="text-sm text-gray-500 mt-1">Score de Produtividade</p>
            </CardContent>
          </Card>

          {/* Today tasks */}
          <Card className={!hasTimeAccess ? "opacity-60" : ""}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
                {!hasTimeAccess && <Lock className="w-4 h-4 text-gray-400" />}
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {hasTimeAccess ? `${completedToday}/${totalToday}` : "—"}
              </p>
              <p className="text-sm text-gray-500 mt-1">Tarefas concluídas hoje</p>
            </CardContent>
          </Card>

          {/* Balance */}
          <Card className={!hasBudgetAccess ? "opacity-60" : ""}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
                {!hasBudgetAccess && <Lock className="w-4 h-4 text-gray-400" />}
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {hasBudgetAccess
                  ? formatCurrency(budgetData?.summary?.balance ?? 0)
                  : "—"}
              </p>
              <p className="text-sm text-gray-500 mt-1">Saldo do mês</p>
            </CardContent>
          </Card>

          {/* Income */}
          <Card className={!hasBudgetAccess ? "opacity-60" : ""}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                </div>
                {!hasBudgetAccess && <Lock className="w-4 h-4 text-gray-400" />}
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {hasBudgetAccess
                  ? formatCurrency(budgetData?.summary?.income ?? 0)
                  : "—"}
              </p>
              <p className="text-sm text-gray-500 mt-1">Receita do mês</p>
            </CardContent>
          </Card>
        </div>

        {/* Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Management */}
          <Card className={!hasTimeAccess ? "border-dashed" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Gestão de Tempo</CardTitle>
                    <p className="text-xs text-gray-500">Tríade do Tempo</p>
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
                    <span className="text-gray-600">Tarefas pendentes hoje</span>
                    <span className="font-semibold text-gray-900">{pendingToday}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Concluídas hoje</span>
                    <span className="font-semibold text-emerald-600">{completedToday}</span>
                  </div>
                  {totalToday > 0 && (
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-violet-500 h-2 rounded-full transition-all"
                        style={{ width: `${(completedToday / totalToday) * 100}%` }}
                      />
                    </div>
                  )}
                  <Button
                    onClick={() => navigate("/gestao-tempo")}
                    className="w-full mt-2 bg-violet-600 hover:bg-violet-700"
                  >
                    Abrir Gestão de Tempo
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-3">
                    Faça upgrade para acessar a Gestão de Tempo com a metodologia Tríade do Tempo.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/planos")}
                    className="border-violet-200 text-violet-600 hover:bg-violet-50"
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
                    <CardTitle className="text-base">Orçamento Doméstico</CardTitle>
                    <p className="text-xs text-gray-500">Regra 50/30/20</p>
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
                    <span className="text-gray-600">Receitas</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(budgetData?.summary?.income ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Despesas</span>
                    <span className="font-semibold text-rose-600">
                      {formatCurrency(budgetData?.summary?.totalExpenses ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t pt-2">
                    <span className="text-gray-700 font-medium">Saldo</span>
                    <span
                      className={`font-bold ${
                        (budgetData?.summary?.balance ?? 0) >= 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {formatCurrency(budgetData?.summary?.balance ?? 0)}
                    </span>
                  </div>
                  <Button
                    onClick={() => navigate("/orcamento")}
                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Abrir Orçamento
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-3">
                    Faça upgrade para acessar o Orçamento Doméstico com a regra 50/30/20.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/planos")}
                    className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
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
