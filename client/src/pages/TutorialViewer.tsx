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
      { img: `${CDN}/abertura_generated_41c34109.webp`, caption: "O problema que todo mundo tem" },
      { img: `${CDN}/conceito_gt_generated_29f856f4.webp`, caption: "Gestão do Tempo — 3 categorias que mudam tudo" },
      { img: `${CDN}/importantes_generated_b9b378f3.webp`, caption: "Tarefas Importantes — constroem seu futuro" },
      { img: `${CDN}/urgentes_generated_5b1685d0.webp`, caption: "Tarefas Urgentes — apagam incêndios" },
      { img: `${CDN}/circunstanciais_generated_62020546.webp`, caption: "Tarefas Circunstanciais — consomem seu tempo" },
      { img: `${CDN}/antecipacao_generated_3018c134.webp`, caption: "A chave: antecipar antes que vire urgente" },
      { img: `${CDN}/regra_5030_generated_0b715d84.webp`, caption: "Regra 50/30/20 — sua renda dividida de forma inteligente" },
      { img: `${CDN}/combinacao_generated_50bd779a.webp`, caption: "Os dois métodos juntos — controle total" },
      { img: `${CDN}/cta_generated_d9160b2d.webp`, caption: "Escolha um perfil e veja na prática" },
    ],
  },
  souza: {
    title: "Roberto e Maria Souza",
    subtitle: "Saindo das dívidas com R$ 4.000/mês",
    badge: "Baixa Renda",
    badgeColor: "bg-amber-500",
    slides: [
      { img: `${CDN}/souza_capa_generated_52846e6e.webp`, caption: "Conheça Roberto e Maria Souza" },
      { img: `${CDN}/souza_passo1_generated_d60b678d.webp`, caption: "Passo 1 — Cadastro e Dashboard" },
      { img: `${CDN}/souza_passo2_generated_9e94264a.webp`, caption: "Passo 2 — Gestão do Tempo na prática" },
      { img: `${CDN}/souza_passo3_generated_d32f956e.webp`, caption: "Passo 3 — Orçamento e controle de dívidas" },
      { img: `${CDN}/souza_resultado_generated_973c3b0a.webp`, caption: "Resultado — 30 dias depois" },
    ],
  },
  silva: {
    title: "Família Silva",
    subtitle: "Organizando quem ganha bem mas não investe",
    badge: "Renda Média",
    badgeColor: "bg-sky-500",
    slides: [
      { img: `${CDN}/silva_capa_generated_26a8894a.webp`, caption: "Conheça a Família Silva" },
      { img: `${CDN}/silva_passo1_generated_0ee57273.webp`, caption: "Passo 1 — Cadastro e Dashboard" },
      { img: `${CDN}/silva_passo2_generated_8c858803.webp`, caption: "Passo 2 — Gestão do Tempo na prática" },
      { img: `${CDN}/silva_passo3_generated_dd22dfdc.webp`, caption: "Passo 3 — Orçamento e investimentos" },
      { img: `${CDN}/silva_resultado_generated_10f646a5.webp`, caption: "Resultado — 6 meses depois" },
    ],
  },
  fernanda: {
    title: "Dra. Fernanda Rocha",
    subtitle: "Médica profissional liberal sem tempo para nada",
    badge: "Prof. Liberal",
    badgeColor: "bg-rose-500",
    slides: [
      { img: `${CDN}/fernanda_capa_generated_c72143c6.webp`, caption: "Conheça a Dra. Fernanda Rocha" },
      { img: `${CDN}/fernanda_passo1_generated_d85ee556.webp`, caption: "Passo 1 — Cadastro e Dashboard" },
      { img: `${CDN}/fernanda_passo2_generated_e1f39784.webp`, caption: "Passo 2 — Gestão do Tempo na prática" },
      { img: `${CDN}/fernanda_passo3_generated_d6a117af.webp`, caption: "Passo 3 — Orçamento e aposentadoria" },
      { img: `${CDN}/fernanda_resultado_generated_6760272a.webp`, caption: "Resultado — 3 meses depois" },
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
          className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-muted-foreground/60 hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`${badgeColor} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}>
              {badge}
            </span>
            <span className="text-xs text-muted-foreground">
              {current + 1} / {total}
            </span>
          </div>
          <p className="text-sm font-bold text-white truncate">{title}</p>
        </div>
        <button
          onClick={() => navigate("/ferramentas")}
          className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-muted-foreground/70 hover:bg-gray-700 transition-colors"
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
        <p className="text-sm text-muted-foreground/60 mb-3">{slides[current].caption}</p>
        <div className="flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current ? "w-5 h-2 bg-indigo-500" : "w-2 h-2 bg-gray-600 hover:bg-muted/300"
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
