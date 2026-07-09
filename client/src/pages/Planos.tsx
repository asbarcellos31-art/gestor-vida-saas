import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  CheckCircle2,
  X,
  ArrowRight,
  Zap,
  ExternalLink,
  BookOpen,
  Infinity,
} from "lucide-react";
import { trackInitiateCheckout } from "@/lib/pixel";

const HOTMART_URL = "https://pay.hotmart.com/M105784997J?checkoutMode=2";

const PLANS = [
  {
    id: "time_management" as const,
    name: "E-book",
    price: "19,90",
    priceLabel: "pagamento único",
    description: "Método 3 Pilares da Vida — guia completo em PDF",
    icon: BookOpen,
    color: "from-blue-600 to-indigo-700",
    badge: null,
    features: [
      "E-book: Método 3 Pilares da Vida",
      "Gestão de Tempo, Dinheiro e Futuro",
      "Estratégias práticas e aplicáveis",
      "Acesso imediato ao PDF",
    ],
    notIncluded: ["Acesso ao sistema", "Dashboard interativo", "Projeção de aposentadoria"],
  },
  {
    id: "budget" as const,
    name: "Sistema Vitalício",
    price: "250,00",
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
    notIncluded: ["E-book não incluso"],
  },
  {
    id: "combo" as const,
    name: "Combo Promocional",
    price: "147,90",
    priceLabel: "acesso vitalício",
    description: "E-book + Sistema — tudo por um preço especial",
    icon: Star,
    color: "from-amber-500 to-orange-600",
    badge: "Melhor Oferta",
    features: [
      "E-book: Método 3 Pilares da Vida",
      "Acesso vitalício ao sistema completo",
      "Gestão do Tempo + Orçamento Doméstico",
      "Dashboard com gráficos interativos",
      "Projeção de aposentadoria (3 cenários)",
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

        <div className="mb-6 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-center gap-3">
          <Star className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-bold text-amber-400">Melhor custo-benefício:</span> E-book + Sistema separados custam R$ 269,90 — no Combo você paga apenas <span className="font-bold text-amber-400">R$ 147,90</span> e economiza R$ 122,00.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
