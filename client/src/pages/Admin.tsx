import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Users,
  TrendingUp,
  Clock,
  XCircle,
  DollarSign,
  CheckCircle2,
  Crown,
  Wallet,
  Star,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

const PLAN_LABELS: Record<string, string> = {
  time_management: "Gestão de Tempo",
  budget: "Orçamento Doméstico",
  combo: "Combo Promocional",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Ativo", color: "bg-emerald-100 text-emerald-700" },
  trialing: { label: "Trial", color: "bg-violet-100 text-violet-700" },
  expired: { label: "Expirado", color: "bg-orange-100 text-orange-700" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Admin() {
  const utils = trpc.useUtils();
  const { data: metrics, isLoading: metricsLoading } = trpc.admin.metrics.useQuery();
  const { data: users, isLoading: usersLoading } = trpc.admin.users.useQuery();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const setUserPlan = trpc.admin.setUserPlan.useMutation({
    onSuccess: () => {
      utils.admin.users.invalidate();
      utils.admin.metrics.invalidate();
      toast.success("Plano atualizado com sucesso.");
      setSelectedUser(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const mrr = metrics ? (metrics.mrrCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00";

  const filteredUsers = (users ?? []).filter((u) => {
    if (planFilter !== "all" && u.plan !== planFilter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-amber-500" />
              <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
            </div>
            <p className="text-muted-foreground text-sm">Métricas, assinantes e gestão de planos</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              utils.admin.metrics.invalidate();
              utils.admin.users.invalidate();
            }}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>

        {/* Metrics grid */}
        {metricsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-5 h-24 animate-pulse" />
            ))}
          </div>
        ) : metrics ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <MetricCard
                icon={DollarSign}
                label="MRR"
                value={mrr}
                sub="receita mensal recorrente"
                color="bg-emerald-100 text-emerald-700"
              />
              <MetricCard
                icon={Users}
                label="Assinantes Ativos"
                value={metrics.activeSubscribers}
                sub={`${metrics.conversionRate}% de conversão`}
                color="bg-violet-100 text-violet-700"
              />
              <MetricCard
                icon={Clock}
                label="Em Trial"
                value={metrics.activeTrials}
                sub={`${metrics.expiredTrials} expirados`}
                color="bg-blue-100 text-blue-700"
              />
              <MetricCard
                icon={TrendingUp}
                label="Total de Usuários"
                value={metrics.totalUsers}
                sub={`${metrics.cancelled} cancelados`}
                color="bg-amber-100 text-amber-700"
              />
            </div>

            {/* Por plano */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gestão de Tempo</p>
                  <p className="text-xl font-bold text-foreground">{metrics.byPlan.time_management}</p>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Orçamento</p>
                  <p className="text-xl font-bold text-foreground">{metrics.byPlan.budget}</p>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Combo</p>
                  <p className="text-xl font-bold text-foreground">{metrics.byPlan.combo}</p>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* Users table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="font-semibold text-foreground">Usuários</h2>
            <div className="flex gap-2 flex-wrap">
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground"
              >
                <option value="all">Todos os planos</option>
                <option value="time_management">Gestão de Tempo</option>
                <option value="budget">Orçamento</option>
                <option value="combo">Combo</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground"
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativos</option>
                <option value="trialing">Em trial</option>
                <option value="expired">Expirados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>

          {usersLoading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando usuários...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Nenhum usuário encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">Usuário</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Plano</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Desde</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const statusInfo = STATUS_LABELS[user.status ?? ""] ?? { label: user.status ?? "—", color: "bg-muted/50 text-muted-foreground" };
                    const isExpanded = selectedUser === user.userId;
                    return (
                      <>
                        <tr
                          key={user.userId}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                        >
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-foreground">{user.name ?? "Sem nome"}</p>
                              <p className="text-xs text-muted-foreground">{user.email ?? "—"}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            {user.plan ? (
                              <span className="text-foreground">{PLAN_LABELS[user.plan] ?? user.plan}</span>
                            ) : (
                              <span className="text-muted-foreground">Sem plano</span>
                            )}
                          </td>
                          <td className="p-3">
                            {user.status ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "—"}
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUser(isExpanded ? null : user.userId)}
                              className="gap-1 text-xs"
                            >
                              Gerenciar
                              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </Button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${user.userId}-actions`} className="bg-muted/10 border-b border-border/50">
                            <td colSpan={5} className="p-4">
                              <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-sm text-muted-foreground mr-2">Definir plano:</span>
                                {(["time_management", "budget", "combo"] as const).map((plan) => (
                                  <Button
                                    key={plan}
                                    variant="outline"
                                    size="sm"
                                    disabled={setUserPlan.isPending || user.plan === plan}
                                    onClick={() => setUserPlan.mutate({ userId: user.userId, plan })}
                                    className={`text-xs ${user.plan === plan ? "border-violet-300 text-violet-600" : ""}`}
                                  >
                                    {user.plan === plan && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                    {PLAN_LABELS[plan]}
                                  </Button>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={setUserPlan.isPending || !user.plan}
                                  onClick={() => {
                                    if (confirm("Cancelar o plano deste usuário?")) {
                                      setUserPlan.mutate({ userId: user.userId, plan: null });
                                    }
                                  }}
                                  className="text-xs border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Cancelar plano
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
