import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
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
  Gift,
  ExternalLink,
  CreditCard,
} from "lucide-react";

const PLANS = [
  {
    id: "time_management" as const,
    name: "Gestão de Tempo",
    price: "19,90",
    description: "Organize seu dia com a metodologia Gestão do Tempo",
    icon: Clock,
    color: "from-violet-600 to-purple-700",
    features: [
      "Meu Dia — visão diária completa",
      "Planejamento semanal",
      "Gestão do Tempo (Importante, Urgente, Circunstancial)",
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
    notIncluded: ["Gestão de tempo", "Gestão do Tempo", "Score de produtividade"],
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
      "Suporte por email",
    ],
    notIncluded: [],
  },
];

export default function Planos() {
  const utils = trpc.useUtils();
  const [, navigate] = useLocation();
  const { data: subscription } = trpc.subscription.get.useQuery();

  const startTrial = trpc.subscription.startTrial.useMutation({
    onSuccess: () => {
      utils.subscription.get.invalidate();
      toast.success("🎉 Trial iniciado! Você tem 5 dias de acesso completo.");
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

  const createCheckout = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecionando para o checkout seguro...");
        window.open(data.url, "_blank");
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const createPortal = trpc.stripe.createPortalSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Abrindo portal de assinatura...");
        window.open(data.url, "_blank");
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const sub = subscription as {
    plan?: string;
    status?: string;
    trialDaysLeft?: number | null;
    isAdmin?: boolean;
    stripeCustomerId?: string | null;
  } | null;

  const currentPlan = sub?.plan;
  const isTrialing = sub?.status === "trialing";
  const trialDaysLeft = sub?.trialDaysLeft ?? 0;
  const hasNoSubscription = !subscription;
  const hasStripeSubscription = !!(sub as any)?.stripeCustomerId;

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Planos e Assinatura</h1>
          <p className="text-muted-foreground mt-1">
            {isTrialing
              ? `Período de avaliação — ${trialDaysLeft} dia(s) restante(s)`
              : currentPlan
              ? `Seu plano atual: ${PLANS.find((p) => p.id === currentPlan)?.name}`
              : "Escolha o plano ideal para você"}
          </p>
        </div>

        {/* Trial ativo */}
        {isTrialing && (
          <div className="mb-8 p-4 rounded-xl bg-violet-50 border border-violet-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Avaliação gratuita em andamento
                </p>
                <p className="text-sm text-muted-foreground">
                  {trialDaysLeft <= 0
                    ? "Seu trial expirou. Escolha um plano para continuar."
                    : `${trialDaysLeft} dia(s) restante(s) com acesso completo ao Combo`}
                </p>
              </div>
            </div>
            <Badge className="bg-violet-600 text-white border-0 text-xs">Trial ativo</Badge>
          </div>
        )}

        {/* Plano ativo (não trial) */}
        {sub && !isTrialing && !sub.isAdmin && currentPlan && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Plano ativo: {PLANS.find((p) => p.id === currentPlan)?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {sub.status === "active" ? "Ativo" : sub.status}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {hasStripeSubscription ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => createPortal.mutate({ origin: window.location.origin })}
                  disabled={createPortal.isPending}
                  className="border-violet-200 text-violet-600 hover:bg-violet-50"
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Gerenciar assinatura
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              ) : (
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
              )}
            </div>
          </div>
        )}

        {/* Banner de trial para novos usuários */}
        {hasNoSubscription && (
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg">5 dias grátis — acesso completo</p>
                <p className="text-violet-200 text-sm">
                  Experimente todos os módulos. Cartão de crédito necessário.
                </p>
              </div>
            </div>
            <Button
              onClick={() => startTrial.mutate()}
              disabled={startTrial.isPending}
              className="bg-white text-violet-700 hover:bg-violet-50 font-semibold flex-shrink-0"
            >
              <Gift className="w-4 h-4 mr-2" />
              Experimentar grátis
            </Button>
          </div>
        )}

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrentPlan = !isTrialing && currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative bg-card rounded-2xl border-2 p-6 flex flex-col transition-all ${
                  isCurrentPlan
                    ? "border-violet-400 shadow-lg shadow-violet-100"
                    : plan.badge
                    ? "border-amber-300 shadow-md shadow-amber-50"
                    : "border-border hover:border-muted-foreground/30 hover:shadow-md"
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

                <h3 className="text-lg font-bold text-foreground mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                <div className="mb-5">
                  <span className="text-3xl font-extrabold text-foreground">R$ {plan.price}</span>
                  <span className="text-muted-foreground text-sm">/mês</span>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground/50">
                      <X className="w-4 h-4 text-muted-foreground/30 mt-0.5 shrink-0" />
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
                    onClick={() =>
                      createCheckout.mutate({ plan: plan.id, origin: window.location.origin })
                    }
                    disabled={createCheckout.isPending}
                    className={`w-full rounded-xl font-semibold ${
                      plan.badge
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : "bg-violet-600 hover:bg-violet-700 text-white"
                    }`}
                  >
                    {isTrialing || currentPlan ? "Assinar este plano" : "Assinar agora"}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Pagamento seguro via Stripe. Cancele quando quiser. Sem fidelidade.
        </p>
      </div>
    </AppLayout>
  );
}
