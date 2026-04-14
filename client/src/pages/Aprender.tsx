import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Wallet,
  ChevronDown,
  ChevronRight,
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
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Target,
  Play,
  ExternalLink,
  Users,
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

// ─── Content ─────────────────────────────────────────────────────────────────

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
          "São atividades que contribuem diretamente para seus objetivos de médio e longo prazo. Não têm prazo imediato, mas se ignoradas por muito tempo, geram consequências sérias. São o coração da sua produtividade estratégica.",
        example:
          "Estudar para uma certificação, planejar metas do trimestre, desenvolver uma nova habilidade, fazer exercícios físicos, criar um plano financeiro.",
        tip: "Se você só fizer o que é urgente, nunca chegará onde quer. Reserve pelo menos 60% do seu dia para o Importante.",
      },
      {
        icon: Calendar,
        title: "Quando agendar tarefas Importantes?",
        description:
          "Coloque as tarefas Importantes nos seus melhores horários — quando você tem mais energia e foco. Geralmente são as primeiras horas da manhã ou os blocos de tempo sem interrupções.",
        example:
          "Bloqueie das 8h às 10h para tarefas estratégicas. Não permita que reuniões ou interrupções tomem esse tempo.",
        tip: "Use o Planejamento Semanal para distribuir suas tarefas Importantes ao longo da semana antes que o Urgente domine sua agenda.",
      },
    ],
  },
  {
    id: "urgente",
    icon: AlertTriangle,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    title: "Urgente",
    subtitle: "Tarefas que exigem ação imediata",
    steps: [
      {
        icon: Zap,
        title: "O que é uma tarefa Urgente?",
        description:
          "São demandas com prazo próximo ou imediato que precisam ser resolvidas hoje. Geralmente chegam de fora — clientes, chefes, problemas inesperados. O perigo é deixar que o Urgente consuma todo o seu dia.",
        example:
          "Responder um cliente insatisfeito, resolver um erro no sistema, entregar um relatório com prazo de hoje, pagar uma conta vencendo hoje.",
        tip: "Se você vive apagando incêndios, é sinal de que não está planejando o suficiente. Reduza o Urgente planejando melhor o Importante.",
      },
      {
        icon: AlertTriangle,
        title: "Como lidar com o Urgente sem perder o foco?",
        description:
          "Reserve um bloco de tempo específico para o Urgente — por exemplo, das 14h às 16h. Fora desse bloco, foque no Importante. Isso evita que o Urgente invada todo o seu dia.",
        example:
          "Ao criar uma tarefa urgente, defina a duração realista. Se vai levar 2 horas, bloqueie 2 horas no seu dia e proteja o restante.",
        tip: "Urgente não significa importante. Aprenda a diferenciar: o que é urgente para os outros nem sempre é urgente para você.",
      },
    ],
  },
  {
    id: "circunstancial",
    icon: RefreshCcw,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    title: "Circunstancial",
    subtitle: "Tarefas necessárias mas de baixo impacto",
    steps: [
      {
        icon: RefreshCcw,
        title: "O que é uma tarefa Circunstancial?",
        description:
          "São atividades rotineiras, operacionais ou administrativas que precisam ser feitas mas não contribuem diretamente para seus objetivos. São necessárias para manter tudo funcionando, mas não criam valor novo.",
        example:
          "Verificar e-mails, organizar arquivos, preencher planilhas de controle, fazer ligações de rotina, atualizar cadastros.",
        tip: "Agrupe tarefas circunstanciais em um único bloco de tempo. Fazer todas de uma vez é muito mais eficiente do que intercalar com tarefas estratégicas.",
      },
      {
        icon: Lightbulb,
        title: "Como minimizar o Circunstancial?",
        description:
          "Questione sempre: essa tarefa pode ser delegada? Automatizada? Eliminada? O objetivo é reduzir ao máximo o tempo gasto com o Circunstancial para liberar espaço para o Importante.",
        example:
          "Se você passa 2 horas por dia em e-mails, experimente verificar apenas 2 vezes ao dia (manhã e tarde). Isso libera tempo para o que realmente importa.",
        tip: "Um score de produtividade alto significa mais tempo no Importante e menos no Circunstancial. Acompanhe seu progresso no Relatório.",
      },
    ],
  },
];

const PLANEJAMENTO_SECTIONS: Section[] = [
  {
    id: "mes",
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    title: "Planejamento Mensal",
    subtitle: "Visão macro dos seus objetivos",
    steps: [
      {
        icon: Target,
        title: "Como planejar o mês?",
        description:
          "No início de cada mês, defina de 3 a 5 objetivos principais. Esses objetivos vão guiar o que você coloca na sua agenda semanal. Pense: o que precisa acontecer este mês para que eu avance nos meus objetivos de longo prazo?",
        example:
          "Objetivo do mês: fechar 10 novos clientes. Isso se desdobra em: 3 reuniões por semana, 1 proposta por dia, 30 minutos de prospecção diária.",
        tip: "Use o Backlog para capturar todas as tarefas do mês sem data. Depois distribua na semana conforme sua prioridade.",
      },
    ],
  },
  {
    id: "semana",
    icon: CalendarDays,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    title: "Planejamento Semanal",
    subtitle: "Distribuição inteligente das tarefas",
    steps: [
      {
        icon: CalendarDays,
        title: "Como planejar a semana?",
        description:
          "Todo domingo ou segunda-feira de manhã, abra o Planejamento Semanal. Pegue as tarefas do Backlog e distribua pelos dias da semana. Considere sua energia: segunda e terça para tarefas Importantes, quarta para reuniões, quinta e sexta para entregas.",
        example:
          "Segunda: 2h de desenvolvimento de produto (Importante). Terça: 1h de prospecção (Importante). Quarta: reuniões (Urgente). Quinta: relatórios (Circunstancial).",
        tip: "Não planeje mais do que 6 horas de tarefas por dia. Deixe espaço para o inesperado e para o descanso.",
      },
    ],
  },
  {
    id: "dia",
    icon: Sun,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    title: "Planejamento Diário",
    subtitle: "Execução focada e consciente",
    steps: [
      {
        icon: Sun,
        title: "Como usar o Meu Dia?",
        description:
          "Toda manhã, abra o Meu Dia e revise as tarefas do dia. Reordene conforme sua energia e prioridade. Inicie o timer ao começar uma tarefa — isso cria consciência sobre como você usa seu tempo e alimenta o Score de Produtividade.",
        example:
          "8h: Inicia tarefa Importante (timer ligado). 10h: Conclui. 10h15: Inicia tarefa Urgente. 11h: Conclui. Score do dia: 70% Importante — excelente!",
        tip: "O timer não é obrigatório, mas é poderoso. Ele revela a diferença entre o tempo que você planejou e o que realmente gastou.",
      },
    ],
  },
  {
    id: "backlog",
    icon: Inbox,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    title: "Backlog — Tarefas sem Data",
    subtitle: "Capture tudo, agende depois",
    steps: [
      {
        icon: Inbox,
        title: "O que é o Backlog?",
        description:
          "O Backlog é uma lista de tarefas que você quer fazer mas ainda não sabe quando. É o lugar onde você captura ideias, demandas e compromissos sem precisar decidir na hora quando vai fazer. Isso libera sua mente e evita que boas ideias se percam.",
        example:
          "Você está em uma reunião e surge uma ideia: 'criar um vídeo explicativo para clientes'. Adicione ao Backlog agora. Na próxima revisão semanal, você decide se e quando vai fazer.",
        tip: "Revise o Backlog toda semana. Tarefas que ficam meses sem ser agendadas provavelmente não são tão importantes quanto pareciam.",
      },
      {
        icon: CalendarDays,
        title: "Como mover do Backlog para a agenda?",
        description:
          "No Planejamento Semanal, você vê o Backlog ao lado da grade semanal. Basta arrastar a tarefa para o dia desejado ou clicar nela e definir a data. A tarefa sai do Backlog e entra no dia escolhido.",
        example:
          "Backlog tem: 'Preparar apresentação para cliente X'. Você arrasta para quinta-feira. Pronto — está na agenda com a categoria e duração que você definiu.",
        tip: "Não tente agendar tudo de uma vez. Foque nas tarefas mais relevantes para a semana atual e deixe o resto no Backlog.",
      },
    ],
  },
];

const ORCAMENTO_SECTIONS: Section[] = [
  {
    id: "5030",
    icon: PiggyBank,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    title: "A Regra 50/30/20",
    subtitle: "O equilíbrio financeiro em 3 categorias",
    steps: [
      {
        icon: PiggyBank,
        title: "O que é a Regra 50/30/20?",
        description:
          "É uma metodologia simples e poderosa para organizar suas finanças. Ela divide sua renda líquida em três grandes categorias: 50% para Necessidades, 30% para Desejos e 20% para Poupança e Investimentos. O sistema calcula isso automaticamente conforme você lança seus gastos.",
        example:
          "Renda líquida: R$ 5.000. Limite de Necessidades: R$ 2.500. Limite de Desejos: R$ 1.500. Meta de Poupança: R$ 1.000.",
        tip: "Os percentuais são um ponto de partida, não uma lei. Se você mora em cidade cara, pode precisar de 60% em Necessidades. Ajuste conforme sua realidade.",
      },
      {
        icon: ShoppingCart,
        title: "50% — Necessidades",
        description:
          "São gastos essenciais para sua sobrevivência e funcionamento básico. Você não pode simplesmente deixar de pagar. Incluem moradia, alimentação básica, transporte para o trabalho, saúde, educação dos filhos e contas de serviços essenciais.",
        example:
          "Aluguel, condomínio, IPTU, supermercado, plano de saúde, escola dos filhos, luz, água, internet, transporte público ou combustível para trabalhar.",
        tip: "Se suas Necessidades ultrapassam 50%, o problema geralmente está no aluguel ou no carro. São os dois maiores vilões do orçamento.",
      },
      {
        icon: Heart,
        title: "30% — Desejos",
        description:
          "São gastos que melhoram sua qualidade de vida mas não são essenciais. Você poderia viver sem eles, mas eles tornam a vida mais prazerosa. É importante ter espaço para os Desejos — cortar tudo gera frustração e abandono do orçamento.",
        example:
          "Restaurantes, streaming (Netflix, Spotify), academia, viagens, roupas além do básico, hobbies, presentes, assinaturas, lazer.",
        tip: "Não trate os Desejos como inimigos. Eles são necessários para sua saúde mental. O problema é quando ultrapassam o limite.",
      },
      {
        icon: TrendingUp,
        title: "20% — Poupança e Investimentos",
        description:
          "É o dinheiro que trabalha por você no futuro. Inclui reserva de emergência, investimentos, previdência privada, pagamento de dívidas e qualquer forma de construção de patrimônio. É a categoria mais importante para sua liberdade financeira.",
        example:
          "Tesouro Direto, CDB, fundo de investimento, previdência privada, FGTS voluntário, pagamento antecipado de dívidas, reserva de emergência.",
        tip: "Pague a si mesmo primeiro. Assim que receber o salário, transfira os 20% antes de gastar qualquer coisa. O que sobra é que você gasta.",
      },
    ],
  },
  {
    id: "vinculos",
    icon: CreditCard,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    title: "Contas Parceladas e Vínculos",
    subtitle: "Controle total sobre parcelamentos",
    steps: [
      {
        icon: CreditCard,
        title: "O que são Contas Parceladas?",
        description:
          "São compras feitas no crédito ou qualquer gasto que se repete por um número fixo de meses. O sistema registra o valor total, o número de parcelas e a data de início, e automaticamente lança cada parcela no mês correto.",
        example:
          "Comprou uma TV por R$ 1.200 em 12x de R$ 100. Cadastre uma vez e o sistema lança R$ 100 automaticamente nos próximos 12 meses.",
        tip: "Sempre cadastre parcelamentos no momento da compra. Deixar para depois é a principal causa de 'dívidas surpresa' no orçamento.",
      },
      {
        icon: RefreshCcw,
        title: "Como funcionam os vínculos?",
        description:
          "Vínculos são contas fixas que se repetem todo mês automaticamente — como aluguel, plano de saúde ou mensalidade escolar. Você cadastra uma vez e o sistema replica nos meses seguintes. Diferente das parcelas, os vínculos não têm data de término.",
        example:
          "Aluguel de R$ 1.500/mês. Cadastre como conta fixa vinculada e ela aparecerá automaticamente em todos os meses futuros.",
        tip: "Revise seus vínculos a cada 3 meses. Serviços que você não usa mais mas continua pagando são um dos maiores desperdícios financeiros.",
      },
      {
        icon: BarChart2,
        title: "Como usar o Dashboard Anual?",
        description:
          "O Dashboard Anual mostra a evolução do seu orçamento mês a mês ao longo do ano. Você vê em quais meses gastou mais, onde estão os picos de despesa (como dezembro e janeiro) e como sua poupança evoluiu.",
        example:
          "Gráfico mostra que em julho você gastou 40% a mais que a média. Investigando, descobre que foi a viagem de férias. Isso ajuda a planejar melhor o próximo ano.",
        tip: "Use o Dashboard Anual no final de cada trimestre para ajustar seu orçamento. Pequenos ajustes trimestrais são mais eficazes que grandes revisões anuais.",
      },
    ],
  },
  {
    id: "aposentadoria",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    title: "Projeção de Aposentadoria",
    subtitle: "Visualize seu futuro financeiro",
    steps: [
      {
        icon: TrendingUp,
        title: "Como funciona a Projeção?",
        description:
          "A ferramenta calcula quanto você terá acumulado na aposentadoria com base no seu patrimônio atual, aporte mensal e taxa de rendimento. Ela apresenta 3 cenários: conservador (renda fixa), moderado (mix) e arrojado (renda variável).",
        example:
          "Patrimônio atual: R$ 50.000. Aporte mensal: R$ 1.000. Cenário conservador (6% a.a.): R$ 1,2 milhão em 30 anos. Cenário arrojado (12% a.a.): R$ 3,5 milhões.",
        tip: "A diferença entre os cenários pode parecer abstrata, mas representa anos de trabalho a mais ou a menos. Use isso como motivação para investir consistentemente.",
      },
      {
        icon: Target,
        title: "Como usar os 3 cenários?",
        description:
          "O cenário conservador usa taxas de renda fixa (Tesouro Direto, CDB). O moderado mistura renda fixa e variável. O arrojado considera retornos de renda variável (ações, fundos imobiliários). A realidade geralmente fica entre o conservador e o moderado.",
        example:
          "Se você tem perfil conservador, planeje com o cenário conservador. Se investe em ações, use o moderado. O arrojado é para quem tem alta tolerância a risco.",
        tip: "Atualize a projeção a cada 6 meses. Conforme seu patrimônio cresce e seus aportes aumentam, os números melhoram — e isso é muito motivador.",
      },
    ],
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <step.icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <h4 className="font-semibold text-gray-900 text-sm">{step.title}</h4>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-2">{step.description}</p>
        {step.example && (
          <div className="bg-gray-50 rounded-lg p-3 mb-2 border-l-2 border-violet-300">
            <p className="text-xs text-gray-500 font-medium mb-0.5">Exemplo prático</p>
            <p className="text-xs text-gray-700">{step.example}</p>
          </div>
        )}
        {step.tip && (
          <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-2 border border-amber-100">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">{step.tip}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionAccordion({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border-2 ${section.borderColor} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-4 ${section.bgColor} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center`}>
            <section.icon className={`w-5 h-5 ${section.color}`} />
          </div>
          <div className="text-left">
            <p className={`font-bold text-sm ${section.color}`}>{section.title}</p>
            <p className="text-xs text-gray-600">{section.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs hidden sm:flex">
            {section.steps.length} {section.steps.length === 1 ? "lição" : "lições"}
          </Badge>
          {open ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </button>
      {open && (
        <div className="p-4 bg-white space-y-3">
          {section.steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function TrailCard({
  icon: Icon,
  color,
  bgColor,
  title,
  description,
  sections,
  badge,
}: {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  title: string;
  description: string;
  sections: Section[];
  badge: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const totalLessons = sections.reduce((acc, s) => acc + s.steps.length, 0);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className={`${bgColor} p-5`}>
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 rounded-xl bg-white/70 flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <Badge className="bg-white/80 text-gray-700 border-0 text-xs">{badge}</Badge>
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <BookOpen className="w-3.5 h-3.5" />
            {sections.length} módulos
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {totalLessons} lições
          </div>
        </div>
      </div>

      {/* Toggle */}
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Fechar trilha" : "Abrir trilha de aprendizado"}
          {expanded ? (
            <ChevronDown className="w-4 h-4 ml-2" />
          ) : (
            <ChevronRight className="w-4 h-4 ml-2" />
          )}
        </Button>
      </div>

      {/* Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {sections.map((section) => (
            <SectionAccordion key={section.id} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Aprender() {
  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-6 h-6 text-violet-600" />
            <h1 className="text-2xl font-bold text-foreground">Central de Aprendizado</h1>
          </div>
          <p className="text-muted-foreground">
            Aprenda as metodologias por trás de cada módulo e tire o máximo proveito do sistema.
          </p>
        </div>

        {/* Quick tips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            {
              icon: Star,
              color: "text-violet-600",
              bg: "bg-violet-50",
              title: "Tríade do Tempo",
              desc: "Importante, Urgente e Circunstancial",
            },
            {
              icon: PiggyBank,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              title: "Regra 50/30/20",
              desc: "Necessidades, Desejos e Poupança",
            },
            {
              icon: Inbox,
              color: "text-teal-600",
              bg: "bg-teal-50",
              title: "Backlog",
              desc: "Capture tudo, agende depois",
            },
          ].map((tip) => (
            <div key={tip.title} className={`${tip.bg} rounded-xl p-4 flex items-start gap-3`}>
              <tip.icon className={`w-5 h-5 ${tip.color} flex-shrink-0 mt-0.5`} />
              <div>
                <p className="font-semibold text-sm text-gray-900">{tip.title}</p>
                <p className="text-xs text-gray-600">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Trilhas */}
        <div className="space-y-6">
          <TrailCard
            icon={Clock}
            color="text-violet-600"
            bgColor="bg-gradient-to-br from-violet-50 to-purple-50"
            title="Gestão de Tempo — Tríade do Tempo"
            description="Aprenda a classificar suas tarefas, planejar sua semana e usar o backlog para nunca mais perder uma boa ideia."
            sections={[...TRIADE_SECTIONS, ...PLANEJAMENTO_SECTIONS]}
            badge="Metodologia Tríade"
          />

          <TrailCard
            icon={Wallet}
            color="text-emerald-600"
            bgColor="bg-gradient-to-br from-emerald-50 to-teal-50"
            title="Orçamento Doméstico — Regra 50/30/20"
            description="Entenda como categorizar seus gastos, controlar parcelamentos e planejar sua aposentadoria com clareza."
            sections={ORCAMENTO_SECTIONS}
            badge="Metodologia 50/30/20"
          />
        </div>

        {/* Seção de Vídeos */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-1">
            <Play className="w-5 h-5 text-violet-600" />
            <h2 className="text-xl font-bold text-foreground">Vídeos Explicativos</h2>
          </div>
          <p className="text-muted-foreground text-sm mb-5">
            Apresentações animadas mostrando o método e como cada perfil usa o sistema na prática.
          </p>

          {/* Vídeo didático do método */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Aprenda o Método
            </h3>
            <a
              href="https://manus.im/slides/U6HOrPF9ekUg4e2KvGq3Bf"
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl overflow-hidden border border-violet-200 hover:border-violet-400 transition-all hover:shadow-lg"
            >
              <div className="relative">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/abertura_generated_7e5d41f4.webp"
                  alt="O Método: Tríade do Tempo + Regra 50/30/20"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 rounded-full p-4">
                    <Play className="w-8 h-8 text-violet-600 fill-violet-600" />
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <Badge className="bg-violet-600 text-white border-0">Didático</Badge>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-gray-900">O Método: Tríade do Tempo + Regra 50/30/20</h4>
                    <p className="text-sm text-gray-600 mt-1">Entenda os dois métodos que estão por trás de todo o sistema. Ideal para começar.</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-violet-400 flex-shrink-0 mt-1" />
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Play className="w-3 h-3" /> 13 slides</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~90 segundos</span>
                </div>
              </div>
            </a>
          </div>

          {/* Tutoriais práticos */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Tutoriais Práticos — Veja na prática
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href="https://manus.im/slides/ISoqzRxPMWpzDf9W74bnu9"
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl overflow-hidden border border-amber-200 hover:border-amber-400 transition-all hover:shadow-lg"
              >
                <div className="relative">
                  <img
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/souza_intro_generated_3c507ead.webp"
                    alt="Roberto e Maria Souza"
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 rounded-full p-3">
                      <Play className="w-6 h-6 text-amber-600 fill-amber-600" />
                    </div>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-amber-500 text-white border-0 text-xs">Baixa Renda</Badge>
                  </div>
                </div>
                <div className="p-3 bg-amber-50">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Roberto e Maria Souza</h4>
                      <p className="text-xs text-gray-600 mt-0.5">Saindo das dívidas com R$4.000/mês</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Play className="w-3 h-3" /> 7 slides
                  </div>
                </div>
              </a>

              <a
                href="https://manus.im/slides/GUALQC3azwp08SPZEtxvNv"
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl overflow-hidden border border-sky-200 hover:border-sky-400 transition-all hover:shadow-lg"
              >
                <div className="relative">
                  <img
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/silva_intro_generated_bda917a2.webp"
                    alt="Família Silva"
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 rounded-full p-3">
                      <Play className="w-6 h-6 text-sky-600 fill-sky-600" />
                    </div>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-sky-500 text-white border-0 text-xs">Renda Média</Badge>
                  </div>
                </div>
                <div className="p-3 bg-sky-50">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Família Silva</h4>
                      <p className="text-xs text-gray-600 mt-0.5">Organizando a vida de quem ganha bem</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Play className="w-3 h-3" /> 7 slides
                  </div>
                </div>
              </a>

              <a
                href="https://manus.im/slides/tVRKmyr28lEnLpoW8GTUge"
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl overflow-hidden border border-cyan-200 hover:border-cyan-400 transition-all hover:shadow-lg"
              >
                <div className="relative">
                  <img
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/fernanda_intro_generated_b2739c4b.webp"
                    alt="Dra. Fernanda Rocha"
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 rounded-full p-3">
                      <Play className="w-6 h-6 text-cyan-600 fill-cyan-600" />
                    </div>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-cyan-600 text-white border-0 text-xs">Prof. Liberal</Badge>
                  </div>
                </div>
                <div className="p-3 bg-cyan-50">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Dra. Fernanda Rocha</h4>
                      <p className="text-xs text-gray-600 mt-0.5">Médica que ganha bem mas não tem tempo</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Play className="w-3 h-3" /> 7 slides
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Footer tip */}
        <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            <strong className="text-gray-900">Dica:</strong> Não tente aprender tudo de uma vez.
            Comece pela Tríade do Tempo e use o sistema por 1 semana. Depois explore o Orçamento.
            A consistência é mais importante que a perfeição.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
