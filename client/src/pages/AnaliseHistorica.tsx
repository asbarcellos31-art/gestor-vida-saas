import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, FileDown, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";

// ─── Categorias exibidas ───────────────────────────────────────────────────────
const CATS = [
  { key: "receita",   label: "Receita",                 highlight: true },
  { key: "subtotal",  label: "Total Gasto",             highlight: true },
  { key: "cond",      label: "Condomínio" },
  { key: "veiculo",   label: "Veículo (parcela fixa)" },
  { key: "colegio",   label: "Colégio" },
  { key: "celular",   label: "Celular / Net" },
  { key: "gas",       label: "Gás" },
  { key: "seg_vida",  label: "Seguro de Vida" },
  { key: "pet",       label: "Pet" },
  { key: "consorcio", label: "Consórcio" },
  { key: "luz",       label: "Luz" },
  { key: "super",     label: "Supermercado / Aliment.", highlight: true },
  { key: "combust",   label: "Combustível",             highlight: true },
  { key: "lazer",     label: "Restaurantes / Lazer",   highlight: true },
  { key: "manicure",  label: "Manicure / Beleza" },
];

// ─── Observações e análises (conteúdo autoral, não vem do banco) ───────────────
const OBS: Record<string, Record<string, string>> = {
  "2023-2024": {
    receita:   "corretora + distribuição de lucro",
    subtotal:  "expansão do padrão de vida",
    cond:      "entrou em 2024 — mudança de imóvel",
    veiculo:   "troca / upgrade do veículo",
    colegio:   "estável — mesmo contrato",
    celular:   "novo plano família",
    gas:       "—",
    seg_vida:  "revisão de apólice",
    pet:       "aumento de procedimentos",
    consorcio: "entrou em 2024",
    luz:       "apto menor gerava fatura menor em 2023",
    super:     "inflação + volume de compra",
    combust:   "provável carro empresa ou menos deslocamento",
    lazer:     "comportamento estável ao longo do período",
    manicure:  "gasto novo incorporado à rotina",
  },
  "2024-2025": {
    receita:   "crescimento modesto — desaceleração",
    subtotal:  "gastos crescem 2× mais que a receita",
    cond:      "reajuste anual pesado",
    veiculo:   "estável",
    colegio:   "reajuste normal",
    celular:   "estável",
    gas:       "passou a aparecer no controle",
    seg_vida:  "revisão de cobertura",
    pet:       "estável",
    consorcio: "parcela subindo gradualmente",
    luz:       "bandeira tarifária + apartamento maior",
    super:     "estável (dado de extração parcial)",
    combust:   "estável",
    lazer:     "estável",
    manicure:  "reajuste de serviço",
  },
  "2025-2026": {
    receita:   "crescimento tímido — abaixo da inflação",
    subtotal:  "gastos crescem 3× mais que a receita",
    cond:      "estável — reajuste abaixo da inflação",
    veiculo:   "estável",
    colegio:   "estável",
    celular:   "estável",
    gas:       "reajuste normal",
    seg_vida:  "estável",
    pet:       "estável",
    consorcio: "voltou ativo com parcela maior",
    luz:       "bandeira vermelha persistente",
    super:     "inflação real da cesta + volume maior",
    combust:   "alta do combustível no período",
    lazer:     "comportamento controlado — ponto positivo",
    manicure:  "estável",
  },
};

const ANALISE: Record<string, { titulo: string; texto: string }> = {
  "2023-2024": {
    titulo: "O salto de padrão de vida",
    texto: `Receita cresceu +43% e a estrutura de gastos acompanhou na mesma proporção. Condomínio entrou (mudança de imóvel), veículo subiu 50%, manicure dobrou e seguro de vida +55%. Supermercado cresceu +32%. Restaurantes e lazer se mantiveram estáveis. Combustível caiu pela metade — mudança real de hábito ou carro empresa. O cartão saltou R$ 4.400/mês nesse período.`,
  },
  "2024-2025": {
    titulo: "Receita desacelera, gastos não",
    texto: `Receita cresceu apenas +6% mas o total de gastos subiu +13% — o dobro. A luz disparou +130% (bandeira tarifária + apartamento maior). Condomínio reajustou +63%. Seguro de vida +48%, manicure +31%. Supermercado e lazer ficaram estáveis. O cartão engordou mais R$ 1.900/mês sem contrapartida proporcional de receita. Primeiro sinal de compressão do saldo disponível.`,
  },
  "2025-2026": {
    titulo: "A inflação real bate na mesa",
    texto: `Supermercado subiu +72% em relação a 2024 e +116% desde 2023 — o maior salto isolado do período. Luz +38%. Consórcio voltou ativo com força (+300%). Receita cresceu +4,8% enquanto os gastos subiram +15,5% — três vezes mais rápido. Restaurantes e lazer continuaram controlados. Combustível +22%. A compressão do saldo livre se aprofunda mês a mês.`,
  },
};

const fmt = (v: number) =>
  v === 0 ? "—" : `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const pctFmt = (p: number) => `${p >= 0 ? "+" : ""}${p.toFixed(1)}%`;

function DeltaBadge({ pct }: { pct: number }) {
  const abs = Math.abs(pct);
  if (abs < 5) return <span className="text-slate-400 text-xs font-medium flex items-center gap-0.5"><Minus className="w-3 h-3" />{pctFmt(pct)}</span>;
  if (pct > 0)
    return <span className={`text-xs font-bold flex items-center gap-0.5 ${abs > 50 ? "text-red-400" : abs > 20 ? "text-amber-400" : "text-emerald-400"}`}><TrendingUp className="w-3 h-3" />{pctFmt(pct)}</span>;
  return <span className="text-xs font-bold flex items-center gap-0.5 text-sky-400"><TrendingDown className="w-3 h-3" />{pctFmt(pct)}</span>;
}

function DeltaValue({ delta, pct }: { delta: number; pct: number }) {
  const color = delta > 0
    ? (Math.abs(pct) > 50 ? "text-red-400" : Math.abs(pct) > 20 ? "text-amber-400" : "text-emerald-400")
    : "text-sky-400";
  return <span className={`text-xs font-medium ${color}`}>{delta >= 0 ? "+" : ""}{fmt(delta)}</span>;
}

type YearlyData = Record<string, Record<string, number>>;

function YoYTable({ a1, a2, yearly }: { a1: string; a2: string; yearly: YearlyData }) {
  const key = `${a1}-${a2}`;
  const obs = OBS[key] || {};
  const analise = ANALISE[key];
  const d1 = yearly[a1] || {};
  const d2 = yearly[a2] || {};

  const chartData = CATS.filter(c => c.key !== "subtotal").map(c => ({
    name: c.label.length > 16 ? c.label.slice(0, 15) + "…" : c.label,
    [a1]: d1[c.key] || 0,
    [a2]: d2[c.key] || 0,
  })).filter(d => Number(d[a1]) > 0 || Number(d[a2]) > 0);

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/80 text-slate-300">
              <th className="text-left px-4 py-3 font-semibold">Categoria</th>
              <th className="text-right px-4 py-3 font-semibold">Média {a1}</th>
              <th className="text-right px-4 py-3 font-semibold">Média {a2}</th>
              <th className="text-right px-4 py-3 font-semibold">Δ Valor</th>
              <th className="text-center px-4 py-3 font-semibold">Δ %</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-400">Observação</th>
            </tr>
          </thead>
          <tbody>
            {CATS.map((cat, i) => {
              const v1 = d1[cat.key] || 0;
              const v2 = d2[cat.key] || 0;
              if (v1 === 0 && v2 === 0) return null;
              const delta = v2 - v1;
              const pct = v1 > 0 ? (delta / v1) * 100 : 0;
              const isHeader = cat.key === "receita" || cat.key === "subtotal";
              return (
                <tr
                  key={cat.key}
                  className={`border-t border-slate-700/40 transition-colors ${
                    isHeader
                      ? "bg-slate-800/60 font-semibold"
                      : i % 2 === 0 ? "bg-slate-900/40" : "bg-slate-800/20"
                  } hover:bg-slate-700/30`}
                >
                  <td className={`px-4 py-2.5 ${isHeader ? "text-white" : "text-slate-200"}`}>{cat.label}</td>
                  <td className="px-4 py-2.5 text-right text-slate-300 font-mono text-xs">{fmt(v1)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs font-semibold text-white">{fmt(v2)}</td>
                  <td className="px-4 py-2.5 text-right">
                    {v1 > 0 ? <DeltaValue delta={delta} pct={pct} /> : <span className="text-slate-500 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {v1 > 0 ? <DeltaBadge pct={pct} /> : <span className="text-slate-500 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 text-xs italic">{obs[cat.key] || ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Comparativo visual — {a1} × {a2}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
              labelStyle={{ color: "#e2e8f0" }}
              formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]}
            />
            <Legend wrapperStyle={{ paddingTop: 16, color: "#94a3b8", fontSize: 12 }} />
            <Bar dataKey={a1} name={a1} fill="#5B8DEF" radius={[3, 3, 0, 0]} />
            <Bar dataKey={a2} name={a2} fill="#C9A84C" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {analise && (
        <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full bg-amber-400" />
            <h3 className="font-semibold text-white">{a1} × {a2} — {analise.titulo}</h3>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{analise.texto}</p>
        </div>
      )}
    </div>
  );
}

function Consolidado({ yearly, anos }: { yearly: YearlyData; anos: string[] }) {

  const lineData = CATS.filter(c => !["receita", "subtotal"].includes(c.key)).map(c => {
    const entry: Record<string, string | number> = {
      name: c.label.length > 18 ? c.label.slice(0, 17) + "…" : c.label,
    };
    for (const a of anos) entry[a] = (yearly[a] || {})[c.key] || 0;
    return entry;
  }).filter(d => anos.some(a => (d[a] as number) > 0));

  const receitaLine = anos.map(a => ({
    ano: a,
    receita: (yearly[a] || {}).receita || 0,
    gasto: (yearly[a] || {}).subtotal || 0,
  }));

  const firstYear = anos[0];
  const lastYear = anos[anos.length - 1];
  const v23 = yearly[firstYear] || {};
  const v26 = yearly[lastYear] || {};

  const pct = (key: string) => v23[key] > 0 ? Math.round(((v26[key] - v23[key]) / v23[key]) * 100) : 0;
  const pctTotal = pct("receita");
  const pctGasto = pct("subtotal");
  const pctSuper = pct("super");
  const pctLuz = pct("luz");
  const pctSeg = pct("seg_vida");
  const pctMan = pct("manicure");
  const pctLaz = pct("lazer");
  const pctComb = pct("combust");

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/80 text-slate-300">
              <th className="text-left px-4 py-3 font-semibold">Categoria</th>
              {anos.map(a => <th key={a} className="text-right px-3 py-3 font-semibold">{a}</th>)}
              <th className="text-center px-4 py-3 font-semibold">{firstYear.slice(2)}→{lastYear.slice(2)}</th>
            </tr>
          </thead>
          <tbody>
            {CATS.map((cat, i) => {
              const vals = anos.map(a => (yearly[a] || {})[cat.key] || 0);
              if (vals.every(v => v === 0)) return null;
              const catPct = v23[cat.key] > 0 ? ((v26[cat.key] - v23[cat.key]) / v23[cat.key]) * 100 : 0;
              const isHeader = cat.key === "receita" || cat.key === "subtotal";
              return (
                <tr key={cat.key} className={`border-t border-slate-700/40 ${isHeader ? "bg-slate-800/60 font-semibold" : i % 2 === 0 ? "bg-slate-900/40" : "bg-slate-800/20"} hover:bg-slate-700/30`}>
                  <td className={`px-4 py-2.5 ${isHeader ? "text-white" : "text-slate-200"}`}>{cat.label}</td>
                  {vals.map((v, j) => (
                    <td key={j} className={`px-3 py-2.5 text-right font-mono text-xs ${j === 3 ? "font-bold text-white" : "text-slate-300"}`}>{fmt(v)}</td>
                  ))}
                  <td className="px-4 py-2.5 text-center">
                    {v23[cat.key] > 0 ? <DeltaBadge pct={catPct} /> : <span className="text-slate-500 text-xs">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Receita × Total Gasto — evolução 4 anos</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={receitaLine} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="ano" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
              formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]}
            />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
            <Line type="monotone" dataKey="receita" name="Receita" stroke="#10B981" strokeWidth={2.5} dot={{ r: 5, fill: "#10B981" }} />
            <Line type="monotone" dataKey="gasto" name="Total Gasto" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 5, fill: "#EF4444" }} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Evolução por categoria — 2023 a 2026</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={lineData} margin={{ top: 4, right: 16, left: 0, bottom: 70 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} angle={-40} textAnchor="end" interval={0} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
              formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]}
            />
            <Legend wrapperStyle={{ paddingTop: 16, color: "#94a3b8", fontSize: 12 }} />
            {anos.map((a, i) => (
              <Bar key={a} dataKey={a} fill={BAR_COLORS[i % BAR_COLORS.length]} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-5 rounded-full bg-amber-400" />
          <h3 className="font-semibold text-white text-base">Análise do Período {firstYear} → {lastYear}</h3>
        </div>

        {[
          { titulo: "23×24 — O salto estrutural", cor: "text-blue-400", texto: "Receita subiu +43% e os gastos acompanharam. Condomínio entrou (mudança de imóvel), veículo sobe 50%, manicure dobra, seguro de vida +55%, supermercado +32%. O cartão saltou R$ 4.400/mês. Combustível caiu pela metade — mudança de hábito real." },
          { titulo: "24×25 — Receita trava, gastos não", cor: "text-amber-400", texto: "Receita cresce só +6% mas o total sobe +13% — o dobro. Luz dispara +130% (bandeira + apartamento maior). Condomínio +63%. O cartão engordou R$ 1.900/mês sem contrapartida de receita. Primeiro sinal real de compressão do saldo." },
          { titulo: "25×26 — Inflação real na mesa", cor: "text-red-400", texto: "Supermercado +72% vs 2024, +116% desde 2023 — maior salto isolado do período. Luz +38%. Consórcio volta pesando +300%. Receita +4,8% contra gastos +15,5% — três vezes mais rápido. Restaurantes e lazer seguem controlados." },
        ].map(({ titulo, cor, texto }) => (
          <div key={titulo} className="border-l-2 border-slate-600 pl-4">
            <p className={`text-sm font-semibold ${cor} mb-1`}>{titulo}</p>
            <p className="text-slate-300 text-sm leading-relaxed">{texto}</p>
          </div>
        ))}

        <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Receita cresceu", val: pctTotal > 0 ? `+${pctTotal}%` : `${pctTotal}%`, color: pctTotal >= 0 ? "text-emerald-400" : "text-red-400" },
            { label: "Gasto cresceu", val: pctGasto > 0 ? `+${pctGasto}%` : `${pctGasto}%`, color: "text-red-400" },
            { label: "Supermercado", val: pctSuper > 0 ? `+${pctSuper}%` : `${pctSuper}%`, color: "text-red-400" },
            { label: "Luz", val: pctLuz > 0 ? `+${pctLuz}%` : `${pctLuz}%`, color: "text-red-400" },
            { label: "Seguro de Vida", val: pctSeg > 0 ? `+${pctSeg}%` : `${pctSeg}%`, color: "text-amber-400" },
            { label: "Manicure/Beleza", val: pctMan > 0 ? `+${pctMan}%` : `${pctMan}%`, color: "text-amber-400" },
            { label: "Restaurantes/Lazer", val: pctLaz > 0 ? `+${pctLaz}%` : `${pctLaz}%`, color: pctLaz < 20 ? "text-emerald-400" : "text-amber-400" },
            { label: "Combustível", val: pctComb > 0 ? `+${pctComb}%` : `${pctComb}%`, color: pctComb < 0 ? "text-emerald-400" : "text-amber-400" },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs mb-0.5">{label}</p>
              <p className={`font-bold text-lg ${color}`}>{val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Anos a exibir: 2023 até o ano atual (máx 6 anos)
const START_YEAR = 2023;
const BAR_COLORS = ["#475569", "#5B8DEF", "#C9A84C", "#10B981", "#a855f7", "#f97316"];

export default function AnaliseHistorica() {
  const currentYear = new Date().getFullYear();
  const ANOS = Array.from({ length: Math.min(currentYear - START_YEAR + 1, 6) }, (_, i) => String(START_YEAR + i));
  const defaultTab = ANOS.length >= 2 ? `${ANOS[ANOS.length - 2]}-${ANOS[ANOS.length - 1]}` : "consolidado";
  const [tab, setTab] = useState(defaultTab);

  const TABS = [
    ...ANOS.slice(0, -1).map((a, i) => ({
      id: `${a}-${ANOS[i + 1]}`,
      label: `${a.slice(2)} × ${ANOS[i + 1].slice(2)}`,
    })),
    { id: "consolidado", label: "Consolidado" },
  ];

  const [isPrinting, setIsPrinting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const seedMutation = trpc.analise.seedHistorical.useMutation();
  useEffect(() => { seedMutation.mutate(); }, []);

  const exportPDF = async () => {
    setIsPrinting(true);
    await new Promise(r => setTimeout(r, 600));
    const el = reportRef.current;
    if (!el) { setIsPrinting(false); return; }
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(el, {
        backgroundColor: "#020617",
        scale: 1.5,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.88);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const scaledH = (canvas.height / canvas.width) * pdfW;
      const pageCount = Math.ceil(scaledH / pdfH);
      for (let p = 0; p < pageCount; p++) {
        if (p > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, -p * pdfH, pdfW, scaledH);
      }
      pdf.save(`analise-orcamento-${START_YEAR}-${currentYear}.pdf`);
    } finally {
      setIsPrinting(false);
    }
  };

  // Hooks fixos para até 6 anos (2023-2028) — React não permite hooks em loop
  const yr = (i: number) => START_YEAR + i;
  const { data: raw0, isLoading: l0 } = trpc.analise.getYear.useQuery({ year: yr(0) }, { enabled: yr(0) <= currentYear });
  const { data: raw1, isLoading: l1 } = trpc.analise.getYear.useQuery({ year: yr(1) }, { enabled: yr(1) <= currentYear });
  const { data: raw2, isLoading: l2 } = trpc.analise.getYear.useQuery({ year: yr(2) }, { enabled: yr(2) <= currentYear });
  const { data: raw3, isLoading: l3 } = trpc.analise.getYear.useQuery({ year: yr(3) }, { enabled: yr(3) <= currentYear });
  const { data: raw4, isLoading: l4 } = trpc.analise.getYear.useQuery({ year: yr(4) }, { enabled: yr(4) <= currentYear });
  const { data: raw5, isLoading: l5 } = trpc.analise.getYear.useQuery({ year: yr(5) }, { enabled: yr(5) <= currentYear });

  const isLoading = [l0, l1, l2, l3, l4, l5].some(Boolean);

  const rawByYear = [raw0, raw1, raw2, raw3, raw4, raw5];
  const yearly: YearlyData = {};
  for (let i = 0; i < 6; i++) {
    const y = yr(i);
    if (y <= currentYear) yearly[String(y)] = (rawByYear[i] as Record<string, number>) || {};
  }

  const d26 = yearly[String(currentYear)] || {};
  const d23 = yearly[String(START_YEAR)] || {};

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Análise Histórica de Orçamento</h1>
            <p className="text-slate-400 text-sm mt-1">
              Comparativo ano a ano · {START_YEAR} → {currentYear} · médias mensais
              {isLoading && <span className="ml-2 inline-flex items-center gap-1 text-amber-400"><RefreshCw className="w-3 h-3 animate-spin" />carregando...</span>}
            </p>
          </div>
          <button
            onClick={exportPDF}
            disabled={isPrinting || isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPrinting
              ? <><RefreshCw className="w-4 h-4 animate-spin" />Gerando PDF…</>
              : <><FileDown className="w-4 h-4" />Exportar PDF</>
            }
          </button>
        </div>

        {/* Cards resumo — dinâmicos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: `Receita Média ${currentYear}`,
              val: fmt(d26.receita || 0),
              sub: d23.receita > 0 ? `${pctFmt(((d26.receita - d23.receita) / d23.receita) * 100)} vs 2023` : "—",
              color: "border-emerald-500/30 bg-emerald-500/5",
            },
            {
              label: `Total Gasto ${currentYear}`,
              val: fmt(d26.subtotal || 0),
              sub: d23.subtotal > 0 ? `${pctFmt(((d26.subtotal - d23.subtotal) / d23.subtotal) * 100)} vs 2023` : "—",
              color: "border-red-500/30 bg-red-500/5",
            },
            {
              label: `Supermercado ${currentYear}`,
              val: fmt(d26.super || 0),
              sub: d23.super > 0 ? `${pctFmt(((d26.super - d23.super) / d23.super) * 100)} vs 2023 ← maior salto` : "—",
              color: "border-amber-500/30 bg-amber-500/5",
            },
            {
              label: `Restaurantes ${currentYear}`,
              val: fmt(d26.lazer || 0),
              sub: d23.lazer > 0 ? `${pctFmt(((d26.lazer - d23.lazer) / d23.lazer) * 100)} vs 2023 ← controlado` : "—",
              color: "border-blue-500/30 bg-blue-500/5",
            },
          ].map(({ label, val, sub, color }) => (
            <div key={label} className={`rounded-xl border p-4 ${color}`}>
              <p className="text-slate-400 text-xs mb-1">{label}</p>
              <p className="text-xl font-bold text-white">{val}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl w-fit">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-amber-500 text-slate-900"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        {tab === "2023-2024" && <YoYTable a1="2023" a2="2024" yearly={yearly} />}
        {tab === "2024-2025" && <YoYTable a1="2024" a2="2025" yearly={yearly} />}
        {tab === "2025-2026" && <YoYTable a1="2025" a2="2026" yearly={yearly} />}
        {tab === "consolidado" && <Consolidado yearly={yearly} anos={ANOS} />}
      </div>

      {/* Área de captura PDF — off-screen, renderizada só durante exportação */}
      {isPrinting && (
        <div
          ref={reportRef}
          style={{
            position: "fixed",
            left: "-9999px",
            top: 0,
            width: "1200px",
            backgroundColor: "#020617",
            padding: "40px",
            fontFamily: "sans-serif",
            color: "#f8fafc",
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Análise Histórica de Orçamento</h1>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Comparativo ano a ano · {START_YEAR} → {currentYear} · médias mensais</p>
          </div>

          {ANOS.slice(0, -1).map((a, i) => (
            <div key={`${a}-${ANOS[i + 1]}`} style={{ marginBottom: 48 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f59e0b", marginBottom: 16 }}>{a} × {ANOS[i + 1]}</h2>
              <YoYTable a1={a} a2={ANOS[i + 1]} yearly={yearly} />
            </div>
          ))}

          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f59e0b", marginBottom: 16 }}>Consolidado</h2>
            <Consolidado yearly={yearly} anos={ANOS} />
          </div>
        </div>
      )}
    </div>
  );
}
