import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  BookOpen,
  Smartphone,
  Star,
  AlertTriangle,
  Zap,
  Calendar,
  CalendarDays,
  Sun,
  Inbox,
  PiggyBank,
  ShoppingCart,
  Heart,
  TrendingUp,
  CreditCard,
  RefreshCcw,
  BarChart2,
  CheckCircle2,
  Lightbulb,
  Target,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Step {
  icon: React.ElementType;
  title: string;
  description: string;
  example?: string;
  tip?: string;
}
interface Section {
  id: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  title: string;
  subtitle: string;
  steps: Step[];
}

// ─── Content Gestão do Tempo ──────────────────────────────────────────────────────────
const TRIADE_SECTIONS: Section[] = [
  {
    id: "importante",
    icon: Star,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    title: "Importante",
    subtitle: "Tarefas que constroem o futuro",
    steps: [
      {
        icon: Target,
        title: "O que é uma tarefa Importante?",
        description:
          "São atividades que contribuem diretamente para seus objetivos de médio e longo prazo. Não têm prazo imediato, mas se ignoradas por muito tempo, geram consequências sérias.",
        example:
          "Estudar para uma certificação, planejar metas do trimestre, desenvolver uma nova habilidade, fazer exercícios físicos, criar um plano financeiro.",
        tip: "Se você só fizer o que é urgente, nunca chegará onde quer. Reserve pelo menos 60% do seu dia para o Importante.",
      },
      {
        icon: Calendar,
        title: "Quando agendar tarefas Importantes?",
        description:
          "Coloque as tarefas Importantes nos seus melhores horários — quando você tem mais energia e foco. Geralmente são as primeiras horas da manhã.",
        example:
          "Bloqueie das 8h às 10h para tarefas estratégicas. Não permita que reuniões ou interrupções tomem esse tempo.",
        tip: "Use o Planejamento Semanal para distribuir suas tarefas Importantes ao longo da semana antes que o Urgente domine sua agenda.",
      },
    ],
  },
  {
    id: "urgente",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    title: "Urgente",
    subtitle: "Tarefas com prazo imediato",
    steps: [
      {
        icon: Zap,
        title: "O que é uma tarefa Urgente?",
        description:
          "São atividades com prazo imediato ou que exigem ação agora. Podem ou não ser importantes — o que as define é a pressão do tempo.",
        example:
          "Responder um cliente insatisfeito, pagar uma conta com vencimento hoje, resolver uma falha técnica em produção.",
        tip: "Urgente não significa importante. Aprenda a distinguir: urgência é sobre tempo, importância é sobre impacto.",
      },
      {
        icon: CalendarDays,
        title: "Como lidar com o Urgente?",
        description:
          "Reserve um bloco de tempo diário para o Urgente — não deixe que ele tome o dia todo. Trate-o como uma categoria controlada, não como o padrão.",
        example:
          "Separe das 14h às 15h para responder e-mails urgentes, ligações e demandas do dia.",
        tip: "Se tudo parece urgente, você perdeu o controle da sua agenda. Use o Planejamento Semanal para antecipar urgências.",
      },
    ],
  },
  {
    id: "circunstancial",
    icon: Sun,
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    title: "Circunstancial",
    subtitle: "Tarefas do cotidiano",
    steps: [
      {
        icon: Inbox,
        title: "O que é uma tarefa Circunstancial?",
        description:
          "São atividades do dia a dia que precisam ser feitas mas têm baixo impacto estratégico. Consomem tempo mas não movem o ponteiro.",
        example:
          "Organizar a mesa, responder e-mails rotineiros, fazer compras, pagar contas recorrentes.",
        tip: "Automatize, delegue ou agrupe tarefas circunstanciais. Nunca deixe que elas dominem seu dia.",
      },
      {
        icon: Sun,
        title: "Como gerenciar o Circunstancial?",
        description:
          "Agrupe tarefas circunstanciais em blocos específicos. Use listas de compras, automações bancárias e delegação para reduzir o tempo gasto.",
        example:
          "Reserve 30 minutos no final do dia para todas as tarefas circunstanciais pendentes.",
        tip: "O objetivo não é eliminar o Circunstancial, mas contê-lo para que não invada o tempo do Importante.",
      },
    ],
  },
];

const FINANCEIRO_SECTIONS: Section[] = [
  {
    id: "orcamento",
    icon: PiggyBank,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    title: "Orçamento Mensal",
    subtitle: "Controle suas finanças mês a mês",
    steps: [
      {
        icon: PiggyBank,
        title: "Como usar o Orçamento Mensal?",
        description:
          "O Orçamento Mensal é onde você registra todas as suas receitas e despesas fixas do mês. Configure suas contas fixas em Configurações e registre as entradas mensalmente.",
        example:
          "Salário, aluguel, contas de serviços, cartões de crédito — tudo em um só lugar.",
        tip: "Configure suas contas fixas uma vez em Orçamento → Configurações e elas aparecerão automaticamente todo mês.",
      },
    ],
  },
  {
    id: "parcelados",
    icon: CreditCard,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    title: "Parcelados",
    subtitle: "Controle suas compras parceladas",
    steps: [
      {
        icon: ShoppingCart,
        title: "Como registrar compras parceladas?",
        description:
          "Na aba Parcelados, registre qualquer compra dividida em parcelas. O sistema distribui automaticamente as parcelas nos meses seguintes.",
        example:
          "Compra de R$1.200 em 12x = R$100/mês aparecendo automaticamente nos próximos 12 meses.",
        tip: "Use o campo 'Cartão' para associar cada compra ao cartão correto e ter visão por cartão.",
      },
    ],
  },
  {
    id: "aposentadoria",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    title: "Aposentadoria",
    subtitle: "Planeje sua independência financeira",
    steps: [
      {
        icon: Heart,
        title: "Como usar o Simulador de Aposentadoria?",
        description:
          "Configure sua idade atual, idade alvo de aposentadoria, patrimônio atual e aporte mensal. O simulador calcula quanto você terá e quando atingirá a independência financeira.",
        example:
          "Com R$500/mês de aporte a partir dos 30 anos, você terá R$1,2M aos 60 anos (considerando 0,8% a.m.).",
        tip: "Pequenos aportes constantes fazem diferença enorme no longo prazo graças aos juros compostos.",
      },
    ],
  },
];

// ─── Guias de Instalação ─────────────────────────────────────────────────────
const INSTALL_STEPS_IPHONE = [
  { step: 1, icon: "🧭", title: "Abra o Safari", desc: "Acesse gestorvida.manus.space no navegador Safari (não funciona em outros navegadores no iPhone)" },
  { step: 2, icon: "⬆️", title: "Toque em Compartilhar", desc: 'Toque no ícone de compartilhamento — quadrado com seta para cima — na barra inferior do Safari' },
  { step: 3, icon: "➕", title: "Adicionar à Tela de Início", desc: 'Role a lista de opções e toque em "Adicionar à Tela de Início"' },
  { step: 4, icon: "✅", title: "Confirme e pronto!", desc: 'Toque em "Adicionar" no canto superior direito. O ícone do Gestão da Vida aparecerá na sua tela inicial' },
];

const INSTALL_STEPS_ANDROID = [
  { step: 1, icon: "🌐", title: "Abra o Chrome", desc: "Acesse gestorvida.manus.space no navegador Chrome" },
  { step: 2, icon: "⋮", title: "Menu de opções", desc: "Toque nos 3 pontos no canto superior direito da tela" },
  { step: 3, icon: "🏠", title: "Adicionar à tela inicial", desc: 'Toque em "Adicionar à tela inicial" ou "Instalar aplicativo"' },
  { step: 4, icon: "✅", title: "Confirme e pronto!", desc: "Toque em Adicionar/Instalar. O ícone aparecerá na sua tela inicial como um app" },
];

// ─── Sub-abas ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "aprender", label: "Aprender", icon: BookOpen },
  { id: "instalar", label: "Instalar App", icon: Smartphone },
];

// ─── Componente de seção expansível ─────────────────────────────────────────
function SectionCard({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;
  return (
    <div className={`rounded-xl border ${section.borderColor} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 p-4 ${section.bgColor} hover:opacity-90 transition-opacity text-left`}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white/70`}>
          <Icon className={`w-5 h-5 ${section.color}`} />
        </div>
        <div className="flex-1">
          <p className={`font-semibold text-sm ${section.color}`}>{section.title}</p>
          <p className="text-xs text-gray-500">{section.subtitle}</p>
        </div>
        <span className="text-gray-400 text-lg">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="divide-y divide-gray-100">
          {section.steps.map((step, i) => {
            const StepIcon = step.icon;
            return (
              <div key={i} className="p-4 bg-white">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${section.bgColor}`}>
                    <StepIcon className={`w-4 h-4 ${section.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-800 mb-1">{step.title}</p>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    {step.example && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-2">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Exemplo</p>
                        <p className="text-xs text-gray-600">{step.example}</p>
                      </div>
                    )}
                    {step.tip && (
                      <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-3">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">{step.tip}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Guia de Instalação ───────────────────────────────────────────────────────
function InstallGuide({
  title,
  emoji,
  steps,
  imageUrl,
  color,
  bgColor,
}: {
  title: string;
  emoji: string;
  steps: typeof INSTALL_STEPS_IPHONE;
  imageUrl: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`rounded-2xl border overflow-hidden`} style={{ borderColor: color + "40" }}>
      {/* Header */}
      <div className="p-4 flex items-center gap-3" style={{ backgroundColor: bgColor }}>
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className="font-bold text-sm" style={{ color }}>{title}</p>
          <p className="text-xs text-gray-500">Passo a passo para instalar o app</p>
        </div>
      </div>
      {/* Steps */}
      <div className="bg-white divide-y divide-gray-100">
        {steps.map((s) => (
          <div key={s.step} className="flex items-start gap-3 p-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
              style={{ backgroundColor: color }}
            >
              {s.step}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
                <span>{s.icon}</span> {s.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Image preview */}
      <div className="p-4 bg-gray-50 flex justify-center">
        <img
          src={imageUrl}
          alt={`Guia ${title}`}
          className="rounded-xl shadow-md max-w-[220px] w-full"
        />
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function Ferramentas() {
  const [activeTab, setActiveTab] = useState("aprender");
  const [learnSection, setLearnSection] = useState<"triade" | "financeiro">("triade");

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ferramentas</h1>
            <p className="text-sm text-gray-500">Recursos para usar o sistema ao máximo</p>
          </div>
        </div>

        {/* Sub-abas */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Aba Aprender ── */}
        {activeTab === "aprender" && (
          <div>
            {/* Toggle Gestão do Tempo / Financeiro */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => setLearnSection("triade")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  learnSection === "triade"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Gestão do Tempo
              </button>
              <button
                onClick={() => setLearnSection("financeiro")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  learnSection === "financeiro"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Módulo Financeiro
              </button>
            </div>

            {learnSection === "triade" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
                    Gestão do Tempo
                  </Badge>
                  <span className="text-xs text-gray-400">Como usar a Gestão do Tempo</span>
                </div>
                {TRIADE_SECTIONS.map((s) => (
                  <SectionCard key={s.id} section={s} />
                ))}
              </div>
            )}

            {learnSection === "financeiro" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                    Finanças
                  </Badge>
                  <span className="text-xs text-gray-400">Como usar os módulos financeiros</span>
                </div>
                {FINANCEIRO_SECTIONS.map((s) => (
                  <SectionCard key={s.id} section={s} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Aba Instalar App ── */}
        {activeTab === "instalar" && (
          <div className="space-y-6">
            <div className="bg-indigo-50 rounded-xl p-4 flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-indigo-800">Adicione como app na tela inicial</p>
                <p className="text-xs text-indigo-600 mt-0.5">
                  O Gestão da Vida funciona como um app nativo no seu celular — sem precisar baixar da loja. Siga o guia do seu sistema operacional abaixo.
                </p>
              </div>
            </div>

            <InstallGuide
              title="iPhone / iPad (iOS)"
              emoji="🍎"
              steps={INSTALL_STEPS_IPHONE}
              imageUrl="https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/guia-iphone-VwuAUs3v7M27XeHPcWNtRC.png"
              color="#4F46E5"
              bgColor="#EEF2FF"
            />

            <InstallGuide
              title="Android (Chrome)"
              emoji="🤖"
              steps={INSTALL_STEPS_ANDROID}
              imageUrl="https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/guia-android-Y9tLMQuscowa8HMwpyHf4w.png"
              color="#059669"
              bgColor="#ECFDF5"
            />

            <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Já tem o ícone salvo mas está cinza?</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Remova o atalho antigo da tela inicial e adicione novamente seguindo o guia acima. O iOS só atualiza o ícone quando você adiciona pela primeira vez.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
