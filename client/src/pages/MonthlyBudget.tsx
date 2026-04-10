import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import AppLayout, { MONTHS_FULL } from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Trash2, Save, CheckCircle2, XCircle, TrendingUp, TrendingDown,
  Wallet, Info, CreditCard, AlertTriangle, Layers, Pencil, FileDown, Filter, BarChart2, Eraser, RefreshCw, Search, X, Check, ChevronDown,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const parseNum = (v: string | null | undefined) => parseFloat(String(v || "0")) || 0;

// ── Cartões ────────────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { value: "pix_boleto", label: "Pix / Boleto", color: "bg-gray-100 text-gray-700 border-gray-300", icon: "💳" },
  { value: "cartao_1", label: "Cartão 1", color: "bg-blue-100 text-blue-800 border-blue-400", icon: "🔵" },
  { value: "cartao_2", label: "Cartão 2", color: "bg-zinc-800 text-zinc-100 border-zinc-600", icon: "⚫" },
  { value: "cartao_3", label: "Cartão 3", color: "bg-yellow-100 text-yellow-800 border-yellow-400", icon: "🟡" },
  { value: "cartao_4", label: "Cartão 4", color: "bg-green-100 text-green-800 border-green-400", icon: "🟢" },
  { value: "cartao_5", label: "Cartão 5", color: "bg-purple-100 text-purple-800 border-purple-400", icon: "🟣" },
];

const PAYMENT_MAP: Record<string, { label: string; color: string; icon: string }> = {};
PAYMENT_METHODS.forEach(p => { PAYMENT_MAP[p.value] = p; });

// ── Contas Fixas — fallback para usuários sem dados no banco ──────────────────
// Os rótulos reais vêm de fixedBillLabels (banco de dados), configuráveis pelo usuário
const FIXED_BILLS_FIELDS: { key: string; label: string; defaultCategory: string }[] = [
  { key: "conta_1", label: "Conta 1", defaultCategory: "Outros" },
  { key: "conta_2", label: "Conta 2", defaultCategory: "Outros" },
  { key: "conta_3", label: "Conta 3", defaultCategory: "Outros" },
  { key: "conta_4", label: "Conta 4", defaultCategory: "Outros" },
  { key: "conta_5", label: "Conta 5", defaultCategory: "Outros" },
  { key: "conta_6", label: "Conta 6", defaultCategory: "Outros" },
  { key: "conta_7", label: "Conta 7", defaultCategory: "Outros" },
  { key: "conta_8", label: "Conta 8", defaultCategory: "Outros" },
  { key: "cartoes", label: "Cartões", defaultCategory: "Parcelados" },
];

// INCOME_FIELDS — mantido apenas para compatibilidade com código legado
// As receitas agora são lançamentos livres via income.add
const INCOME_FIELDS: { key: string; label: string }[] = [
  { key: "salario", label: "Salário" },
  { key: "freelance", label: "Freelance" },
  { key: "investimentos", label: "Investimentos" },
  { key: "outros", label: "Outros" },
];

const CATEGORIES = [
  "Alimentação", "Assinaturas", "Beleza", "Cantina", "Combustível",
  "Compras Casa", "Condomínio", "Consórcio", "Dívidas", "Educação",
  "Farmácia", "Faxina", "Hobby", "Imposto", "Inglês", "Investimentos",
  "Lazer", "Luz/Água", "Manicure", "Moradia", "Outros", "Parcelados",
  "Pet", "Pilates", "Poupança", "Praia", "Remédio", "Reserva",
  "Roupas", "Saúde", "Seguro", "Streaming/Hobby", "Transporte",
];

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

function CurrencyInput({ value, onChange, placeholder = "0,00" }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <Input
      type="number" step="0.01" min="0"
      value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} className="text-right h-8 text-sm"
    />
  );
}

// ── Popover de metadados de conta fixa ────────────────────────────────────────
function BillMetaPopover({
  billKey, label, obs, dueDay, category, defaultCategory,
  onSave, categories,
}: {
  billKey: string; label: string; obs: string; dueDay: string; category: string; defaultCategory: string;
  onSave: (obs: string, dueDay: string, category: string) => void;
  categories: string[];
}) {
  const [localObs, setLocalObs] = useState(obs);
  const [localDue, setLocalDue] = useState(dueDay);
  const [localCat, setLocalCat] = useState(category || defaultCategory);
  const [open, setOpen] = useState(false);

  useEffect(() => { setLocalObs(obs); setLocalDue(dueDay); setLocalCat(category || defaultCategory); }, [obs, dueDay, category, defaultCategory]);

  const hasData = obs || dueDay || (category && category !== defaultCategory);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex-shrink-0 transition-colors ${hasData ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground/40 hover:text-muted-foreground"}`}
          title="Categoria, vencimento e observação"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 space-y-3" side="right">
        <p className="font-semibold text-sm">{label}</p>
        <div>
          <Label className="text-xs">Categoria</Label>
          <Select value={localCat} onValueChange={setLocalCat}>
            <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Dia de Vencimento</Label>
          <Input
            type="number" min="1" max="31" placeholder="Ex: 10"
            value={localDue} onChange={e => setLocalDue(e.target.value)}
            className="mt-1 h-8 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Observação</Label>
          <Textarea
            placeholder="Anotações livres..."
            value={localObs} onChange={e => setLocalObs(e.target.value)}
            className="mt-1 text-xs resize-none" rows={2}
          />
        </div>
        <Button size="sm" className="w-full h-8 text-xs" onClick={() => { onSave(localObs, localDue, localCat); setOpen(false); }}>
          Salvar
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export default function MonthlyBudget() {
  const params = useParams<{ year?: string; month?: string }>();
  const now = new Date();
  const year = parseInt(params.year || String(now.getFullYear()));
  const month = parseInt(params.month || String(now.getMonth() + 1));

  // Income state
  const [incomeValues, setIncomeValues] = useState<Record<string, string>>({});
  const [incomeDirty, setIncomeDirty] = useState(false);

  // Fixed bills state
  const [billsValues, setBillsValues] = useState<Record<string, string>>({});
  const [billsObs, setBillsObs] = useState<Record<string, string>>({});
  const [billsDueDay, setBillsDueDay] = useState<Record<string, string>>({});
  const [billsCategory, setBillsCategory] = useState<Record<string, string>>({});
  const [billsMember, setBillsMember] = useState<Record<string, number | null>>({});
  const [billsPaid, setBillsPaid] = useState<Record<string, boolean>>({});
  const [billsLabels, setBillsLabels] = useState<Record<string, string>>({});
  const [billsDirty, setBillsDirty] = useState(false);

  // Expense dialog
  const [expDialogOpen, setExpDialogOpen] = useState(false);
  const [newExpCategory, setNewExpCategory] = useState(CATEGORIES[0]);
  const [newExpDesc, setNewExpDesc] = useState("");
  const [newExpAmount, setNewExpAmount] = useState("");
  const [newExpDate, setNewExpDate] = useState("");
  const [newExpObs, setNewExpObs] = useState("");
  const [newExpPayment, setNewExpPayment] = useState("pix_boleto");
  const [newExpInstallments, setNewExpInstallments] = useState("1");
  const [newExpCurrentInstallment, setNewExpCurrentInstallment] = useState("1");
  const [newExpMemberId, setNewExpMemberId] = useState<number | null>(null);
  const [newExpIsRecurring, setNewExpIsRecurring] = useState(false);

  // Edit expense state
  const [editExpDialogOpen, setEditExpDialogOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<null | {
    id: number; category: string; description: string; amount: string;
    expenseDate: string; obs: string; paymentMethod: string; memberId: number | null;
    installmentTotal?: number | null; installmentNumber?: number | null;
  }>(null);

  // Filter by member
  const [filterMemberId, setFilterMemberId] = useState<number | null | "all">("all");
  // Filter by category
  const [filterCategory, setFilterCategory] = useState<string>("all");
  // Filter by 50/30/20 group
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [showCategoryChart, setShowCategoryChart] = useState(false);
  // Busca global
  const [searchQuery, setSearchQuery] = useState("");
  const sq = searchQuery.toLowerCase().trim();
  // Limpar mês
  const [clearMonthDialogOpen, setClearMonthDialogOpen] = useState(false);

  // Bill entries (lançamentos avulsos nas Contas a Pagar)
  const [showAddBillEntry, setShowAddBillEntry] = useState(false);
  const [newBillDesc, setNewBillDesc] = useState("");
  const [newBillAmount, setNewBillAmount] = useState("");
  const [newBillPayment, setNewBillPayment] = useState("pix_boleto");
  const [newBillDate, setNewBillDate] = useState("");
  // Edição de bill entry
  const [editBillEntry, setEditBillEntry] = useState<{ id: number; description: string; amount: string; paymentMethod: string; billDate: string } | null>(null);
  // Edição de nome de conta fixa
  const [editingFixedBillKey, setEditingFixedBillKey] = useState<string | null>(null);
  const [editingFixedBillLabel, setEditingFixedBillLabel] = useState("");
  // Edição de valor de parcelado no mês
  const [editingInstId, setEditingInstId] = useState<number | null>(null);
  const [editingInstAmount, setEditingInstAmount] = useState("");

  const utils = trpc.useUtils();
  const { data: familyMembers } = trpc.members.list.useQuery();
  const { data: incomeData } = trpc.income.list.useQuery({ year, month });
  const { data: billsData, isLoading: billsLoading, isFetching: billsFetching } = trpc.fixedBills.list.useQuery({ year, month });
  // Mês anterior — para replicar datas de vencimento quando o mês atual ainda não tem dados
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const { data: prevBillsData } = trpc.fixedBills.list.useQuery({ year: prevYear, month: prevMonth });
  const { data: billEntries } = trpc.billEntries.list.useQuery({ year, month });
  const { data: expenses } = trpc.expenses.list.useQuery({ year, month });
  const { data: installments } = trpc.installments.list.useQuery();
  const { data: cardTotals } = trpc.fixedBills.getCardTotal.useQuery({ year, month });
  const { data: endingNext } = trpc.expenses.endingNextMonth.useQuery({ year, month });
  const { data: userCategories } = trpc.categories.list.useQuery();
  const { data: userPaymentMethods } = trpc.paymentMethods.list.useQuery();
  const { data: fixedBillLabels } = trpc.fixedBillLabels.list.useQuery();

  // Categorias dinâmicas: usa as do banco se disponíveis, senão as padrão
  const activeCategories = (userCategories && userCategories.length > 0)
    ? userCategories.map(c => c.name)
    : CATEGORIES;

  const activeCategoryRules: Record<string, string> = {};
  if (userCategories && userCategories.length > 0) {
    userCategories.forEach(c => { activeCategoryRules[c.name] = c.rule; });
  } else {
    Object.assign(activeCategoryRules, CATEGORY_RULES);
  }

  // Formas de pagamento dinâmicas: usa as do banco se disponíveis, senão as padrão
  const activePaymentMethods = (userPaymentMethods && userPaymentMethods.length > 0)
    ? userPaymentMethods.map(p => ({ value: p.key, label: p.label, color: p.colorClass, icon: p.icon, isCard: p.isCard }))
    : PAYMENT_METHODS;

  const activePaymentMap: Record<string, { label: string; color: string; icon: string; isCard?: boolean }> = {};
  activePaymentMethods.forEach(p => { activePaymentMap[p.value] = p; });

  const clearMonthMutation = trpc.expenses.clearMonth.useMutation({
    onSuccess: () => {
      toast.success("Mês limpo com sucesso!");
      setClearMonthDialogOpen(false);
      utils.income.list.invalidate();
      utils.fixedBills.list.invalidate();
      utils.expenses.list.invalidate();
      utils.billEntries.list.invalidate();
      utils.dashboard.monthly.invalidate();
    },
    onError: () => toast.error("Erro ao limpar mês"),
  });

  const addIncomeMut = trpc.income.add.useMutation({
    onSuccess: () => { utils.income.list.invalidate(); utils.dashboard.monthly.invalidate(); },
    onError: () => toast.error("Erro ao salvar receita"),
  });
  const saveBillMut = trpc.fixedBills.upsert.useMutation({
    onSuccess: () => { utils.fixedBills.list.invalidate(); utils.dashboard.monthly.invalidate(); },
    onError: (err) => toast.error(`Erro ao salvar conta: ${err.message}`, { duration: 10000 }),
  });
  // Estado para nova receita
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [newIncomeDesc, setNewIncomeDesc] = useState("");
  const [newIncomeAmount, setNewIncomeAmount] = useState("");
  const [newIncomeCategory, setNewIncomeCategory] = useState("");
  const deleteIncomeMut = trpc.income.delete.useMutation({
    onSuccess: () => { utils.income.list.invalidate(); utils.dashboard.monthly.invalidate(); },
    onError: () => toast.error("Erro ao remover receita"),
  });
  const updateIncomeMut = trpc.income.update.useMutation({
    onSuccess: () => { utils.income.list.invalidate(); utils.dashboard.monthly.invalidate(); },
    onError: () => toast.error("Erro ao atualizar receita"),
  });
  // Aliases para compatibilidade com o restante do código
  const saveIncome = addIncomeMut;
  const saveBills = saveBillMut;

  const addBillEntry = trpc.billEntries.add.useMutation({
    onSuccess: () => {
      toast.success("Lançamento adicionado!");
      setShowAddBillEntry(false);
      setNewBillDesc(""); setNewBillAmount(""); setNewBillPayment("pix_boleto"); setNewBillDate("");
      utils.billEntries.list.invalidate(); utils.dashboard.monthly.invalidate();
    },
    onError: () => toast.error("Erro ao adicionar lançamento"),
  });

  const deleteBillEntry = trpc.billEntries.delete.useMutation({
    onSuccess: () => { toast.success("Lançamento removido"); utils.billEntries.list.invalidate(); utils.dashboard.monthly.invalidate(); },
    onError: () => toast.error("Erro ao remover lançamento"),
  });

  const updateBillEntryMutation = trpc.billEntries.update.useMutation({
    onSuccess: () => { toast.success("Lançamento atualizado!"); setEditBillEntry(null); utils.billEntries.list.invalidate(); utils.dashboard.monthly.invalidate(); },
    onError: () => toast.error("Erro ao atualizar lançamento"),
  });

  const deleteInstallmentFromMonth = trpc.installments.delete.useMutation({
    onSuccess: () => { toast.success("Parcelado removido!"); utils.installments.list.invalidate(); utils.dashboard.monthly.invalidate(); },
    onError: () => toast.error("Erro ao remover parcelado"),
  });
  const addInstallmentFromExpense = trpc.installments.add.useMutation({
    onSuccess: () => {
      const total = parseInt(newExpInstallments) || 1;
      const cur = parseInt(newExpCurrentInstallment) || 1;
      const msg = newExpIsRecurring
        ? "Despesa recorrente adicionada! Aparecerá em todos os meses."
        : `Parcelado ${cur}/${total} adicionado! Aparece na aba Parcelados.`;
      toast.success(msg);
      setExpDialogOpen(false);
      setNewExpDesc(""); setNewExpAmount(""); setNewExpDate(""); setNewExpObs(""); setNewExpPayment("pix_boleto"); setNewExpInstallments("1"); setNewExpCurrentInstallment("1"); setNewExpMemberId(null); setNewExpIsRecurring(false);
      utils.installments.list.invalidate(); utils.dashboard.monthly.invalidate();
    },
    onError: () => toast.error("Erro ao adicionar parcelado"),
  });
  const addExpense = trpc.expenses.add.useMutation({
    onSuccess: () => {
      toast.success("Despesa adicionada!");
      setExpDialogOpen(false);
      setNewExpDesc(""); setNewExpAmount(""); setNewExpDate(""); setNewExpObs(""); setNewExpPayment("pix_boleto"); setNewExpInstallments("1"); setNewExpCurrentInstallment("1"); setNewExpMemberId(null); setNewExpIsRecurring(false);
      utils.expenses.list.invalidate(); utils.dashboard.monthly.invalidate(); utils.expenses.endingNextMonth.invalidate();
    },
    onError: () => toast.error("Erro ao adicionar despesa"),
  });

  const deleteExpense = trpc.expenses.delete.useMutation({
    onSuccess: () => { toast.success("Despesa removida"); utils.expenses.list.invalidate(); utils.dashboard.monthly.invalidate(); utils.expenses.endingNextMonth.invalidate(); },
    onError: () => toast.error("Erro ao remover despesa"),
  });

  const updateExpense = trpc.expenses.update.useMutation({
    onSuccess: () => {
      toast.success("Despesa atualizada!");
      setEditExpDialogOpen(false);
      setEditingExp(null);
      utils.expenses.list.invalidate();
      utils.dashboard.monthly.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar despesa"),
  });

  const upsertFixedBillLabel = trpc.fixedBillLabels.upsert.useMutation({
    onSuccess: () => {
      toast.success("Nome atualizado!");
      setEditingFixedBillKey(null);
      utils.fixedBillLabels.list.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar nome"),
  });

  const updateInstallmentAmount = trpc.installments.update.useMutation({
    onSuccess: () => {
      toast.success("Valor atualizado!");
      setEditingInstId(null);
      utils.installments.list.invalidate();
      utils.dashboard.monthly.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar valor"),
  });

  const toggleInstPaidMonth = trpc.installments.togglePaidMonth.useMutation({
    onSuccess: (data) => {
      if (data?.paid) toast.success("Marcado como descontado!");
      else toast.success("Desmarcado!");
      utils.installments.list.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  const handleEditExpense = () => {
    if (!editingExp) return;
    updateExpense.mutate({
      id: editingExp.id,
      category: editingExp.category,
      description: editingExp.description,
      amount: editingExp.amount,
      expenseDate: editingExp.expenseDate || undefined,
      obs: editingExp.obs || undefined,
      paymentMethod: editingExp.paymentMethod,
      memberId: editingExp.memberId,
    });
  };

  const handleExportExcel = async () => {
    try {
      const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs" as any);
      const wb = XLSX.utils.book_new();
      // Aba de Receitas
      const incomeRows = INCOME_FIELDS.map(f => ({ Campo: f.label, Valor: parseNum(incomeValues[f.key]) }));
      incomeRows.push({ Campo: "TOTAL", Valor: totalIncome });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(incomeRows), "Receitas");
      // Aba de Contas a Pagar
      const billsRows = FIXED_BILLS_FIELDS.map(f => ({
        Conta: f.label,
        Valor: parseNum(billsValues[f.key]),
        Categoria: billsCategory[f.key] || f.defaultCategory,
        Vencimento: billsDueDay[f.key] ? `Dia ${billsDueDay[f.key]}` : "",
        Observação: billsObs[f.key] || "",
      }));
      billsRows.push({ Conta: "TOTAL", Valor: totalBills, Categoria: "", Vencimento: "", Observação: "" });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(billsRows), "Contas a Pagar");
      // Aba de Despesas
      const expRows = (expenses || []).map(e => ({
        Descrição: e.description,
        Categoria: e.category,
        Valor: parseNum(e.amount),
        Data: e.expenseDate ? new Date(e.expenseDate).toLocaleDateString("pt-BR") : "",
        Pagamento: activePaymentMap[e.paymentMethod ?? ""]?.label || e.paymentMethod || "",
        Vínculo: familyMembers?.find(m => m.id === e.memberId)?.name || "Geral",
        Observação: e.obs || "",
        Parcela: e.installmentTotal && e.installmentTotal > 1 ? `${e.installmentNumber}/${e.installmentTotal}` : "",
      }));
      expRows.push({ Descrição: "TOTAL", Categoria: "", Valor: totalExpenses, Data: "", Pagamento: "", Vínculo: "", Observação: "", Parcela: "" });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expRows), "Despesas");
      // Aba de Resumo
      const summaryRows = [
        { Métrica: "Total Receitas", Valor: totalIncome },
        { Métrica: "Total Contas Fixas", Valor: totalBills },
        { Métrica: "Total Despesas", Valor: totalExpenses },
        { Métrica: "Total Parcelados", Valor: totalInstallments },
        { Métrica: "Saldo Final", Valor: saldoFinal },
        { Métrica: "% Guardado", Valor: `${pctGuardado.toFixed(1)}%` },
        { Métrica: "Meta 20% Atingida", Valor: meta20 ? "Sim" : "Não" },
        { Métrica: "Essenciais (50%)", Valor: groupTotals.essenciais },
        { Métrica: "Estilo de Vida (30%)", Valor: groupTotals.estiloVida },
        { Métrica: "Investimentos/Dívidas (20%)", Valor: groupTotals.investimentos },
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), "Resumo");
      XLSX.writeFile(wb, `Orcamento_${monthName}_${year}.xlsx`);
      toast.success("Excel exportado com sucesso!");
    } catch {
      toast.error("Erro ao exportar Excel. Tente novamente.");
    }
  };

  // Load income data
  useEffect(() => {
    if (incomeData) {
      const vals: Record<string, string> = {};
      INCOME_FIELDS.forEach(f => { vals[f.key] = String(parseNum((incomeData as any)[f.key])); });
      setIncomeValues(vals); setIncomeDirty(false);
    } else {
      const vals: Record<string, string> = {};
      INCOME_FIELDS.forEach(f => { vals[f.key] = "0"; });
      setIncomeValues(vals);
    }
  }, [incomeData]);

  // Load bills data
  // Carrega dados do mês atual quando existem
  useEffect(() => {
    if (!billsData) return;
    const vals: Record<string, string> = {};
    FIXED_BILLS_FIELDS.forEach(f => { vals[f.key] = String(parseNum((billsData as any)[f.key])); });
    setBillsValues(vals);
    try { setBillsObs(JSON.parse((billsData as any).billsObs || "{}")); } catch { setBillsObs({}); }
    try { setBillsDueDay(JSON.parse((billsData as any).billsDueDay || "{}")); } catch { setBillsDueDay({}); }
    try { setBillsCategory(JSON.parse((billsData as any).billsCategory || "{}")); } catch { setBillsCategory({}); }
    try { setBillsMember(JSON.parse((billsData as any).billsMember || "{}")); } catch { setBillsMember({}); }
    try { setBillsPaid(JSON.parse((billsData as any).billsPaid || "{}")); } catch { setBillsPaid({}); }
    try { setBillsLabels(JSON.parse((billsData as any).billsLabels || "{}")); } catch { setBillsLabels({}); }
    setBillsDirty(false);
  }, [billsData]);

  // Controla se a replicação já foi feita para este mês (evita re-rodar após save/refetch)
  const replicationDoneRef = useRef(false);

  // Quando o mês atual NÃO tem dados e o mês anterior carrega,
  // replica apenas datas de vencimento, categorias e membros (NÃO os valores monetários)
  // Só roda UMA VEZ por mês (replicationDoneRef garante isso)
  useEffect(() => {
    // Aguarda a query do mês atual terminar completamente (sem loading nem fetching)
    if (billsLoading || billsFetching) return;
    // Se já tem dados salvos no banco — não replica nada
    if (billsData) return;
    // Se já replicou neste mês — não replica de novo
    if (replicationDoneRef.current) return;
    // Só replica se o mês anterior tem dados
    if (!prevBillsData) return;
    replicationDoneRef.current = true;
    try {
      const prevDueDays = JSON.parse((prevBillsData as any).billsDueDay || "{}");
      if (Object.keys(prevDueDays).length > 0) setBillsDueDay(prevDueDays);
    } catch { /* ignora */ }
    try {
      const prevCat = JSON.parse((prevBillsData as any).billsCategory || "{}");
      if (Object.keys(prevCat).length > 0) setBillsCategory(prevCat);
    } catch { /* ignora */ }
    try {
      const prevMember = JSON.parse((prevBillsData as any).billsMember || "{}");
      if (Object.keys(prevMember).length > 0) setBillsMember(prevMember);
    } catch { /* ignora */ }
  }, [billsLoading, billsFetching, billsData, prevBillsData]);

  // Auto-Cartões: quando cardTotals chega do backend, preenche o campo "cartoes" automaticamente
  useEffect(() => {
    if (cardTotals && cardTotals.total > 0) {
      setBillsValues(prev => ({ ...prev, cartoes: String(cardTotals.total.toFixed(2)) }));
    } else if (cardTotals && cardTotals.total === 0) {
      // Se não há despesas de cartão, zera o campo (mas só se não foi editado manualmente)
      setBillsValues(prev => ({ ...prev, cartoes: "0" }));
    }
  }, [cardTotals]);

  // Metrics
  const totalIncome = (incomeData || []).reduce((s, e) => s + parseNum(e.amount), 0);
  const totalBillEntries = (billEntries || []).reduce((s, e) => s + parseNum(e.amount), 0);
  // Para o campo cartoes, usa cardTotals.total diretamente (evita valor desatualizado do banco antes do cardTotals chegar)
  const cartoesParaTotal = cardTotals !== undefined ? cardTotals.total : 0;
  const totalBillsFixed = (billsData || []).reduce((s, b) => {
    if (b.billKey === 'cartoes') return s + cartoesParaTotal;
    return s + parseNum(b.amount);
  }, 0);
  const totalBills = totalBillsFixed + totalBillEntries;
  const totalExpenses = (expenses || []).reduce((s, e) => s + parseNum(e.amount), 0);
  // Total filtrado por categoria/vínculo
  const filteredExpenses = (expenses || []).filter(e => {
    if (filterMemberId !== "all" && e.memberId !== filterMemberId) return false;
    if (filterCategory !== "all" && e.category !== filterCategory) return false;
    if (filterGroup !== "all") {
      const rule = activeCategoryRules[e.category || ""] || "";
      if (filterGroup === "essenciais" && rule !== "Essenciais (50%)") return false;
      if (filterGroup === "estilo" && rule !== "Estilo de Vida (30%)") return false;
      if (filterGroup === "investimentos" && rule !== "Investimentos/Dívidas (20%)") return false;
    }
    if (sq && !(e.description || "").toLowerCase().includes(sq) && !(e.category || "").toLowerCase().includes(sq)) return false;
    return true;
  });
  const totalExpensesFiltered = filteredExpenses.reduce((s, e) => s + parseNum(e.amount), 0);
  const isFiltered = filterMemberId !== "all" || filterCategory !== "all" || filterGroup !== "all" || !!sq;

  // Installments for this month (from installment_bills table)
  const monthInstallments = (installments || []).filter(inst => {
    if (inst.paid) return false;
    // Aplicar filtro de categoria quando ativo
    if (filterCategory !== "all" && inst.category !== filterCategory) return false;
    // Aplicar filtro de membro quando ativo
    if (filterMemberId !== "all" && (inst as any).memberId !== filterMemberId) return false;
    // Aplicar filtro 50/30/20
    if (filterGroup !== "all") {
      const rule = activeCategoryRules[inst.category || ""] || "";
      if (filterGroup === "essenciais" && rule !== "Essenciais (50%)") return false;
      if (filterGroup === "estilo" && rule !== "Estilo de Vida (30%)") return false;
      if (filterGroup === "investimentos" && rule !== "Investimentos/Dívidas (20%)") return false;
    }
    // Aplicar busca global
    if (sq && !(inst.description || "").toLowerCase().includes(sq) && !(inst.category || "").toLowerCase().includes(sq)) return false;
    // Recorrentes: aparecem sempre a partir do mês de início
    if ((inst as any).isRecurring) {
      const startDate = inst.startYear * 12 + inst.startMonth;
      return (year * 12 + month) >= startDate;
    }
    const startDate = inst.startYear * 12 + inst.startMonth;
    const endMonthNorm = ((inst.startMonth + inst.totalInstallments - 2) % 12) + 1;
    const endYear = inst.startYear + Math.floor((inst.startMonth + inst.totalInstallments - 2) / 12);
    const endDate = endYear * 12 + endMonthNorm;
    const curDate = year * 12 + month;
    return curDate >= startDate && curDate <= endDate;
  });
  const totalInstallments = monthInstallments.reduce((s, i) => s + parseNum(i.installmentAmount), 0);

  // Total de Saídas = apenas Contas a Pagar (já inclui o total do Cartão)
  // Despesas individuais são detalhe do cartão — não entram no saldo
  const saldoFinal = totalIncome - totalBills;
  const pctGuardado = totalIncome > 0 ? (saldoFinal / totalIncome) * 100 : 0;
  const meta20 = pctGuardado >= 20;

  // Category totals — usa a categoria real de cada item (não agrupa parcelados como "Parcelados")
  const categoryTotals: Record<string, number> = {};
  (expenses || []).forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + parseNum(e.amount);
  });
  // Parcelados: soma por categoria individual de cada parcelado ativo no mês
  monthInstallments.forEach(inst => {
    const cat = inst.category || "Parcelados";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + parseNum(inst.installmentAmount);
  });

  // Group totals — inclui despesas + contas a pagar fixas + parcelados (por categoria real)
  const groupTotals = { essenciais: 0, estiloVida: 0, investimentos: 0 };
  // 1) Despesas por categoria (já inclui parcelados somados por categoria real acima)
  Object.entries(categoryTotals).forEach(([cat, val]) => {
    const rule = activeCategoryRules[cat];
    if (rule === "Essenciais (50%)") groupTotals.essenciais += val;
    else if (rule === "Estilo de Vida (30%)") groupTotals.estiloVida += val;
    else if (rule === "Investimentos/Dívidas (20%)") groupTotals.investimentos += val;
  });
  // 2) Contas a pagar fixas — usa categoria configurada ou padrão do campo
  // IMPORTANTE: o campo "cartoes" é preenchido automaticamente com o total dos parcelados.
  // Os parcelados já são contados individualmente por categoria acima, então "cartoes" é EXCLUÍDO
  // para evitar dupla contagem.
  FIXED_BILLS_FIELDS.forEach(f => {
    if (f.key === "cartoes") return; // Excluir: parcelados já somados individualmente acima
    const val = parseNum(billsValues[f.key]);
    if (val <= 0) return;
    const cat = billsCategory[f.key] || f.defaultCategory;
    const rule = activeCategoryRules[cat];
    if (rule === "Essenciais (50%)") groupTotals.essenciais += val;
    else if (rule === "Estilo de Vida (30%)") groupTotals.estiloVida += val;
    else if (rule === "Investimentos/Dívidas (20%)") groupTotals.investimentos += val;
    // Se categoria não mapeada, não soma em nenhum grupo
  });

  const handleSaveIncome = () => {
    if (!newIncomeDesc.trim() || !newIncomeAmount) return;
    saveIncome.mutate({ year, month, description: newIncomeDesc, amount: newIncomeAmount, category: newIncomeCategory || undefined });
    setNewIncomeDesc(""); setNewIncomeAmount(""); setNewIncomeCategory(""); setShowAddIncome(false);
  };

  const handleSaveBills = (key: string, amount: string, paid?: boolean, paidDate?: string) => {
    saveBills.mutate({ year, month, billKey: key, amount, paid, paidDate });
  };

  const handleBillMeta = (key: string, obs: string, dueDay: string, category: string) => {
    setBillsObs(prev => ({ ...prev, [key]: obs }));
    setBillsDueDay(prev => ({ ...prev, [key]: dueDay }));
    setBillsCategory(prev => ({ ...prev, [key]: category }));
    setBillsDirty(true);
  };

  const handleBillMember = (key: string, memberId: number | null) => {
    setBillsMember(prev => ({ ...prev, [key]: memberId }));
    setBillsDirty(true);
  };

  const handleAddExpense = () => {
    if (!newExpDesc.trim() || !newExpAmount) return;
    const totalInstallments = parseInt(newExpInstallments) || 1;
    const currentInstallment = parseInt(newExpCurrentInstallment) || 1;
    if (newExpIsRecurring || totalInstallments > 1) {
      // Salvar como installment_bill (recorrente ou parcelado) — aparece na aba Parcelados
      addInstallmentFromExpense.mutate({
        description: newExpDesc,
        totalAmount: String(parseFloat(newExpAmount) * (newExpIsRecurring ? 1 : totalInstallments)),
        installmentAmount: newExpAmount,
        totalInstallments: newExpIsRecurring ? 9999 : totalInstallments,
        currentInstallment: newExpIsRecurring ? 1 : currentInstallment,
        startYear: year,
        startMonth: month,
        category: newExpCategory,
        isRecurring: newExpIsRecurring,
      });
    } else {
      // Despesa à vista — salva como expense_entry normal
      addExpense.mutate({
        year, month,
        category: newExpCategory,
        description: newExpDesc,
        amount: newExpAmount,
        expenseDate: newExpDate || undefined,
        obs: newExpObs || undefined,
        paymentMethod: newExpPayment,
        installmentTotal: 1,
        memberId: newExpMemberId ?? undefined,
      });
    }
  };

  const monthName = MONTHS_FULL[month - 1];
  const isCard = (pm: string | null | undefined) => {
    const method = activePaymentMap[pm ?? ""];
    return method?.isCard ?? false;
  };

  return (
    <AppLayout title={`Orçamento — ${monthName} ${year}`}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Alerta parcelados encerrando */}
        {(endingNext || []).length > 0 && (
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                {(endingNext || []).length} parcelado(s) encerra(m) no próximo mês
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">
                {(endingNext || []).map(e => e.description).join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* Painel: Últimas parcelas do mês atual */}
        {(() => {
          const lastInstallmentsThisMonth = (installments || []).filter(inst => {
            if (inst.paid || (inst as any).isRecurring) return false;
            const installNum = (year - inst.startYear) * 12 + (month - inst.startMonth) + 1;
            return installNum === inst.totalInstallments;
          });
          if (lastInstallmentsThisMonth.length === 0) return null;
          const totalLastInstallments = lastInstallmentsThisMonth.reduce((s, i) => s + parseNum(i.installmentAmount), 0);
          return (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-700 dark:text-green-400 text-sm font-semibold">🎉 Últimas parcelas neste mês</span>
                  <span className="bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs px-2 py-0.5 rounded-full font-medium">{lastInstallmentsThisMonth.length} item(s)</span>
                </div>
                <span className="text-green-700 dark:text-green-400 font-bold text-sm">{fmt(totalLastInstallments)} liberados no próximo mês</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {lastInstallmentsThisMonth.map(inst => (
                  <div key={inst.id} className="flex items-center gap-1.5 bg-white dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded px-2 py-1">
                    <span className="text-xs font-medium text-green-800 dark:text-green-300">{inst.description}</span>
                    <span className="text-xs text-green-600 dark:text-green-400">{fmt(parseNum(inst.installmentAmount))}</span>
                    <span className="text-[10px] text-green-500">{inst.totalInstallments}/{inst.totalInstallments}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Barra de ações do mês */}
        <div className="flex items-center gap-2">
          {/* Campo de busca global */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-8 pr-8 h-9 text-sm"
              placeholder="Buscar despesa, parcelado, conta..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:hover:bg-red-950/30 flex-shrink-0"
            onClick={() => setClearMonthDialogOpen(true)}
          >
            <Eraser className="w-3.5 h-3.5 mr-1.5" />
            Limpar Mês
          </Button>
        </div>

        {/* Dialog de confirmação: Limpar Mês */}
        <Dialog open={clearMonthDialogOpen} onOpenChange={setClearMonthDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Eraser className="w-5 h-5" />
                Limpar {monthName} {year}?
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground pt-2">
                Esta ação irá apagar <strong>todas as despesas</strong>, <strong>receitas</strong>,
                <strong> lançamentos avulsos</strong> e <strong>zerar as contas a pagar</strong> deste mês.
                <br /><br />
                <span className="text-red-600 font-semibold">Esta ação não pode ser desfeita.</span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setClearMonthDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => clearMonthMutation.mutate({ year, month })}
                disabled={clearMonthMutation.isPending}
              >
                {clearMonthMutation.isPending ? "Limpando..." : "Sim, limpar tudo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Entrada</p>
              <p className="text-lg font-bold text-emerald-600">{fmt(totalIncome)}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Saídas</p>
              <p className="text-lg font-bold text-red-600">{fmt(totalBills)}</p>
            </CardContent>
          </Card>
          <Card className={`border-l-4 ${saldoFinal >= 0 ? "border-l-blue-500" : "border-l-orange-500"}`}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Saldo Final</p>
              <p className={`text-lg font-bold ${saldoFinal >= 0 ? "text-blue-600" : "text-orange-600"}`}>{fmt(saldoFinal)}</p>
            </CardContent>
          </Card>
          <Card className={`border-l-4 ${meta20 ? "border-l-emerald-500" : "border-l-red-500"}`}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Meta 20%</p>
              <div className="flex items-center gap-2">
                <p className={`text-lg font-bold ${meta20 ? "text-emerald-600" : "text-red-600"}`}>{pctGuardado.toFixed(1)}%</p>
                {meta20 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
              </div>
              <p className={`text-xs mt-0.5 ${meta20 ? "text-emerald-600" : "text-red-500"}`}>
                {meta20 ? "Meta atingida ✓" : "Meta não atingida"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Resumo de Cartões */}
        {cardTotals && cardTotals.total > 0 && (
          <Card className="border border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-500" />
                Resumo de Cartões do Mês
                <span className="ml-auto text-base font-bold text-blue-600">{fmt(cardTotals.total)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {/* Bandeiras com total consolidado (despesas + parcelados) */}
              <div className="flex flex-wrap gap-2">
                {activePaymentMethods.filter(p => (p as any).isCard !== false && p.value !== "pix_boleto").map(p => {
                  const val = cardTotals.byCard[p.value] || 0;
                  if (!val) return null;
                  return (
                    <div key={p.value} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${p.color}`}>
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                      <span className="font-bold">{fmt(val)}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Inclui despesas avulsas + parcelados/recorrentes ativos no mês, por bandeira.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ENTRADA */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Entrada
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-emerald-600">{fmt(totalIncome)}</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAddIncome(true)}>
                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {(incomeData || []).length === 0 && !showAddIncome && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma receita cadastrada. Clique em "Adicionar" para incluir.</p>
              )}
              {(incomeData || []).map(entry => (
                <div key={entry.id} className="flex items-center gap-2 group">
                  <label className="text-sm text-muted-foreground flex-1 truncate">{entry.description}</label>
                  {entry.category && <span className="text-xs text-muted-foreground/60 hidden sm:block">{entry.category}</span>}
                  <span className="text-sm font-medium text-emerald-600 flex-shrink-0">{fmt(parseNum(entry.amount))}</span>
                  <button
                    onClick={() => deleteIncomeMut.mutate({ id: entry.id })}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-red-500 transition-all flex-shrink-0"
                    title="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {showAddIncome && (
                <div className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg border border-dashed border-emerald-300">
                  <Input
                    placeholder="Descrição (ex: Salário, Freela...)"
                    value={newIncomeDesc}
                    onChange={e => setNewIncomeDesc(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <div className="flex gap-2">
                    <CurrencyInput value={newIncomeAmount} onChange={setNewIncomeAmount} placeholder="Valor" />
                    <Select value={newIncomeCategory} onValueChange={setNewIncomeCategory}>
                      <SelectTrigger className="h-8 text-xs flex-1"><SelectValue placeholder="Categoria" /></SelectTrigger>
                      <SelectContent>
                        {activeCategories.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-8 text-xs" onClick={handleSaveIncome} disabled={saveIncome.isPending || !newIncomeDesc.trim() || !newIncomeAmount}>
                      <Save className="w-3 h-3 mr-1" /> Salvar
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setShowAddIncome(false); setNewIncomeDesc(""); setNewIncomeAmount(""); setNewIncomeCategory(""); }}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <span className="text-sm font-semibold flex-1">TOTAL ENTRADA</span>
                <span className="text-sm font-bold text-emerald-600">{fmt(totalIncome)}</span>
              </div>
            </CardContent>
          </Card>

          {/* CONTAS A PAGAR */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  Contas a Pagar
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-600">{fmt(totalBills)}</span>

                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {(fixedBillLabels || []).filter(l => !l.hidden).map(f => {
                const obs = billsObs[f.billKey] || "";
                const dueDay = billsDueDay[f.billKey] || "";
                const cat = billsCategory[f.billKey] || "";
                const memberIdForBill = billsMember[f.billKey] ?? null;
                const memberForBill = familyMembers?.find(m => m.id === memberIdForBill);
                const isAutoCartoes = f.billKey === "cartoes" && cardTotals !== undefined;
                const billData = (billsData || []).find(b => b.billKey === f.billKey);
                return (
                  <div key={f.billKey} className={`flex items-center gap-2 ${isAutoCartoes && (cardTotals?.total ?? 0) > 0 ? "bg-blue-50 dark:bg-blue-950/20 rounded-lg px-1 -mx-1" : ""}`}>
                    <div className="flex items-center gap-1.5 w-44 flex-shrink-0">
                      {editingFixedBillKey === f.billKey ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            autoFocus
                            className="text-sm border rounded px-1 py-0.5 flex-1 min-w-0"
                            value={editingFixedBillLabel}
                            onChange={e => setEditingFixedBillLabel(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') { upsertFixedBillLabel.mutate({ billKey: f.billKey, label: editingFixedBillLabel }); setEditingFixedBillKey(null); }
                              if (e.key === 'Escape') setEditingFixedBillKey(null);
                            }}
                          />
                          <button onClick={() => { upsertFixedBillLabel.mutate({ billKey: f.billKey, label: editingFixedBillLabel }); setEditingFixedBillKey(null); }} className="text-emerald-600 hover:text-emerald-700"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingFixedBillKey(null)} className="text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <label className="text-sm text-muted-foreground truncate flex-1">{f.label}</label>
                      )}
                      {editingFixedBillKey !== f.billKey && (
                        <button
                          onClick={() => { setEditingFixedBillKey(f.billKey); setEditingFixedBillLabel(f.label); }}
                          className="text-muted-foreground/30 hover:text-blue-500 transition-colors flex-shrink-0"
                          title="Renomear conta"
                        ><Pencil className="w-3 h-3" /></button>
                      )}
                      {isAutoCartoes && (cardTotals?.total ?? 0) > 0 && (
                        <span className="text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-700 flex-shrink-0 flex items-center gap-0.5">
                          <CreditCard className="w-2.5 h-2.5" /> Auto
                        </span>
                      )}
                      {dueDay && !isAutoCartoes && (
                        <span className="text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-700 flex-shrink-0">
                          dia {dueDay}
                        </span>
                      )}
                    </div>
                    <CurrencyInput
                      value={billData ? String(parseNum(billData.amount)) : billsValues[f.billKey] || "0"}
                      onChange={v => {
                        if (!isAutoCartoes) {
                          setBillsValues(prev => ({ ...prev, [f.billKey]: v }));
                          saveBillMut.mutate({ year, month, billKey: f.billKey, amount: v, paid: billsPaid[f.billKey] || false });
                        }
                      }}
                      placeholder={isAutoCartoes ? "Auto" : "0,00"}
                    />
                    {/* Seletor de vínculo */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="flex-shrink-0 transition-colors"
                          title={memberForBill ? memberForBill.name : "Vincular membro"}
                        >
                          {memberForBill ? (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow"
                              style={{ backgroundColor: memberForBill.color }}
                            >
                              {memberForBill.name.charAt(0).toUpperCase()}
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground/40 hover:border-muted-foreground/60 hover:text-muted-foreground transition-colors">
                              <span className="text-xs">+</span>
                            </div>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-52 p-2" side="right">
                        <p className="text-xs font-semibold mb-2 text-muted-foreground">Vínculo — {f.label}</p>
                        <div className="space-y-1">
                          <button
                            onClick={() => handleBillMember(f.billKey, null)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors ${
                              memberIdForBill === null ? "bg-muted font-semibold" : ""
                            }`}
                          >
                            <div className="w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground/40" />
                            Sem vínculo
                          </button>
                          {(familyMembers || []).map(m => (
                            <button
                              key={m.id}
                              onClick={() => handleBillMember(f.billKey, m.id)}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors ${
                                memberIdForBill === m.id ? "bg-muted font-semibold" : ""
                              }`}
                            >
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                                style={{ backgroundColor: m.color }}
                              >
                                {m.name.charAt(0).toUpperCase()}
                              </div>
                              {m.name}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    {/* Botão OK Pago */}
                    <button
                      onClick={() => {
                        const newPaid = !billsPaid[f.billKey];
                        setBillsPaid(prev => ({ ...prev, [f.billKey]: newPaid }));
                        saveBillMut.mutate({
                          year, month, billKey: f.billKey,
                          amount: billData ? String(parseNum(billData.amount)) : billsValues[f.billKey] || "0",
                          paid: newPaid,
                          paidDate: newPaid ? new Date().toISOString().split('T')[0] : undefined,
                        });
                      }}
                      title={billsPaid[f.billKey] ? "Marcar como não pago" : "Marcar como pago"}
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        billsPaid[f.billKey]
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "border-2 border-dashed border-muted-foreground/30 text-muted-foreground/40 hover:border-emerald-400 hover:text-emerald-500"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <BillMetaPopover
                      billKey={f.billKey} label={f.label}
                      obs={obs} dueDay={dueDay} category={cat} defaultCategory=""
                      onSave={(o, d, c) => handleBillMeta(f.billKey, o, d, c)}
                      categories={activeCategories}
                    />
                  </div>
                );
              })}
              {/* Auto-cartões */}
              {cardTotals && cardTotals.total > 0 && (
                <div className="flex items-center gap-2 pt-1 border-t border-dashed border-blue-200 dark:border-blue-800">
                  <span className="text-xs text-blue-600 dark:text-blue-400 w-36 flex-shrink-0 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Auto-Cartões
                  </span>
                  <span className="text-sm font-bold text-blue-600 text-right flex-1">{fmt(cardTotals.total)}</span>
                  <span className="w-3.5" />
                </div>
              )}
              {/* Lançamentos avulsos */}
              {(billEntries || []).filter(be => !sq || (be.billKey || "").toLowerCase().includes(sq)).length > 0 && (
                <div className="space-y-1 pt-1 border-t border-dashed border-orange-200 dark:border-orange-800">
                  {(billEntries || []).filter(be => !sq || (be.billKey || "").toLowerCase().includes(sq)).map(be => {
                    return (
                      <div key={be.id} className="flex items-center gap-2 group">
                        <span className="text-xs text-muted-foreground flex-1 truncate">{be.billKey}</span>
                        <span className="text-sm font-medium text-right flex-shrink-0">{fmt(parseNum(be.amount))}</span>
                        <button
                          onClick={() => setEditBillEntry({ id: be.id, description: be.billKey || "", amount: String(parseNum(be.amount)), paymentMethod: "pix_boleto", billDate: be.paidDate || "" })}
                          className="text-muted-foreground/40 hover:text-blue-500 transition-colors flex-shrink-0"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteBillEntry.mutate({ id: be.id })}
                          className="text-muted-foreground/40 hover:text-red-500 transition-colors flex-shrink-0"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Dialog de edição de lançamento avulso */}
              <Dialog open={!!editBillEntry} onOpenChange={open => { if (!open) setEditBillEntry(null); }}>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Editar Lançamento</DialogTitle>
                  </DialogHeader>
                  {editBillEntry && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <Label>Descrição</Label>
                        <Input
                          className="mt-1"
                          value={editBillEntry.description}
                          onChange={e => setEditBillEntry(f => f ? { ...f, description: e.target.value } : f)}
                        />
                      </div>
                      <div>
                        <Label>Valor (R$)</Label>
                        <Input
                          className="mt-1"
                          type="number"
                          step="0.01"
                          value={editBillEntry.amount}
                          onChange={e => setEditBillEntry(f => f ? { ...f, amount: e.target.value } : f)}
                        />
                      </div>
                      <div>
                        <Label>Forma de Pagamento</Label>
                        <Select value={editBillEntry.paymentMethod} onValueChange={v => setEditBillEntry(f => f ? { ...f, paymentMethod: v } : f)}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {activePaymentMethods.map(p => (
                              <SelectItem key={p.value} value={p.value}>{p.icon} {p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Vencimento (dia)</Label>
                        <Input
                          className="mt-1"
                          type="number"
                          min="1" max="31"
                          placeholder="Ex: 15"
                          value={editBillEntry.billDate}
                          onChange={e => setEditBillEntry(f => f ? { ...f, billDate: e.target.value } : f)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => updateBillEntryMutation.mutate({ id: editBillEntry.id, description: editBillEntry.description, amount: editBillEntry.amount, paymentMethod: editBillEntry.paymentMethod, billDate: editBillEntry.billDate || undefined })}
                          disabled={updateBillEntryMutation.isPending}
                        >
                          {updateBillEntryMutation.isPending ? "Salvando..." : "Salvar"}
                        </Button>
                        <Button variant="outline" onClick={() => setEditBillEntry(null)}>Cancelar</Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              {/* Formulário de novo lançamento */}
              {showAddBillEntry ? (
                <div className="space-y-2 pt-2 border-t border-dashed border-green-200 dark:border-green-800">
                  <Input
                    placeholder="Descrição (ex: IPVA, Plano de Saúde...)"
                    value={newBillDesc} onChange={e => setNewBillDesc(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <div className="flex gap-2">
                    <CurrencyInput value={newBillAmount} onChange={setNewBillAmount} placeholder="Valor" />
                    <Input
                      type="date" value={newBillDate} onChange={e => setNewBillDate(e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                  </div>
                  <Select value={newBillPayment} onValueChange={setNewBillPayment}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {activePaymentMethods.map(p => (
                        <SelectItem key={p.value} value={p.value} className="text-xs">{p.icon} {p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-8 text-xs" disabled={!newBillDesc || !newBillAmount || addBillEntry.isPending}
                      onClick={() => addBillEntry.mutate({ year, month, description: newBillDesc, amount: newBillAmount, paymentMethod: newBillPayment, billDate: newBillDate || undefined })}
                    >
                      <Save className="w-3 h-3 mr-1" /> Salvar
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowAddBillEntry(false)}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="outline" className="w-full h-8 text-xs mt-1" onClick={() => setShowAddBillEntry(true)}>
                  <Plus className="w-3 h-3 mr-1" /> Adicionar lançamento
                </Button>
              )}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <span className="text-sm font-semibold w-36">TOTAL CONTAS</span>
                <span className="text-sm font-bold text-red-600 text-right flex-1">{fmt(totalBills)}</span>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* DESPESAS POR CATEGORIA */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base flex items-center gap-2 flex-1">
                <Wallet className="w-4 h-4 text-blue-500" />
                Despesas por Categoria
              </CardTitle>
              {/* Filtro por categoria */}
              <div className="flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5 text-muted-foreground" />
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-7 text-xs w-36">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">Todas categorias</SelectItem>
                    {activeCategories.sort().map(cat => (
                      <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Botão gráfico */}
              <Button
                size="sm" variant={showCategoryChart ? "default" : "outline"}
                className="h-7 text-xs px-2"
                onClick={() => setShowCategoryChart(v => !v)}
                title="Gráfico por categoria"
              >
                <BarChart2 className="w-3.5 h-3.5" />
              </Button>
              {/* Filtro por vínculo */}
              {familyMembers && familyMembers.length > 0 && (
                <div className="flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <div className="flex gap-1 flex-wrap">
                    <button
                      onClick={() => setFilterMemberId("all")}
                      className={`px-2 py-1 rounded-full text-xs font-medium border transition-all ${
                        filterMemberId === "all"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >Todos</button>
                    {familyMembers.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setFilterMemberId(filterMemberId === m.id ? "all" : m.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-all`}
                        style={filterMemberId === m.id
                          ? { backgroundColor: m.color, borderColor: m.color, color: "white" }
                          : {}}
                      >
                        <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: m.color }}>{m.name.charAt(0)}</span>
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Filtro 50/30/20 */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilterGroup(filterGroup === "essenciais" ? "all" : "essenciais")}
                  className={`px-2 py-1 rounded-full text-xs font-medium border transition-all ${
                    filterGroup === "essenciais"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
                  }`}
                >50% Essencial</button>
                <button
                  onClick={() => setFilterGroup(filterGroup === "estilo" ? "all" : "estilo")}
                  className={`px-2 py-1 rounded-full text-xs font-medium border transition-all ${
                    filterGroup === "estilo"
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800"
                  }`}
                >30% Estilo</button>
                <button
                  onClick={() => setFilterGroup(filterGroup === "investimentos" ? "all" : "investimentos")}
                  className={`px-2 py-1 rounded-full text-xs font-medium border transition-all ${
                    filterGroup === "investimentos"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                  }`}
                >20% Invest.</button>
              </div>
              <Button size="sm" variant="outline" className="h-8" onClick={handleExportExcel}>
                <FileDown className="w-4 h-4 mr-1" /> Excel
              </Button>
              <Dialog open={expDialogOpen} onOpenChange={setExpDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8">
                    <Plus className="w-4 h-4 mr-1" /> Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nova Despesa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Categoria</Label>
                        <Select value={newExpCategory} onValueChange={setNewExpCategory}>
                          <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {activeCategories.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Data da Despesa</Label>
                        <Input
                          type="date" className="mt-1 h-8 text-xs"
                          value={newExpDate} onChange={e => setNewExpDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Descrição</Label>
                      <Input
                        className="mt-1 h-8 text-xs"
                        value={newExpDesc} onChange={e => setNewExpDesc(e.target.value)}
                        placeholder="Ex: Supermercado Extra"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Valor da Parcela (R$)</Label>
                        <Input
                          className="mt-1 h-8 text-xs" type="number" step="0.01" min="0"
                          value={newExpAmount} onChange={e => setNewExpAmount(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Total de Parcelas</Label>
                        <Input
                          className="mt-1 h-8 text-xs" type="number" min="1" max="360"
                          value={newExpInstallments}
                          onChange={e => { setNewExpInstallments(e.target.value); if (parseInt(e.target.value) <= 1) setNewExpCurrentInstallment("1"); }}
                          placeholder="1 = à vista"
                          disabled={newExpIsRecurring}
                        />
                      </div>
                    </div>
                    {!newExpIsRecurring && parseInt(newExpInstallments) > 1 && (
                      <div>
                        <Label className="text-xs">Parcela Atual <span className="text-muted-foreground font-normal">(já está na parcela X de {newExpInstallments}?)</span></Label>
                        <Input
                          className="mt-1 h-8 text-xs" type="number" min="1" max={newExpInstallments}
                          value={newExpCurrentInstallment} onChange={e => setNewExpCurrentInstallment(e.target.value)}
                          placeholder={`1 a ${newExpInstallments}`}
                        />
                        {parseInt(newExpCurrentInstallment) > 1 && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            O sistema calculará que a 1ª parcela foi em {(() => {
                              const offset = (parseInt(newExpCurrentInstallment) || 1) - 1;
                              const d = new Date(year, month - 1 - offset, 1);
                              return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                            })()}
                          </p>
                        )}
                      </div>
                    )}
                    <div>
                      <Label className="text-xs">Forma de Pagamento</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {activePaymentMethods.map(p => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setNewExpPayment(p.value)}
                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded border text-xs font-medium transition-all ${
                              newExpPayment === p.value
                                ? `${p.color} ring-2 ring-offset-1 ring-current`
                                : "border-border text-muted-foreground hover:border-current"
                            }`}
                          >
                            <span>{p.icon}</span>
                            <span className="truncate">{p.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Observação (opcional)</Label>
                      <Textarea
                        className="mt-1 text-xs resize-none" rows={2}
                        value={newExpObs} onChange={e => setNewExpObs(e.target.value)}
                        placeholder="Anotações livres..."
                      />
                    </div>
                    {familyMembers && familyMembers.length > 0 && (
                      <div>
                        <Label className="text-xs">Vínculo (opcional)</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => setNewExpMemberId(null)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              newExpMemberId === null
                                ? "bg-muted border-primary text-primary ring-1 ring-primary"
                                : "bg-muted/40 border-border text-muted-foreground hover:border-primary/50"
                            }`}
                          >
                            Geral
                          </button>
                          {familyMembers.map(m => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setNewExpMemberId(m.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                newExpMemberId === m.id
                                  ? "ring-1 ring-offset-1 text-white"
                                  : "bg-muted/40 border-border text-muted-foreground hover:border-primary/50"
                              }`}
                              style={newExpMemberId === m.id ? { backgroundColor: m.color, borderColor: m.color } : {}}
                            >
                              <span
                                className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                                style={{ backgroundColor: m.color }}
                              >
                                {m.name.charAt(0).toUpperCase()}
                              </span>
                              {m.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Toggle Recorrente */}
                    <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-xs font-medium">Despesa Recorrente</p>
                          <p className="text-[10px] text-muted-foreground">Aparece automaticamente em todos os meses</p>
                        </div>
                      </div>
                      <Switch
                        checked={newExpIsRecurring}
                        onCheckedChange={(v) => { setNewExpIsRecurring(v); if (v) setNewExpInstallments("1"); }}
                      />
                    </div>
                    {!newExpIsRecurring && parseInt(newExpInstallments) > 1 && (
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-2 text-xs text-blue-700 dark:text-blue-400 flex items-start gap-2">
                        <Layers className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>
                          Parcelado <strong>{parseInt(newExpCurrentInstallment) || 1}/{newExpInstallments}</strong> — parcela de <strong>{fmt(parseFloat(newExpAmount || "0"))}</strong>.
                          Aparecerá na <strong>aba Parcelados</strong> e no Orçamento de cada mês.
                        </span>
                      </div>
                    )}
                    {newExpIsRecurring && (
                      <div className="bg-green-50 dark:bg-green-950/30 rounded p-2 text-xs text-green-700 dark:text-green-400 flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          Esta despesa será lançada como <strong>recorrente</strong> e aparecerá automaticamente
                          em todos os meses a partir de <strong>{MONTHS_FULL[month - 1]}/{year}</strong>.
                        </span>
                      </div>
                    )}
                    <Button
                      className="w-full"
                      onClick={handleAddExpense}
                      disabled={(newExpIsRecurring || parseInt(newExpInstallments) > 1 ? addInstallmentFromExpense.isPending : addExpense.isPending) || !newExpDesc.trim() || !newExpAmount}
                    >
                      {newExpIsRecurring
                        ? "Adicionar Recorrente"
                        : parseInt(newExpInstallments) > 1
                          ? `Adicionar Parcelado (${parseInt(newExpCurrentInstallment) || 1}/${newExpInstallments})`
                          : "Adicionar Despesa"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Gráfico de distribuição por categoria */}
            {showCategoryChart && (expenses || []).length > 0 && (() => {
              const chartData = Object.entries(
                (expenses || []).reduce((acc, e) => {
                  acc[e.category] = (acc[e.category] || 0) + parseNum(e.amount);
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1])
                .map(([name, value]) => ({ name, value }));
              const COLORS = [
                "#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6","#8b5cf6",
                "#ec4899","#14b8a6","#f97316","#84cc16","#06b6d4","#a855f7",
              ];
              return (
                <div className="mb-4 pb-4 border-b border-border">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Distribuição por Categoria</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%" cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number) => [fmt(v), "Total"]}
                        contentStyle={{ fontSize: 12 }}
                      />
                      <Legend
                        formatter={(value, entry) => {
                          const v = (entry as { payload?: { value?: number } })?.payload?.value ?? 0;
                          return `${value}: ${fmt(v)}`;
                        }}
                        wrapperStyle={{ fontSize: 11 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}
            {(expenses || []).length === 0 && monthInstallments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhuma despesa lançada neste mês. Clique em "Adicionar" para começar.
              </p>
            ) : (
              <div className="space-y-0.5">
                {(expenses || []).filter(e =>
                  (filterMemberId === "all" || e.memberId === filterMemberId) &&
                  (filterCategory === "all" || e.category === filterCategory) &&
                  (filterGroup === "all" || (() => {
                    const rule = activeCategoryRules[e.category || ""] || "";
                    if (filterGroup === "essenciais") return rule === "Essenciais (50%)";
                    if (filterGroup === "estilo") return rule === "Estilo de Vida (30%)";
                    if (filterGroup === "investimentos") return rule === "Investimentos/Dívidas (20%)";
                    return true;
                  })()) &&
                  (!sq || (e.description || "").toLowerCase().includes(sq) || (e.category || "").toLowerCase().includes(sq))
                ).map(e => {
                  const pm = e.paymentMethod ? (activePaymentMap[e.paymentMethod] || PAYMENT_MAP[e.paymentMethod] || null) : null;
                  const cardEntry = isCard(e.paymentMethod);
                  return (
                    <div
                      key={e.id}
                      className={`flex items-center gap-2 py-2 border-b border-border/50 last:border-0 ${cardEntry ? "bg-blue-50/30 dark:bg-blue-950/10" : ""}`}
                    >
                      {/* Avatar do vínculo */}
                      {(() => {
                        const member = familyMembers?.find(m => m.id === e.memberId);
                        return member ? (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                            style={{ backgroundColor: member.color }}
                            title={member.name}
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        ) : null;
                      })()}
                      <Badge variant="outline" className="text-xs flex-shrink-0 hidden sm:flex">{e.category}</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{e.description}</p>
                        {(e.expenseDate || e.obs) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {e.expenseDate && <span>{new Date(e.expenseDate).toLocaleDateString("pt-BR")}</span>}
                            {e.expenseDate && e.obs && <span> · </span>}
                            {e.obs && <span>{e.obs}</span>}
                          </p>
                        )}
                      </div>
                      {/* Forma de pagamento */}
                      {pm && (
                        <span className={`hidden sm:flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border flex-shrink-0 ${pm.color}`}>
                          {pm.icon} <span className="hidden md:inline">{pm.label}</span>
                        </span>
                      )}
                      {/* Parcela badge */}
                      {e.installmentTotal && e.installmentTotal > 1 && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {e.installmentNumber}/{e.installmentTotal}
                        </span>
                      )}
                      <span className="text-sm font-medium text-red-600 flex-shrink-0">{fmt(parseNum(e.amount))}</span>
                      <button
                        onClick={() => {
                          setEditingExp({
                            id: e.id,
                            category: e.category || "",
                            description: e.description || "",
                            amount: String(parseNum(e.amount)),
                            expenseDate: e.expenseDate ? String(e.expenseDate).slice(0, 10) : "",
                            obs: e.obs || "",
                            paymentMethod: e.paymentMethod || "",
                            memberId: e.memberId ?? null,
                            installmentTotal: e.installmentTotal,
                            installmentNumber: e.installmentNumber,
                          });
                          setEditExpDialogOpen(true);
                        }}
                        className="text-muted-foreground hover:text-blue-500 transition-colors flex-shrink-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (e.installmentTotal && e.installmentTotal > 1) {
                            if (confirm(`Apagar apenas esta parcela ou todas as ${e.installmentTotal} parcelas?`)) {
                              deleteExpense.mutate({ id: e.id, deleteGroup: true });
                            } else {
                              deleteExpense.mutate({ id: e.id, deleteGroup: false });
                            }
                          } else {
                            deleteExpense.mutate({ id: e.id, deleteGroup: false });
                          }
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-2 font-semibold">
                  <span className="text-sm">
                    {isFiltered ? (
                      <span className="flex items-center gap-1">
                        Total Filtrado
                        <span className="text-xs font-normal text-muted-foreground">(de {fmt(totalExpenses)})</span>
                      </span>
                    ) : "Total Despesas"}
                  </span>
                  <span className="text-sm text-red-600">{fmt(isFiltered ? totalExpensesFiltered : totalExpenses)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PARCELADOS DO MÊS (installment_bills) */}
        {monthInstallments.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Parcelas do Mês (Contas Parceladas)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {monthInstallments.map(inst => {
                  const installNum = (year - inst.startYear) * 12 + (month - inst.startMonth) + 1;
                  const isLastInstallment = !Boolean((inst as any).isRecurring) && installNum === inst.totalInstallments;
                  const paidKey = `${year}-${month}`;
                  let paidMap: Record<string, boolean> = {};
                  try { paidMap = JSON.parse((inst as any).paidMonths || "{}"); } catch { paidMap = {}; }
                  const isPaidThisMonth = !!paidMap[paidKey];
                  return (
                    <div key={inst.id} className={`flex items-center gap-3 py-2 border-b border-border last:border-0 ${isLastInstallment ? "bg-amber-50/50 dark:bg-amber-950/10" : ""} ${isPaidThisMonth ? "opacity-60" : ""}`}>
                      <span className="text-sm flex-1">{inst.description}</span>
                      {(inst as any).isRecurring && <span className="text-xs text-green-600 font-medium flex items-center gap-0.5"><RefreshCw className="w-3 h-3" /> Recorrente</span>}
                      {isLastInstallment && <span className="text-xs text-amber-600 font-medium">Última parcela</span>}
                      {!(inst as any).isRecurring && <span className="text-xs text-muted-foreground">{installNum}/{inst.totalInstallments}</span>}
                      {editingInstId === inst.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            autoFocus
                            type="text"
                            className="text-sm border rounded px-1 py-0.5 w-24 text-right"
                            value={editingInstAmount}
                            onChange={e => setEditingInstAmount(e.target.value.replace(/[^0-9,.]/g, ""))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const amt = parseFloat(editingInstAmount.replace(",", ".")) || 0;
                                updateInstallmentAmount.mutate({ id: inst.id, installmentAmount: String(amt) });
                              }
                              if (e.key === 'Escape') setEditingInstId(null);
                            }}
                          />
                          <button onClick={() => { const amt = parseFloat(editingInstAmount.replace(",", ".")) || 0; updateInstallmentAmount.mutate({ id: inst.id, installmentAmount: String(amt) }); }} className="text-emerald-600 hover:text-emerald-700"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingInstId(null)} className="text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-orange-600">{fmt(parseNum(inst.installmentAmount))}</span>
                      )}
                      <button
                        onClick={() => { setEditingInstId(inst.id); setEditingInstAmount(String(parseNum(inst.installmentAmount))); }}
                        className="text-muted-foreground/40 hover:text-blue-500 transition-colors flex-shrink-0"
                        title="Editar valor neste mês"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleInstPaidMonth.mutate({ id: inst.id, year, month })}
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isPaidThisMonth
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-muted-foreground/30 hover:border-emerald-400"
                        }`}
                        title={isPaidThisMonth ? "Desmarcar" : "Marcar como descontado"}
                      >
                        {isPaidThisMonth && <Check className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remover "${inst.description}" da aba Parcelados? Isso apagará todos os meses.`)) {
                            deleteInstallmentFromMonth.mutate({ id: inst.id });
                          }
                        }}
                        className="text-muted-foreground/40 hover:text-destructive transition-colors flex-shrink-0"
                        title="Remover parcelado"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-2 font-semibold">
                  <span className="text-sm">Total Parcelados</span>
                  <span className="text-sm text-orange-600">{fmt(totalInstallments)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* RESUMO POR CATEGORIA (Regra 50/30/20) */}
        {(() => {
          // Monta lista unificada de todos os itens para cada grupo
          type GroupItem = { key: string; label: string; category: string; amount: number; type: "conta" | "despesa" | "parcelado" | "lancamento" };
          const buildGroupItems = (groupKey: "essenciais" | "estilo" | "investimentos"): GroupItem[] => {
            const ruleMatch = groupKey === "essenciais" ? "Essenciais (50%)" : groupKey === "estilo" ? "Estilo de Vida (30%)" : "Investimentos/Dívidas (20%)";
            const items: GroupItem[] = [];
            // Contas fixas (exceto "cartoes" que é duplicata dos parcelados)
            FIXED_BILLS_FIELDS.forEach(f => {
              if (f.key === "cartoes") return;
              const val = parseNum(billsValues[f.key]);
              if (val <= 0) return;
              const cat = billsCategory[f.key] || f.defaultCategory;
              if (activeCategoryRules[cat] !== ruleMatch) return;
              const label = billsLabels[f.key] || (fixedBillLabels || []).find(l => l.billKey === f.key)?.label || f.label;
              items.push({ key: `conta-${f.key}`, label, category: cat, amount: val, type: "conta" });
            });
            // Lançamentos avulsos (billEntries) — sem categoria, usa padrão Essencial
            if (groupKey === "essenciais") {
              (billEntries || []).forEach(be => {
                items.push({ key: `be-${be.id}`, label: be.billKey || "Lançamento", category: "—", amount: parseNum(be.amount), type: "lancamento" });
              });
            }
            // Despesas avulsas
            (expenses || []).forEach(e => {
              const rule = activeCategoryRules[e.category || ""] || "";
              if (rule !== ruleMatch) return;
              items.push({ key: `exp-${e.id}`, label: e.description || e.category, category: e.category, amount: parseNum(e.amount), type: "despesa" });
            });
            // Parcelados
            monthInstallments.forEach(inst => {
              const rule = activeCategoryRules[inst.category || ""] || "";
              if (rule !== ruleMatch) return;
              const installNum = (year - inst.startYear) * 12 + (month - inst.startMonth) + 1;
              const suffix = (inst as any).isRecurring ? " (Recorrente)" : ` (${installNum}/${inst.totalInstallments})`;
              items.push({ key: `inst-${inst.id}`, label: inst.description + suffix, category: inst.category || "Parcelados", amount: parseNum(inst.installmentAmount), type: "parcelado" });
            });
            return items;
          };

          const groups = [
            { key: "essenciais" as const, label: "Essenciais (50%)", total: groupTotals.essenciais, color: "blue" },
            { key: "estilo" as const, label: "Estilo de Vida (30%)", total: groupTotals.estiloVida, color: "purple" },
            { key: "investimentos" as const, label: "Investimentos/Dívidas (20%)", total: groupTotals.investimentos, color: "emerald" },
          ];

          const [openGroup, setOpenGroup] = useState<string | null>(null);

          const colorMap: Record<string, { card: string; badge: string; text: string; border: string; typeBadge: Record<string, string> }> = {
            blue: {
              card: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/50",
              badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
              text: "text-blue-700 dark:text-blue-400",
              border: "border-blue-200 dark:border-blue-800",
              typeBadge: { conta: "bg-red-100 text-red-700", despesa: "bg-orange-100 text-orange-700", parcelado: "bg-amber-100 text-amber-700", lancamento: "bg-gray-100 text-gray-600" },
            },
            purple: {
              card: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-950/50",
              badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
              text: "text-purple-700 dark:text-purple-400",
              border: "border-purple-200 dark:border-purple-800",
              typeBadge: { conta: "bg-red-100 text-red-700", despesa: "bg-orange-100 text-orange-700", parcelado: "bg-amber-100 text-amber-700", lancamento: "bg-gray-100 text-gray-600" },
            },
            emerald: {
              card: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/50",
              badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
              text: "text-emerald-700 dark:text-emerald-400",
              border: "border-emerald-200 dark:border-emerald-800",
              typeBadge: { conta: "bg-red-100 text-red-700", despesa: "bg-orange-100 text-orange-700", parcelado: "bg-amber-100 text-amber-700", lancamento: "bg-gray-100 text-gray-600" },
            },
          };

          const typeLabel: Record<string, string> = { conta: "Conta Fixa", despesa: "Despesa", parcelado: "Parcelado", lancamento: "Lançamento" };

          return (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Resumo por Categoria (Regra 50/30/20)</CardTitle>
                <p className="text-xs text-muted-foreground">Clique em um grupo para ver todos os itens cadastrados nele.</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {groups.map(g => {
                  const c = colorMap[g.color];
                  const isOpen = openGroup === g.key;
                  const items = isOpen ? buildGroupItems(g.key) : [];
                  return (
                    <div key={g.key} className={`rounded-lg border transition-all ${c.card}`}>
                      {/* Header clicável */}
                      <button
                        className="w-full flex items-center justify-between p-3 text-left"
                        onClick={() => setOpenGroup(isOpen ? null : g.key)}
                      >
                        <div>
                          <p className={`text-sm font-semibold ${c.text}`}>{g.label}</p>
                          {totalIncome > 0 && (
                            <p className={`text-xs ${c.text} opacity-70`}>{((g.total / totalIncome) * 100).toFixed(1)}% da renda</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${c.text}`}>{fmt(g.total)}</span>
                          <ChevronDown className={`w-4 h-4 ${c.text} transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </div>
                      </button>
                      {/* Lista de itens */}
                      {isOpen && (
                        <div className={`border-t ${c.border} divide-y divide-border/40`}>
                          {items.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">Nenhum item neste grupo neste mês.</p>
                          ) : (
                            items.map(item => (
                              <div key={item.key} className="flex items-center gap-2 px-3 py-2">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${c.typeBadge[item.type]}`}>{typeLabel[item.type]}</span>
                                <span className="text-xs flex-shrink-0 text-muted-foreground hidden sm:inline">{item.category}</span>
                                <span className="text-sm flex-1 truncate">{item.label}</span>
                                <span className="text-sm font-semibold flex-shrink-0">{fmt(item.amount)}</span>
                              </div>
                            ))
                          )}
                          <div className={`flex items-center justify-between px-3 py-2 font-semibold ${c.text}`}>
                            <span className="text-xs">Total {g.label}</span>
                            <span className="text-sm">{fmt(g.total)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })()}
      </div>

      {/* Dialog de Edição de Despesa */}
      <Dialog open={editExpDialogOpen} onOpenChange={open => { setEditExpDialogOpen(open); if (!open) setEditingExp(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Despesa{editingExp?.installmentTotal && editingExp.installmentTotal > 1 ? ` (${editingExp.installmentNumber}/${editingExp.installmentTotal})` : ""}</DialogTitle>
          </DialogHeader>
          {editingExp && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Categoria</Label>
                  <Select value={editingExp.category} onValueChange={v => setEditingExp(p => p ? {...p, category: v} : p)}>
                    <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {activeCategories.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Data da Despesa</Label>
                  <Input
                    type="date" className="mt-1 h-8 text-xs"
                    value={editingExp.expenseDate}
                    onChange={e => setEditingExp(p => p ? {...p, expenseDate: e.target.value} : p)}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Descrição</Label>
                <Input
                  className="mt-1 h-8 text-xs"
                  value={editingExp.description}
                  onChange={e => setEditingExp(p => p ? {...p, description: e.target.value} : p)}
                  placeholder="Descrição da despesa"
                />
              </div>
              <div>
                <Label className="text-xs">Valor (R$)</Label>
                <CurrencyInput
                  value={editingExp.amount}
                  onChange={v => setEditingExp(p => p ? {...p, amount: v} : p)}
                />
              </div>
              <div>
                <Label className="text-xs">Forma de Pagamento</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {activePaymentMethods.map(pm => (
                    <button
                      key={pm.value}
                      type="button"
                      onClick={() => setEditingExp(p => p ? {...p, paymentMethod: pm.value} : p)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded border text-xs font-medium transition-all ${
                        editingExp.paymentMethod === pm.value
                          ? `${pm.color} ring-2 ring-offset-1 ring-current`
                          : "border-border text-muted-foreground hover:border-current"
                      }`}
                    >
                      <span>{pm.icon}</span>
                      <span className="truncate">{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Observação (opcional)</Label>
                <Textarea
                  className="mt-1 text-xs resize-none" rows={2}
                  value={editingExp.obs}
                  onChange={e => setEditingExp(p => p ? {...p, obs: e.target.value} : p)}
                  placeholder="Anotações livres..."
                />
              </div>
              {familyMembers && familyMembers.length > 0 && (
                <div>
                  <Label className="text-xs">Vínculo (opcional)</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setEditingExp(p => p ? {...p, memberId: null} : p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        editingExp.memberId === null
                          ? "bg-muted border-primary text-primary ring-1 ring-primary"
                          : "bg-muted/40 border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >Geral</button>
                    {familyMembers.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setEditingExp(p => p ? {...p, memberId: m.id} : p)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all`}
                        style={editingExp.memberId === m.id ? { backgroundColor: m.color, borderColor: m.color, color: "white" } : {}}
                      >
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: m.color }}>
                          {m.name.charAt(0).toUpperCase()}
                        </span>
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => { setEditExpDialogOpen(false); setEditingExp(null); }}>Cancelar</Button>
                <Button className="flex-1" onClick={handleEditExpense} disabled={updateExpense.isPending}>
                  {updateExpense.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
