import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell,
} from "recharts";
import {
  ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet,
  AlertTriangle, CheckCircle2, Target, Calendar, Zap, Info,
} from "lucide-react";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
const pct = (v: number) => `${v.toFixed(1)}%`;
const parseN = (v: unknown) => parseFloat(String(v || "0")) || 0;

const MONTHS_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const CATEGORY_COLORS: Record<string, string> = {
  "Alimentação": "#f59e0b", "Lazer": "#8b5cf6", "Saúde": "#10b981",
  "Roupas": "#ec4899", "Transporte": "#3b82f6", "Educação": "#06b6d4",
  "Combustível": "#f97316", "Pet": "#84cc16", "Beleza": "#e879f9",
  "Streaming/Hobby": "#a78bfa", "Assinaturas": "#60a5fa", "Outros": "#94a3b8",
  "Parcelados": "#6366f1", "Contas Fixas": "#0ea5e9", "Farmácia": "#34d399",
  "Hobbie": "#fb7185", "Cantina": "#fbbf24", "Inglês": "#2dd4bf",
  "Pilates": "#c084fc", "Manicure": "#f472b6", "Compras Casa": "#a3e635",
  "Seguro": "#7dd3fc", "Imposto": "#fca5a5", "Investimentos": "#4ade80",
  "Presentes": "#fb923c", "Viagem": "#38bdf8", "Dívidas": "#ef4444",
};

function catColor(cat: string, idx = 0) {
  return CATEGORY_COLORS[cat] ?? [
    "#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6",
    "#06b6d4","#f97316","#84cc16","#ec4899","#6366f1",
  ][idx % 10];
}

function isInstActive(inst: any, year: number, month: number): boolean {
  const start = inst.startYear * 12 + inst.startMonth;
  const cur = year * 12 + month;
  if (cur < start) return false;
  if (inst.isRecurring || inst.totalInstallments >= 9999) return true;
  const end = start + inst.totalInstallments - 1;
  return cur <= end;
}

function SummaryCard({
  label, value, sub, color, icon: Icon,
}: {
  label: string; value: string; sub?: string; color?: string; icon?: any;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color ?? ""}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
        </div>
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
      <p className="font-medium text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex justify-between gap-4" style={{ color: p.color ?? p.fill }}>
          <span>{p.name}</span>
          <span className="font-semibold">{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function PlanejamentoOrcamentario() {
  const now = new Date();
  const [baseYear, setBaseYear] = useState(now.getFullYear());
  const targetYear = baseYear + 1;

  const [incomeAdj, setIncomeAdj] = useState(7.5);
  const [expAdj, setExpAdj] = useState(5.0);

  const { data, isLoading } = trpc.planejamento.getData.useQuery(
    { baseYear },
    { enabled: true }
  );

  // ── Monthly computation for baseYear ──────────────────────────────────────
  const monthlyData = useMemo(() => {
    if (!data) return [];
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;

      const monthIncome = data.incomes
        .filter((e: any) => e.month === m)
        .reduce((s: number, e: any) => s + parseN(e.amount), 0);

      const monthExpenses = data.expenses.filter((e: any) => e.month === m);
      const expByCategory: Record<string, number> = {};
      for (const e of monthExpenses) {
        expByCategory[e.category] = (expByCategory[e.category] || 0) + parseN(e.amount);
      }

      const fixedTotal = data.bills
        .filter((b: any) => b.month === m)
        .reduce((s: number, b: any) => s + parseN(b.amount), 0);
      const billEntriesTotal = data.annualBillEntries
        .filter((b: any) => b.month === m)
        .reduce((s: number, b: any) => s + parseN(b.amount), 0);
      const fixedGrand = fixedTotal + billEntriesTotal;

      const activeInst = data.installments.filter((inst: any) => !inst.paid && isInstActive(inst, baseYear, m));
      const instByCategory: Record<string, number> = {};
      for (const inst of activeInst) {
        const cat = inst.category || "Parcelados";
        instByCategory[cat] = (instByCategory[cat] || 0) + parseN(inst.installmentAmount);
      }

      const expTotal = Object.values(expByCategory).reduce((s: number, v) => s + (v as number), 0);
      const instTotal = Object.values(instByCategory).reduce((s: number, v) => s + (v as number), 0);
      const totalExpenses = expTotal + fixedGrand + instTotal;

      return {
        month: m,
        income: monthIncome,
        fixedTotal: fixedGrand,
        expByCategory,
        instByCategory,
        expTotal,
        instTotal,
        totalExpenses,
        disponivel: monthIncome - totalExpenses,
      };
    });
  }, [data, baseYear]);

  // ── Aggregates ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const withData = monthlyData.filter(m => m.income > 0 || m.totalExpenses > 0);
    const n = withData.length || 1;

    const avgIncome = withData.reduce((s, m) => s + m.income, 0) / n;
    const avgFixed = withData.reduce((s, m) => s + m.fixedTotal, 0) / n;
    const avgExp = withData.reduce((s, m) => s + m.expTotal, 0) / n;
    const avgInst = withData.reduce((s, m) => s + m.instTotal, 0) / n;
    const avgTotal = withData.reduce((s, m) => s + m.totalExpenses, 0) / n;
    const avgDisp = avgIncome - avgTotal;

    // Category totals (expense_entries + installments combined)
    const catTotals: Record<string, number> = {};
    for (const m of withData) {
      for (const [cat, amt] of Object.entries(m.expByCategory)) {
        catTotals[cat] = (catTotals[cat] || 0) + (amt as number);
      }
      for (const [cat, amt] of Object.entries(m.instByCategory)) {
        catTotals[cat] = (catTotals[cat] || 0) + (amt as number);
      }
    }
    const catMonthly: Record<string, number> = Object.fromEntries(
      Object.entries(catTotals).map(([k, v]) => [k, (v as number) / n])
    );

    return { n, avgIncome, avgFixed, avgExp, avgInst, avgTotal, avgDisp, catMonthly };
  }, [monthlyData]);

  // ── Installment analysis ───────────────────────────────────────────────────
  const instAnalysis = useMemo(() => {
    if (!data) return { active: [], expiringInTarget: [], stillActive: [] };
    const allInst = data.installments as any[];

    const activeInBase = allInst.filter(inst => !inst.paid && isInstActive(inst, baseYear, 6));

    const expiringInTarget = allInst
      .filter(inst => {
        if (inst.isRecurring || inst.totalInstallments >= 9999) return false;
        const end = inst.startYear * 12 + inst.startMonth + inst.totalInstallments - 1;
        return end >= targetYear * 12 + 1 && end <= targetYear * 12 + 12;
      })
      .map(inst => {
        const end = inst.startYear * 12 + inst.startMonth + inst.totalInstallments - 1;
        const endMonth = end - targetYear * 12;
        const monthsActive = endMonth;
        const monthsRelief = 12 - endMonth;
        return {
          ...inst,
          endMonth,
          monthsActive,
          annualRelief: parseN(inst.installmentAmount) * monthsRelief,
        };
      })
      .sort((a, b) => a.endMonth - b.endMonth);

    // Installments still running all year in targetYear
    const stillActive = allInst.filter(inst => {
      if (inst.paid) return false;
      if (!isInstActive(inst, targetYear, 1)) return false;
      if (inst.isRecurring || inst.totalInstallments >= 9999) return true;
      const end = inst.startYear * 12 + inst.startMonth + inst.totalInstallments - 1;
      return end > targetYear * 12 + 12;
    });

    return { active: activeInBase, expiringInTarget, stillActive };
  }, [data, baseYear, targetYear]);

  // ── Projections ────────────────────────────────────────────────────────────
  const proj = useMemo(() => {
    const { avgIncome, avgFixed, catMonthly, avgTotal } = stats;
    if (!data) return null;

    const projIncome = avgIncome * (1 + incomeAdj / 100);
    const projFixed = avgFixed * (1 + expAdj / 100);

    const projCat: Record<string, number> = Object.fromEntries(
      Object.entries(catMonthly).map(([k, v]) => [k, (v as number) * (1 + expAdj / 100)])
    );

    // Jan installments in targetYear (full month)
    const instJan = (data.installments as any[])
      .filter(inst => !inst.paid && isInstActive(inst, targetYear, 1))
      .reduce((s, i) => s + parseN(i.installmentAmount), 0);

    // Avg installments in targetYear (weighted by months active)
    let instTargetYearTotal = 0;
    for (let m = 1; m <= 12; m++) {
      const monthInst = (data.installments as any[])
        .filter(inst => !inst.paid && isInstActive(inst, targetYear, m))
        .reduce((s, i) => s + parseN(i.installmentAmount), 0);
      instTargetYearTotal += monthInst;
    }
    const avgInstTarget = instTargetYearTotal / 12;

    const projTotalJanMar = projFixed + Object.values(projCat).reduce((s, v) => s + (v as number), 0) + instJan;
    const projTotalAprDez = projFixed + Object.values(projCat).reduce((s, v) => s + (v as number), 0) + avgInstTarget;

    const totalAnnualRelief = instAnalysis.expiringInTarget.reduce((s, i) => s + i.annualRelief, 0);

    // Regra 50/30/20 — current vs proj
    const rule = {
      base: {
        essencial: avgFixed + (catMonthly["Alimentação"] || 0) + (catMonthly["Saúde"] || 0) +
          (catMonthly["Transporte"] || 0) + (catMonthly["Combustível"] || 0) +
          (catMonthly["Educação"] || 0) + (catMonthly["Pet"] || 0) + (catMonthly["Remédio"] || 0) +
          (catMonthly["Compras Casa"] || 0) + (catMonthly["Moradia"] || 0) + (catMonthly["Faxina"] || 0),
        desejo: (catMonthly["Lazer"] || 0) + (catMonthly["Roupas"] || 0) +
          (catMonthly["Streaming/Hobby"] || 0) + (catMonthly["Assinaturas"] || 0) +
          (catMonthly["Beleza"] || 0) + (catMonthly["Hobbie"] || 0) + (catMonthly["Inglês"] || 0) +
          (catMonthly["Pilates"] || 0) + (catMonthly["Outros"] || 0) + (catMonthly["Cantina"] || 0) +
          (catMonthly["Presentes"] || 0) + (catMonthly["Viagem"] || 0) + (catMonthly["Farmácia"] || 0),
        investimento: (catMonthly["Investimentos"] || 0) + (catMonthly["Poupança"] || 0) +
          (catMonthly["Reserva"] || 0) + (catMonthly["Consórcio"] || 0),
      },
      proj: {
        income: projIncome,
        essencial: projFixed + (projCat["Alimentação"] || 0) + (projCat["Saúde"] || 0) +
          (projCat["Transporte"] || 0) + (projCat["Combustível"] || 0) +
          (projCat["Educação"] || 0) + (projCat["Pet"] || 0),
        desejo: (projCat["Lazer"] || 0) + (projCat["Roupas"] || 0) +
          (projCat["Streaming/Hobby"] || 0) + (projCat["Assinaturas"] || 0) +
          (projCat["Beleza"] || 0) + (projCat["Outros"] || 0) + (projCat["Presentes"] || 0),
        investimento: (projCat["Investimentos"] || 0),
      },
    };

    return {
      projIncome, projFixed, projCat, instJan, avgInstTarget,
      projTotalJanMar, projTotalAprDez, totalAnnualRelief, rule,
      projDispJanMar: projIncome - projTotalJanMar,
      projDispAprDez: projIncome - projTotalAprDez,
    };
  }, [stats, data, incomeAdj, expAdj, targetYear, instAnalysis]);

  // ── Chart data ─────────────────────────────────────────────────────────────
  const monthlyChartData = useMemo(() =>
    monthlyData.map(m => ({
      name: MONTHS_SHORT[m.month - 1],
      Receita: m.income,
      Gastos: m.totalExpenses,
    })),
  [monthlyData]);

  const categoryChartData = useMemo(() => {
    const cats = Object.entries(stats.catMonthly)
      .filter(([, v]) => (v as number) > 50)
      .sort(([, a], [, b]) => (b as number) - (a as number));

    if (stats.avgFixed > 0) {
      cats.unshift(["Contas Fixas", stats.avgFixed]);
    }

    return cats.map(([cat, amt]) => ({
      name: cat,
      value: Math.round(amt as number),
      color: catColor(cat),
    }));
  }, [stats]);

  const comparisonData = useMemo(() => {
    if (!proj) return [];
    const cats = Object.entries(stats.catMonthly)
      .filter(([, v]) => (v as number) > 50)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10);

    return [
      { name: "Contas Fixas", base: Math.round(stats.avgFixed), proj: Math.round(proj.projFixed) },
      ...cats.map(([cat, amt]) => ({
        name: cat,
        base: Math.round(amt as number),
        proj: Math.round((proj.projCat[cat] || 0) as number),
      })),
    ];
  }, [stats, proj]);

  if (isLoading) {
    return (
      <AppLayout title="Planejamento Orçamentário">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Carregando dados...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout title="Planejamento Orçamentário">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Sem dados disponíveis para {baseYear}.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Planejamento Orçamentário">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold">Planejamento Orçamentário</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Análise de {baseYear} • Projeção para {targetYear}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setBaseYear(y => y - 1)}
                className="px-2 py-1.5 hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-bold">{baseYear}</span>
              <button
                onClick={() => setBaseYear(y => y + 1)}
                className="px-2 py-1.5 hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Ajustes ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Índices de Reajuste para {targetYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Receita (% ao ano)</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={incomeAdj}
                    onChange={e => setIncomeAdj(parseFloat(e.target.value) || 0)}
                    className="w-28"
                    step="0.5"
                  />
                  <Button variant="outline" size="sm" onClick={() => setIncomeAdj(7.5)}>IPCA+3%</Button>
                  <Button variant="outline" size="sm" onClick={() => setIncomeAdj(4.5)}>IPCA</Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Gastos (% ao ano)</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={expAdj}
                    onChange={e => setExpAdj(parseFloat(e.target.value) || 0)}
                    className="w-28"
                    step="0.5"
                  />
                  <Button variant="outline" size="sm" onClick={() => setExpAdj(4.5)}>IPCA</Button>
                  <Button variant="outline" size="sm" onClick={() => setExpAdj(5.0)}>5%</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Resumo do Ano Base ── */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Resumo {baseYear}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              ({stats.n} {stats.n === 1 ? "mês" : "meses"} com dados)
            </span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Receita Média/mês"
              value={fmt(stats.avgIncome)}
              icon={TrendingUp}
              color="text-green-500"
            />
            <SummaryCard
              label="Gastos Médios/mês"
              value={fmt(stats.avgTotal)}
              sub={`Fixas ${fmt(stats.avgFixed)} + Variáveis ${fmt(stats.avgExp + stats.avgInst)}`}
              icon={Wallet}
              color="text-red-500"
            />
            <SummaryCard
              label="Disponível Médio"
              value={fmt(stats.avgDisp)}
              sub={stats.avgIncome > 0 ? pct((stats.avgDisp / stats.avgIncome) * 100) + " da receita" : ""}
              icon={stats.avgDisp >= 0 ? CheckCircle2 : AlertTriangle}
              color={stats.avgDisp >= 0 ? "text-emerald-500" : "text-orange-500"}
            />
            <SummaryCard
              label="Parcelamentos Ativos"
              value={fmt(stats.avgInst)}
              sub={`${instAnalysis.active.length} itens`}
              icon={Target}
            />
          </div>
        </div>

        {/* ── Evolução Mensal ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolução Mensal — {baseYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="Receita" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Gastos" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ── Gastos por Categoria ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gastos por Categoria — Média Mensal {baseYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(300, categoryChartData.length * 36)}>
              <BarChart
                layout="vertical"
                data={categoryChartData}
                margin={{ top: 0, right: 60, bottom: 0, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Média/mês" radius={[0, 4, 4, 0]} label={{ position: "right", formatter: (v: number) => fmt(v), fontSize: 11 }}>
                  {categoryChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ── Parcelamentos que Encerram ── */}
        {instAnalysis.expiringInTarget.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Alívio Automático em {targetYear} — Parcelas que Encerram
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 font-medium text-muted-foreground">Descrição</th>
                      <th className="pb-2 font-medium text-muted-foreground">Categoria</th>
                      <th className="pb-2 font-medium text-muted-foreground text-right">Valor/mês</th>
                      <th className="pb-2 font-medium text-muted-foreground text-center">Encerra em</th>
                      <th className="pb-2 font-medium text-muted-foreground text-right">Economia/ano</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instAnalysis.expiringInTarget.map((inst: any, i: number) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2.5 font-medium">{inst.description}</td>
                        <td className="py-2.5 text-muted-foreground">{inst.category}</td>
                        <td className="py-2.5 text-right">{fmt(parseN(inst.installmentAmount))}</td>
                        <td className="py-2.5 text-center text-amber-500 font-medium">
                          {MONTHS_SHORT[inst.endMonth - 1]}/{targetYear}
                        </td>
                        <td className="py-2.5 text-right text-emerald-500 font-semibold">
                          {fmt(inst.annualRelief)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border">
                      <td colSpan={4} className="pt-3 font-semibold">Total de Alívio Anual</td>
                      <td className="pt-3 text-right font-bold text-emerald-500">
                        {fmt(instAnalysis.expiringInTarget.reduce((s: number, i: any) => s + i.annualRelief, 0))}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="text-xs text-muted-foreground pb-1">Alívio mensal médio</td>
                      <td className="text-right text-xs text-muted-foreground pb-1">
                        {fmt(instAnalysis.expiringInTarget.reduce((s: number, i: any) => s + i.annualRelief, 0) / 12)}/mês
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Projeção targetYear ── */}
        {proj && (
          <>
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Projeção {targetYear}
              </h2>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <SummaryCard
                  label={`Receita Projetada (${incomeAdj}%)`}
                  value={fmt(proj.projIncome)}
                  sub={`+${fmt(proj.projIncome - stats.avgIncome)} vs ${baseYear}`}
                  color="text-green-500"
                  icon={TrendingUp}
                />
                <SummaryCard
                  label="Gastos Jan–Mar"
                  value={fmt(proj.projTotalJanMar)}
                  sub="Com parcelamentos plenos"
                  color="text-red-500"
                  icon={Wallet}
                />
                <SummaryCard
                  label="Gastos Abr–Dez (est.)"
                  value={fmt(proj.projTotalAprDez)}
                  sub="Após alívio das parcelas"
                  color="text-orange-500"
                  icon={Wallet}
                />
                <SummaryCard
                  label="Disponível/mês (Abr–)"
                  value={fmt(proj.projDispAprDez)}
                  sub={proj.projIncome > 0 ? pct((proj.projDispAprDez / proj.projIncome) * 100) + " da receita" : ""}
                  color={proj.projDispAprDez >= 0 ? "text-emerald-500" : "text-red-500"}
                  icon={proj.projDispAprDez >= 0 ? CheckCircle2 : AlertTriangle}
                />
              </div>

              {/* Comparison chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Comparativo por Categoria — {baseYear} vs {targetYear}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={Math.max(280, comparisonData.length * 40)}>
                    <BarChart
                      layout="vertical"
                      data={comparisonData}
                      margin={{ top: 0, right: 20, bottom: 0, left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                      <XAxis type="number" tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="base" name={String(baseYear)} fill="#3b82f6" radius={[0, 2, 2, 0]} />
                      <Bar dataKey="proj" name={String(targetYear)} fill="#f59e0b" radius={[0, 2, 2, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* ── Cenários ── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cenários Mensais — {targetYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-2 font-medium text-muted-foreground">Período</th>
                        <th className="pb-2 font-medium text-muted-foreground text-right">Receita</th>
                        <th className="pb-2 font-medium text-muted-foreground text-right">Gastos</th>
                        <th className="pb-2 font-medium text-muted-foreground text-right">Disponível</th>
                        <th className="pb-2 font-medium text-muted-foreground text-right">% Poupado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-3 font-medium">Jan–Mar/{targetYear}</td>
                        <td className="py-3 text-right text-green-500 font-semibold">{fmt(proj.projIncome)}</td>
                        <td className="py-3 text-right text-red-400">{fmt(proj.projTotalJanMar)}</td>
                        <td className={`py-3 text-right font-bold ${proj.projDispJanMar >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {fmt(proj.projDispJanMar)}
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          {pct(proj.projIncome > 0 ? (proj.projDispJanMar / proj.projIncome) * 100 : 0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium">Abr–Dez/{targetYear}</td>
                        <td className="py-3 text-right text-green-500 font-semibold">{fmt(proj.projIncome)}</td>
                        <td className="py-3 text-right text-red-400">{fmt(proj.projTotalAprDez)}</td>
                        <td className={`py-3 text-right font-bold ${proj.projDispAprDez >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {fmt(proj.projDispAprDez)}
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          {pct(proj.projIncome > 0 ? (proj.projDispAprDez / proj.projIncome) * 100 : 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* ── Regra 50/30/20 ── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  Regra 50/30/20 — Diagnóstico
                </CardTitle>
              </CardHeader>
              <CardContent>
                {[
                  { label: "Necessidades (ideal 50%)", base: proj.rule.base.essencial, proj: proj.rule.proj.essencial, ideal: 50 },
                  { label: "Desejos (ideal 30%)", base: proj.rule.base.desejo, proj: proj.rule.proj.desejo, ideal: 30 },
                  { label: "Investimentos (ideal 20%)", base: proj.rule.base.investimento, proj: proj.rule.proj.investimento, ideal: 20 },
                ].map(row => {
                  const baseP = stats.avgIncome > 0 ? (row.base / stats.avgIncome) * 100 : 0;
                  const projP = proj.rule.proj.income > 0 ? (row.proj / proj.rule.proj.income) * 100 : 0;
                  const ok = (label: string) => label.includes("Invest") ? projP >= row.ideal : projP <= row.ideal;
                  return (
                    <div key={row.label} className="mb-5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{row.label}</span>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>{baseYear}: <strong className="text-foreground">{pct(baseP)}</strong></span>
                          <span>{targetYear}: <strong className={ok(row.label) ? "text-emerald-500" : "text-orange-400"}>{pct(projP)}</strong></span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(projP / (row.ideal * 2) * 100, 100)}%`,
                            background: ok(row.label) ? "#10b981" : projP > row.ideal * 1.3 ? "#ef4444" : "#f59e0b",
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                        <span>0%</span>
                        <span>Ideal: {row.ideal}%</span>
                        <span>{row.ideal * 2}%</span>
                      </div>
                    </div>
                  );
                })}

                <div className="mt-4 p-4 bg-muted/40 rounded-xl border border-border">
                  <p className="text-sm font-semibold mb-1">Resumo</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Com receita projetada de <strong className="text-foreground">{fmt(proj.projIncome)}/mês</strong>,
                    o orçamento ideal seria: <strong className="text-foreground">{fmt(proj.projIncome * 0.5)}</strong> em necessidades,{" "}
                    <strong className="text-foreground">{fmt(proj.projIncome * 0.3)}</strong> em desejos e{" "}
                    <strong className="text-emerald-500">{fmt(proj.projIncome * 0.2)}</strong> investidos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── Todos os Parcelamentos ── */}
        {instAnalysis.active.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Parcelamentos Ativos — todos ({instAnalysis.active.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 font-medium text-muted-foreground">Descrição</th>
                      <th className="pb-2 font-medium text-muted-foreground">Categoria</th>
                      <th className="pb-2 font-medium text-muted-foreground text-right">Valor/mês</th>
                      <th className="pb-2 font-medium text-muted-foreground text-center">Encerra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instAnalysis.active
                      .sort((a: any, b: any) => parseN(b.installmentAmount) - parseN(a.installmentAmount))
                      .map((inst: any, i: number) => {
                        const isRec = inst.isRecurring || inst.totalInstallments >= 9999;
                        const end = !isRec
                          ? inst.startYear * 12 + inst.startMonth + inst.totalInstallments - 1
                          : 0;
                        const endMonth = !isRec ? end % 12 || 12 : 0;
                        const endYear = !isRec ? Math.floor((end - 1) / 12) : 0;
                        return (
                          <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-2 font-medium">{inst.description}</td>
                            <td className="py-2 text-muted-foreground">{inst.category}</td>
                            <td className="py-2 text-right font-semibold">{fmt(parseN(inst.installmentAmount))}</td>
                            <td className="py-2 text-center text-xs">
                              {isRec ? (
                                <span className="text-blue-400">Recorrente</span>
                              ) : (
                                <span className={end <= targetYear * 12 + 12 ? "text-emerald-400" : "text-muted-foreground"}>
                                  {MONTHS_SHORT[endMonth - 1]}/{endYear}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border">
                      <td colSpan={2} className="pt-3 font-semibold">Total atual/mês</td>
                      <td className="pt-3 text-right font-bold text-red-400">
                        {fmt(instAnalysis.active.reduce((s: number, i: any) => s + parseN(i.installmentAmount), 0))}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </AppLayout>
  );
}
