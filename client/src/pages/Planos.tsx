import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  Clock,
  Wallet,
  Star,
  CheckCircle2,
  X,
  ArrowRight,
  Zap,
} from "lucide-react";

const PLANS = [
  {
    id: "time_management" as const,
    name: "Gestão de Tempo",
    price: "19,90",
    description: "Organize seu dia com a metodologia Tríade do Tempo",
    icon: Clock,
    color: "from-violet-600 to-purple-700",
    features: [
      "Meu Dia — visão diária completa",
      "Planejamento semanal",
      "Tríade do Tempo (Importante, Urgente, Circunstancial)",
      "Score de produtividade (30 dias)",
      "Relatório de desempenho",
      "Timer por tarefa",
    ],
    notIncluded: ["Orçamento doméstico", "Regra 50/30/20", "Projeção de aposentadoria"],
  },
  {
    id: "budget" as const,
    name: "Orçamento Doméstico",
    price: "19,90",
    description: "Controle financeiro familiar inteligente e completo",
    icon: Wallet,
    color: "from-emerald-600 to-teal-700",
    features: [
      "Orçamento mensal (receitas e despesas)",
      "Regra 50/30/20 automática",
      "Contas parceladas",
      "Projeção de aposentadoria (3 cenários)",
      "Dashboard anual com gráficos",
      "Categorização por tipo",
    ],
    notIncluded: ["Gestão de tempo", "Tríade do Tempo", "Score de produtividade"],
  },
  {
    id: "combo" as const,
    name: "Combo Completo",
    price: "34,90",
    description: "Tudo em um só lugar — tempo e dinheiro sob controle",
    icon: Star,
    color: "from-amber-500 to-orange-600",
    badge: "Mais Popular",
    features: [
      "Tudo do plano Gestão de Tempo",
      "Tudo do plano Orçamento Doméstico",
      "Dashboard unificado",
      "Resumo diário completo",
      "Acesso a todos os módulos",
      "Suporte prioritário por email",
    ],
    notIncluded: [],
  },
];

export default function Planos() {
  const utils = trpc.useUtils();
  const [, navigate] = useLocation();
  const { data: subscription } = trpc.subscription.get.useQuery();

  const createSubscription = trpc.subscription.activate.useMutation({
    onSuccess: () => {
      utils.subscription.get.invalidate();
      toast.success("Plano ativado com sucesso! Bem-vindo ao Gestor de Vida! 🎉");
      navigate("/dashboard");
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const cancelSubscription = trpc.subscription.cancel.useMutation({
    onSuccess: () => {
      utils.subscription.get.invalidate();
      toast.success("Assinatura cancelada.");
    },
    onError: (e) => toast.error(e.message),
  });

  const currentPlan = subscription?.plan;

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Planos e Assinatura</h1>
          <p className="text-gray-500 mt-1">
            {currentPlan
              ? `Seu plano atual: ${PLANS.find((p) => p.id === currentPlan)?.name}`
              : "Escolha o plano ideal para você"}
          </p>
        </div>

        {/* Current subscription status */}
        {subscription && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Plano ativo: {PLANS.find((p) => p.id === currentPlan)?.name}
                </p>
                <p className="text-sm text-gray-500">
                  Status: {subscription.status === "active" ? "Ativo" : subscription.status}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Tem certeza que deseja cancelar sua assinatura?")) {
                  cancelSubscription.mutate();
                }
              }}
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              Cancelar assinatura
            </Button>
          </div>
        )}

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col transition-all ${
                  isCurrentPlan
                    ? "border-violet-400 shadow-lg shadow-violet-100"
                    : plan.badge
                    ? "border-amber-300 shadow-md shadow-amber-50"
                    : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-violet-600 text-white border-0 px-3">Plano Atual</Badge>
                  </div>
                )}
                {plan.badge && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-amber-500 text-white border-0 px-3">{plan.badge}</Badge>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>

                <div className="mb-5">
                  <span className="text-3xl font-extrabold text-gray-900">R$ {plan.price}</span>
                  <span className="text-gray-500 text-sm">/mês</span>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                      <X className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Button disabled className="w-full rounded-xl opacity-70">
                    Plano atual
                  </Button>
                ) : (
                  <Button
                    onClick={() => createSubscription.mutate({ plan: plan.id })}
                    disabled={createSubscription.isPending}
                    className={`w-full rounded-xl font-semibold ${
                      plan.badge
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : "bg-violet-600 hover:bg-violet-700 text-white"
                    }`}
                  >
                    {currentPlan ? "Mudar para este plano" : "Assinar agora"}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Cancele quando quiser. Sem fidelidade. Suporte por email.
        </p>
      </div>
    </AppLayout>
  );
}
