import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Clock,
  Wallet,
  CheckCircle2,
  Star,
  BarChart3,
  Target,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  X,
} from "lucide-react";
import { useLocation } from "wouter";

const ICON_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/icon-gv-navy-gold_6e5b968f.png";

const PLANS = [
  {
    id: "time_management",
    name: "Gestão de Tempo",
    price: "19,90",
    description: "Organize seu dia com a metodologia Gestão do Tempo",
    icon: Clock,
    color: "from-amber-600 to-yellow-700",
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
    id: "budget",
    name: "Orçamento Doméstico",
    price: "19,90",
    description: "Controle financeiro familiar inteligente e completo",
    icon: Wallet,
    color: "from-amber-700 to-amber-900",
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
    id: "combo",
    name: "Combo Completo",
    price: "34,90",
    description: "Tudo em um só lugar — tempo e dinheiro sob controle",
    icon: Star,
    color: "from-yellow-500 to-amber-600",
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

const FEATURES = [
  {
    icon: Target,
    title: "Gestão do Tempo",
    description:
      "Classifique suas tarefas em Importante, Urgente e Circunstancial para focar no que realmente importa.",
  },
  {
    icon: BarChart3,
    title: "Score de Produtividade",
    description:
      "Acompanhe seu desempenho nos últimos 30 dias com métricas claras e objetivas.",
  },
  {
    icon: TrendingUp,
    title: "Regra 50/30/20",
    description:
      "Categorização automática das suas despesas em Essenciais, Estilo de Vida e Investimentos.",
  },
  {
    icon: Zap,
    title: "Projeção de Aposentadoria",
    description:
      "Simule 3 cenários de rentabilidade e descubra quanto você terá ao se aposentar.",
  },
  {
    icon: Shield,
    title: "Dados Isolados por Usuário",
    description:
      "Seus dados são completamente privados e isolados. Ninguém mais tem acesso.",
  },
  {
    icon: Clock,
    title: "Timer por Tarefa",
    description:
      "Inicie e pause tarefas com um clique. Saiba exatamente quanto tempo gastou em cada atividade.",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/cadastro");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#0B1437" }}>
      {/* ─── Navbar ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
        style={{ background: "rgba(11,20,55,0.92)", borderColor: "rgba(201,168,76,0.2)" }}
      >
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img
              src={ICON_URL}
              alt="Gestor de Vida"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="font-bold text-lg" style={{ color: "#C9A84C", fontFamily: "'Inter', sans-serif" }}>
              Gestor de Vida
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate("/dashboard")}
                style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}
                className="font-semibold"
              >
                Acessar Dashboard
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  style={{ color: "#C9A84C" }}
                  className="hover:bg-white/10"
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => navigate("/cadastro")}
                  style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}
                  className="font-semibold"
                >
                  Começar grátis
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────────────── */}
      <section
        className="pt-32 pb-20 px-4"
        style={{ background: "linear-gradient(180deg,#0D1B4B 0%,#0B1437 100%)" }}
      >
        <div className="container text-center max-w-4xl mx-auto">
          <Badge
            className="mb-6 border"
            style={{ background: "rgba(201,168,76,0.15)", color: "#E2C97E", borderColor: "rgba(201,168,76,0.4)" }}
          >
            🎁 5 dias grátis — com cartão de crédito
          </Badge>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight" style={{ color: "#F0E6C8" }}>
            Organize seu{" "}
            <span style={{ color: "#C9A84C" }}>tempo</span>{" "}
            e suas{" "}
            <span style={{ color: "#C9A84C" }}>finanças</span>
          </h1>
          <p className="text-base sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed" style={{ color: "#8A9BB5" }}>
            A plataforma completa para pequenas e médias empresas e profissionais autônomos que
            precisam de controle real — sem complicação e sem custo alto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => handleGetStarted()}
              className="px-8 py-6 text-lg rounded-xl font-semibold"
              style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}
            >
              Experimentar 5 dias grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg rounded-xl"
              style={{ borderColor: "rgba(201,168,76,0.5)", color: "#C9A84C", background: "transparent" }}
              onClick={() => document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" })}
            >
              Ver planos
            </Button>
          </div>
          <p className="mt-4 text-sm" style={{ color: "#5A6A80" }}>
            5 dias grátis com acesso completo. Depois, a partir de R$ 19,90/mês. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "#0D1B4B" }}>
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#F0E6C8" }}>
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#8A9BB5" }}>
              Ferramentas profissionais com preço acessível para quem não pode — e não precisa —
              pagar caro por um sistema de gestão.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(201,168,76,0.15)" }}
                >
                  <f.icon className="w-6 h-6" style={{ color: "#C9A84C" }} />
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: "#F0E6C8" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8A9BB5" }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Plans ───────────────────────────────────────────────────────────── */}
      <section id="planos" className="py-20 px-4" style={{ background: "#0B1437" }}>
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#F0E6C8" }}>
              Escolha o plano ideal para você
            </h2>
            <p className="text-lg" style={{ color: "#8A9BB5" }}>
              Sem surpresas. Preço fixo mensal, cancele quando quiser.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className="relative rounded-2xl p-5 sm:p-8 flex flex-col transition-all duration-200"
                style={{
                  background: plan.badge ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.04)",
                  border: plan.badge ? "2px solid rgba(201,168,76,0.6)" : "1px solid rgba(201,168,76,0.15)",
                }}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge
                      className="border-0 px-4 py-1 text-sm font-semibold"
                      style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}
                    >
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-5`}
                >
                  <plan.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1" style={{ color: "#F0E6C8" }}>{plan.name}</h3>
                <p className="text-sm mb-5" style={{ color: "#8A9BB5" }}>{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold" style={{ color: "#C9A84C" }}>R$ {plan.price}</span>
                  <span className="text-sm" style={{ color: "#8A9BB5" }}>/mês</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "#C8D8E8" }}>
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#C9A84C" }} />
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "#3A4A60" }}>
                      <X className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#3A4A60" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleGetStarted()}
                  className="w-full rounded-xl py-5 font-semibold"
                  style={
                    plan.badge
                      ? { background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }
                      : { background: "rgba(201,168,76,0.15)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.4)" }
                  }
                >
                  Assinar agora
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────────── */}
      <section
        className="py-20 px-4"
        style={{ background: "linear-gradient(135deg,#0D1B4B 0%,#1A2B5E 100%)", borderTop: "1px solid rgba(201,168,76,0.2)" }}
      >
        <div className="container text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#F0E6C8" }}>
            Pronto para organizar sua vida?
          </h2>
          <p className="text-lg mb-8" style={{ color: "#8A9BB5" }}>
            Junte-se a quem já usa o Gestor de Vida para ter mais controle, mais foco e mais
            resultados.
          </p>
          <Button
            size="lg"
            onClick={() => handleGetStarted()}
            className="px-10 py-6 text-lg rounded-xl font-semibold"
            style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}
          >
            Começar agora — R$ 19,90/mês
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-4 text-sm" style={{ background: "#070E26", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={ICON_URL} alt="Gestor de Vida" className="w-6 h-6 rounded" />
            <span className="font-semibold" style={{ color: "#C9A84C" }}>Gestor de Vida</span>
          </div>
          <p style={{ color: "#3A4A60" }}>© {new Date().getFullYear()} Gestor de Vida. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <a href="mailto:contato@gestordevida.com.br" className="transition-colors" style={{ color: "#5A6A80" }}>
              Suporte
            </a>
            <a href="#planos" className="transition-colors" style={{ color: "#5A6A80" }}>
              Planos
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
