import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
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

const PLANS = [
  {
    id: "time_management",
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
    id: "budget",
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
    id: "combo",
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

const FEATURES = [
  {
    icon: Target,
    title: "Tríade do Tempo",
    description:
      "Classifique suas tarefas em Importante, Urgente e Circunstancial para focar no que realmente importa.",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: BarChart3,
    title: "Score de Produtividade",
    description:
      "Acompanhe seu desempenho nos últimos 30 dias com métricas claras e objetivas.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: TrendingUp,
    title: "Regra 50/30/20",
    description:
      "Categorização automática das suas despesas em Essenciais, Estilo de Vida e Investimentos.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Zap,
    title: "Projeção de Aposentadoria",
    description:
      "Simule 3 cenários de rentabilidade e descubra quanto você terá ao se aposentar.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Shield,
    title: "Dados Isolados por Usuário",
    description:
      "Seus dados são completamente privados e isolados. Ninguém mais tem acesso.",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: Clock,
    title: "Timer por Tarefa",
    description:
      "Inicie e pause tarefas com um clique. Saiba exatamente quanto tempo gastou em cada atividade.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/icon-gv-v3_237347c1.png"
              alt="Gestor de Vida"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="font-bold text-gray-900 text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Gestor de Vida
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard")} className="bg-violet-600 hover:bg-violet-700">
                Acessar Dashboard
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => (window.location.href = getLoginUrl())}>
                  Entrar
                </Button>
                <Button
                  onClick={() => (window.location.href = getLoginUrl())}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Começar grátis
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-violet-50 via-white to-white">
        <div className="container text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-100">
            🎁 5 dias grátis — sem cartão de crédito
          </Badge>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Organize seu{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
              tempo
            </span>{" "}
            e suas{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
              finanças
            </span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            A plataforma completa para pequenas e médias empresas e profissionais autônomos que
            precisam de controle real — sem complicação e sem custo alto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => handleGetStarted()}
              className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-violet-200"
            >
              Experimentar 5 dias grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg rounded-xl border-gray-200"
              onClick={() => document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" })}
            >
              Ver planos
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            5 dias grátis com acesso completo. Depois, a partir de R$ 19,90/mês. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ferramentas profissionais com preço acessível para quem não pode — e não precisa —
              pagar caro por um sistema de gestão.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 bg-white"
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Plans ───────────────────────────────────────────────────────────── */}
      <section id="planos" className="py-20 px-4 bg-gray-50">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-lg text-gray-600">
              Sem surpresas. Preço fixo mensal, cancele quando quiser.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 p-5 sm:p-8 flex flex-col transition-all duration-200 hover:shadow-xl ${
                  plan.badge
                    ? "border-amber-400 shadow-lg shadow-amber-100"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-amber-500 text-white border-0 px-4 py-1 text-sm">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-5`}
                >
                  <plan.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-5">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">R$ {plan.price}</span>
                  <span className="text-gray-500 text-sm">/mês</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
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
                <Button
                  onClick={() => handleGetStarted()}
                  className={`w-full rounded-xl py-5 font-semibold ${
                    plan.badge
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-violet-600 hover:bg-violet-700 text-white"
                  }`}
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
      <section className="py-20 px-4 bg-gradient-to-br from-violet-600 to-purple-700">
        <div className="container text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para organizar sua vida?
          </h2>
          <p className="text-violet-200 text-lg mb-8">
            Junte-se a quem já usa o Gestor de Vida para ter mais controle, mais foco e mais
            resultados.
          </p>
          <Button
            size="lg"
            onClick={() => handleGetStarted()}
            className="bg-white text-violet-700 hover:bg-violet-50 px-10 py-6 text-lg rounded-xl font-semibold shadow-lg"
          >
            Começar agora — R$ 19,90/mês
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-4 bg-gray-900 text-gray-400 text-sm">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-white font-semibold">Gestor de Vida</span>
          </div>
          <p>© {new Date().getFullYear()} Gestor de Vida. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <a href="mailto:suporte@gestordevida.com.br" className="hover:text-white transition-colors">
              Suporte
            </a>
            <a href="#planos" className="hover:text-white transition-colors">
              Planos
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
