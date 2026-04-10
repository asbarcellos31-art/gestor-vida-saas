import { useState } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, CheckCircle2, XCircle, ArrowRight, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
const parseNum = (v: string | number | null | undefined) => parseFloat(String(v || "0")) || 0;

const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const MONTHS_FULL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const CHART_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#84cc16", "#ec4899", "#6366f1",
];

const RULE_COLORS = {
  "Essenciais (50%)": "#3b82f6",
  "Estilo de Vida (30%)": "#8b5cf6",
  "Investimentos/Dívidas (20%)": "#10b981",
};

const CATEGORY_RULES: Record<string, string> = {
  "Alimentação": "Essenciais (50%)", "Combustível": "Essenciais (50%)", "Compras Casa": "Essenciais (50%)",
  "Condomínio": "Essenciais (50%)", "Educação": "Essenciais (50%)", "Faxina": "Essenciais (50%)",
  "Luz/Água": "Essenciais (50%)", "Moradia": "Essenciais (50%)", "Parcelados": "Essenciais (50%)",
  "Pet": "Essenciais (50%)", "Remédio": "Essenciais (50%)", "Saúde": "Essenciais (50%)",
  "Seguro": "Essenciais (50%)", "Transporte": "Essenciais (50%)",
  "Assinaturas": "Estilo de Vida (30%)", "Beleza": "Estilo de Vida (30%)", "Cantina": "Estilo de Vida (30%)",
  "Farmácia": "Estilo de Vida (30%)", "Hobby": "Estilo de Vida (30%)", "Inglês": "Estilo de Vida (30%)",
  "Lazer": "Estilo de Vida (30%)", "Manicure": "Estilo de Vida (30%)", "Outros": "Estilo de Vida (30%)",
  "Pilates": "Estilo de Vida (30%)", "Roupas": "Estilo de Vida (30%)", "Streaming/Hobby": "Estilo de Vida (30%)",
  "Consórcio": "Investimentos/Dívidas (20%)", "Dívidas": "Investimentos/Dívidas (20%)",
  "Imposto": "Investimentos/Dívidas (20%)", "Investimentos": "Investimentos/Dívidas (20%)",
  "Poupança": "Investimentos/Dívidas (20%)", "Praia": "Investimentos/Dívidas (20%)",
  "Reserva": "Investimentos/Dívidas (20%)",
};

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {fmt(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: annualData, isLoading } = trpc.dashboard.annual.useQuery({ year: selectedYear });
  const { data: memberBreakdown } = trpc.members.breakdownAnnual.useQuery({ year: selectedYear });
  const currentMonthNum = new Date().getMonth() + 1;
  const currentYearNum = new Date().getFullYear();
  const { data: endingNextMonth } = trpc.expenses.endingNextMonth.useQuery({
    year: currentYearNum,
    month: currentMonthNum,
  });

  const months = annualData?.months || [];

  // Annual totals
  const totalIncomeYear = months.reduce((s, m) => s + parseNum(m.totalIncome), 0);
  const totalExpensesYear = months.reduce((s, m) => s + parseNum(m.totalExpenses), 0);
  const totalBillsYear = months.reduce((s, m) => s + parseNum(m.totalBills), 0);
  const totalInstallmentsYear = months.reduce((s, m) => s + parseNum(m.totalInstallments), 0);
  // Total de Saídas = apenas Contas a Pagar (já inclui o total do Cartão)
  const totalSavingsYear = totalIncomeYear - totalBillsYear;
  const avgSavingsPct = totalIncomeYear > 0 ? (totalSavingsYear / totalIncomeYear) * 100 : 0;

  // Bar chart data
  const barData = months.map((m, i) => ({
    name: MONTHS_SHORT[i],
    Receita: parseNum(m.totalIncome),
    Despesas: parseNum(m.totalBills),
    Saldo: parseNum(m.totalIncome) - parseNum(m.totalBills),
  }));

  // Category pie data (annual)
  const categoryTotalsYear: Record<string, number> = {};
  months.forEach(m => {
    (m.categoryBreakdown || []).forEach((cb: any) => {
      categoryTotalsYear[cb.category] = (categoryTotalsYear[cb.category] || 0) + parseNum(cb.total);
    });
  });
  const pieData = Object.entries(categoryTotalsYear)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  // Rule breakdown
  const ruleBreakdown: Record<string, number> = {};
  Object.entries(categoryTotalsYear).forEach(([cat, val]) => {
    const rule = CATEGORY_RULES[cat] || "Outros";
    ruleBreakdown[rule] = (ruleBreakdown[rule] || 0) + val;
  });
  const rulePieData = Object.entries(ruleBreakdown).map(([name, value]) => ({ name, value }));

  const currentMonth = new Date().getMonth() + 1;

  return (
    <AppLayout title={`Dashboard ${selectedYear}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Year selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedYear(y => y - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xl font-bold text-foreground">{selectedYear}</span>
            <button
              onClick={() => setSelectedYear(y => y + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/orcamento/${selectedYear}/${currentMonth}`)}
          >
            Mês Atual <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Alerta parcelados encerrando no próximo mês */}
        {(endingNextMonth || []).length > 0 && (
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                {(endingNextMonth || []).length} despesa(s) parcelada(s) encerra(m) no próximo mês
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {(endingNextMonth || []).map((e: any) => (
                  <span key={e.id} className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full">
                    {e.description} — {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(e.amount || "0"))}
                  </span>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0 text-xs h-7"
              onClick={() => {
                const nm = currentMonthNum === 12 ? 1 : currentMonthNum + 1;
                const ny = currentMonthNum === 12 ? currentYearNum + 1 : currentYearNum;
                navigate(`/orcamento/${ny}/${nm}`);
              }}
            >
              Ver mês
            </Button>
          </div>
        )}

        {/* Annual KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Receita Total</p>
              <p className="text-lg font-bold text-emerald-600">{fmt(totalIncomeYear)}</p>
              <p className="text-xs text-muted-foreground">no ano</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Despesas Totais</p>
              <p className="text-lg font-bold text-red-600">{fmt(totalBillsYear)}</p>
              <p className="text-xs text-muted-foreground">no ano</p>
            </CardContent>
          </Card>
          <Card className={`border-l-4 ${totalSavingsYear >= 0 ? "border-l-blue-500" : "border-l-orange-500"}`}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Saldo Acumulado</p>
              <p className={`text-lg font-bold ${totalSavingsYear >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                {fmt(totalSavingsYear)}
              </p>
              <p className="text-xs text-muted-foreground">no ano</p>
            </CardContent>
          </Card>
          <Card className={`border-l-4 ${avgSavingsPct >= 20 ? "border-l-emerald-500" : "border-l-red-500"}`}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Média Poupança</p>
              <div className="flex items-center gap-1">
                <p className={`text-lg font-bold ${avgSavingsPct >= 20 ? "text-emerald-600" : "text-red-600"}`}>
                  {avgSavingsPct.toFixed(1)}%
                </p>
                {avgSavingsPct >= 20
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  : <XCircle className="w-4 h-4 text-red-500" />
                }
              </div>
              <p className="text-xs text-muted-foreground">meta: 20%</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Overview Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resumo Mensal — {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium text-muted-foreground">Mês</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Receita</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Contas</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Despesas</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Parcelados</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Saldo</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">% Poup.</th>
                      <th className="text-center py-2 font-medium text-muted-foreground">Meta</th>
                      <th className="text-center py-2 font-medium text-muted-foreground">Ver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {months.map((m, i) => {
                      const income = parseNum(m.totalIncome);
                      const bills = parseNum(m.totalBills);
                      const expenses = parseNum(m.totalExpenses);
                      const installments = parseNum(m.totalInstallments);
                      const saldo = income - bills;
                      const pct = income > 0 ? (saldo / income) * 100 : 0;
                      const meta = pct >= 20;
                      const hasData = income > 0 || bills > 0;
                      return (
                        <tr
                          key={i}
                          className={`border-b border-border/50 hover:bg-muted/20 ${!hasData ? "opacity-40" : ""}`}
                        >
                          <td className="py-2 font-medium">{MONTHS_FULL[i]}</td>
                          <td className="py-2 text-right text-emerald-600">{income > 0 ? fmt(income) : "—"}</td>
                          <td className="py-2 text-right text-red-600">{bills > 0 ? fmt(bills) : "—"}</td>
                          <td className="py-2 text-right text-red-600">{expenses > 0 ? fmt(expenses) : "—"}</td>
                          <td className="py-2 text-right text-orange-600">{installments > 0 ? fmt(installments) : "—"}</td>
                          <td className={`py-2 text-right font-semibold ${saldo >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                            {hasData ? fmt(saldo) : "—"}
                          </td>
                          <td className={`py-2 text-right ${meta ? "text-emerald-600" : hasData ? "text-red-600" : "text-muted-foreground"}`}>
                            {hasData ? `${pct.toFixed(1)}%` : "—"}
                          </td>
                          <td className="py-2 text-center">
                            {hasData ? (
                              meta
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                                : <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                            ) : "—"}
                          </td>
                          <td className="py-2 text-center">
                            <button
                              onClick={() => navigate(`/orcamento/${selectedYear}/${i + 1}`)}
                              className="text-primary hover:text-primary/80 transition-colors"
                            >
                              <ArrowRight className="w-4 h-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Totals row */}
                    <tr className="border-t-2 border-border font-bold bg-muted/30">
                      <td className="py-2">TOTAL</td>
                      <td className="py-2 text-right text-emerald-600">{fmt(totalIncomeYear)}</td>
                      <td className="py-2 text-right text-red-600">{fmt(totalBillsYear)}</td>
                      <td className="py-2 text-right text-red-600">{fmt(totalExpensesYear)}</td>
                      <td className="py-2 text-right text-orange-600">{fmt(totalInstallmentsYear)}</td>
                      <td className={`py-2 text-right ${totalSavingsYear >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                        {fmt(totalSavingsYear)}
                      </td>
                      <td className={`py-2 text-right ${avgSavingsPct >= 20 ? "text-emerald-600" : "text-red-600"}`}>
                        {avgSavingsPct.toFixed(1)}%
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Receita vs Despesas por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Receita" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Despesas" fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Saldo line chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Evolução do Saldo Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={barData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="Saldo"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category pie */}
          {pieData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Top 10 Categorias de Despesa (Ano)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Rule pie */}
          {rulePieData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Distribuição por Regra 50/30/20 (Ano)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={rulePieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {rulePieData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={(RULE_COLORS as any)[entry.name] || "#6b7280"}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Legend
                      formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {rulePieData.map(entry => {
                    const total = rulePieData.reduce((s, e) => s + e.value, 0);
                    const pct = total > 0 ? (entry.value / total) * 100 : 0;
                    return (
                      <div key={entry.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: (RULE_COLORS as any)[entry.name] || "#6b7280" }}
                          />
                          <span className="text-muted-foreground">{entry.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{fmt(entry.value)}</span>
                          <span className="text-muted-foreground w-12 text-right">{pct.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Breakdown por Vínculo Familiar */}
        {memberBreakdown && memberBreakdown.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Gastos por Vínculo Familiar — {selectedYear}</CardTitle>
              <p className="text-xs text-muted-foreground">Contas a pagar + despesas vinculadas a cada membro</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {(memberBreakdown as any[]).map((m: any) => {
                  const maxTotal = Math.max(...(memberBreakdown as any[]).map((x: any) => x.total));
                  const pct = maxTotal > 0 ? (m.total / maxTotal) * 100 : 0;
                  const pctBills = m.total > 0 ? ((m.totalBills || 0) / m.total) * 100 : 0;
                  const pctExp = m.total > 0 ? ((m.totalExpenses || 0) / m.total) * 100 : 0;
                  return (
                    <div key={m.memberId ?? "geral"} className="space-y-2">
                      {/* Cabeçalho do membro */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow"
                            style={{ backgroundColor: m.color || "#6b7280" }}
                          >
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{m.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(m.months || []).filter((v: number) => v > 0).length} meses ativos
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{fmt(m.total)}</p>
                          <div className="flex gap-3 text-xs text-muted-foreground justify-end">
                            {(m.totalBills || 0) > 0 && (
                              <span className="text-orange-600">Contas: {fmt(m.totalBills)}</span>
                            )}
                            {(m.totalExpenses || 0) > 0 && (
                              <span className="text-blue-600">Despesas: {fmt(m.totalExpenses)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Barra total */}
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: m.color || "#6366f1" }}
                        />
                      </div>
                      {/* Barra de divisão contas vs despesas */}
                      {m.total > 0 && (
                        <div className="flex rounded-full overflow-hidden h-1.5">
                          <div
                            className="h-full bg-orange-400 transition-all"
                            style={{ width: `${pctBills}%` }}
                            title={`Contas: ${fmt(m.totalBills || 0)}`}
                          />
                          <div
                            className="h-full bg-blue-400 transition-all"
                            style={{ width: `${pctExp}%` }}
                            title={`Despesas: ${fmt(m.totalExpenses || 0)}`}
                          />
                        </div>
                      )}
                      {/* Heatmap mensal */}
                      <div className="flex gap-0.5">
                        {MONTHS_SHORT.map((ms, idx) => (
                          <div key={ms} className="flex-1 text-center" title={`${ms}: ${fmt((m.months || [])[idx] || 0)}`}>
                            <div
                              className="h-5 rounded-sm"
                              style={{
                                backgroundColor: ((m.months || [])[idx] || 0) > 0 ? (m.color || "#6366f1") : "transparent",
                                opacity: ((m.months || [])[idx] || 0) > 0
                                  ? Math.max(0.2, ((m.months || [])[idx] || 0) / Math.max(...(m.months || []).map((v: number) => v || 0), 1))
                                  : 1,
                                border: ((m.months || [])[idx] || 0) > 0 ? `1px solid ${m.color || "#6366f1"}` : "1px solid #e5e7eb",
                              }}
                            />
                            <span className="text-[9px] text-muted-foreground">{ms}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {/* Legenda */}
                <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-400" /> Contas a Pagar</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-400" /> Despesas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!isLoading && totalIncomeYear === 0 && totalExpensesYear === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhum dado financeiro registrado para {selectedYear}.
              </p>
              <Button onClick={() => navigate(`/orcamento/${selectedYear}/${currentMonth}`)}>
                Lançar dados de {MONTHS_FULL[currentMonth - 1]}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
