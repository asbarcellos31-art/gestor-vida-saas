import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ArrowLeft,
  Volume2,
  VolumeX,
} from "lucide-react";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd";

interface SlideData {
  img: string;
  caption: string;
  duration?: number; // ms per slide, default 5000
}

interface TutorialData {
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  slides: SlideData[];
}

const TUTORIALS: Record<string, TutorialData> = {
  metodo: {
    title: "O Método: Gestão do Tempo + Regra 50/30/20",
    subtitle: "Como antecipar o que é importante antes que vire urgente",
    badge: "Didático",
    badgeColor: "bg-violet-600",
    slides: [
      { img: `${CDN}/abertura_generated_41c34109.webp`, caption: "O problema que todo mundo tem", duration: 5000 },
      { img: `${CDN}/conceito_gt_generated_29f856f4.webp`, caption: "Gestão do Tempo — 3 categorias que mudam tudo", duration: 6000 },
      { img: `${CDN}/importantes_generated_b9b378f3.webp`, caption: "Tarefas Importantes — constroem seu futuro", duration: 6000 },
      { img: `${CDN}/urgentes_generated_5b1685d0.webp`, caption: "Tarefas Urgentes — apagam incêndios", duration: 6000 },
      { img: `${CDN}/circunstanciais_generated_62020546.webp`, caption: "Tarefas Circunstanciais — consomem seu tempo", duration: 6000 },
      { img: `${CDN}/antecipacao_generated_3018c134.webp`, caption: "A chave: antecipar antes que vire urgente", duration: 7000 },
      { img: `${CDN}/regra_5030_generated_0b715d84.webp`, caption: "Regra 50/30/20 — sua renda dividida de forma inteligente", duration: 6000 },
      { img: `${CDN}/combinacao_generated_50bd779a.webp`, caption: "Os dois métodos juntos — controle total", duration: 6000 },
      { img: `${CDN}/cta_generated_d9160b2d.webp`, caption: "Escolha um perfil e veja na prática", duration: 5000 },
    ],
  },
  souza: {
    title: "Roberto e Maria Souza",
    subtitle: "Saindo das dívidas com R$ 4.000/mês",
    badge: "Baixa Renda",
    badgeColor: "bg-amber-500",
    slides: [
      { img: `${CDN}/souza_capa_generated_52846e6e.webp`, caption: "Conheça Roberto e Maria Souza", duration: 5000 },
      { img: `${CDN}/souza_passo1_generated_d60b678d.webp`, caption: "Passo 1 — Cadastro e Dashboard", duration: 6000 },
      { img: `${CDN}/souza_passo2_generated_9e94264a.webp`, caption: "Passo 2 — Gestão do Tempo na prática", duration: 7000 },
      { img: `${CDN}/souza_passo3_generated_d32f956e.webp`, caption: "Passo 3 — Orçamento e controle de dívidas", duration: 7000 },
      { img: `${CDN}/souza_resultado_generated_973c3b0a.webp`, caption: "Resultado — 30 dias depois", duration: 6000 },
    ],
  },
  silva: {
    title: "Família Silva",
    subtitle: "Organizando quem ganha bem mas não investe",
    badge: "Renda Média",
    badgeColor: "bg-sky-500",
    slides: [
      { img: `${CDN}/silva_capa_generated_26a8894a.webp`, caption: "Conheça a Família Silva", duration: 5000 },
      { img: `${CDN}/silva_passo1_generated_0ee57273.webp`, caption: "Passo 1 — Cadastro e Dashboard", duration: 6000 },
      { img: `${CDN}/silva_passo2_generated_8c858803.webp`, caption: "Passo 2 — Gestão do Tempo na prática", duration: 7000 },
      { img: `${CDN}/silva_passo3_generated_dd22dfdc.webp`, caption: "Passo 3 — Orçamento e investimentos", duration: 7000 },
      { img: `${CDN}/silva_resultado_generated_10f646a5.webp`, caption: "Resultado — 6 meses depois", duration: 6000 },
    ],
  },
  fernanda: {
    title: "Dra. Fernanda Rocha",
    subtitle: "Médica profissional liberal — organizando tempo e dinheiro na prática",
    badge: "Prof. Liberal",
    badgeColor: "bg-rose-500",
    slides: [
      {
        img: `${CDN}/01_dashboard_955dc6f1.webp`,
        caption: "Dashboard — visão geral: entradas R$ 15.000, saldo e meta 20% atingida",
        duration: 7000,
      },
      {
        img: `${CDN}/02_gestao_tempo_meudio_35680b0d.webp`,
        caption: "Gestão do Tempo — tarefas do dia classificadas: Importante, Urgente e Circunstancial",
        duration: 7000,
      },
      {
        img: `${CDN}/03_nova_tarefa_form_601804fb.webp`,
        caption: "Criando nova tarefa — clique em '+ Nova' e preencha: título, categoria e duração estimada",
        duration: 7000,
      },
      {
        img: `${CDN}/04_nova_tarefa_preenchida_450ab4d7.webp`,
        caption: "Tarefa preenchida — 'Elaborar proposta para plano de saúde empresarial' como Importante",
        duration: 7000,
      },
      {
        img: `${CDN}/05_tarefa_criada_be28a96d.webp`,
        caption: "Tarefa salva — aparece na lista do dia com timer e opções de editar/excluir",
        duration: 6000,
      },
      {
        img: `${CDN}/06_planejamento_semanal_fa0b5b00.webp`,
        caption: "Planejamento semanal — distribua as tarefas pelos dias da semana com antecedência",
        duration: 7000,
      },
      {
        img: `${CDN}/07_orcamento_mensal_ff594d25.webp`,
        caption: "Orçamento Mensal — lançamento de entradas: consultório R$ 9.500, plantão R$ 4.200, telemedicina R$ 1.300",
        duration: 8000,
      },
      {
        img: `${CDN}/08_nova_despesa_form_5b08736c.webp`,
        caption: "Nova Despesa — preencha: categoria, descrição, valor, forma de pagamento e vínculo familiar",
        duration: 8000,
      },
      {
        img: `${CDN}/09_parcelado_preenchido_a2a01768.webp`,
        caption: "Parcelado — material cirúrgico R$ 3.600 em 3x: o sistema distribui automaticamente nos próximos meses",
        duration: 8000,
      },
      {
        img: `${CDN}/10_parcelados_ativos_cdcc89ca.webp`,
        caption: "Contas Parceladas — visão de todos os parcelados ativos: comprometimento mensal e prazo de quitação",
        duration: 7000,
      },
      {
        img: `${CDN}/11_aposentadoria_9a8a7342.webp`,
        caption: "Simulador de Aposentadoria — 3 cenários (pessimista, regular, otimista) baseados no seu orçamento real",
        duration: 8000,
      },
      {
        img: `${CDN}/12_relatorio_gestao_fd6f6b81.webp`,
        caption: "Relatório de Gestão do Tempo — resumo diário por categoria: quantas tarefas, horas planejadas vs. executadas",
        duration: 7000,
      },
    ],
  },
};

interface Props {
  id: string;
}

export default function VideoPlayer({ id }: Props) {
  const [, navigate] = useLocation();
  const tutorial = TUTORIALS[id];

  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100 within current slide
  const [transitioning, setTransitioning] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef(0);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = tutorial?.slides.length ?? 0;
  const currentDuration = tutorial?.slides[current]?.duration ?? 5000;
  const TICK = 50; // ms

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const goToSlide = useCallback(
    (index: number, autoPlay = true) => {
      clearTimer();
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(index);
        setProgress(0);
        progressRef.current = 0;
        setTransitioning(false);
        setEnded(false);
        if (autoPlay) setPlaying(true);
      }, 300);
    },
    [clearTimer]
  );

  const next = useCallback(() => {
    if (current < total - 1) {
      goToSlide(current + 1);
    } else {
      clearTimer();
      setPlaying(false);
      setEnded(true);
    }
  }, [current, total, goToSlide, clearTimer]);

  const prev = useCallback(() => {
    if (current > 0) goToSlide(current - 1);
  }, [current, goToSlide]);

  // Autoplay ticker
  useEffect(() => {
    if (!playing) {
      clearTimer();
      return;
    }
    intervalRef.current = setInterval(() => {
      progressRef.current += (TICK / currentDuration) * 100;
      setProgress(Math.min(progressRef.current, 100));
      if (progressRef.current >= 100) {
        clearTimer();
        next();
      }
    }, TICK);
    return clearTimer;
  }, [playing, current, currentDuration, next, clearTimer]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (playing) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [playing, current, resetControlsTimer]);

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

  const { title, badge, badgeColor, slides } = tutorial;

  // Overall progress bar (across all slides)
  const overallProgress = ((current + progress / 100) / total) * 100;

  return (
    <div
      className="min-h-screen bg-black flex flex-col select-none"
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-20 transition-opacity duration-300"
        style={{ opacity: showControls ? 1 : 0 }}
      >
        <button
          onClick={() => navigate("/ferramentas")}
          className="w-8 h-8 rounded-full bg-card/10 backdrop-blur flex items-center justify-center text-white hover:bg-card/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`${badgeColor} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}>
              {badge}
            </span>
            <span className="text-xs text-white/60">
              {current + 1} / {total}
            </span>
          </div>
          <p className="text-sm font-bold text-white truncate">{title}</p>
        </div>
        <button
          onClick={() => setMuted((m) => !m)}
          className="w-8 h-8 rounded-full bg-card/10 backdrop-blur flex items-center justify-center text-white hover:bg-card/20 transition-colors"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Slide image — fills screen */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => {
          if (ended) return;
          setPlaying((p) => !p);
        }}
      >
        <img
          key={current}
          src={slides[current].img}
          alt={slides[current].caption}
          className="w-full h-full object-contain"
          style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? "scale(1.03)" : "scale(1)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        />

        {/* Play/Pause overlay icon (center) */}
        {!playing && !ended && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
              <Play className="w-10 h-10 text-white fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Ended overlay */}
        {ended && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-4">
            <p className="text-white text-xl font-bold">Tutorial concluído!</p>
            <div className="flex gap-3">
              <button
                onClick={() => goToSlide(0, false)}
                className="px-5 py-2 bg-card/10 hover:bg-card/20 text-white text-sm font-semibold rounded-full transition-colors"
              >
                Rever
              </button>
              <button
                onClick={() => navigate("/ferramentas")}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div
        className="bg-gradient-to-t from-black/90 to-transparent absolute bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-12 transition-opacity duration-300"
        style={{ opacity: showControls ? 1 : 0 }}
      >
        {/* Caption */}
        <p className="text-white/80 text-sm text-center mb-3 font-medium">{slides[current].caption}</p>

        {/* Overall progress bar (clickable) */}
        <div
          className="w-full h-1.5 bg-card/20 rounded-full mb-4 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            const targetSlide = Math.floor(ratio * total);
            goToSlide(Math.max(0, Math.min(total - 1, targetSlide)));
          }}
        >
          <div
            className="h-full bg-indigo-400 rounded-full transition-all duration-100"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        {/* Segment dots */}
        <div className="flex justify-center gap-1.5 mb-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className="rounded-full transition-all"
              style={{
                width: i === current ? "20px" : "8px",
                height: "8px",
                background: i === current ? "#818cf8" : i < current ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={prev}
            disabled={current === 0}
            className="w-10 h-10 rounded-full bg-card/10 flex items-center justify-center text-white disabled:opacity-30 hover:bg-card/20 transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              if (ended) {
                goToSlide(0, true);
              } else {
                setPlaying((p) => !p);
              }
            }}
            className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white transition-colors shadow-lg shadow-indigo-900/50"
          >
            {playing ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 fill-white ml-0.5" />
            )}
          </button>

          <button
            onClick={next}
            disabled={current === total - 1 && ended}
            className="w-10 h-10 rounded-full bg-card/10 flex items-center justify-center text-white disabled:opacity-30 hover:bg-card/20 transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
