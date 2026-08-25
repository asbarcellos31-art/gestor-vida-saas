import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Clock, Wallet, CheckCircle2, Star, TrendingUp, Shield, ArrowRight, X, Lock, BarChart3, PiggyBank, CalendarCheck } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { trackInitiateCheckout, trackLead, trackViewContent } from "@/lib/pixel";
import { trpc } from "@/lib/trpc";

function LogoBadge({ size = 8 }: { size?: number }) {
  const px = size * 4;
  return (
    <div style={{ width: px, height: px, borderRadius: 8, background: "linear-gradient(135deg,#C9A84C,#E2C97E)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ color: "#0B1437", fontWeight: 800, fontSize: px * 0.38, letterSpacing: -0.5 }}>GV</span>
    </div>
  );
}
const HOTMART_EBOOK  = "https://pay.hotmart.com/M105784997J?off=gqtt03zn";
const HOTMART_SISTEMA = "https://pay.hotmart.com/M105784997J?off=6vlpofwo";
const HOTMART_COMBO  = "https://pay.hotmart.com/M105784997J?off=zys6qohw";

const PLANS = [
  {
    id: "ebook", name: "E-book", price: "29,90", priceLabel: "pagamento único",
    description: "Método 3 Pilares da Vida — guia completo em PDF",
    icon: Clock, color: "from-amber-600 to-yellow-700", hotmartUrl: HOTMART_EBOOK,
    features: ["E-book: Método 3 Pilares da Vida", "Gestão de Tempo, Dinheiro e Futuro", "Estratégias práticas e aplicáveis", "Acesso imediato ao PDF"],
    notIncluded: ["Acesso ao sistema", "Dashboard interativo", "Projeção de aposentadoria"],
  },
  {
    id: "sistema", name: "Sistema Vitalício", price: "39,90", priceLabel: "acesso vitalício",
    description: "Acesso completo e permanente ao sistema Gestor de Vida",
    icon: Wallet, color: "from-amber-700 to-amber-900", hotmartUrl: HOTMART_SISTEMA,
    features: ["Gestão do Tempo completa", "Orçamento Doméstico completo", "Dashboard com gráficos", "Projeção de aposentadoria (3 cenários)", "Regra 50/30/20 automática", "Score de produtividade", "Pague uma vez, use para sempre"],
    notIncluded: ["E-book não incluso"],
  },
  {
    id: "combo", name: "Combo Promocional", price: "59,90", priceLabel: "acesso vitalício",
    description: "E-book + Sistema — tudo por um preço especial",
    icon: Star, color: "from-yellow-500 to-amber-600", hotmartUrl: HOTMART_COMBO,
    badge: "Melhor Oferta",
    features: ["E-book: Método 3 Pilares da Vida", "Acesso vitalício ao sistema completo", "Gestão do Tempo + Orçamento Doméstico", "Dashboard com gráficos interativos", "Projeção de aposentadoria (3 cenários)", "Score de produtividade", "Pague uma vez, use para sempre"],
    notIncluded: [],
  },
];

const gold = "#C9A84C";
const navy = "#0B1437";

function MockScreen({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(201,168,76,0.25)", background: "#070E26" }}>
      <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(201,168,76,0.08)", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
        <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
        <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
        <div className="w-3 h-3 rounded-full" style={{ background: "#10b981" }} />
        <span className="text-xs ml-2" style={{ color: "#5A6A80" }}>gestordevida.com.br</span>
      </div>
      <div className="p-5">{children}</div>
      <div className="px-4 py-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
        <p className="text-xs" style={{ color: "#5A6A80" }}>{label}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const captureLead = trpc.leads.capture.useMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  const [pendingPlan, setPendingPlan] = useState({ name: "", price: "" });
  const [leadEmail, setLeadEmail] = useState("");
  const [leadName, setLeadName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const planosRef = useRef<HTMLElement>(null);
  const testRef = useRef<HTMLElement>(null);
  const viewContentFired = useRef(false);
  const leadFired = useRef(false);

  useEffect(() => {
    const obsPlanos = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !viewContentFired.current) {
        viewContentFired.current = true;
        trackViewContent({ content_name: "Planos Gestor de Vida", content_category: "SaaS" });
      }
    }, { threshold: 0.3 });
    const obsTest = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !leadFired.current) {
        leadFired.current = true;
        trackLead({ content_name: "Depoimentos vistos", content_category: "SaaS" });
      }
    }, { threshold: 0.3 });
    if (planosRef.current) obsPlanos.observe(planosRef.current);
    if (testRef.current) obsTest.observe(testRef.current);
    return () => { obsPlanos.disconnect(); obsTest.disconnect(); };
  }, []);

  const openModal = (hotmartUrl: string, planName: string, price: string) => {
    setPendingUrl(hotmartUrl);
    setPendingPlan({ name: planName, price });
    setModalOpen(true);
  };

  const handleModalSubmit = async () => {
    if (!leadEmail.trim()) return;
    setSubmitting(true);
    const numericPrice = parseFloat(pendingPlan.price.replace(",", "."));
    captureLead.mutate({ email: leadEmail.trim(), name: leadName.trim() || undefined, planName: pendingPlan.name, planPrice: pendingPlan.price });
    trackLead({ content_name: pendingPlan.name, value: numericPrice, currency: "BRL" });
    trackInitiateCheckout({ content_name: pendingPlan.name, content_category: "SaaS", value: numericPrice, currency: "BRL" });
    localStorage.setItem("lastPurchaseValue", String(numericPrice));
    localStorage.setItem("lastPurchaseName", pendingPlan.name);
    const url = pendingUrl + (pendingUrl.includes("?") ? "&" : "?") + "checkoutEmail=" + encodeURIComponent(leadEmail.trim());
    setModalOpen(false);
    setSubmitting(false);
    setTimeout(() => { window.location.href = url; }, 200);
  };

  const handleGetStarted = () => {
    if (isAuthenticated) { navigate("/dashboard"); return; }
    openModal(HOTMART_COMBO, "Combo Promocional", "59,90");
  };

  const handlePlanClick = (hotmartUrl: string, planName: string, price: string) => {
    if (isAuthenticated) { navigate("/dashboard"); return; }
    openModal(hotmartUrl, planName, price);
  };

  return (
    <div className="min-h-screen" style={{ background: navy }}>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md" style={{ background: "#0D1B4B", border: "1px solid rgba(201,168,76,0.4)", color: "#F0E6C8" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "#E2C97E" }}>Antes de continuar...</DialogTitle>
            <DialogDescription style={{ color: "#8A9BB5" }}>
              Deixe seu email para receber a confirmação de acesso e dicas exclusivas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: gold }}>Seu nome</label>
              <Input placeholder="Como posso te chamar?" value={leadName} onChange={e => setLeadName(e.target.value)}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(201,168,76,0.3)", color: "#F0E6C8" }} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: gold }}>Seu melhor email *</label>
              <Input type="email" placeholder="email@exemplo.com" value={leadEmail}
                onChange={e => setLeadEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleModalSubmit()}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(201,168,76,0.3)", color: "#F0E6C8" }} />
            </div>
            <Button className="w-full py-5 font-semibold text-base rounded-xl mt-2"
              style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: navy }}
              disabled={!leadEmail.trim() || submitting} onClick={handleModalSubmit}>
              {submitting ? "Aguarde..." : `Continuar para o pagamento — R$ ${pendingPlan.price}`}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Lock className="w-3 h-3" style={{ color: "#5A6A80" }} />
              <p className="text-xs text-center" style={{ color: "#5A6A80" }}>
                Pagamento seguro via Hotmart · Garantia de 7 dias · Sem mensalidade
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b" style={{ background: "rgba(11,20,55,0.92)", borderColor: "rgba(201,168,76,0.2)" }}>
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <LogoBadge size={8} />
            <span className="font-bold text-lg" style={{ color: gold }}>Gestor de Vida</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard")} style={{ background: `linear-gradient(135deg,#C9A84C,#E2C97E)`, color: navy }} className="font-semibold">
                Acessar Dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")} style={{ color: gold }}>Entrar</Button>
                <Button onClick={handleGetStarted} style={{ background: `linear-gradient(135deg,#C9A84C,#E2C97E)`, color: navy }} className="font-semibold hidden sm:flex">
                  Começar agora
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-36 pb-20 px-4" style={{ background: "linear-gradient(180deg,#0D1B4B 0%,#0B1437 100%)" }}>
        <div className="container text-center max-w-3xl mx-auto">
          <Badge className="mb-6 border" style={{ background: "rgba(201,168,76,0.15)", color: "#E2C97E", borderColor: "rgba(201,168,76,0.4)" }}>
            Sistema completo · Pagamento único · Sem mensalidade
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight" style={{ color: "#F0E6C8" }}>
            Organize seu tempo.<br />
            Controle seu dinheiro.<br />
            <span style={{ color: gold }}>Garanta sua aposentadoria.</span>
          </h1>
          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: "#8A9BB5" }}>
            O Método dos 3 Pilares conecta gestão do tempo, controle financeiro e projeção de futuro em um único sistema — simples, prático e vitalício.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/simulador")} className="px-8 py-6 text-lg rounded-xl font-semibold"
              style={{ background: `linear-gradient(135deg,#C9A84C,#E2C97E)`, color: navy }}>
              Simular minha aposentadoria <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-xl"
              style={{ borderColor: "rgba(201,168,76,0.5)", color: gold, background: "transparent" }}
              onClick={() => document.getElementById("pilares")?.scrollIntoView({ behavior: "smooth" })}>
              Ver como funciona
            </Button>
          </div>
          <p className="mt-5 text-sm" style={{ color: "#5A6A80" }}>
            Simulador gratuito · Sistema a partir de R$39,90 · Garantia de 7 dias
          </p>
        </div>
      </section>

      {/* OS 3 PILARES */}
      <section id="pilares" className="py-20 px-4" style={{ background: "#070E26" }}>
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: gold }}>O método na prática</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#F0E6C8" }}>
              Três pilares. Um ciclo. Um resultado.
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#8A9BB5" }}>
              Cada pilar alimenta o próximo. Quando você organiza o tempo, sobra energia para enxergar o dinheiro. Quando enxerga o dinheiro, começa a construir o futuro.
            </p>
          </div>

          <div className="space-y-16">

            {/* Pilar 1 — Tempo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
                    <CalendarCheck className="w-6 h-6" style={{ color: "#3B82F6" }} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#3B82F6" }}>Pilar 1 — Tempo</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: "#F0E6C8" }}>
                  Pare de ser refém da agenda dos outros.
                </h3>
                <p className="text-base leading-relaxed mb-5" style={{ color: "#8A9BB5" }}>
                  Você classifica cada tarefa como Importante, Urgente ou Circunstancial. O sistema organiza sua atenção — não apenas sua agenda. Em média, quem usa o método recupera <strong style={{ color: "#F0E6C8" }}>1h30 por dia</strong> eliminando tarefas que não deveriam existir na sua rotina.
                </p>
                <ul className="space-y-2">
                  {["Gestão de tarefas com prioridade real", "Timer por tarefa e score de produtividade", "Visão semanal e relatório de desempenho", "Tarefas recorrentes com controle automático"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "#C8D8E8" }}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#3B82F6" }} />{f}
                    </li>
                  ))}
                </ul>
              </div>
              <MockScreen label="Gestão do Tempo — classificação e timer por tarefa">
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold" style={{ color: "#F0E6C8" }}>Segunda-feira</span>
                    <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: "rgba(59,130,246,0.15)", color: "#3B82F6" }}>Score: 87</span>
                  </div>
                  {[
                    { label: "Reunião de resultados", type: "Importante", color: "#10b981", done: true },
                    { label: "Proposta para cliente X", type: "Importante", color: "#10b981", done: true },
                    { label: "Responder e-mails gerais", type: "Circunstancial", color: "#8A9BB5", done: false },
                    { label: "Fechar contrato pendente", type: "Urgente", color: "#f59e0b", done: false },
                  ].map(t => (
                    <div key={t.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${t.color}22`, opacity: t.done ? 0.6 : 1 }}>
                      <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: t.done ? t.color : "transparent", border: `2px solid ${t.color}` }}>
                        {t.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: "#F0E6C8", textDecoration: t.done ? "line-through" : "none" }}>{t.label}</p>
                      </div>
                      <span className="text-xs shrink-0" style={{ color: t.color }}>{t.type}</span>
                    </div>
                  ))}
                </div>
              </MockScreen>
            </div>

            {/* Pilar 2 — Finanças */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <MockScreen label="Orçamento — Regra 50/30/20 e lançamento de despesas">
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold" style={{ color: "#F0E6C8" }}>Agosto · R$5.000</span>
                    <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>No controle</span>
                  </div>
                  {[
                    { label: "Necessidades (50%)", valor: "R$2.500", max: "R$2.500", pct: 100, color: "#8A9BB5" },
                    { label: "Lazer (30%)", valor: "R$1.100", max: "R$1.500", pct: 73, color: "#3B82F6" },
                    { label: "Futuro (20%)", valor: "R$1.000", max: "R$1.000", pct: 100, color: "#10b981" },
                  ].map(c => (
                    <div key={c.label} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div className="flex justify-between text-xs mb-2">
                        <span style={{ color: "#8A9BB5" }}>{c.label}</span>
                        <span style={{ color: "#F0E6C8" }}>{c.valor} <span style={{ color: "#5A6A80" }}>/ {c.max}</span></span>
                      </div>
                      <div className="w-full h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-2 rounded-full transition-all" style={{ width: `${c.pct}%`, background: c.color }} />
                      </div>
                    </div>
                  ))}
                  <div className="mt-2 p-3 rounded-xl text-center" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <p className="text-xs" style={{ color: "#10b981" }}>✓ R$1.000 investidos este mês</p>
                  </div>
                </div>
              </MockScreen>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                    <Wallet className="w-6 h-6" style={{ color: "#10b981" }} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#10b981" }}>Pilar 2 — Finanças</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: "#F0E6C8" }}>
                  Clareza financeira sem planilha complexa.
                </h3>
                <p className="text-base leading-relaxed mb-5" style={{ color: "#8A9BB5" }}>
                  Você lança cada gasto. Manualmente. Intencionalmente. A Regra 50/30/20 é automática — 50% para necessidades, 30% para lazer, 20% para o futuro. Quem usa por 30 dias, em média, descobre <strong style={{ color: "#F0E6C8" }}>R$400–700 de gastos invisíveis</strong> por mês.
                </p>
                <ul className="space-y-2">
                  {["Orçamento com Regra 50/30/20 automática", "Lançamento de despesas por categoria", "Controle de contas fixas e parcelamentos", "Visão mensal de onde vai cada real"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "#C8D8E8" }}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#10b981" }} />{f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pilar 3 — Aposentadoria */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)" }}>
                    <PiggyBank className="w-6 h-6" style={{ color: gold }} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>Pilar 3 — Aposentadoria</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: "#F0E6C8" }}>
                  Veja, em números reais, onde você chega.
                </h3>
                <p className="text-base leading-relaxed mb-5" style={{ color: "#8A9BB5" }}>
                  O simulador compara o que o INSS vai te pagar com o que você acumularia investindo o mesmo valor. Três cenários: pessimista, regular e otimista — com taxas IPCA+6%, IPCA+8% e IPCA+10%. Sem promessa. Só matemática.
                </p>
                <ul className="space-y-2">
                  {["Simulação em 3 cenários reais (IPCA+6/8/10%)", "Comparativo INSS vs investimento", "Capital acumulado e renda mensal projetada", "Simulador gratuito em gestordevida.com.br/simulador"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "#C8D8E8" }}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: gold }} />{f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-6 px-6 py-4 font-semibold rounded-xl"
                  style={{ background: `linear-gradient(135deg,#C9A84C,#E2C97E)`, color: navy }}
                  onClick={() => navigate("/simulador")}>
                  Simular gratuitamente <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <MockScreen label="Projeção de Aposentadoria — 3 cenários com taxas reais">
                <div className="space-y-3">
                  <div className="mb-4">
                    <p className="text-xs" style={{ color: "#5A6A80" }}>Renda R$5.000 · Investindo R$1.000/mês · 30 anos</p>
                  </div>
                  {[
                    { label: "Pessimista", rate: "IPCA+6%", capital: "R$2,4M", renda: "R$8.100/mês", color: "#ef4444" },
                    { label: "Regular", rate: "IPCA+8%", capital: "R$3,6M", renda: "R$12.000/mês", color: gold },
                    { label: "Otimista", rate: "IPCA+10%", capital: "R$5,6M", renda: "R$18.600/mês", color: "#10b981" },
                  ].map(s => (
                    <div key={s.label} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${s.color}33` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold" style={{ color: s.color }}>{s.label} ({s.rate})</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs" style={{ color: "#5A6A80" }}>Capital acumulado</p>
                          <p className="text-sm font-bold" style={{ color: "#F0E6C8" }}>{s.capital}</p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: "#5A6A80" }}>Renda mensal</p>
                          <p className="text-sm font-bold" style={{ color: s.color }}>{s.renda}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </MockScreen>
            </div>
          </div>
        </div>
      </section>

      {/* SIMULADOR CTA */}
      <section className="py-16 px-4" style={{ background: "#0D1B4B" }}>
        <div className="container max-w-3xl mx-auto text-center">
          <BarChart3 className="w-10 h-10 mx-auto mb-4" style={{ color: gold }} />
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "#F0E6C8" }}>
            Descubra quanto você vai ter na aposentadoria
          </h2>
          <p className="text-base mb-6" style={{ color: "#8A9BB5" }}>
            Simulação gratuita em 30 segundos. Sem cadastro. Sem compromisso.
          </p>
          <Button size="lg" className="px-8 py-5 text-base rounded-xl font-semibold"
            style={{ background: `linear-gradient(135deg,#C9A84C,#E2C97E)`, color: navy }}
            onClick={() => navigate("/simulador")}>
            Simular agora — é gratuito <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="mt-3 text-xs" style={{ color: "#5A6A80" }}>30 segundos · gestordevida.com.br/simulador</p>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section ref={testRef} className="py-20 px-4" style={{ background: "#070E26" }}>
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: gold }}>Quem já usa</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#F0E6C8" }}>Pessoas reais. Rotinas reais.</h2>
          </div>

          <div className="max-w-2xl mx-auto mb-10 p-6 rounded-2xl text-center" style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.35)" }}>
            <p className="text-lg md:text-xl font-semibold leading-relaxed italic" style={{ color: "#E2C97E" }}>
              "Comprei achando que era mais um app de finanças. Não é. É um método que usa o app como ferramenta. Essa diferença muda tudo."
            </p>
            <p className="text-sm mt-3 font-semibold" style={{ color: gold }}>— Juliana Castro, Psicóloga · Curitiba</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                text: "Eu vivia com aquela sensação constante de que estava sempre devendo algo a alguém. Minha rotina era uma bagunça disfarçada de movimento. Quando comecei a usar a gestão do tempo do Gestor de Vida, foi a primeira vez que eu realmente parei para olhar para o que eu estava fazendo com as minhas horas. O estresse diminuiu. Consegui me dedicar mais aos meus clientes, entregar melhor, fechar mais projetos — e ainda sobrou energia para a minha família. Hoje guardo para os meus sonhos.",
                name: "Nayara Barcellos", role: "Designer de Interiores · Sócia · Mãe e Esposa", handle: "@naybarcellos", link: "https://instagram.com/naybarcellos",
              },
              {
                text: "Com dois filhos, o tempo escorregava pelas mãos. Quando comecei a usar o Gestor de Vida, ganhei uma visão que a agenda convencional nunca me deu. Os relatórios semanais me ajudam a afinar minha produtividade. Quando você vê o tempo, o orçamento e a projeção da sua aposentadoria juntos, numa visão só, bate uma clareza diferente. Fiquei muito mais motivada a lapidar meu orçamento porque agora enxergo o quanto cada ajuste antecipa meus objetivos.",
                name: "Fernanda Griggio", role: "Consultora de Benefícios · Empresária · Mãe", handle: "@fernanda_griggio", link: "https://instagram.com/fernanda_griggio",
              },
              {
                text: "Trabalhava 10h por dia e no final do mês não sobrava nada. Na primeira semana já percebi que gastava R$340 em coisas que nem lembrava de ter comprado. Em 60 dias cortei R$680 de gastos invisíveis — sem mudar minha renda. O simulador de aposentadoria foi o que mais me chocou: investindo só R$300 a mais por mês, antecipo minha aposentadoria em 4 anos. Hoje durmo diferente.",
                name: "Rafael Mendonça", role: "Analista de TI · São Paulo", handle: "usuário verificado", link: null,
              },
              {
                text: "A parte de tempo foi onde mais senti impacto: eu era daquelas pessoas que chegava no fim do dia exausta mas sem saber o que tinha feito de útil. Quando comecei a classificar as tarefas, percebi que passava a tarde inteira em 'urgente para os outros' e deixava o que era importante para mim para depois — que nunca chegava. Em 3 semanas isso mudou. Finalizei um projeto que estava parado há 7 meses.",
                name: "Juliana Castro", role: "Psicóloga · Curitiba", handle: "usuário verificado", link: null,
              },
            ].map((t) => (
              <div key={t.name} className="p-7 rounded-2xl flex flex-col" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}>
                <div className="flex gap-1 mb-4">{Array.from({ length: 5 }).map((_, s) => (<Star key={s} className="w-4 h-4 fill-current" style={{ color: gold }} />))}</div>
                <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: "#C8D8E8" }}>"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#F0E6C8" }}>{t.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#8A9BB5" }}>{t.role}</p>
                  </div>
                  {t.link
                    ? <a href={t.link} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold" style={{ color: gold }}>{t.handle}</a>
                    : <span className="text-xs" style={{ color: "#5A6A80" }}>{t.handle}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4" style={{ background: "#0D1B4B" }}>
        <div className="container max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest mb-3" style={{ color: gold }}>PERGUNTAS FREQUENTES</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#F0E6C8" }}>Antes de decidir</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: "O que exatamente é o Gestor de Vida?", a: "É um sistema com 3 módulos conectados: Gestão do Tempo (tarefas, prioridades, timer e score), Orçamento (lançamento de despesas, Regra 50/30/20) e Projeção de Aposentadoria (simulação em 3 cenários). Acompanha o E-book com o Método dos 3 Pilares, que explica a lógica por trás de tudo." },
              { q: "Por que não tem integração com banco?", a: "Porque integração automática não muda comportamento. Quando o app importa tudo sozinho, você olha os números como dados de outra pessoa. O ato de lançar manualmente cria consciência — e consciência muda hábito." },
              { q: "Quanto tempo leva para ver resultado?", a: "Em 30 dias de uso consistente, você já sabe exatamente para onde vai cada real e cada hora. Em 90 dias, o hábito está instalado. Em 1 ano, você tem números reais para decisões de vida." },
              { q: "Funciona no celular?", a: "Sim. O sistema é responsivo e funciona em qualquer dispositivo — celular, tablet ou computador." },
              { q: "O pagamento é único mesmo?", a: "Sim. Pague uma vez e use para sempre. Sem assinatura, sem cobrança recorrente." },
              { q: "E se eu não gostar?", a: "Garantia de 7 dias. Se por qualquer motivo não ficar satisfeito, o valor é devolvido integralmente, sem perguntas." },
            ].map((item, i) => (
              <details key={i} className="group rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}>
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none" style={{ color: "#E8E0CC" }}>
                  <span className="font-semibold pr-4">{item.q}</span>
                  <span className="text-xl flex-shrink-0 transition-transform group-open:rotate-45" style={{ color: gold }}>+</span>
                </summary>
                <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: "rgba(232,224,204,0.75)" }}>{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section ref={planosRef} id="planos" className="py-20 px-4" style={{ background: "#070E26" }}>
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: gold }}>Investimento</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#F0E6C8" }}>Escolha como começar</h2>
            <p className="text-lg" style={{ color: "#8A9BB5" }}>Pagamento único. Sem mensalidade. Pague uma vez e use para sempre.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div key={plan.id} className="relative rounded-2xl p-6 sm:p-8 flex flex-col"
                style={{ background: (plan as any).badge ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.04)", border: (plan as any).badge ? "2px solid rgba(201,168,76,0.6)" : "1px solid rgba(201,168,76,0.15)" }}>
                {(plan as any).badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="border-0 px-4 py-1 text-sm font-semibold" style={{ background: `linear-gradient(135deg,#C9A84C,#E2C97E)`, color: navy }}>{(plan as any).badge}</Badge>
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-5`}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1" style={{ color: "#F0E6C8" }}>{plan.name}</h3>
                <p className="text-sm mb-5" style={{ color: "#8A9BB5" }}>{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold" style={{ color: gold }}>R$ {plan.price}</span>
                  <span className="text-sm ml-2" style={{ color: "#8A9BB5" }}>{(plan as any).priceLabel}</span>
                  {(plan as any).badge && <p className="text-xs mt-1 font-semibold" style={{ color: "#ef4444" }}>⚡ Preço promocional por tempo limitado</p>}
                </div>
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "#C8D8E8" }}>
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: gold }} />{f}
                    </li>
                  ))}
                  {plan.notIncluded.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "#3A4A60" }}>
                      <X className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#3A4A60" }} />{f}
                    </li>
                  ))}
                </ul>
                <Button onClick={() => handlePlanClick(plan.hotmartUrl, plan.name, plan.price)}
                  className="w-full rounded-xl py-5 font-semibold"
                  style={(plan as any).badge
                    ? { background: `linear-gradient(135deg,#C9A84C,#E2C97E)`, color: navy }
                    : { background: "rgba(201,168,76,0.15)", color: gold, border: "1px solid rgba(201,168,76,0.4)" }}>
                  Comprar agora <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <Shield className="w-3 h-3" style={{ color: "#10b981" }} />
                  <span className="text-xs" style={{ color: "#5A6A80" }}>Garantia de 7 dias — dinheiro de volta sem perguntas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-4" style={{ background: "linear-gradient(135deg,#0D1B4B 0%,#1A2B5E 100%)", borderTop: "1px solid rgba(201,168,76,0.2)" }}>
        <div className="container text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight" style={{ color: "#F0E6C8" }}>
            O processo não começa quando você se sentir pronto.<br />
            <span style={{ color: gold }}>Ele começa quando você decide começar.</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: "#8A9BB5" }}>
            Tempo organizado. Dinheiro controlado. Aposentadoria projetada. Tudo em um sistema. R$59,90 — uma vez só.
          </p>
          <Button size="lg" onClick={handleGetStarted} className="px-10 py-6 text-lg rounded-xl font-semibold"
            style={{ background: `linear-gradient(135deg,#C9A84C,#E2C97E)`, color: navy }}>
            Quero o Combo — R$ 59,90 <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="mt-4 text-sm" style={{ color: "#5A6A80" }}>Pagamento único · Acesso vitalício · Garantia de 7 dias</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-4 text-sm" style={{ background: "#070E26", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LogoBadge size={6} />
            <span className="font-semibold" style={{ color: gold }}>Gestor de Vida</span>
          </div>
          <p style={{ color: "#3A4A60" }}>© {new Date().getFullYear()} Gestor de Vida. Todos os direitos reservados.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="mailto:contato@gestordevida.com.br" className="transition-colors" style={{ color: "#5A6A80" }}>Suporte</a>
            <a href="#planos" className="transition-colors" style={{ color: "#5A6A80" }}>Planos</a>
            <a href="/politica-de-privacidade" className="transition-colors" style={{ color: "#5A6A80" }}>Privacidade</a>
            <a href="/termos-de-uso" className="transition-colors" style={{ color: "#5A6A80" }}>Termos de Uso</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
