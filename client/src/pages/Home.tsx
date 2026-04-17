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
    name: "E-book",
    price: "19,90",
    priceLabel: "pagamento único",
    description: "Método 3 Pilares da Vida — guia completo em PDF",
    icon: Clock,
    color: "from-amber-600 to-yellow-700",
    features: [
      "E-book: Método 3 Pilares da Vida",
      "Gestão de Tempo, Dinheiro e Futuro",
      "Estratégias práticas e aplicáveis",
      "Acesso imediato ao PDF",
    ],
    notIncluded: ["Acesso ao sistema", "Dashboard interativo", "Projeção de aposentadoria"],
  },
  {
    id: "budget",
    name: "Sistema Vitalício",
    price: "250,00",
    priceLabel: "acesso vitalício",
    description: "Acesso completo e permanente ao sistema Gestor de Vida",
    icon: Wallet,
    color: "from-amber-700 to-amber-900",
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
    id: "combo",
    name: "Combo Promocional",
    price: "147,90",
    priceLabel: "acesso vitalício",
    description: "E-book + Sistema — tudo por um preço especial",
    icon: Star,
    color: "from-yellow-500 to-amber-600",
    badge: "Melhor Oferta",
    features: [
      "E-book: Método 3 Pilares da Vida",
      "Acesso vitalício ao sistema completo",
      "Gestão do Tempo + Orçamento Doméstico",
      "Dashboard com gráficos interativos",
      "Projeção de aposentadoria (3 cenários)",
      "Pague uma vez, use para sempre",
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
                  className="hover:bg-card/10"
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
            🎁 Pagamento único — sem mensalidade, sem recorrência
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
              Adquirir agora
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
            E-book R$ 19,90 · Sistema R$ 250,00 · Combo R$ 147,90 — pague uma vez, use para sempre.
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
              Pagamento único. Sem mensalidade. Sem recorrência. Pague uma vez e use para sempre.
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
                  <span className="text-sm" style={{ color: "#8A9BB5" }}>{(plan as any).priceLabel}</span>
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
                  Comprar agora
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
            Adquirir agora — Combo R$ 147,90
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
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="mailto:contato@gestordevida.com.br" className="transition-colors" style={{ color: "#5A6A80" }}>
              Suporte
            </a>
            <a href="#planos" className="transition-colors" style={{ color: "#5A6A80" }}>
              Planos
            </a>
            <a href="/politica-de-privacidade" className="transition-colors" style={{ color: "#5A6A80" }}>
              Privacidade
            </a>
            <a href="/termos-de-uso" className="transition-colors" style={{ color: "#5A6A80" }}>
              Termos de Uso
            </a>
            <a href="/lgpd" className="transition-colors" style={{ color: "#5A6A80" }}>
              LGPD
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
