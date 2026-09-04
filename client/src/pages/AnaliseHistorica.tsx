import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, FileDown } from "lucide-react";

// ─── Dados consolidados (extraídos das planilhas 2023-2025 + sistema 2026) ───
const YEARLY: Record<string, Record<string, number>> = {
  "2023": {
    receita: 21370, subtotal: 17407,
    cond: 0,    veiculo: 1639, colegio: 1313, celular: 174,
    gas: 0,     seg_vida: 160, pet: 340,      consorcio: 0,
    luz: 229,   super: 1846,   combust: 1230, lazer: 3248, manicure: 79,
  },
  "2024": {
    receita: 30643, subtotal: 22736,
    cond: 750,  veiculo: 2460, colegio: 1302, celular: 202,
    gas: 0,     seg_vida: 248, pet: 388,      consorcio: 49,
    luz: 166,   super: 2445,   combust: 600,  lazer: 3514, manicure: 165,
  },
  "2025": {
    receita: 32352, subtotal: 25784,
    cond: 1223, veiculo: 2577, colegio: 1436, celular: 224,
    gas: 117,   seg_vida: 366, pet: 407,      consorcio: 156,
    luz: 382,   super: 2329,   combust: 556,  lazer: 3331, manicure: 217,
  },
  "2026": {
    receita: 33894, subtotal: 29772,
    cond: 1184, veiculo: 2654, colegio: 1393, celular: 250,
    gas: 139,   seg_vida: 386, pet: 415,      consorcio: 626,
    luz: 525,   super: 4003,   combust: 679,  lazer: 3879, manicure: 220,
  },
};

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
  return <span className="text-xs font-bold flex items-center gap-0.5 text-emerald-400"><TrendingDown className="w-3 h-3" />{pctFmt(pct)}</span>;
}

function DeltaValue({ delta, pct }: { delta: number; pct: number }) {
  const color = delta > 0
    ? (Math.abs(pct) > 50 ? "text-red-400" : Math.abs(pct) > 20 ? "text-amber-400" : "text-emerald-400")
    : "text-emerald-400";
  return <span className={`text-xs font-medium ${color}`}>{delta >= 0 ? "+" : ""}{fmt(delta)}</span>;
}

function YoYTable({ a1, a2 }: { a1: string; a2: string }) {
  const key = `${a1}-${a2}`;
  const obs = OBS[key] || {};
  const analise = ANALISE[key];
  const d1 = YEARLY[a1];
  const d2 = YEARLY[a2];

  // chart data — top categorias (excl receita e subtotal)
  const chartData = CATS.filter(c => c.key !== "subtotal").map(c => ({
    name: c.label.length > 16 ? c.label.slice(0, 15) + "…" : c.label,
    [a1]: d1[c.key] || 0,
    [a2]: d2[c.key] || 0,
  })).filter(d => d[a1] > 0 || d[a2] > 0);

  return (
    <div className="space-y-6">
      {/* Tabela */}
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
                  <td className={`px-4 py-2.5 ${isHeader ? "text-white" : "text-slate-200"}`}>
                    {cat.label}
                  </td>
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

      {/* Gráfico */}
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

      {/* Análise */}
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

function Consolidado() {
  const anos = ["2023", "2024", "2025", "2026"];

  const lineData = CATS.filter(c => !["receita", "subtotal"].includes(c.key)).map(c => ({
    name: c.label.length > 18 ? c.label.slice(0, 17) + "…" : c.label,
    ...Object.fromEntries(anos.map(a => [a, YEARLY[a][c.key] || 0])),
  })).filter(d => anos.some(a => (d[a] as number) > 0));

  const receitaLine = anos.map(a => ({ ano: a, receita: YEARLY[a].receita, gasto: YEARLY[a].subtotal }));

  const v23 = YEARLY["2023"];
  const v26 = YEARLY["2026"];

  return (
    <div className="space-y-6">
      {/* Tabela consolidada */}
      <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/80 text-slate-300">
              <th className="text-left px-4 py-3 font-semibold">Categoria</th>
              {anos.map(a => <th key={a} className="text-right px-3 py-3 font-semibold">{a}</th>)}
              <th className="text-center px-4 py-3 font-semibold">23→26</th>
            </tr>
          </thead>
          <tbody>
            {CATS.map((cat, i) => {
              const vals = anos.map(a => YEARLY[a][cat.key] || 0);
              if (vals.every(v => v === 0)) return null;
              const pct = v23[cat.key] > 0 ? ((v26[cat.key] - v23[cat.key]) / v23[cat.key]) * 100 : 0;
              const isHeader = cat.key === "receita" || cat.key === "subtotal";
              return (
                <tr key={cat.key} className={`border-t border-slate-700/40 ${isHeader ? "bg-slate-800/60 font-semibold" : i % 2 === 0 ? "bg-slate-900/40" : "bg-slate-800/20"} hover:bg-slate-700/30`}>
                  <td className={`px-4 py-2.5 ${isHeader ? "text-white" : "text-slate-200"}`}>{cat.label}</td>
                  {vals.map((v, j) => (
                    <td key={j} className={`px-3 py-2.5 text-right font-mono text-xs ${j === 3 ? "font-bold text-white" : "text-slate-300"}`}>{fmt(v)}</td>
                  ))}
                  <td className="px-4 py-2.5 text-center">
                    {v23[cat.key] > 0 ? <DeltaBadge pct={pct} /> : <span className="text-slate-500 text-xs">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Gráfico receita vs gasto */}
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

      {/* Gráfico categorias */}
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
            <Bar dataKey="2023" fill="#475569" radius={[3, 3, 0, 0]} />
            <Bar dataKey="2024" fill="#5B8DEF" radius={[3, 3, 0, 0]} />
            <Bar dataKey="2025" fill="#C9A84C" radius={[3, 3, 0, 0]} />
            <Bar dataKey="2026" fill="#10B981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Análise final */}
      <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-5 rounded-full bg-amber-400" />
          <h3 className="font-semibold text-white text-base">Análise do Período 2023 → 2026</h3>
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
            { label: "Receita cresceu", val: "+58%", color: "text-emerald-400" },
            { label: "Gasto cresceu", val: "+71%", color: "text-red-400" },
            { label: "Supermercado", val: "+117%", color: "text-red-400" },
            { label: "Luz", val: "+129%", color: "text-red-400" },
            { label: "Seguro de Vida", val: "+141%", color: "text-amber-400" },
            { label: "Manicure/Beleza", val: "+179%", color: "text-amber-400" },
            { label: "Restaurantes/Lazer", val: "+19%", color: "text-emerald-400" },
            { label: "Combustível", val: "-44%", color: "text-emerald-400" },
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

const TABS = [
  { id: "2023-2024", label: "23 × 24" },
  { id: "2024-2025", label: "24 × 25" },
  { id: "2025-2026", label: "25 × 26" },
  { id: "consolidado", label: "Consolidado" },
];

export default function AnaliseHistorica() {
  const [tab, setTab] = useState("2023-2024");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Análise Histórica de Orçamento</h1>
            <p className="text-slate-400 text-sm mt-1">Comparativo ano a ano · 2023 → 2026 · médias mensais</p>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>

        {/* Cards resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Receita Média 2026", val: "R$ 33.894", sub: "+58% vs 2023", color: "border-emerald-500/30 bg-emerald-500/5" },
            { label: "Total Gasto 2026", val: "R$ 29.772", sub: "+71% vs 2023", color: "border-red-500/30 bg-red-500/5" },
            { label: "Supermercado 2026", val: "R$ 4.003", sub: "+117% vs 2023 ← maior salto", color: "border-amber-500/30 bg-amber-500/5" },
            { label: "Restaurantes 2026", val: "R$ 3.879", sub: "+19% vs 2023 ← controlado", color: "border-blue-500/30 bg-blue-500/5" },
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
        {tab === "2023-2024" && <YoYTable a1="2023" a2="2024" />}
        {tab === "2024-2025" && <YoYTable a1="2024" a2="2025" />}
        {tab === "2025-2026" && <YoYTable a1="2025" a2="2026" />}
        {tab === "consolidado" && <Consolidado />}
      </div>
    </div>
  );
}
