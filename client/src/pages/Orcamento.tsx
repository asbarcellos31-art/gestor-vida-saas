import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  CreditCard,
  PiggyBank,
  CheckCircle2,
  Edit2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useState, useMemo } from "react";

type EntryType = "income" | "fixed_expense" | "variable_expense";
type Rule5030 = "essential" | "lifestyle" | "investment";

function getCurrentMonth() {
  const now = new Date();
  return `${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const ENTRY_TYPE_CONFIG: Record<EntryType, { label: string; color: string; icon: React.ElementType }> = {
  income: { label: "Receita", color: "text-emerald-600", icon: TrendingUp },
  fixed_expense: { label: "Despesa Fixa", color: "text-rose-600", icon: TrendingDown },
  variable_expense: { label: "Despesa Variável", color: "text-amber-600", icon: Wallet },
};

const RULE_CONFIG: Record<Rule5030, { label: string; target: number; color: string }> = {
  essential: { label: "Essenciais (50%)", target: 50, color: "#10b981" },
  lifestyle: { label: "Estilo de Vida (30%)", target: 30, color: "#8b5cf6" },
  investment: { label: "Investimentos (20%)", target: 20, color: "#f59e0b" },
};

const PIE_COLORS = ["#10b981", "#8b5cf6", "#f59e0b"];

interface EntryForm {
  type: EntryType;
  rule5030Category: Rule5030 | "";
  category: string;
  description: string;
  amount: string;
  month: string;
  isPaid: boolean;
  dueDay: string;
}

const DEFAULT_ENTRY: EntryForm = {
  type: "income",
  rule5030Category: "",
  category: "",
  description: "",
  amount: "",
  month: getCurrentMonth(),
  isPaid: false,
  dueDay: "",
};

interface InstallmentForm {
  description: string;
  totalAmount: string;
  totalParcels: string;
  startMonth: string;
  category: string;
}

const DEFAULT_INSTALLMENT: InstallmentForm = {
  description: "",
  totalAmount: "",
  totalParcels: "",
  startMonth: getCurrentMonth(),
  category: "",
};

interface RetirementForm {
  currentAge: string;
  retirementAge: string;
  currentSavings: string;
  monthlyContribution: string;
}

const DEFAULT_RETIREMENT: RetirementForm = {
  currentAge: "",
  retirementAge: "65",
  currentSavings: "0",
  monthlyContribution: "",
};

export default function Orcamento() {
  const utils = trpc.useUtils();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear] = useState(String(new Date().getFullYear()));

  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<number | null>(null);
  const [entryForm, setEntryForm] = useState<EntryForm>(DEFAULT_ENTRY);

  const [installmentDialogOpen, setInstallmentDialogOpen] = useState(false);
  const [installmentForm, setInstallmentForm] = useState<InstallmentForm>(DEFAULT_INSTALLMENT);

  const [retirementForm, setRetirementForm] = useState<RetirementForm>(DEFAULT_RETIREMENT);

  const { data: budgetData, isLoading } = trpc.budget.byMonth.useQuery({ month: selectedMonth });
  const { data: annualData = [] } = trpc.budget.annualSummary.useQuery({ year: selectedYear });
  const { data: installments = [] } = trpc.installments.list.useQuery();
  const { data: retirement } = trpc.retirement.get.useQuery();

  const createEntry = trpc.budget.create.useMutation({
    onSuccess: () => {
      utils.budget.byMonth.invalidate();
      utils.budget.annualSummary.invalidate();
      setEntryDialogOpen(false);
      setEntryForm(DEFAULT_ENTRY);
      setEditingEntry(null);
      toast.success("Entrada salva!");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateEntry = trpc.budget.update.useMutation({
    onSuccess: () => {
      utils.budget.byMonth.invalidate();
      utils.budget.annualSummary.invalidate();
      setEntryDialogOpen(false);
      setEntryForm(DEFAULT_ENTRY);
      setEditingEntry(null);
      toast.success("Entrada atualizada!");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteEntry = trpc.budget.delete.useMutation({
    onSuccess: () => {
      utils.budget.byMonth.invalidate();
      utils.budget.annualSummary.invalidate();
      toast.success("Entrada excluída!");
    },
    onError: (e) => toast.error(e.message),
  });

  const createInstallment = trpc.installments.create.useMutation({
    onSuccess: () => {
      utils.installments.list.invalidate();
      setInstallmentDialogOpen(false);
      setInstallmentForm(DEFAULT_INSTALLMENT);
      toast.success("Parcelamento criado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const payParcel = trpc.installments.payParcel.useMutation({
    onSuccess: () => {
      utils.installments.list.invalidate();
      toast.success("Parcela paga!");
    },
  });

  const deleteInstallment = trpc.installments.delete.useMutation({
    onSuccess: () => {
      utils.installments.list.invalidate();
      toast.success("Parcelamento excluído!");
    },
  });

  const calcRetirement = trpc.retirement.calculate.useMutation({
    onSuccess: () => {
      utils.retirement.get.invalidate();
      toast.success("Projeção calculada!");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmitEntry = () => {
    if (!entryForm.description.trim() || !entryForm.amount) {
      return toast.error("Preencha todos os campos obrigatórios.");
    }
    const data = {
      type: entryForm.type,
      rule5030Category: entryForm.rule5030Category || undefined,
      category: entryForm.category || entryForm.type,
      description: entryForm.description,
      amount: parseFloat(entryForm.amount),
      month: entryForm.month,
      isPaid: entryForm.isPaid,
      dueDay: entryForm.dueDay ? parseInt(entryForm.dueDay) : undefined,
    };
    if (editingEntry) {
      updateEntry.mutate({ id: editingEntry, ...data });
    } else {
      createEntry.mutate(data);
    }
  };

  const openEditEntry = (entry: NonNullable<typeof budgetData>["entries"][0]) => {
    setEditingEntry(entry.id);
    setEntryForm({
      type: entry.type as EntryType,
      rule5030Category: (entry.rule5030Category as Rule5030) ?? "",
      category: entry.category,
      description: entry.description,
      amount: entry.amount,
      month: entry.month,
      isPaid: entry.isPaid,
      dueDay: entry.dueDay ? String(entry.dueDay) : "",
    });
    setEntryDialogOpen(true);
  };

  const summary = budgetData?.summary;
  const entries = budgetData?.entries ?? [];

  const pieData = summary
    ? [
        { name: "Essenciais", value: summary.essential },
        { name: "Estilo de Vida", value: summary.lifestyle },
        { name: "Investimentos", value: summary.investment },
      ].filter((d) => d.value > 0)
    : [];

  const monthOptions = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = -3; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const m = String(d.getMonth() + 1).padStart(2, "0");
      months.push(`${m}/${d.getFullYear()}`);
    }
    return months;
  }, []);

  return (
    <AppLayout>
      <div className="p-3 sm:p-5 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orçamento Doméstico</h1>
            <p className="text-gray-500 text-sm mt-0.5">Regra 50/30/20</p>
          </div>
        </div>

        <Tabs defaultValue="orcamento">
          <TabsList className="mb-4 flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="orcamento" className="flex items-center gap-1 text-xs sm:text-sm">
              <Wallet className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Orçamento</span>
              <span className="xs:hidden">Orç.</span>
            </TabsTrigger>
            <TabsTrigger value="parcelados" className="flex items-center gap-1 text-xs sm:text-sm">
              <CreditCard className="w-3.5 h-3.5" />
              Parcelados
            </TabsTrigger>
            <TabsTrigger value="aposentadoria" className="flex items-center gap-1 text-xs sm:text-sm">
              <PiggyBank className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Aposentadoria</span>
              <span className="sm:hidden">Aposen.</span>
            </TabsTrigger>
            <TabsTrigger value="anual" className="flex items-center gap-1 text-xs sm:text-sm">
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard Anual</span>
              <span className="sm:hidden">Anual</span>
            </TabsTrigger>
          </TabsList>

          {/* ─── Orçamento Mensal ─────────────────────────────────────────────── */}
          <TabsContent value="orcamento">
            {/* Month selector + Add button */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={entryDialogOpen} onOpenChange={(o) => { setEntryDialogOpen(o); if (!o) { setEditingEntry(null); setEntryForm(DEFAULT_ENTRY); } }}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Nova Entrada
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-4 sm:mx-auto">
                  <DialogHeader>
                    <DialogTitle>{editingEntry ? "Editar Entrada" : "Nova Entrada"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label>Tipo</Label>
                      <Select value={entryForm.type} onValueChange={(v) => setEntryForm((f) => ({ ...f, type: v as EntryType }))}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Receita</SelectItem>
                          <SelectItem value="fixed_expense">Despesa Fixa</SelectItem>
                          <SelectItem value="variable_expense">Despesa Variável</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {entryForm.type !== "income" && (
                      <div>
                        <Label>Categoria (Regra 50/30/20)</Label>
                        <Select value={entryForm.rule5030Category} onValueChange={(v) => setEntryForm((f) => ({ ...f, rule5030Category: v as Rule5030 }))}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="essential">Essencial (50%)</SelectItem>
                            <SelectItem value="lifestyle">Estilo de Vida (30%)</SelectItem>
                            <SelectItem value="investment">Investimento (20%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Categoria</Label>
                        <Input value={entryForm.category} onChange={(e) => setEntryForm((f) => ({ ...f, category: e.target.value }))} placeholder="Ex: Alimentação" className="mt-1" />
                      </div>
                      <div>
                        <Label>Mês</Label>
                        <Select value={entryForm.month} onValueChange={(v) => setEntryForm((f) => ({ ...f, month: v }))}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {monthOptions.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Input value={entryForm.description} onChange={(e) => setEntryForm((f) => ({ ...f, description: e.target.value }))} placeholder="Ex: Salário, Aluguel..." className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Valor (R$)</Label>
                        <Input type="number" min={0} step={0.01} value={entryForm.amount} onChange={(e) => setEntryForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0,00" className="mt-1" />
                      </div>
                      <div>
                        <Label>Dia de vencimento</Label>
                        <Input type="number" min={1} max={31} value={entryForm.dueDay} onChange={(e) => setEntryForm((f) => ({ ...f, dueDay: e.target.value }))} placeholder="Ex: 10" className="mt-1" />
                      </div>
                    </div>
                    <Button onClick={handleSubmitEntry} disabled={createEntry.isPending || updateEntry.isPending} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      {editingEntry ? "Salvar alterações" : "Adicionar entrada"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 mb-1">Receitas</p>
                  <p className="text-xl font-bold text-emerald-600">{formatCurrency(summary?.income ?? 0)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 mb-1">Despesas</p>
                  <p className="text-xl font-bold text-rose-600">{formatCurrency(summary?.totalExpenses ?? 0)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 mb-1">Saldo</p>
                  <p className={`text-xl font-bold ${(summary?.balance ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatCurrency(summary?.balance ?? 0)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 mb-1">Investimentos</p>
                  <p className="text-xl font-bold text-amber-600">{formatCurrency(summary?.investment ?? 0)}</p>
                </CardContent>
              </Card>
            </div>

            {/* 50/30/20 */}
            {summary && summary.income > 0 && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Regra 50/30/20</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(Object.entries(RULE_CONFIG) as [Rule5030, typeof RULE_CONFIG[Rule5030]][]).map(([key, cfg]) => {
                      const actual = key === "essential" ? summary.essential : key === "lifestyle" ? summary.lifestyle : summary.investment;
                      const target = (summary.income * cfg.target) / 100;
                      const pct = summary.income > 0 ? (actual / summary.income) * 100 : 0;
                      const ok = pct <= cfg.target;
                      return (
                        <div key={key} className="p-4 rounded-xl border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">{cfg.label}</span>
                            <Badge className={ok ? "bg-emerald-100 text-emerald-700 border-0" : "bg-rose-100 text-rose-700 border-0"}>
                              {pct.toFixed(0)}%
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(pct, 100)}%`, background: cfg.color }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{formatCurrency(actual)}</span>
                            <span>Meta: {formatCurrency(target)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Entries list */}
            <div className="space-y-2">
              {isLoading ? (
                <p className="text-center text-gray-400 py-8">Carregando...</p>
              ) : entries.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma entrada para este mês</p>
                </div>
              ) : (
                entries.map((entry) => {
                  const cfg = ENTRY_TYPE_CONFIG[entry.type as EntryType];
                  return (
                    <div key={entry.id} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${entry.type === "income" ? "bg-emerald-100" : entry.type === "fixed_expense" ? "bg-rose-100" : "bg-amber-100"}`}>
                        <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{entry.description}</p>
                        <p className="text-xs text-gray-400">{entry.category}{entry.dueDay ? ` · Vence dia ${entry.dueDay}` : ""}</p>
                      </div>
                      <span className={`text-sm font-semibold ${cfg.color}`}>
                        {entry.type === "income" ? "+" : "-"}{formatCurrency(parseFloat(entry.amount))}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => openEditEntry(entry)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteEntry.mutate({ id: entry.id })} className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* ─── Parcelados ───────────────────────────────────────────────────── */}
          <TabsContent value="parcelados">
            <div className="flex justify-end mb-5">
              <Dialog open={installmentDialogOpen} onOpenChange={setInstallmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Novo Parcelamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-4 sm:mx-auto">
                  <DialogHeader>
                    <DialogTitle>Novo Parcelamento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label>Descrição</Label>
                      <Input value={installmentForm.description} onChange={(e) => setInstallmentForm((f) => ({ ...f, description: e.target.value }))} placeholder="Ex: Notebook, TV..." className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Valor Total (R$)</Label>
                        <Input type="number" min={0} step={0.01} value={installmentForm.totalAmount} onChange={(e) => setInstallmentForm((f) => ({ ...f, totalAmount: e.target.value }))} placeholder="0,00" className="mt-1" />
                      </div>
                      <div>
                        <Label>Nº de Parcelas</Label>
                        <Input type="number" min={1} value={installmentForm.totalParcels} onChange={(e) => setInstallmentForm((f) => ({ ...f, totalParcels: e.target.value }))} placeholder="12" className="mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Mês Inicial</Label>
                        <Select value={installmentForm.startMonth} onValueChange={(v) => setInstallmentForm((f) => ({ ...f, startMonth: v }))}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {monthOptions.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Categoria</Label>
                        <Input value={installmentForm.category} onChange={(e) => setInstallmentForm((f) => ({ ...f, category: e.target.value }))} placeholder="Ex: Eletrônicos" className="mt-1" />
                      </div>
                    </div>
                    {installmentForm.totalAmount && installmentForm.totalParcels && (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        Parcela mensal: <strong>{formatCurrency(parseFloat(installmentForm.totalAmount) / parseInt(installmentForm.totalParcels))}</strong>
                      </p>
                    )}
                    <Button
                      onClick={() => {
                        if (!installmentForm.description || !installmentForm.totalAmount || !installmentForm.totalParcels) return toast.error("Preencha todos os campos.");
                        createInstallment.mutate({
                          description: installmentForm.description,
                          totalAmount: parseFloat(installmentForm.totalAmount),
                          totalParcels: parseInt(installmentForm.totalParcels),
                          startMonth: installmentForm.startMonth,
                          category: installmentForm.category || undefined,
                        });
                      }}
                      disabled={createInstallment.isPending}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      Criar parcelamento
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {installments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum parcelamento cadastrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {installments.map((inst) => {
                  const progress = (inst.paidParcels / inst.totalParcels) * 100;
                  return (
                    <Card key={inst.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-gray-900">{inst.description}</p>
                            <p className="text-xs text-gray-400">{inst.category} · Início: {inst.startMonth}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(parseFloat(inst.monthlyValue))}/mês</p>
                            <Badge className={inst.status === "completed" ? "bg-emerald-100 text-emerald-700 border-0" : "bg-blue-100 text-blue-700 border-0"}>
                              {inst.status === "completed" ? "Quitado" : "Ativo"}
                            </Badge>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                          <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{inst.paidParcels}/{inst.totalParcels} parcelas pagas</span>
                          <div className="flex gap-2">
                            {inst.status === "active" && (
                              <Button size="sm" variant="outline" onClick={() => payParcel.mutate({ id: inst.id })} className="h-7 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Pagar parcela
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => deleteInstallment.mutate({ id: inst.id })} className="h-7 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ─── Aposentadoria ────────────────────────────────────────────────── */}
          <TabsContent value="aposentadoria">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PiggyBank className="w-5 h-5 text-amber-600" />
                    Calcular Projeção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Idade atual</Label>
                        <Input type="number" min={18} max={80} value={retirementForm.currentAge} onChange={(e) => setRetirementForm((f) => ({ ...f, currentAge: e.target.value }))} placeholder="Ex: 35" className="mt-1" />
                      </div>
                      <div>
                        <Label>Idade de aposentadoria</Label>
                        <Input type="number" min={40} max={90} value={retirementForm.retirementAge} onChange={(e) => setRetirementForm((f) => ({ ...f, retirementAge: e.target.value }))} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label>Patrimônio atual (R$)</Label>
                      <Input type="number" min={0} step={100} value={retirementForm.currentSavings} onChange={(e) => setRetirementForm((f) => ({ ...f, currentSavings: e.target.value }))} placeholder="0,00" className="mt-1" />
                    </div>
                    <div>
                      <Label>Aporte mensal (R$)</Label>
                      <Input type="number" min={0} step={50} value={retirementForm.monthlyContribution} onChange={(e) => setRetirementForm((f) => ({ ...f, monthlyContribution: e.target.value }))} placeholder="Ex: 500,00" className="mt-1" />
                    </div>
                    <Button
                      onClick={() => {
                        if (!retirementForm.currentAge || !retirementForm.monthlyContribution) return toast.error("Preencha todos os campos.");
                        calcRetirement.mutate({
                          currentAge: parseInt(retirementForm.currentAge),
                          retirementAge: parseInt(retirementForm.retirementAge),
                          currentSavings: parseFloat(retirementForm.currentSavings),
                          monthlyContribution: parseFloat(retirementForm.monthlyContribution),
                        });
                      }}
                      disabled={calcRetirement.isPending}
                      className="w-full bg-amber-500 hover:bg-amber-600"
                    >
                      Calcular projeção
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              {retirement && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Resultados — 3 Cenários</h3>
                  {[
                    { label: "Conservador", rate: retirement.scenario1Rate, result: retirement.scenario1Result, income: retirement.scenario1MonthlyIncome, color: "border-blue-200 bg-blue-50", badge: "bg-blue-100 text-blue-700" },
                    { label: "Moderado", rate: retirement.scenario2Rate, result: retirement.scenario2Result, income: retirement.scenario2MonthlyIncome, color: "border-emerald-200 bg-emerald-50", badge: "bg-emerald-100 text-emerald-700" },
                    { label: "Agressivo", rate: retirement.scenario3Rate, result: retirement.scenario3Result, income: retirement.scenario3MonthlyIncome, color: "border-amber-200 bg-amber-50", badge: "bg-amber-100 text-amber-700" },
                  ].map((s) => (
                    <Card key={s.label} className={`border-2 ${s.color}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{s.label}</span>
                          <Badge className={`${s.badge} border-0`}>{s.rate}% a.a.</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-500">Patrimônio acumulado</p>
                            <p className="font-bold text-gray-900">{formatCurrency(parseFloat(s.result ?? "0"))}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Renda mensal estimada</p>
                            <p className="font-bold text-gray-900">{formatCurrency(parseFloat(s.income ?? "0"))}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <p className="text-xs text-gray-400">* Renda calculada para 25 anos de aposentadoria.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ─── Dashboard Anual ──────────────────────────────────────────────── */}
          <TabsContent value="anual">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Receitas vs Despesas — {selectedYear}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={annualData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(v) => v.split("/")[0] + "/" + v.split("/")[1].slice(2)} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                      <ReTooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend />
                      <Bar dataKey="income" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Saldo Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={annualData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={(v) => v.split("/")[0]} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                        <ReTooltip formatter={(v: number) => formatCurrency(v)} />
                        <Bar dataKey="balance" name="Saldo" radius={[4, 4, 0, 0]}
                          fill="#8b5cf6"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Distribuição 50/30/20 (Ano)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const totalEssential = annualData.reduce((s, m) => s + m.essential, 0);
                      const totalLifestyle = annualData.reduce((s, m) => s + m.lifestyle, 0);
                      const totalInvestment = annualData.reduce((s, m) => s + m.investment, 0);
                      const annualPie = [
                        { name: "Essenciais", value: totalEssential },
                        { name: "Estilo de Vida", value: totalLifestyle },
                        { name: "Investimentos", value: totalInvestment },
                      ].filter((d) => d.value > 0);
                      return (
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie data={annualPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                              {annualPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                            </Pie>
                            <ReTooltip formatter={(v: number) => formatCurrency(v)} />
                          </PieChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
