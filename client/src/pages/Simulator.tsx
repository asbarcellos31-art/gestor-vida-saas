import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Lock, TrendingUp, AlertTriangle, CheckCircle2, Shield, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { trackLead } from "@/lib/pixel";

const ICON_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/icon-gv-navy-gold_6e5b968f.png";
const INSS_BENEFIT_TETO = 7786;
const INSS_CONTRIBUTION_TETO = 8157;
const SALARIO_MINIMO = 1518;

// Tabela progressiva INSS 2026 — quanto você PAGA por mês
function calcInssContribution(income: number): number {
  const brackets = [
    { max: 1518,  rate: 0.075 },
    { max: 2793,  rate: 0.09  },
    { max: 4190,  rate: 0.12  },
    { max: 8157,  rate: 0.14  },
  ];
  let contribution = 0;
  let prevMax = 0;
  const capped = Math.min(income, INSS_CONTRIBUTION_TETO);
  for (const b of brackets) {
    if (capped <= prevMax) break;
    contribution += (Math.min(capped, b.max) - prevMax) * b.rate;
    prevMax = b.max;
  }
  return contribution;
}

// Estimativa do benefício que você vai RECEBER do INSS
function calcInssBenefit(income: number): number {
  return Math.min(Math.max(income * 0.60, SALARIO_MINIMO), INSS_BENEFIT_TETO);
}

function futureValue(pmt: number, annualRate: number, months: number): number {
  const r = Math.pow(1 + annualRate, 1 / 12) - 1;
  if (r === 0 || months <= 0) return pmt * months;
  return pmt * (Math.pow(1 + r, months) - 1) / r;
}

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

interface ScenarioResult {
  label: string; rate: number; fv: number; monthlyFromFv: number; color: string;
}

interface SimResult {
  savingsUsed: number;
  inssBenefit: number;
  inssContribution: number;
  gap: number;
  totalNeeded: number;
  months: number;
  years: number;
  breakdown: { needs: number; wants: number; savings: number };
  scenarios: ScenarioResult[];
  inssScenarios: ScenarioResult[]; // mesma contribuição investida
}

const IPCA = 0.045; // premissa IPCA 4,5% a.a.

// Taxas REAIS (acima da inflação): IPCA+6%, IPCA+8%, IPCA+10%
// Convertidas para nominal via Fisher: (1 + real) * (1 + IPCA) - 1
const SCENARIOS_DEF = [
  { label: "Pessimista", realRate: 0.06, color: "#ef4444" },
  { label: "Regular",    realRate: 0.08, color: "#C9A84C" },
  { label: "Otimista",   realRate: 0.10, color: "#10b981" },
];

function buildScenarios(pmt: number, months: number): ScenarioResult[] {
  return SCENARIOS_DEF.map((s) => {
    const nominalRate = (1 + s.realRate) * (1 + IPCA) - 1;
    const fv = futureValue(pmt, nominalRate, months);
    return { label: s.label, rate: s.realRate, fv, monthlyFromFv: (fv * 0.04) / 12, color: s.color };
  });
}

function calculate(
  currentAge: number,
  retirementAge: number,
  income: number,
  desiredIncome: number,
  overrideSavings?: number,
): SimResult {
  const years = Math.max(retirementAge - currentAge, 1);
  const months = years * 12;
  const savingsUsed = overrideSavings ?? income * 0.20;
  const inssBenefit = calcInssBenefit(income);
  const inssContribution = calcInssContribution(income);
  const gap = Math.max(0, desiredIncome - inssBenefit);
  const totalNeeded = gap * 300;

  return {
    savingsUsed,
    inssBenefit,
    inssContribution,
    gap,
    totalNeeded,
    months,
    years,
    breakdown: { needs: income * 0.50, wants: income * 0.30, savings: income * 0.20 },
    scenarios: buildScenarios(savingsUsed, months),
    inssScenarios: buildScenarios(inssContribution, months),
  };
}

export default function Simulator() {
  const [, navigate] = useLocation();
  const captureSimulator = trpc.leads.captureSimulator.useMutation();

  // Inputs
  const [currentAge,    setCurrentAge]    = useState("");
  const [retirementAge, setRetirementAge] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [desiredIncome, setDesiredIncome] = useState("");

  // Contact
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Flow
  const [step,       setStep]       = useState<"form" | "contact" | "result">("form");
  const [result,     setResult]     = useState<SimResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  // Custom savings re-simulation
  const [customSavingsInput,  setCustomSavingsInput]  = useState("");
  const [adjustedResult,      setAdjustedResult]      = useState<SimResult | null>(null);
  const [customSavingsError,  setCustomSavingsError]  = useState("");

  const income      = parseFloat(monthlyIncome.replace(/\./g, "").replace(",", ".")) || 0;
  const desired     = parseFloat(desiredIncome.replace(/\./g, "").replace(",", ".")) || 0;
  const curAge      = parseInt(currentAge) || 0;
  const retAge      = parseInt(retirementAge) || 0;

  const handleCalculate = () => {
    if (!curAge || !retAge || !income || !desired) { setError("Preencha todos os campos."); return; }
    if (retAge <= curAge) { setError("A idade de aposentadoria deve ser maior que a atual."); return; }
    if (curAge < 16 || curAge > 80) { setError("Idade atual inválida."); return; }
    setError("");
    setResult(calculate(curAge, retAge, income, desired));
    setStep("contact");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContactSubmit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) { setError("Preencha todos os campos."); return; }
    setError("");
    setSubmitting(true);
    trackLead({ content_name: "simulador", email: email.trim() });
    try {
      await captureSimulator.mutateAsync({
        email: email.trim(),
        name:  name.trim(),
        phone: phone.trim(),
        simulation: { currentAge: curAge, retirementAge: retAge, monthlyIncome: income, desiredIncome: desired },
      });
    } catch (err) { console.error("[simulator] falha ao salvar lead:", err); }
    setSubmitting(false);
    setStep("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCustomSimulate = () => {
    const val = parseFloat(customSavingsInput.replace(/\./g, "").replace(",", "."));
    if (!val || val <= 0) { setCustomSavingsError("Informe um valor válido."); return; }
    setCustomSavingsError("");
    setAdjustedResult(calculate(curAge, retAge, income, desired, val));
  };

  // Recalcula com novos inputs sem voltar ao formulário (mantém dados de contato)
  const [editAge,        setEditAge]        = useState("");
  const [editRetAge,     setEditRetAge]     = useState("");
  const [editIncome,     setEditIncome]     = useState("");
  const [editDesired,    setEditDesired]    = useState("");
  const [editError,      setEditError]      = useState("");
  const [showEditPanel,  setShowEditPanel]  = useState(false);

  const handleRecalculate = () => {
    const ca  = parseInt(editAge)     || curAge;
    const ra  = parseInt(editRetAge)  || retAge;
    const inc = parseFloat(editIncome.replace(/\./g, "").replace(",", "."))  || income;
    const des = parseFloat(editDesired.replace(/\./g, "").replace(",", ".")) || desired;
    if (ra <= ca) { setEditError("Idade de aposentadoria deve ser maior que a atual."); return; }
    setEditError("");
    setCurrentAge(String(ca));
    setRetirementAge(String(ra));
    setMonthlyIncome(String(inc));
    setDesiredIncome(String(des));
    setResult(calculate(ca, ra, inc, des));
    setAdjustedResult(null);
    setCustomSavingsInput("");
    setShowEditPanel(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(201,168,76,0.3)",
    color: "#F0E6C8",
    height: "52px",
    fontSize: "1rem",
  };

  // ── INSS helpers ──────────────────────────────────────────────────
  const inssEstimated   = result ? result.inssBenefit    : calcInssBenefit(income);
  const inssContrib     = result ? result.inssContribution : calcInssContribution(income);
  const inssGapToTeto   = Math.max(0, INSS_BENEFIT_TETO - inssEstimated);
  const atContribTeto   = income >= INSS_CONTRIBUTION_TETO;

  // ── Cenários panel (reutilizável) ─────────────────────────────────
  const ScenariosPanel = ({ r, label }: { r: SimResult; label?: string }) => (
    <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}>
      {label && <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#C9A84C" }}>{label}</p>}
      <div className="space-y-3">
        {r.scenarios.map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${s.color}33` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold" style={{ color: s.color }}>
                {s.label} (IPCA+{(s.rate * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs" style={{ color: "#5A6A80" }}>Capital acumulado</p>
                <p className="text-base font-extrabold" style={{ color: "#F0E6C8" }}>{fmt(s.fv)}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "#5A6A80" }}>Renda mensal gerada</p>
                <p className="text-base font-extrabold" style={{ color: s.color }}>{fmt(s.monthlyFromFv)}/mês</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs mt-3 text-center" style={{ color: "#5A6A80" }}>
        Guardando {fmt(r.savingsUsed)}/mês · Renda calculada com 4% de retirada anual
      </p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#0B1437" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b" style={{ background: "rgba(11,20,55,0.92)", borderColor: "rgba(201,168,76,0.2)" }}>
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img src={ICON_URL} alt="Gestor de Vida" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-lg" style={{ color: "#C9A84C" }}>Gestor de Vida</span>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}>
            Simulador Gratuito
          </span>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C9A84C" }}>Método dos 3 Pilares</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight" style={{ color: "#F0E6C8" }}>
              {step === "form"    && <>Quanto você vai ter<br /><span style={{ color: "#C9A84C" }}>na aposentadoria?</span></>}
              {step === "contact" && <>Sua simulação está<br /><span style={{ color: "#C9A84C" }}>pronta.</span></>}
              {step === "result"  && <>Seu resultado,<br /><span style={{ color: "#C9A84C" }}>{name.split(" ")[0]}.</span></>}
            </h1>
            <p className="text-base" style={{ color: "#8A9BB5" }}>
              {step === "form"    && "Preencha os dados e veja sua projeção real em 3 cenários — comparando com o que o INSS vai te pagar."}
              {step === "contact" && "Deixe seus dados para receber o resultado completo com os 3 cenários de projeção."}
              {step === "result"  && "Baseado no Método dos 3 Pilares — o quanto você investiria e onde chegaria."}
            </p>
          </div>

          {/* ── STEP 1: Formulário ── */}
          {step === "form" && (
            <div className="rounded-2xl p-6 sm:p-8 space-y-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#C9A84C" }}>Sua idade atual</label>
                  <Input type="number" placeholder="Ex: 32" value={currentAge} onChange={e => setCurrentAge(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#C9A84C" }}>Quer se aposentar com</label>
                  <Input type="number" placeholder="Ex: 60" value={retirementAge} onChange={e => setRetirementAge(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "#C9A84C" }}>Sua renda mensal atual (R$)</label>
                <Input type="number" placeholder="Ex: 5000" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} style={inputStyle} />
                <p className="text-xs mt-1" style={{ color: "#5A6A80" }}>Usamos a Regra 50/30/20 para calcular quanto você poderia guardar.</p>
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "#C9A84C" }}>Quanto quer receber por mês na aposentadoria (R$)</label>
                <Input type="number" placeholder="Ex: 3000" value={desiredIncome} onChange={e => setDesiredIncome(e.target.value)} style={inputStyle} />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button onClick={handleCalculate} className="w-full py-6 text-lg font-bold rounded-xl" style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}>
                Simular minha aposentadoria <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <div className="flex items-center justify-center gap-2">
                <Lock className="w-3 h-3" style={{ color: "#5A6A80" }} />
                <p className="text-xs" style={{ color: "#5A6A80" }}>Gratuito · Sem compromisso · Dados protegidos</p>
              </div>
            </div>
          )}

          {/* ── STEP 2: Contato + preview borrado ── */}
          {step === "contact" && result && (
            <div className="space-y-6">
              {/* 50/30/20 visível */}
              <div className="rounded-2xl p-6" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.25)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#C9A84C" }}>Regra 50/30/20 — sua renda de {fmt(income)}</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Necessidades", pct: "50%", val: result.breakdown.needs,   highlight: false },
                    { label: "Lazer",        pct: "30%", val: result.breakdown.wants,   highlight: false },
                    { label: "Futuro",       pct: "20%", val: result.breakdown.savings, highlight: true  },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl p-3" style={{ background: item.highlight ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.04)", border: item.highlight ? "1px solid rgba(201,168,76,0.4)" : "none" }}>
                      <p className="text-xs mb-1" style={{ color: item.highlight ? "#C9A84C" : "#8A9BB5" }}>{item.pct}</p>
                      <p className="text-lg font-bold" style={{ color: item.highlight ? "#C9A84C" : "#F0E6C8" }}>{fmt(item.val)}</p>
                      <p className="text-xs mt-1" style={{ color: "#5A6A80" }}>{item.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm mt-4 text-center font-semibold" style={{ color: "#C9A84C" }}>
                  Você poderia estar guardando {fmt(result.breakdown.savings)}/mês para o futuro.
                </p>
              </div>

              {/* Cenários borrados */}
              <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(201,168,76,0.2)" }}>
                <div className="p-6 blur-sm select-none pointer-events-none" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#C9A84C" }}>Sua projeção em 3 cenários</p>
                  <div className="space-y-3">
                    {["Pessimista","Regular","Otimista"].map((l) => (
                      <div key={l} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <span className="font-semibold" style={{ color: "#C9A84C" }}>{l}</span>
                        <span className="text-lg font-bold" style={{ color: "#F0E6C8" }}>R$ ██████</span>
                        <span className="text-sm" style={{ color: "#8A9BB5" }}>██████/mês</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "rgba(11,20,55,0.85)" }}>
                  <Lock className="w-8 h-8 mb-2" style={{ color: "#C9A84C" }} />
                  <p className="text-sm font-bold" style={{ color: "#F0E6C8" }}>Deixe seus dados para ver</p>
                </div>
              </div>

              {/* Formulário contato */}
              <div className="rounded-2xl p-6 sm:p-8 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.3)" }}>
                <p className="text-sm font-semibold text-center" style={{ color: "#8A9BB5" }}>Onde enviamos sua análise completa?</p>
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#C9A84C" }}>Seu nome</label>
                  <Input placeholder="Como posso te chamar?" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#C9A84C" }}>Seu melhor email</label>
                  <Input type="email" placeholder="email@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#C9A84C" }}>Seu WhatsApp</label>
                  <Input type="tel" placeholder="(00) 00000-0000" value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key === "Enter" && handleContactSubmit()} style={inputStyle} />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button onClick={handleContactSubmit} disabled={submitting} className="w-full py-6 text-lg font-bold rounded-xl" style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}>
                  {submitting ? "Calculando..." : "Ver minha projeção completa"} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-3 h-3" style={{ color: "#5A6A80" }} />
                  <p className="text-xs" style={{ color: "#5A6A80" }}>Seus dados não serão compartilhados com terceiros</p>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Resultado completo ── */}
          {step === "result" && result && (
            <div className="space-y-6">

              {/* 50/30/20 */}
              <div className="rounded-2xl p-6" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.25)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#C9A84C" }}>Regra 50/30/20 — sua renda de {fmt(income)}</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Necessidades", pct: "50%", val: result.breakdown.needs,   highlight: false },
                    { label: "Lazer",        pct: "30%", val: result.breakdown.wants,   highlight: false },
                    { label: "Futuro",       pct: "20%", val: result.breakdown.savings, highlight: true  },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl p-3" style={{ background: item.highlight ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.04)", border: item.highlight ? "1px solid rgba(201,168,76,0.4)" : "none" }}>
                      <p className="text-xs mb-1" style={{ color: item.highlight ? "#C9A84C" : "#8A9BB5" }}>{item.pct}</p>
                      <p className="text-lg font-bold" style={{ color: item.highlight ? "#C9A84C" : "#F0E6C8" }}>{fmt(item.val)}</p>
                      <p className="text-xs mt-1" style={{ color: "#5A6A80" }}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projeção base (20% da renda) */}
              <ScenariosPanel r={result} label={`Se você investir ${fmt(result.breakdown.savings)}/mês (seus 20%) por ${result.years} anos`} />

              {/* INSS vs Investimento — o comparativo principal */}
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(201,168,76,0.25)" }}>
                <div className="px-6 py-4" style={{ background: "rgba(201,168,76,0.08)", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#C9A84C" }}>
                    INSS vs Investimento — o mesmo dinheiro, destinos diferentes
                  </p>
                </div>

                {/* Quanto você paga */}
                <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-xs mb-3" style={{ color: "#8A9BB5" }}>Você contribui ao INSS todo mês:</p>
                  <p className="text-3xl font-extrabold" style={{ color: "#F0E6C8" }}>{fmt(inssContrib)}<span className="text-base font-normal" style={{ color: "#8A9BB5" }}>/mês</span></p>
                  {inssGapToTeto > 0 && !atContribTeto && (
                    <p className="text-xs mt-2" style={{ color: "#5A6A80" }}>
                      Para receber o teto ({fmt(INSS_BENEFIT_TETO)}/mês), precisaria contribuir sobre {fmt(INSS_CONTRIBUTION_TETO)}/mês de salário.
                    </p>
                  )}
                </div>

                {/* Duas colunas: INSS vs Investimento */}
                <div className="grid grid-cols-2 divide-x" style={{ divideColor: "rgba(255,255,255,0.06)" }}>
                  {/* Coluna INSS */}
                  <div className="p-5 space-y-3" style={{ background: "rgba(239,68,68,0.04)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#ef4444" }}>Com o INSS</p>
                    <div>
                      <p className="text-xs" style={{ color: "#8A9BB5" }}>Benefício estimado</p>
                      <p className="text-2xl font-extrabold" style={{ color: "#ef4444" }}>{fmt(inssEstimated)}/mês</p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "#8A9BB5" }}>Teto máximo INSS</p>
                      <p className="text-base font-bold" style={{ color: "#8A9BB5" }}>{fmt(INSS_BENEFIT_TETO)}/mês</p>
                    </div>
                    {result.gap > 0 && (
                      <div className="rounded-lg p-3" style={{ background: "rgba(239,68,68,0.1)" }}>
                        <p className="text-xs" style={{ color: "#8A9BB5" }}>Falta para sua meta</p>
                        <p className="text-base font-bold" style={{ color: "#ef4444" }}>−{fmt(result.gap)}/mês</p>
                      </div>
                    )}
                  </div>

                  {/* Coluna Investimento */}
                  <div className="p-5 space-y-3" style={{ background: "rgba(16,185,129,0.04)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#10b981" }}>Se investir o mesmo valor</p>
                    {result.inssScenarios.map((s) => (
                      <div key={s.label}>
                        <p className="text-xs" style={{ color: "#5A6A80" }}>{s.label} (IPCA+{(s.rate * 100).toFixed(0)}%)</p>
                        <p className="text-base font-bold" style={{ color: s.color }}>{fmt(s.monthlyFromFv)}/mês</p>
                      </div>
                    ))}
                    <p className="text-xs" style={{ color: "#5A6A80" }}>Capital acumulado (cenário regular): {fmt(result.inssScenarios[1].fv)}</p>
                  </div>
                </div>

                <div className="px-6 py-4 text-center" style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-xs" style={{ color: "#5A6A80" }}>
                    * Simulação educacional. O INSS é obrigatório e cobre riscos como invalidez e morte. Valores são estimativas simplificadas.
                  </p>
                </div>
              </div>

              {/* ── Recalcular mudando premissas ── */}
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(16,185,129,0.25)" }}>
                <button
                  onClick={() => { setShowEditPanel(p => !p); setEditAge(currentAge); setEditRetAge(retirementAge); setEditIncome(monthlyIncome); setEditDesired(desiredIncome); setEditError(""); }}
                  className="w-full flex items-center justify-between px-6 py-4"
                  style={{ background: "rgba(16,185,129,0.06)", border: "none", cursor: "pointer" }}
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" style={{ color: "#10b981" }} />
                    <span className="text-sm font-bold" style={{ color: "#F0E6C8" }}>Recalcular com outras premissas</span>
                  </div>
                  <span style={{ color: "#10b981", fontSize: "1.2rem" }}>{showEditPanel ? "−" : "+"}</span>
                </button>

                {showEditPanel && (
                  <div className="p-6 space-y-4" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold mb-2 block" style={{ color: "#10b981" }}>Idade atual</label>
                        <Input type="number" placeholder={currentAge} value={editAge} onChange={e => setEditAge(e.target.value)} style={{ ...inputStyle, border: "1px solid rgba(16,185,129,0.3)" }} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold mb-2 block" style={{ color: "#10b981" }}>Aposentar com</label>
                        <Input type="number" placeholder={retirementAge} value={editRetAge} onChange={e => setEditRetAge(e.target.value)} style={{ ...inputStyle, border: "1px solid rgba(16,185,129,0.3)" }} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold mb-2 block" style={{ color: "#10b981" }}>Renda mensal (R$)</label>
                        <Input type="number" placeholder={monthlyIncome} value={editIncome} onChange={e => setEditIncome(e.target.value)} style={{ ...inputStyle, border: "1px solid rgba(16,185,129,0.3)" }} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold mb-2 block" style={{ color: "#10b981" }}>Meta aposentadoria (R$)</label>
                        <Input type="number" placeholder={desiredIncome} value={editDesired} onChange={e => setEditDesired(e.target.value)} style={{ ...inputStyle, border: "1px solid rgba(16,185,129,0.3)" }} />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-semibold mb-2 block" style={{ color: "#10b981" }}>Guardar por mês (R$) — deixe em branco para usar 20%</label>
                        <Input type="number" placeholder={`${Math.round(result.breakdown.savings)}`} value={customSavingsInput} onChange={e => setCustomSavingsInput(e.target.value)} style={{ ...inputStyle, border: "1px solid rgba(16,185,129,0.3)" }} />
                      </div>
                    </div>

                    {editError && <p className="text-sm text-red-400">{editError}</p>}

                    <Button onClick={handleRecalculate} className="w-full py-4 font-bold rounded-xl" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.4)" }}>
                      Recalcular <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {adjustedResult && !showEditPanel && (
                  <div className="p-6 pt-0">
                    <ScenariosPanel r={adjustedResult} label={`Resultado com ${fmt(adjustedResult.savingsUsed)}/mês`} />
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.35)" }}>
                <TrendingUp className="w-10 h-10 mx-auto mb-4" style={{ color: "#C9A84C" }} />
                <h3 className="text-xl font-bold mb-3" style={{ color: "#F0E6C8" }}>Os números são reais. O método também.</h3>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: "#8A9BB5" }}>
                  O Método dos 3 Pilares te ensina como guardar esse valor de forma consistente — controlando seu tempo, suas finanças e projetando seu futuro em um único sistema.
                </p>
                <Button
                  onClick={() => navigate("/#planos")}
                  className="w-full sm:w-auto px-8 py-5 text-lg font-bold rounded-xl"
                  style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}
                >
                  Conheça o Método dos 3 Pilares <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-xs mt-3" style={{ color: "#5A6A80" }}>R$59,90 · Acesso vitalício · Garantia de 7 dias</p>
              </div>
            </div>
          )}

        </div>
      </div>

      <footer className="py-6 px-4 text-center text-xs border-t" style={{ color: "#3A4A60", borderColor: "rgba(201,168,76,0.1)" }}>
        © {new Date().getFullYear()} Gestor de Vida · Simulação meramente educacional · Valores do INSS são estimativas simplificadas.
      </footer>
    </div>
  );
}
