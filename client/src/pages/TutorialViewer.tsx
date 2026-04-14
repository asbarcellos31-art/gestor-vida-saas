import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, X, ArrowLeft } from "lucide-react";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd";

interface TutorialData {
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  slides: { img: string; caption: string }[];
}

const TUTORIALS: Record<string, TutorialData> = {
  metodo: {
    title: "O Método: Gestão do Tempo + Regra 50/30/20",
    subtitle: "Como antecipar o que é importante antes que vire urgente",
    badge: "Didático",
    badgeColor: "bg-violet-600",
    slides: [
      { img: `${CDN}/abertura_generated_ba638351.webp`, caption: "Introdução ao método" },
      { img: `${CDN}/problema_generated_2aa5c9b1.webp`, caption: "O problema do dia a dia" },
      { img: `${CDN}/solucao_generated_babce076.webp`, caption: "A solução" },
      { img: `${CDN}/triade_conceito_generated_b79af802.webp`, caption: "Gestão do Tempo — o conceito" },
      { img: `${CDN}/importantes_generated_dd172bc9.webp`, caption: "Tarefas Importantes" },
      { img: `${CDN}/urgentes_generated_6a25fa3e.webp`, caption: "Tarefas Urgentes" },
      { img: `${CDN}/circunstanciais_generated_0d36f5a3.webp`, caption: "Tarefas Circunstanciais" },
      { img: `${CDN}/regra_conceito_generated_e71db345.webp`, caption: "Regra 50/30/20 — o conceito" },
      { img: `${CDN}/essenciais_generated_98dd8b3a.webp`, caption: "Gastos essenciais (50%)" },
      { img: `${CDN}/estilo_generated_fcc26b9a.webp`, caption: "Estilo de vida (30%)" },
      { img: `${CDN}/futuro_generated_8a87eadc.webp`, caption: "Futuro e investimentos (20%)" },
      { img: `${CDN}/combinacao_generated_07ce08cf.webp`, caption: "Combinando os dois métodos" },
      { img: `${CDN}/cta_generated_c1f651e7.webp`, caption: "Comece agora" },
    ],
  },
  souza: {
    title: "Roberto e Maria Souza",
    subtitle: "Saindo das dívidas com R$ 4.000/mês",
    badge: "Baixa Renda",
    badgeColor: "bg-amber-500",
    slides: [
      { img: `${CDN}/souza_intro_generated_121a0c44.webp`, caption: "Conheça a família Souza" },
      { img: `${CDN}/souza_problema_generated_66dee6af.webp`, caption: "O desafio deles" },
      { img: `${CDN}/souza_login_generated_c55f0279.webp`, caption: "Acessando o sistema" },
      { img: `${CDN}/souza_dashboard_generated_6c343298.webp`, caption: "Dashboard — visão geral" },
      { img: `${CDN}/souza_gestao_tempo_generated_96995c04.webp`, caption: "Gestão do Tempo na prática" },
      { img: `${CDN}/souza_orcamento_generated_0d3dc068.webp`, caption: "Orçamento e controle de dívidas" },
      { img: `${CDN}/souza_resultado_generated_5d4d5df1.webp`, caption: "Resultado após 3 meses" },
    ],
  },
  silva: {
    title: "Família Silva",
    subtitle: "Organizando quem ganha bem mas não investe",
    badge: "Renda Média",
    badgeColor: "bg-sky-500",
    slides: [
      { img: `${CDN}/silva_intro_generated_a3c7eb54.webp`, caption: "Conheça a família Silva" },
      { img: `${CDN}/silva_problema_generated_70643a17.webp`, caption: "O desafio deles" },
      { img: `${CDN}/silva_gestao_tempo_generated_e3bc32bb.webp`, caption: "Gestão do Tempo na prática" },
      { img: `${CDN}/silva_orcamento_generated_5775884f.webp`, caption: "Orçamento e controle" },
      { img: `${CDN}/silva_aposentadoria_generated_615a2f28.webp`, caption: "Planejamento de aposentadoria" },
      { img: `${CDN}/silva_resultado_generated_b23a49ac.webp`, caption: "Resultado após 3 meses" },
    ],
  },
  fernanda: {
    title: "Dra. Fernanda Rocha",
    subtitle: "Médica profissional liberal sem tempo para nada",
    badge: "Prof. Liberal",
    badgeColor: "bg-cyan-600",
    slides: [
      { img: `${CDN}/fernanda_intro_generated_b7046782.webp`, caption: "Conheça a Dra. Fernanda" },
      { img: `${CDN}/fernanda_problema_generated_dc546043.webp`, caption: "O desafio dela" },
      { img: `${CDN}/fernanda_gestao_tempo_generated_f8378b96.webp`, caption: "Gestão do Tempo na prática" },
      { img: `${CDN}/fernanda_orcamento_generated_7b4d0c06.webp`, caption: "Orçamento e controle" },
      { img: `${CDN}/fernanda_aposentadoria_generated_2e04d6ac.webp`, caption: "Planejamento de aposentadoria" },
      { img: `${CDN}/fernanda_resultado_generated_0e77a9a8.webp`, caption: "Resultado após 3 meses" },
    ],
  },
};

interface Props {
  id: string;
}

export default function TutorialViewer({ id }: Props) {
  const [, navigate] = useLocation();
  const [current, setCurrent] = useState(0);
  const tutorial = TUTORIALS[id];

  if (!tutorial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <p className="text-xl font-bold mb-4">Tutorial não encontrado</p>
          <button onClick={() => navigate("/ferramentas")} className="text-indigo-400 underline">
            Voltar para Ferramentas
          </button>
        </div>
      </div>
    );
  }

  const { title, subtitle, badge, badgeColor, slides } = tutorial;
  const total = slides.length;

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(total - 1, c + 1));

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
        <button
          onClick={() => navigate("/ferramentas")}
          className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`${badgeColor} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}>
              {badge}
            </span>
            <span className="text-xs text-gray-500">
              {current + 1} / {total}
            </span>
          </div>
          <p className="text-sm font-bold text-white truncate">{title}</p>
        </div>
        <button
          onClick={() => navigate("/ferramentas")}
          className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>

      {/* Slide image */}
      <div className="flex-1 flex items-center justify-center px-2 py-4 relative">
        <img
          key={current}
          src={slides[current].img}
          alt={slides[current].caption}
          className="max-w-full max-h-[calc(100vh-180px)] rounded-xl shadow-2xl object-contain"
        />

        {/* Nav arrows */}
        {current > 0 && (
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {current < total - 1 && (
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Caption + dots */}
      <div className="px-4 pb-6 text-center">
        <p className="text-sm text-gray-300 mb-3">{slides[current].caption}</p>
        <div className="flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current ? "w-5 h-2 bg-indigo-500" : "w-2 h-2 bg-gray-600 hover:bg-gray-500"
              }`}
            />
          ))}
        </div>
        {current === total - 1 && (
          <button
            onClick={() => navigate("/ferramentas")}
            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full transition-colors"
          >
            Concluir tutorial
          </button>
        )}
      </div>
    </div>
  );
}
