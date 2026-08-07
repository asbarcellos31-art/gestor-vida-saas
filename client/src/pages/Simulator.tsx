import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Lock, TrendingUp, AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import { useLocation } from "wouter";

const ICON_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/icon-gv-navy-gold_6e5b968f.png";
const INSS_TETO = 7786;
const SALARIO_MINIMO = 1518;

function calcInss(income: number): number {
  return Math.min(Math.max(income * 0.60, SALARIO_MINIMO), INSS_TETO);
}

function futureValue(pmt: number, annualRate: number, months: number): number {
  const r = Math.pow(1 + annualRate, 1 / 12) - 1;
  if (r === 0 || months <= 0) return pmt * months;
  return pmt * (Math.pow(1 + r, months) - 1) / r;
}

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

interface SimResult {
  savings: number;
  inss: number;
  gap: number;
  totalNeeded: number;
  months: number;
  years: number;
  breakdown: { needs: number; wants: number; savings: number };
  scenarios: { label: string; rate: number; fv: number; monthlyFromFv: number; color: string }[];
}

function calculate(currentAge: number, retirementAge: number, income: number, desiredIncome: number): SimResult {
  const years = Math.max(retirementAge - currentAge, 1);
  const months = years * 12;
  const savings = income * 0.20;
  const inss = calcInss(income);
  const gap = Math.max(0, desiredIncome - inss);
  const totalNeeded = gap * 300;

  const scenarios = [
    { label: "Pessimista", rate: 0.06, color: "#ef4444" },
    { label: "Regular", rate: 0.08, color: "#C9A84C" },
    { label: "Otimista", rate: 0.12, color: "#10b981" },
  ].map((s) => {
    const fv = futureValue(savings, s.rate, months);
    const monthlyFromFv = (fv * 0.04) / 12;
    return { ...s, fv, monthlyFromFv };
  });

  return {
    savings,
    inss,
    gap,
    totalNeeded,
    months,
    years,
    breakdown: { needs: income * 0.50, wants: income * 0.30, savings },
    scenarios,
  };
}

export default function Simulator() {
  const [, navigate] = useLocation();
  const captureSimulator = trpc.leads.captureSimulator.useMutation();

  // Step 1: inputs
  const [currentAge, setCurrentAge] = useState("");
  const [retirementAge, setRetirementAge] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [desiredIncome, setDesiredIncome] = useState("");

  // Step 2: contact
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [step, setStep] = useState<"form" | "contact" | "result">("form");
  const [result, setResult] = useState<SimResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    const ca = parseInt(currentAge);
    const ra = parseInt(retirementAge);
    const inc = parseFloat(monthlyIncome.replace(/\./g, "").replace(",", "."));
    const des = parseFloat(desiredIncome.replace(/\./g, "").replace(",", "."));

    if (!ca || !ra || !inc || !des) { setError("Preencha todos os campos."); return; }
    if (ra <= ca) { setError("A idade de aposentadoria deve ser maior que a atual."); return; }
    if (ca < 16 || ca > 80) { setError("Idade atual inválida."); return; }

    setError("");
    setResult(calculate(ca, ra, inc, des));
    setStep("contact");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  const handleContactSubmit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) { setError("Preencha todos os campos."); return; }
    setError("");
    setSubmitting(true);
    try {
      await captureSimulator.mutateAsync({
        email: email.trim(),
        name: name.trim(),
        phone: phone.trim(),
        simulation: {
          currentAge: parseInt(currentAge),
          retirementAge: parseInt(retirementAge),
          monthlyIncome: parseFloat(monthlyIncome.replace(/\./g, "").replace(",", ".")),
          desiredIncome: parseFloat(desiredIncome.replace(/\./g, "").replace(",", ".")),
        },
      });
    } catch (_) { /* ignora erro de DB, mostra resultado mesmo assim */ }
    setSubmitting(false);
    setStep("result");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(201,168,76,0.3)",
    color: "#F0E6C8",
    height: "52px",
    fontSize: "1rem",
  };

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
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C9A84C" }}>
              Método dos 3 Pilares
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight" style={{ color: "#F0E6C8" }}>
              {step === "form" && <>Quanto você vai ter<br /><span style={{ color: "#C9A84C" }}>na aposentadoria?</span></>}
              {step === "contact" && <>Sua simulação está<br /><span style={{ color: "#C9A84C" }}>pronta.</span></>}
              {step === "result" && <>Seu resultado,<br /><span style={{ color: "#C9A84C" }}>{name.split(" ")[0]}.</span></>}
            </h1>
            <p className="text-base" style={{ color: "#8A9BB5" }}>
              {step === "form" && "Preencha os dados abaixo e veja sua projeção real em 3 cenários — comparando com o que o INSS vai te pagar."}
              {step === "contact" && "Deixe seus dados para receber o resultado completo com os 3 cenários de projeção."}
              {step === "result" && "Baseado no Método dos 3 Pilares — o quanto você investiria e onde chegaria."}
            </p>
          </div>

          {/* STEP 1: Formulário */}
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
                <p className="text-xs text-center" style={{ color: "#5A6A80" }}>Gratuito · Sem compromisso · Seus dados são protegidos</p>
              </div>
            </div>
          )}

          {/* STEP 2: Captura de contato + preview borrado */}
          {step === "contact" && result && (
            <div className="space-y-6">
              {/* Preview do 50/30/20 — visível antes de confirmar */}
              <div className="rounded-2xl p-6" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.25)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#C9A84C" }}>Regra 50/30/20 — sua renda</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Necessidades", pct: "50%", val: result.breakdown.needs, color: "#8A9BB5" },
                    { label: "Lazer", pct: "30%", val: result.breakdown.wants, color: "#8A9BB5" },
                    { label: "Futuro", pct: "20%", val: result.breakdown.savings, color: "#C9A84C" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-xs mb-1" style={{ color: item.color }}>{item.pct}</p>
                      <p className="text-lg font-bold" style={{ color: item.label === "Futuro" ? "#C9A84C" : "#F0E6C8" }}>{fmt(item.val)}</p>
                      <p className="text-xs mt-1" style={{ color: "#5A6A80" }}>{item.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm mt-4 text-center font-semibold" style={{ color: "#C9A84C" }}>
                  Você poderia estar guardando {fmt(result.savings)}/mês para o futuro.
                </p>
              </div>

              {/* Preview borrado dos cenários */}
              <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(201,168,76,0.2)" }}>
                <div className="p-6 blur-sm select-none pointer-events-none" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#C9A84C" }}>Sua projeção em 3 cenários</p>
                  <div className="space-y-3">
                    {result.scenarios.map((s) => (
                      <div key={s.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <span className="font-semibold" style={{ color: s.color }}>{s.label}</span>
                        <span className="text-lg font-bold" style={{ color: "#F0E6C8" }}>████████</span>
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

              {/* Formulário de contato */}
              <div className="rounded-2xl p-6 sm:p-8 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.3)" }}>
                <p className="text-sm font-semibold text-center" style={{ color: "#8A9BB5" }}>
                  Onde enviamos sua análise completa?
                </p>
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
                  <p className="text-xs text-center" style={{ color: "#5A6A80" }}>Seus dados não serão compartilhados com terceiros</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Resultado completo */}
          {step === "result" && result && (
            <div className="space-y-6">
              {/* 50/30/20 */}
              <div className="rounded-2xl p-6" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.25)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#C9A84C" }}>Regra 50/30/20 — sua renda</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Necessidades", pct: "50%", val: result.breakdown.needs, highlight: false },
                    { label: "Lazer", pct: "30%", val: result.breakdown.wants, highlight: false },
                    { label: "Futuro", pct: "20%", val: result.breakdown.savings, highlight: true },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl p-3" style={{ background: item.highlight ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.04)", border: item.highlight ? "1px solid rgba(201,168,76,0.4)" : "none" }}>
                      <p className="text-xs mb-1" style={{ color: item.highlight ? "#C9A84C" : "#8A9BB5" }}>{item.pct}</p>
                      <p className="text-lg font-bold" style={{ color: item.highlight ? "#C9A84C" : "#F0E6C8" }}>{fmt(item.val)}</p>
                      <p className="text-xs mt-1" style={{ color: "#5A6A80" }}>{item.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm mt-4 text-center font-semibold" style={{ color: "#C9A84C" }}>
                  Investindo {fmt(result.savings)}/mês — em {result.years} anos de método consistente:
                </p>
              </div>

              {/* Cenários */}
              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#C9A84C" }}>Sua projeção em 3 cenários</p>
                <div className="space-y-3">
                  {result.scenarios.map((s) => (
                    <div key={s.label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${s.color}33` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold" style={{ color: s.color }}>{s.label} ({(s.rate * 100).toFixed(0)}% a.a.)</span>
                        <span className="text-sm font-semibold" style={{ color: "#8A9BB5" }}>{fmt(s.monthlyFromFv)}/mês</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: "#5A6A80" }}>Capital acumulado</span>
                        <span className="text-base font-extrabold" style={{ color: "#F0E6C8" }}>{fmt(s.fv)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-3 text-center" style={{ color: "#5A6A80" }}>
                  Renda mensal estimada com retirada de 4% ao ano sobre o capital acumulado.
                </p>
              </div>

              {/* INSS vs Meta */}
              <div className="rounded-2xl p-6" style={{ background: result.gap > 0 ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.06)", border: `1px solid ${result.gap > 0 ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}` }}>
                <div className="flex items-center gap-2 mb-4">
                  {result.gap > 0
                    ? <AlertTriangle className="w-5 h-5" style={{ color: "#ef4444" }} />
                    : <CheckCircle2 className="w-5 h-5" style={{ color: "#10b981" }} />}
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: result.gap > 0 ? "#ef4444" : "#10b981" }}>
                    Comparativo com o INSS
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-xs mb-1" style={{ color: "#8A9BB5" }}>INSS (estimativa)</p>
                    <p className="text-2xl font-extrabold" style={{ color: "#ef4444" }}>{fmt(result.inss)}/mês</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs mb-1" style={{ color: "#8A9BB5" }}>Sua meta</p>
                    <p className="text-2xl font-extrabold" style={{ color: "#10b981" }}>{fmt(parseFloat(desiredIncome))}/mês</p>
                  </div>
                </div>
                {result.gap > 0 ? (
                  <div className="p-3 rounded-xl text-center" style={{ background: "rgba(239,68,68,0.1)" }}>
                    <p className="text-sm font-bold" style={{ color: "#ef4444" }}>
                      O INSS não cobre sua meta. Faltam {fmt(result.gap)}/mês.
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#8A9BB5" }}>
                      Para cobrir essa diferença você precisaria acumular aproximadamente {fmt(result.totalNeeded)}.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl text-center" style={{ background: "rgba(16,185,129,0.1)" }}>
                    <p className="text-sm font-bold" style={{ color: "#10b981" }}>
                      O INSS cobre sua meta. Mas investir além garante segurança e antecipa sua liberdade.
                    </p>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.35)" }}>
                <TrendingUp className="w-10 h-10 mx-auto mb-4" style={{ color: "#C9A84C" }} />
                <h3 className="text-xl font-bold mb-3" style={{ color: "#F0E6C8" }}>
                  Os números são reais. O método também.
                </h3>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: "#8A9BB5" }}>
                  O Método dos 3 Pilares te ensina como guardar esses {fmt(result.savings)}/mês de forma consistente — controlando seu tempo, suas finanças e projetando seu futuro. Tudo em um único sistema.
                </p>
                <Button
                  onClick={() => navigate("/#planos")}
                  className="w-full sm:w-auto px-8 py-5 text-lg font-bold rounded-xl"
                  style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}
                >
                  Quero o Método dos 3 Pilares <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-xs mt-3" style={{ color: "#5A6A80" }}>
                  A partir de R$29,90 · Pagamento único · Garantia de 7 dias
                </p>
              </div>

              {/* Recalcular */}
              <button
                onClick={() => { setStep("form"); setResult(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="w-full text-sm underline"
                style={{ color: "#5A6A80", background: "none", border: "none", cursor: "pointer" }}
              >
                Refazer simulação com outros valores
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer mínimo */}
      <footer className="py-6 px-4 text-center text-xs border-t" style={{ color: "#3A4A60", borderColor: "rgba(201,168,76,0.1)" }}>
        © {new Date().getFullYear()} Gestor de Vida · Simulação meramente educacional · Os valores do INSS são estimativas simplificadas.
      </footer>
    </div>
  );
}
