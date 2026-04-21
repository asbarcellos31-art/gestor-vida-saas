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
  Repeat2,
  Flame,
  Brain,
  PenLine,
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
      "Classifique suas tarefas em Importante, Urgente e Circunstancial. Você decide o que entra, o que fica e o que sai. Sem automação que pensa por você.",
  },
  {
    icon: PenLine,
    title: "Lançamento Manual Intencional",
    description:
      "Cada gasto que você registra é um momento de consciência. Não é burocracia — é o contato direto com a sua realidade financeira.",
  },
  {
    icon: TrendingUp,
    title: "Regra 50/30/20",
    description:
      "Visualize em tempo real como seus gastos se distribuem entre Essenciais, Estilo de Vida e Investimentos. O método só funciona se você alimentar.",
  },
  {
    icon: Zap,
    title: "Projeção de Aposentadoria",
    description:
      "Simule 3 cenários de rentabilidade e veja o que a consistência de hoje constrói no futuro. Números reais, sem promessa de atalho.",
  },
  {
    icon: BarChart3,
    title: "Score de Produtividade",
    description:
      "Acompanhe seu desempenho nos últimos 30 dias. O score não mente — ele reflete exatamente o quanto você executou o processo.",
  },
  {
    icon: Shield,
    title: "Dados Privados e Isolados",
    description:
      "Seus dados são completamente privados. Nenhuma integração com banco, nenhum extrato automático. Você controla o que entra.",
  },
];

const PILLARS = [
  {
    icon: Repeat2,
    title: "Consistência acima de tudo",
    text: "Não é o dia perfeito que muda a vida. É o processo repetido todos os dias — mesmo nos dias ruins, mesmo quando bate a preguiça, mesmo quando parece que não está funcionando. O resultado é filho da frequência.",
  },
  {
    icon: Brain,
    title: "Simples não quer dizer fácil",
    text: "Anotar um gasto é simples. Fazer isso todos os dias, sem exceção, durante meses — isso é difícil. Qualquer um entende o método em 5 minutos. Poucos têm a teimosia de aplicá-lo por 90 dias seguidos. Esses poucos são os que mudam de vida.",
  },
  {
    icon: Flame,
    title: "O tempo recompensa quem persiste",
    text: "Não existe resultado financeiro ou de produtividade sem tempo. O mercado quer te vender velocidade. A realidade entrega resultado para quem persiste. Persistir no processo simples, dia após dia, é o ativo mais raro e mais valioso que existe.",
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
            <img src={ICON_URL} alt="Gestor de Vida" className="w-8 h-8 rounded-lg object-cover" />
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
                  Começar agora
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────────────── */}
      <section
        className="pt-36 pb-24 px-4"
        style={{ background: "linear-gradient(180deg,#0D1B4B 0%,#0B1437 100%)" }}
      >
        <div className="container text-center max-w-4xl mx-auto">
          <Badge
            className="mb-6 border"
            style={{ background: "rgba(201,168,76,0.15)", color: "#E2C97E", borderColor: "rgba(201,168,76,0.4)" }}
          >
            🎁 Pagamento único — sem mensalidade, sem recorrência
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight" style={{ color: "#F0E6C8" }}>
            O sistema que exige{" "}
            <span style={{ color: "#C9A84C" }}>a sua participação</span>{" "}
            para funcionar
          </h1>

          <p className="text-lg sm:text-xl mb-6 max-w-2xl mx-auto leading-relaxed" style={{ color: "#8A9BB5" }}>
            Gestor de Vida é uma ferramenta de gestão do tempo e das finanças pessoais baseada no{" "}
            <strong style={{ color: "#C9A84C" }}>Método 3 Pilares</strong>: Tempo, Dinheiro e Futuro.
            Não tem integração automática com banco. Não importa extrato. Não pensa por você.
          </p>

          <p className="text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed font-medium" style={{ color: "#C9A84C" }}>
            Você lança. Você enxerga. Você decide. Esse contato com a realidade é o método.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => handleGetStarted()}
              className="px-8 py-6 text-lg rounded-xl font-semibold"
              style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}
            >
              Quero começar agora
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

      {/* ─── Manifesto / Filosofia ───────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "#070E26" }}>
        <div className="container max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#C9A84C" }}>
            Por que este sistema é diferente
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-8 leading-tight" style={{ color: "#F0E6C8" }}>
            Simples não quer dizer fácil.
          </h2>
          <p className="text-lg leading-relaxed mb-6" style={{ color: "#8A9BB5" }}>
            Existe uma diferença enorme entre um processo simples e um processo fácil. O Gestor de Vida é simples: você lança seus gastos, classifica suas tarefas, acompanha seus números. Qualquer pessoa entende em minutos.
          </p>
          <p className="text-lg leading-relaxed mb-6" style={{ color: "#8A9BB5" }}>
            Mas fazer isso todo dia — sem parar, sem desculpa, sem esperar que o sistema faça por você — isso é difícil. E é exatamente essa dificuldade que gera o resultado. Porque quando você lança um gasto, você não está só registrando um número. Você está tendo contato com a sua realidade. E esse contato muda comportamento.
          </p>
          <p className="text-xl font-bold leading-relaxed" style={{ color: "#C9A84C" }}>
            Não adianta o sistema ser automático. Não adianta importar o extrato do banco ou do cartão. Se você não passa pelo processo, o processo não passa por você.
          </p>
        </div>
      </section>

      {/* ─── 3 Pilares do Método ─────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "#0D1B4B" }}>
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C9A84C" }}>
              A filosofia por trás do método
            </p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#F0E6C8" }}>
              O que separa quem muda de quem continua igual
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="p-7 rounded-2xl flex flex-col gap-4"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(201,168,76,0.15)" }}
                >
                  <p.icon className="w-6 h-6" style={{ color: "#C9A84C" }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: "#F0E6C8" }}>{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8A9BB5" }}>{p.text}</p>
              </div>
            ))}
          </div>

          {/* Citação de impacto */}
          <div
            className="mt-12 p-8 rounded-2xl text-center"
            style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.3)" }}
          >
            <p className="text-xl md:text-2xl font-bold leading-relaxed" style={{ color: "#E2C97E" }}>
              "A teimosia de persistir no processo simples é o ativo mais raro que existe. O tempo recompensa quem não desiste."
            </p>
          </div>
        </div>
      </section>

      {/* ─── O que o sistema faz ─────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "#0B1437" }}>
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C9A84C" }}>
              A ferramenta
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#F0E6C8" }}>
              O que o Gestor de Vida entrega
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#8A9BB5" }}>
              Três módulos integrados que cobrem os pilares que definem a qualidade de vida de qualquer pessoa: como você usa o tempo, como você usa o dinheiro e para onde você está indo.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl"
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

      {/* ─── Para quem é / Para quem NÃO é ──────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "#070E26" }}>
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#F0E6C8" }}>
              Seja honesto consigo mesmo
            </h2>
            <p className="text-lg mt-3" style={{ color: "#8A9BB5" }}>
              Este sistema não é para todo mundo. E está tudo bem.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="p-7 rounded-2xl"
              style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.25)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#10b981" }}>
                ✓ Este sistema é para você se...
              </p>
              <ul className="space-y-3">
                {[
                  "Você quer entender para onde vai o seu dinheiro, não só ver um gráfico automático",
                  "Você aceita que o processo exige disciplina diária e está disposto a isso",
                  "Você quer construir um hábito real de gestão, não terceirizar para um app",
                  "Você entende que resultado vem de consistência, não de ferramenta perfeita",
                  "Você está cansado de começar e parar e quer um método simples para seguir",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "#C8D8E8" }}>
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#10b981" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="p-7 rounded-2xl"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#ef4444" }}>
                ✗ Este sistema não é para você se...
              </p>
              <ul className="space-y-3">
                {[
                  "Você quer que o sistema importe o extrato e faça tudo automaticamente",
                  "Você acredita que a ferramenta certa vai resolver sem esforço da sua parte",
                  "Você quer resultado sem processo — atalho sem caminho",
                  "Você não está disposto a lançar seus gastos manualmente todos os dias",
                  "Você quer complexidade: dashboards cheios de dados que você nunca vai usar",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "#8A9BB5" }}>
                    <X className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#ef4444" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── O resultado do método ───────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "#0D1B4B" }}>
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C9A84C" }}>
              O resultado
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#F0E6C8" }}>
              O que acontece quando você persiste
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#8A9BB5" }}>
              Não em 7 dias. Não em 30. Mas em 90, 180, 365 dias de processo consistente — o resultado é inevitável.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[
              {
                number: "30 dias",
                title: "Clareza",
                text: "Você sabe exatamente para onde vai cada real. Sem surpresa no fim do mês. Sem a sensação de que o dinheiro sumiu.",
              },
              {
                number: "90 dias",
                title: "Controle",
                text: "O hábito está instalado. Você lança sem pensar. Você planeja a semana sem esforço. O processo virou rotina.",
              },
              {
                number: "1 ano",
                title: "Construção",
                text: "Você tem reserva. Você tem investimento. Você tem projeção. Você tem prova de que o processo funciona — nos seus próprios números.",
              },
            ].map((r) => (
              <div
                key={r.title}
                className="p-7 rounded-2xl text-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}
              >
                <p className="text-3xl font-extrabold mb-1" style={{ color: "#C9A84C" }}>{r.number}</p>
                <p className="text-lg font-bold mb-3" style={{ color: "#F0E6C8" }}>{r.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#8A9BB5" }}>{r.text}</p>
              </div>
            ))}
          </div>
          <div
            className="p-8 rounded-2xl text-center"
            style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.3)" }}
          >
            <p className="text-lg md:text-xl font-semibold leading-relaxed" style={{ color: "#E2C97E" }}>
              Todo santo dia. Sem glamour, sem viralizar, sem esperar a motivação aparecer. Só o processo — repetido, teimoso, consistente. É isso que constrói.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Plans ───────────────────────────────────────────────────────────── */}
      <section id="planos" className="py-20 px-4" style={{ background: "#0B1437" }}>
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C9A84C" }}>
              Investimento
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#F0E6C8" }}>
              Escolha como começar
            </h2>
            <p className="text-lg" style={{ color: "#8A9BB5" }}>
              Pagamento único. Sem mensalidade. Sem recorrência. Pague uma vez e use para sempre.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className="relative rounded-2xl p-5 sm:p-8 flex flex-col"
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
                  <span className="text-sm ml-2" style={{ color: "#8A9BB5" }}>{(plan as any).priceLabel}</span>
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

      {/* ─── CTA Final ───────────────────────────────────────────────────────── */}
      <section
        className="py-24 px-4"
        style={{ background: "linear-gradient(135deg,#0D1B4B 0%,#1A2B5E 100%)", borderTop: "1px solid rgba(201,168,76,0.2)" }}
      >
        <div className="container text-center max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#C9A84C" }}>
            A decisão é agora
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight" style={{ color: "#F0E6C8" }}>
            O processo não começa quando você se sentir pronto.<br />
            <span style={{ color: "#C9A84C" }}>Ele começa quando você decide começar.</span>
          </h2>
          <p className="text-lg mb-10 leading-relaxed" style={{ color: "#8A9BB5" }}>
            Você pode continuar esperando a motivação perfeita, o momento certo, a ferramenta ideal. Ou pode começar hoje — com o processo simples, teimoso e consistente que o tempo vai recompensar.
          </p>
          <Button
            size="lg"
            onClick={() => handleGetStarted()}
            className="px-10 py-6 text-lg rounded-xl font-semibold"
            style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}
          >
            Quero o Combo — R$ 147,90
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="mt-4 text-sm" style={{ color: "#5A6A80" }}>
            Pagamento único · Acesso vitalício · Garantia de 7 dias
          </p>
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
