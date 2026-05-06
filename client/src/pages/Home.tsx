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
  ChevronRight,
} from "lucide-react";
import { useLocation } from "wouter";

const ICON_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/icon-gv-navy-gold_6e5b968f.png";

const SCREEN_DASHBOARD = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663348080686/vDBNytaWESBMpwAO.png";
const SCREEN_TEMPO = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663348080686/JSekXphCoDYCLiPW.png";
const SCREEN_ORCAMENTO = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663348080686/noAKfgniWZfoKskx.png";
const SCREEN_APOSENTADORIA = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663348080686/FYaeNAYzYrOsATYY.png";

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

const CYCLE_STEPS = [
  {
    number: "01",
    icon: Clock,
    title: "Gestão do Tempo",
    subtitle: "O ponto de partida",
    description: "Tudo começa aqui. Você classifica suas tarefas como Importante, Urgente ou Circunstancial. Você define o que vai fazer hoje — e o que vai esperar. Parece simples. E é. Mas fazer isso todo dia, sem pular, sem improvisar, sem deixar a cabeça decidir no automático — isso exige disciplina.",
    example: "Exemplo: Camila, analista de RH, passava 3h por dia respondendo e-mails que podiam esperar. Ao classificar suas tarefas, percebeu que 60% do que fazia era Circunstancial — urgente para os outros, irrelevante para ela. Em 2 semanas, recuperou 1h30 por dia.",
    screen: SCREEN_TEMPO,
    screenLabel: "Tela de Gestão do Tempo — classificação e timer por tarefa",
    color: "#3B82F6",
  },
  {
    number: "02",
    icon: Zap,
    title: "Eficiência e Produtividade",
    subtitle: "O que o tempo libera",
    description: "Quando você para de desperdiçar tempo com o que não importa, sobra tempo para o que importa. Isso não é motivação — é matemática. 1h30 a mais por dia são 45h por mês. São 540h por ano. O que você faria com 540h a mais de foco no que realmente move sua vida?",
    example: "Exemplo: Marcos, corretor autônomo, usava as tardes para tarefas administrativas. Ao reorganizar o tempo, passou a usar as tardes para prospecção — o período em que os clientes estão mais disponíveis. Em 60 dias, aumentou em 40% o número de reuniões realizadas.",
    screen: SCREEN_DASHBOARD,
    screenLabel: "Dashboard — Score de Produtividade e visão geral do dia",
    color: "#10B981",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Mais resultado, mais renda",
    subtitle: "A consequência natural",
    description: "Mais foco gera mais resultado. Mais resultado gera mais renda. Isso não é promessa — é a consequência lógica de usar o tempo certo nas coisas certas. E quando a renda aumenta, surge a pergunta que a maioria nunca responde: para onde está indo esse dinheiro a mais?",
    example: "Exemplo: Marcos fechou 2 contratos a mais por mês. R$3.200 a mais na conta. Mas no fim do mês, o dinheiro tinha sumido. Sem controle, mais renda virou mais gasto. Foi aí que o segundo pilar entrou.",
    screen: null,
    screenLabel: null,
    color: "#F59E0B",
  },
  {
    number: "04",
    icon: Wallet,
    title: "Controle do Orçamento",
    subtitle: "O contato com a realidade",
    description: "Aqui está o coração do método financeiro: você lança cada gasto. Manualmente. Intencionalmente. Não tem integração com banco. Não tem importação de extrato. Porque o ato de lançar é o método. Quando você digita 'R$47,00 — delivery', você está tendo contato com a sua realidade. E esse contato muda comportamento.",
    example: "Exemplo: Camila descobriu que gastava R$680 por mês em delivery e assinaturas que mal usava. Não porque era irresponsável — mas porque nunca tinha parado para ver os números. Em 30 dias de lançamento manual, cortou R$420 em gastos invisíveis.",
    screen: SCREEN_ORCAMENTO,
    screenLabel: "Tela de Orçamento — lançamento de despesas e Regra 50/30/20",
    color: "#8B5CF6",
  },
  {
    number: "05",
    icon: Target,
    title: "Projeção do Futuro",
    subtitle: "O destino do processo",
    description: "Quando você controla o tempo e o dinheiro, aparece algo que a maioria nunca vê: sobra. E essa sobra, investida com consistência, muda o destino. O simulador de aposentadoria mostra 3 cenários reais — pessimista, regular e otimista — com base no que você realmente está guardando, não no que você acha que está guardando.",
    example: "Exemplo: Marcos, 34 anos, descobriu que investindo R$500/mês no cenário regular (8% a.a.), chegaria aos 65 anos com R$745.000 acumulados. Não é sorte. Não é herança. É o processo simples, repetido por 31 anos.",
    screen: SCREEN_APOSENTADORIA,
    screenLabel: "Tela de Aposentadoria — simulação em 3 cenários com dados reais do orçamento",
    color: "#C9A84C",
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
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b" style={{ background: "rgba(11,20,55,0.92)", borderColor: "rgba(201,168,76,0.2)" }}>
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src={ICON_URL} alt="Gestor de Vida" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-lg" style={{ color: "#C9A84C" }}>Gestor de Vida</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard")} style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }} className="font-semibold">
                Acessar Dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")} style={{ color: "#C9A84C" }}>Entrar</Button>
                <Button onClick={() => navigate("/cadastro")} style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }} className="font-semibold">Começar agora</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="pt-36 pb-24 px-4" style={{ background: "linear-gradient(180deg,#0D1B4B 0%,#0B1437 100%)" }}>
        <div className="container text-center max-w-4xl mx-auto">
          <Badge className="mb-6 border" style={{ background: "rgba(201,168,76,0.15)", color: "#E2C97E", borderColor: "rgba(201,168,76,0.4)" }}>
            🎁 Pagamento único — sem mensalidade, sem recorrência
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight" style={{ color: "#F0E6C8" }}>
            O sistema que exige <span style={{ color: "#C9A84C" }}>a sua participação</span> para funcionar
          </h1>
          <p className="text-lg sm:text-xl mb-6 max-w-2xl mx-auto leading-relaxed" style={{ color: "#8A9BB5" }}>
            Gestor de Vida é uma ferramenta de gestão do tempo e das finanças pessoais baseada no <strong style={{ color: "#C9A84C" }}>Método 3 Pilares</strong>: Tempo, Dinheiro e Futuro. Não tem integração automática com banco. Não importa extrato. Não pensa por você.
          </p>
          <p className="text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed font-medium" style={{ color: "#C9A84C" }}>
            Você lança. Você enxerga. Você decide. Esse contato com a realidade é o método.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => handleGetStarted()} className="px-8 py-6 text-lg rounded-xl font-semibold" style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}>
              Quero começar agora <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-xl" style={{ borderColor: "rgba(201,168,76,0.5)", color: "#C9A84C", background: "transparent" }} onClick={() => document.getElementById("metodo")?.scrollIntoView({ behavior: "smooth" })}>
              Ver o método
            </Button>
          </div>
          <p className="mt-4 text-sm" style={{ color: "#5A6A80" }}>E-book R$ 19,90 · Sistema R$ 250,00 · Combo R$ 147,90 — pague uma vez, use para sempre.</p>
        </div>
      </section>

      <section className="py-20 px-4" style={{ background: "#070E26" }}>
        <div className="container max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#C9A84C" }}>A verdade que ninguém quer ouvir</p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-8 leading-tight" style={{ color: "#F0E6C8" }}>Simples não quer dizer fácil.</h2>
          <p className="text-lg leading-relaxed mb-6" style={{ color: "#8A9BB5" }}>O mercado quer te vender a ferramenta perfeita. A que faz tudo automático. A que conecta com o banco, importa o extrato, categoriza sozinha e te manda um relatório bonito no fim do mês. E você olha para o relatório, fala "que legal" — e não muda nada.</p>
          <p className="text-lg leading-relaxed mb-6" style={{ color: "#8A9BB5" }}>Porque o problema nunca foi falta de dado. Foi falta de contato com a realidade. E esse contato só acontece quando você passa pelo processo. Quando você digita o número. Quando você vê, com os seus olhos, para onde o dinheiro foi. Quando você sente o peso de cada decisão.</p>
          <p className="text-xl font-bold leading-relaxed" style={{ color: "#C9A84C" }}>Não existe fórmula secreta. É simples: é sobre método e persistência. Se você não passa pelo processo, o processo não passa por você.</p>
        </div>
      </section>

      <section id="metodo" className="py-20 px-4" style={{ background: "#0D1B4B" }}>
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C9A84C" }}>O método na prática</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#F0E6C8" }}>Como o ciclo funciona — do tempo ao futuro</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#8A9BB5" }}>Cada pilar alimenta o próximo. Não dá para pular etapa. Não dá para fazer só o financeiro sem organizar o tempo. O método é o ciclo completo.</p>
          </div>
          <div className="flex items-center justify-center gap-2 mb-14 flex-wrap">
            {["Tempo", "Eficiência", "Resultado", "Controle", "Futuro"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.4)" }}>{step}</span>
                {i < 4 && <ChevronRight className="w-4 h-4" style={{ color: "#3A4A60" }} />}
              </div>
            ))}
          </div>
          <div className="space-y-20">
            {CYCLE_STEPS.map((step, index) => (
              <div key={step.number} className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center`} style={{ direction: index % 2 === 1 ? "rtl" : "ltr" }}>
                <div style={{ direction: "ltr" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl font-black" style={{ color: "rgba(201,168,76,0.2)", fontFamily: "monospace" }}>{step.number}</span>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${step.color}22`, border: `1px solid ${step.color}44` }}>
                      <step.icon className="w-5 h-5" style={{ color: step.color }} />
                    </div>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: step.color }}>{step.subtitle}</p>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: "#F0E6C8" }}>{step.title}</h3>
                  <p className="text-base leading-relaxed mb-5" style={{ color: "#8A9BB5" }}>{step.description}</p>
                  <div className="p-4 rounded-xl" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#C9A84C" }}>Exemplo real</p>
                    <p className="text-sm leading-relaxed" style={{ color: "#C8D8E8" }}>{step.example}</p>
                  </div>
                </div>
                <div style={{ direction: "ltr" }}>
                  {step.screen ? (
                    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(201,168,76,0.2)", background: "#070E26" }}>
                      <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(201,168,76,0.08)", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
                        <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
                        <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
                        <div className="w-3 h-3 rounded-full" style={{ background: "#10b981" }} />
                        <span className="text-xs ml-2" style={{ color: "#5A6A80" }}>gestordevida.com.br</span>
                      </div>
                      <img src={step.screen} alt={step.screenLabel || step.title} className="w-full object-contain" style={{ maxHeight: "300px" }} />
                      <div className="px-4 py-2"><p className="text-xs" style={{ color: "#5A6A80" }}>{step.screenLabel}</p></div>
                    </div>
                  ) : (
                    <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.25)" }}>
                      <p className="text-5xl font-black mb-3" style={{ color: "#F59E0B" }}>540h</p>
                      <p className="text-lg font-semibold mb-2" style={{ color: "#F0E6C8" }}>a mais de foco por ano</p>
                      <p className="text-sm leading-relaxed" style={{ color: "#8A9BB5" }}>1h30 recuperada por dia × 360 dias. Esse é o resultado matemático de parar de desperdiçar tempo com o que não importa.</p>
                      <div className="mt-6 grid grid-cols-3 gap-4">
                        {[{ label: "por dia", value: "1h30" }, { label: "por mês", value: "45h" }, { label: "por ano", value: "540h" }].map((item) => (
                          <div key={item.label}>
                            <p className="text-2xl font-bold" style={{ color: "#F59E0B" }}>{item.value}</p>
                            <p className="text-xs" style={{ color: "#5A6A80" }}>{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-20 p-8 rounded-2xl text-center" style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.3)" }}>
            <p className="text-xl md:text-2xl font-bold leading-relaxed" style={{ color: "#E2C97E" }}>"Não existe fórmula secreta. Não existe atalho. É simples — e exatamente por ser simples, a maioria desiste. Método e persistência. Todo santo dia. É isso."</p>
          </div>
        </div>
      </section>

      {/* ─── Comparativo ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "linear-gradient(135deg, #0F1B35 0%, #1a2a4a 100%)" }}>
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C9A84C" }}>Compare e decida</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#F0E6C8" }}>Veja quanto você economiza</h2>
            <p className="text-lg" style={{ color: "#8A9BB5" }}>O Gestor de Vida entrega o que outros cobram fortunas para ensinar — de forma prática, simples e com acesso vitalício.</p>
          </div>
          <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(201,168,76,0.2)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(201,168,76,0.08)", borderBottom: "2px solid rgba(201,168,76,0.3)" }}>
                  <th className="text-left py-4 px-6" style={{ color: "#F0E6C8" }}>Alternativa no mercado</th>
                  <th className="text-right py-4 px-6" style={{ color: "#F0E6C8" }}>Preço médio</th>
                  <th className="text-right py-4 px-6" style={{ color: "#C9A84C" }}>Gestor de Vida</th>
                  <th className="text-right py-4 px-6" style={{ color: "#10B981" }}>Sua economia</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Curso de Gestão do Tempo", market: "R$ 1.200", ours: "R$ 147,90", save: "R$ 1.052,10" },
                  { name: "Planilha de Orçamento Doméstico (premium)", market: "R$ 297", ours: "R$ 147,90", save: "R$ 149,10" },
                  { name: "Mentoria de Organização Financeira Pessoal", market: "R$ 3.000", ours: "R$ 147,90", save: "R$ 2.852,10" },
                  { name: "Curso de Planejamento de Aposentadoria", market: "R$ 897", ours: "R$ 147,90", save: "R$ 749,10" },
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(201,168,76,0.1)", background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                    <td className="py-4 px-6" style={{ color: "#C8D8E8" }}>{row.name}</td>
                    <td className="text-right py-4 px-6" style={{ color: "#8A9BB5" }}>{row.market}</td>
                    <td className="text-right py-4 px-6 font-bold" style={{ color: "#C9A84C" }}>{row.ours}</td>
                    <td className="text-right py-4 px-6 font-bold" style={{ color: "#10B981" }}>{row.save}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-sm mt-6" style={{ color: "#5A6A80" }}>* Valores de referência do mercado brasileiro. O Gestor de Vida é pagamento único — sem mensalidade.</p>
        </div>
      </section>

      <section className="py-20 px-4" style={{ background: "#070E26" }}>
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#F0E6C8" }}>Seja honesto consigo mesmo</h2>
            <p className="text-lg mt-3" style={{ color: "#8A9BB5" }}>Este sistema não é para todo mundo. E está tudo bem.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-7 rounded-2xl" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#10b981" }}>✓ Este sistema é para você se...</p>
              <ul className="space-y-3">
                {["Você quer entender para onde vai o seu dinheiro, não só ver um gráfico automático", "Você aceita que o processo exige disciplina diária e está disposto a isso", "Você quer construir um hábito real de gestão, não terceirizar para um app", "Você entende que resultado vem de consistência, não de ferramenta perfeita", "Você está cansado de começar e parar e quer um método simples para seguir"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "#C8D8E8" }}>
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#10b981" }} />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-7 rounded-2xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#ef4444" }}>✗ Este sistema não é para você se...</p>
              <ul className="space-y-3">
                {["Você quer que o sistema importe o extrato e faça tudo automaticamente", "Você acredita que a ferramenta certa vai resolver sem esforço da sua parte", "Você quer resultado sem processo — atalho sem caminho", "Você não está disposto a lançar seus gastos manualmente todos os dias", "Você quer complexidade: dashboards cheios de dados que você nunca vai usar"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "#8A9BB5" }}>
                    <X className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#ef4444" }} />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4" style={{ background: "#0B1437" }}>
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C9A84C" }}>O resultado</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#F0E6C8" }}>O que acontece quando você persiste</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#8A9BB5" }}>Não em 7 dias. Não em 30. Mas em 90, 180, 365 dias de processo consistente — o resultado é inevitável.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[
              { number: "30 dias", title: "Clareza", text: "Você sabe exatamente para onde vai cada real e cada hora. Sem surpresa no fim do mês. Sem a sensação de que o tempo e o dinheiro sumiram." },
              { number: "90 dias", title: "Controle", text: "O hábito está instalado. Você lança sem pensar. Você planeja a semana sem esforço. O processo virou rotina — e a rotina virou resultado." },
              { number: "1 ano", title: "Construção", text: "Você tem reserva. Você tem investimento. Você tem projeção. Você tem prova de que o processo funciona — nos seus próprios números." },
            ].map((r) => (
              <div key={r.title} className="p-7 rounded-2xl text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}>
                <p className="text-3xl font-extrabold mb-1" style={{ color: "#C9A84C" }}>{r.number}</p>
                <p className="text-lg font-bold mb-3" style={{ color: "#F0E6C8" }}>{r.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#8A9BB5" }}>{r.text}</p>
              </div>
            ))}
          </div>
          <div className="p-8 rounded-2xl text-center" style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.3)" }}>
            <p className="text-lg md:text-xl font-semibold leading-relaxed" style={{ color: "#E2C97E" }}>Não é sobre a ferramenta certa. Não é sobre o momento certo. É sobre método e persistência — repetidos todo santo dia, sem glamour, sem esperar a motivação aparecer. É isso que constrói.</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4" style={{ background: "#070E26" }}>
        <div className="container max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C9A84C" }}>Por que isso existe</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#F0E6C8" }}>Nasceu de uma dor real</h2>
          </div>
          <div className="rounded-2xl p-8 md:p-12" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.2)" }}>
            <div className="space-y-6 text-base leading-relaxed" style={{ color: "#C8D8E8" }}>
              <p>Durante anos, eu busquei uma forma de organizar minha vida. Tentei planilhas, aplicativos, métodos importados, sistemas complexos. Nada ficava. Ou era complicado demais para manter, ou simples demais para ser útil. E a sensação era sempre a mesma: tempo e dinheiro escorregando pelos dedos sem eu entender por quê.</p>
              <p>Estudei. Apliquei. Errei. Ajustei. E depois de anos testando na prática, percebi algo que parecia óbvio, mas que ninguém havia me mostrado de forma clara:</p>
              <p className="text-lg md:text-xl font-bold py-4 px-6 rounded-xl text-center" style={{ color: "#E2C97E", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)" }}>"Era simples. Não era fácil — mas era simples."</p>
              <p>Gestão de tempo, controle financeiro e projeção de futuro. Três pilares. Conectados. Um leva ao outro. E o que faltava não era uma fórmula secreta — era um ponto de partida estruturado e a disciplina de repetir o processo.</p>
              <p>O Gestor de Vida foi criado para ser esse começo. Para quem tem vontade, mas ainda não tem estrutura. Para quem quer controle, mas não sabe como montar do zero. Para quem entende que o processo simples, repetido com teimosia, é o que constrói — e precisa de uma ferramenta que acompanhe esse processo sem complicar.</p>
            </div>
            <div className="mt-8 pt-8" style={{ borderTop: "1px solid rgba(201,168,76,0.15)" }}>
              <p className="text-sm font-semibold" style={{ color: "#C9A84C" }}>— Criador do Gestor de Vida</p>
              <p className="text-xs mt-1" style={{ color: "#5A6A80" }}>Anos de busca, estudo e aplicação prática do método</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4" style={{ background: "#0B1437" }}>
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C9A84C" }}>Quem já usa</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#F0E6C8" }}>O processo na vida real</h2>
            <p className="text-base mt-3" style={{ color: "#8A9BB5" }}>Depoimentos reais de quem decidiu começar.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-8 rounded-2xl flex flex-col" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}>
              <div className="flex gap-1 mb-5">{Array.from({ length: 5 }).map((_, s) => (<Star key={s} className="w-4 h-4 fill-current" style={{ color: "#C9A84C" }} />))}</div>
              <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: "#C8D8E8" }}>"Eu vivia com aquela sensação constante de que estava sempre devendo algo a alguém — para os clientes, para a minha empresa, para os meus filhos, para mim mesma. Minha rotina era uma bagunça disfarçada de movimento. Adivinhava os gastos no final do mês e sempre tinha surpresa desagradável. Quando comecei a usar a gestão do tempo do Gestor de Vida, foi a primeira vez que eu realmente parei para olhar para o que eu estava fazendo com as minhas horas. Comecei a organizar minhas tarefas com antecedência, priorizando o que de fato gerava resultado. O estresse diminuiu porque eu parei de apagar incêndio e comecei a planejar. Consegui me dedicar mais aos meus clientes, entregar melhor, fechar mais projetos — e ainda sobrou energia para a minha família. O controle financeiro veio junto: quando você para de correr, você consegue olhar para os números. Hoje guardo para os meus sonhos. Isso antes parecia impossível."</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold" style={{ color: "#F0E6C8" }}>Nayara Barcellos</p>
                  <p className="text-xs mt-0.5" style={{ color: "#8A9BB5" }}>Designer de Interiores · Sócia · Mãe e Esposa</p>
                </div>
                <a href="https://instagram.com/naybarcellos" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold" style={{ color: "#C9A84C" }}>@naybarcellos</a>
              </div>
            </div>
            <div className="p-8 rounded-2xl flex flex-col" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}>
              <div className="flex gap-1 mb-5">{Array.from({ length: 5 }).map((_, s) => (<Star key={s} className="w-4 h-4 fill-current" style={{ color: "#C9A84C" }} />))}</div>
              <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: "#C8D8E8" }}>"Eu já me organizava — agenda física, anotações, listas. Mas com dois filhos, parecia que o tempo simplesmente escorregava pelas mãos, e eu ficava voltando páginas e páginas para não deixar nada para trás. Quando comecei a usar a gestão do tempo do Gestor de Vida, ganhei uma visão que a agenda convencional nunca me deu: eu consigo ver de verdade o que precisa ser feito, o que está atrasado, e o que de fato está gerando resultado. Os relatórios semanais me ajudam a afinar minha produtividade semana a semana. No financeiro, eu já controlava em planilha — mas a união das três ferramentas mudou tudo. Quando você vê o tempo, o orçamento e a projeção da sua aposentadoria juntos, numa visão só, bate uma clareza diferente. Fiquei muito mais motivada a lapidar meu orçamento porque agora eu consigo enxergar o quanto cada ajuste antecipa os meus objetivos. É uma visão completa que eu não tinha antes."</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold" style={{ color: "#F0E6C8" }}>Fernanda Griggio</p>
                  <p className="text-xs mt-0.5" style={{ color: "#8A9BB5" }}>Consultora de Benefícios · Empresária · Mãe</p>
                </div>
                <a href="https://instagram.com/fernanda_griggio" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold" style={{ color: "#C9A84C" }}>@fernanda_griggio</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 px-4" style={{ background: "#070E26" }}>
        <div className="container max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest mb-3" style={{ color: "#C9A84C" }}>PERGUNTAS FREQUENTES</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Antes de decidir, leia isso</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "Por que não tem integração com banco ou importação de extrato?", a: "Porque integração automática é exatamente o que não funciona para mudar comportamento. Quando o app importa tudo sozinho, você olha para os números como se fossem dados de outra pessoa. O ato de lançar manualmente — digitar o valor, escolher a categoria, confirmar — é o que cria consciência. É o contato com a realidade que muda o hábito. Não é burocracia: é o método." },
              { q: "Quanto tempo leva para ver resultado?", a: "Em 30 dias de uso consistente, você já tem clareza total sobre para onde vai cada real e cada hora. Em 90 dias, o hábito está instalado e o processo virou rotina. Em 1 ano, você tem números reais para tomar decisões de vida — reserva, investimento, projeção. O resultado não depende da ferramenta: depende da sua consistência." },
              { q: "É difícil de usar?", a: "O sistema é simples — propositalmente. Não tem dezenas de menus, relatórios complexos ou configurações avançadas. Você lança, você vê, você decide. Mas simples não quer dizer fácil: fazer isso todo dia, sem pular, exige disciplina. A ferramenta não faz o trabalho por você — ela organiza o trabalho que você decide fazer." },
              { q: "Preciso entender de finanças ou investimentos para usar?", a: "Não. O sistema foi criado para quem está começando do zero. Você não precisa saber o que é taxa Selic, CDB ou previdência privada. Você precisa saber quanto ganha, quanto gasta e quanto quer guardar. O simulador de aposentadoria usa cenários simples (pessimista, regular, otimista) para mostrar o impacto do tempo e da consistência — sem jargão financeiro." },
              { q: "Funciona no celular?", a: "Sim. O sistema é responsivo e funciona em qualquer dispositivo — celular, tablet ou computador. Você pode lançar um gasto direto do celular logo após a compra, que é exatamente quando o lançamento manual faz mais sentido." },
              { q: "O pagamento é único mesmo? Sem mensalidade?", a: "Sim. Você paga uma vez e usa para sempre. Sem assinatura, sem cobrança recorrente, sem surpresa no cartão. O acesso ao sistema e todas as atualizações futuras estão incluídos no valor pago." },
              { q: "E se eu quiser cancelar e pedir reembolso?", a: "Você tem 7 dias de garantia após a compra, conforme o Código de Defesa do Consumidor. Se por qualquer motivo não ficar satisfeito, basta solicitar o reembolso pelo e-mail de suporte e o valor é devolvido integralmente, sem perguntas." },
            ].map((item, i) => (
              <details key={i} className="group rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}>
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none" style={{ color: "#E8E0CC" }}>
                  <span className="font-semibold pr-4">{item.q}</span>
                  <span className="text-xl flex-shrink-0 transition-transform group-open:rotate-45" style={{ color: "#C9A84C" }}>+</span>
                </summary>
                <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: "rgba(232,224,204,0.75)" }}>{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="py-20 px-4" style={{ background: "#0D1B4B" }}>
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C9A84C" }}>Investimento</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#F0E6C8" }}>Escolha como começar</h2>
            <p className="text-lg" style={{ color: "#8A9BB5" }}>Pagamento único. Sem mensalidade. Sem recorrência. Pague uma vez e use para sempre.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div key={plan.id} className="relative rounded-2xl p-5 sm:p-8 flex flex-col" style={{ background: plan.badge ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.04)", border: plan.badge ? "2px solid rgba(201,168,76,0.6)" : "1px solid rgba(201,168,76,0.15)" }}>
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="border-0 px-4 py-1 text-sm font-semibold" style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}>{plan.badge}</Badge>
                  </div>
                )}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-5`}>
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
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#C9A84C" }} />{f}
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "#3A4A60" }}>
                      <X className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#3A4A60" }} />{f}
                    </li>
                  ))}
                </ul>
                <Button onClick={() => handleGetStarted()} className="w-full rounded-xl py-5 font-semibold" style={plan.badge ? { background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" } : { background: "rgba(201,168,76,0.15)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.4)" }}>
                  Comprar agora <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4" style={{ background: "linear-gradient(135deg,#0D1B4B 0%,#1A2B5E 100%)", borderTop: "1px solid rgba(201,168,76,0.2)" }}>
        <div className="container text-center max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#C9A84C" }}>A decisão é agora</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight" style={{ color: "#F0E6C8" }}>
            O processo não começa quando você se sentir pronto.<br />
            <span style={{ color: "#C9A84C" }}>Ele começa quando você decide começar.</span>
          </h2>
          <p className="text-lg mb-10 leading-relaxed" style={{ color: "#8A9BB5" }}>Você pode continuar esperando a motivação perfeita, o momento certo, a ferramenta ideal. Ou pode começar hoje — com o processo simples, teimoso e consistente que o tempo vai recompensar.</p>
          <Button size="lg" onClick={() => handleGetStarted()} className="px-10 py-6 text-lg rounded-xl font-semibold" style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}>
            Quero o Combo — R$ 147,90 <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="mt-4 text-sm" style={{ color: "#5A6A80" }}>Pagamento único · Acesso vitalício · Garantia de 7 dias</p>
        </div>
      </section>

      <footer className="py-10 px-4 text-sm" style={{ background: "#070E26", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={ICON_URL} alt="Gestor de Vida" className="w-6 h-6 rounded" />
            <span className="font-semibold" style={{ color: "#C9A84C" }}>Gestor de Vida</span>
          </div>
          <p style={{ color: "#3A4A60" }}>© {new Date().getFullYear()} Gestor de Vida. Todos os direitos reservados.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="mailto:contato@gestordevida.com.br" className="transition-colors" style={{ color: "#5A6A80" }}>Suporte</a>
            <a href="#planos" className="transition-colors" style={{ color: "#5A6A80" }}>Planos</a>
            <a href="/politica-de-privacidade" className="transition-colors" style={{ color: "#5A6A80" }}>Privacidade</a>
            <a href="/termos-de-uso" className="transition-colors" style={{ color: "#5A6A80" }}>Termos de Uso</a>
            <a href="/lgpd" className="transition-colors" style={{ color: "#5A6A80" }}>LGPD</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
