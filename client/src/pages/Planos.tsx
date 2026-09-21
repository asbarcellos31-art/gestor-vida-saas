import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  X,
  ArrowRight,
  Zap,
  ExternalLink,
  Infinity,
} from "lucide-react";
import { trackInitiateCheckout } from "@/lib/pixel";

const HOTMART_URL = "https://pay.hotmart.com/M105784997J?off=zys6qohw";

const PLANS = [
  {
    id: "budget" as const,
    name: "Gestor de Vida",
    price: "59,90",
    priceLabel: "acesso vitalício",
    description: "Acesso completo e permanente ao sistema Gestor de Vida",
    icon: Infinity,
    color: "from-emerald-600 to-teal-700",
    badge: null,
    features: [
      "Gestão do Tempo completa",
      "Orçamento Doméstico completo",
      "Dashboard com gráficos",
      "Projeção de aposentadoria (3 cenários)",
      "Regra 50/30/20 automática",
      "Score de produtividade",
      "Pague uma vez, use para sempre",
    ],
    notIncluded: [],
  },
];

export default function Planos() {
  const { data: subscription } = trpc.subscription.get.useQuery();

  const sub = subscription as {
    plan?: string;
    status?: string;
    isAdmin?: boolean;
  } | null;

  const currentPlan = sub?.plan;

  const handleBuy = (plan: typeof PLANS[number]) => {
    localStorage.setItem("lastPurchaseValue", plan.price.replace(",", "."));
    localStorage.setItem("lastPurchaseName", plan.name);
    trackInitiateCheckout({ currency: "BRL", value: parseFloat(plan.price.replace(",", ".")), content_name: plan.name });
    window.open(HOTMART_URL, "_blank");
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Planos e Acesso</h1>
          <p className="text-muted-foreground mt-1">
            {currentPlan
              ? `Seu plano atual: ${PLANS.find((p) => p.id === currentPlan)?.name ?? currentPlan}`
              : "Pagamento único — sem mensalidade, sem recorrência"}
          </p>
        </div>

        {sub && !sub.isAdmin && currentPlan && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-900/20 border border-emerald-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Acesso ativo: {PLANS.find((p) => p.id === currentPlan)?.name ?? currentPlan}
              </p>
              <p className="text-sm text-muted-foreground">Acesso vitalício — sem mensalidade</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 max-w-sm mx-auto gap-6">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative bg-card rounded-2xl border-2 p-6 flex flex-col transition-all ${
                  isCurrentPlan
                    ? "border-primary shadow-lg shadow-primary/10"
                    : plan.badge
                    ? "border-amber-400/60 shadow-md shadow-amber-500/10"
                    : "border-border hover:border-muted-foreground/30 hover:shadow-md"
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground border-0 px-3">Plano Atual</Badge>
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
                  <span className="text-muted-foreground text-sm ml-1">{plan.priceLabel}</span>
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
                    onClick={() => handleBuy(plan)}
                    className={`w-full rounded-xl font-semibold ${
                      plan.badge
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    }`}
                  >
                    Comprar agora
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Pagamento seguro via Hotmart. Acesso vitalício — pague uma vez, use para sempre.
        </p>
      </div>
    </AppLayout>
  );
}
