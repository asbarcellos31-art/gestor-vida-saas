import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, CreditCard, CheckCircle2, Eraser, RefreshCw, Pencil, Users, CheckSquare, Square } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const parseNum = (v: string | null | undefined) => parseFloat(String(v || "0")) || 0;

const MONTHS_FULL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const CATEGORIES = [
  "Alimentação", "Assinaturas", "Beleza", "Cantina", "Combustível",
  "Compras Casa", "Condomínio", "Consórcio", "Dívidas", "Educação",
  "Farmácia", "Faxina", "Hobby", "Imposto", "Inglês", "Investimentos",
  "Lazer", "Luz/Água", "Manicure", "Moradia", "Outros", "Parcelados",
  "Pet", "Pilates", "Poupança", "Praia", "Remédio", "Reserva",
  "Roupas", "Saúde", "Seguro", "Streaming/Hobby", "Transporte",
];

const emptyForm = () => ({
  description: "",
  totalAmount: "",
  installmentAmount: "",
  totalInstallments: "12",
  currentInstallment: "1",
  startYear: String(new Date().getFullYear()),
  startMonth: String(new Date().getMonth() + 1),
  category: "Parcelados",
  paymentMethod: "itau_infinite",
  isRecurring: false,
  memberId: null as number | null,
});

export default function Installments() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkMemberId, setBulkMemberId] = useState<string>("none");
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    id: number;
    description: string;
    installmentAmount: string;
    totalInstallments: string;
    category: string;
    paymentMethod: string;
    isRecurring: boolean;
    memberId: number | null;
  } | null>(null);

  const utils = trpc.useUtils();
  const { data: installments, isLoading } = trpc.installments.list.useQuery();
  const { data: paymentMethodsData } = trpc.paymentMethods.list.useQuery();
  const { data: familyMembers } = trpc.members.list.useQuery();
  const cardOptions = (paymentMethodsData || []).map((p) => ({ value: p.key, label: p.label, isCard: p.isCard }));

  const addInstallment = trpc.installments.add.useMutation({
    onSuccess: () => {
      toast.success("Parcelado adicionado!");
      setDialogOpen(false);
      setForm(emptyForm());
      utils.installments.list.invalidate();
    },
    onError: () => toast.error("Erro ao adicionar parcelado"),
  });

  const updateInstallment = trpc.installments.update.useMutation({
    onSuccess: () => { toast.success("Atualizado!"); utils.installments.list.invalidate(); },
    onError: () => toast.error("Erro ao atualizar"),
  });

  const deleteInstallment = trpc.installments.delete.useMutation({
    onSuccess: () => { toast.success("Removido!"); utils.installments.list.invalidate(); },
    onError: () => toast.error("Erro ao remover"),
  });

  const bulkUpdateMember = trpc.installments.bulkUpdateMember.useMutation({
    onSuccess: (res) => {
      toast.success(`Vínculo atribuído para ${(res as any).updated} itens!`);
      setBulkDialogOpen(false);
      setBulkMode(false);
      setSelectedIds(new Set());
      utils.installments.list.invalidate();
    },
    onError: () => toast.error("Erro ao atribuir vínculo"),
  });

  const handleBulkAssign = () => {
    if (selectedIds.size === 0) { toast.error("Selecione ao menos um item"); return; }
    bulkUpdateMember.mutate({
      ids: Array.from(selectedIds),
      memberId: bulkMemberId === "none" ? null : parseInt(bulkMemberId),
    });
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = (items: typeof activeInstallments) => {
    setSelectedIds(new Set(items.map(i => i.id)));
  };

  const clearAllMutation = trpc.installments.clearAll.useMutation({
    onSuccess: () => {
      toast.success("Todos os parcelados foram removidos!");
      setClearAllDialogOpen(false);
      utils.installments.list.invalidate();
    },
    onError: () => toast.error("Erro ao limpar parcelados"),
  });

  const handleEdit = () => {
    if (!editForm) return;
    updateInstallment.mutate({
      id: editForm.id,
      description: editForm.description,
      installmentAmount: editForm.installmentAmount,
      totalInstallments: editForm.isRecurring ? 9999 : parseInt(editForm.totalInstallments),
      category: editForm.category,
      paymentMethod: editForm.paymentMethod,
      memberId: editForm.memberId,
    });
    setEditDialogOpen(false);
    setEditForm(null);
  };

  const handleAdd = () => {
    if (!form.description.trim() || !form.installmentAmount) return;
    addInstallment.mutate({
      description: form.description,
      totalAmount: form.totalAmount || form.installmentAmount,
      installmentAmount: form.installmentAmount,
      totalInstallments: form.isRecurring ? 9999 : (parseInt(form.totalInstallments) || 1),
      currentInstallment: form.isRecurring ? 1 : (parseInt(form.currentInstallment) || 1),
      startYear: parseInt(form.startYear),
      startMonth: parseInt(form.startMonth),
      category: form.category,
      paymentMethod: form.paymentMethod,
      isRecurring: form.isRecurring,
      memberId: form.memberId,
    });
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Recorrentes: aparecem sempre (sem data de fim)
  const recurringInstallments = (installments || []).filter(inst => inst.isRecurring && !inst.paid);

  // Parcelados ativos (não recorrentes, com data de fim)
  const activeInstallments = (installments || []).filter(inst => {
    if (inst.isRecurring) return false;
    const endDate = inst.startYear * 12 + inst.startMonth + inst.totalInstallments - 1;
    const curDate = currentYear * 12 + currentMonth;
    return curDate <= endDate && !inst.paid;
  });

  const completedInstallments = (installments || []).filter(inst => {
    if (inst.isRecurring) return false;
    const endDate = inst.startYear * 12 + inst.startMonth + inst.totalInstallments - 1;
    const curDate = currentYear * 12 + currentMonth;
    return curDate > endDate || inst.paid;
  });

  const totalMonthly = activeInstallments.reduce((s, i) => s + parseNum(i.installmentAmount), 0);
  const totalRecurring = recurringInstallments.reduce((s, i) => s + parseNum(i.installmentAmount), 0);

  const FormDialog = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" /> Novo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Parcelado / Recorrente</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          {/* Toggle recorrente */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30">
            <div>
              <p className="text-sm font-medium">Conta Recorrente</p>
              <p className="text-xs text-muted-foreground">Sem Parar, Netflix, Spotify, etc. — aparece todo mês</p>
            </div>
            <Switch
              checked={form.isRecurring}
              onCheckedChange={v => setForm(f => ({ ...f, isRecurring: v }))}
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Input
              className="mt-1"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder={form.isRecurring ? "Ex: Netflix, Sem Parar..." : "Ex: Notebook Dell 10x"}
            />
          </div>

          <div className={form.isRecurring ? "" : "grid grid-cols-2 gap-3"}>
            <div>
              <Label>Valor Mensal (R$)</Label>
              <Input
                className="mt-1"
                type="number"
                step="0.01"
                value={form.installmentAmount}
                onChange={e => setForm(f => ({ ...f, installmentAmount: e.target.value }))}
                placeholder="0,00"
              />
            </div>
            {!form.isRecurring && (
              <div>
                <Label>Total de Parcelas</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min="1"
                  value={form.totalInstallments}
                  onChange={e => setForm(f => ({ ...f, totalInstallments: e.target.value }))}
                />
              </div>
            )}
          </div>

          {!form.isRecurring && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Parcela Atual</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min="1"
                  value={form.currentInstallment}
                  onChange={e => setForm(f => ({ ...f, currentInstallment: e.target.value }))}
                />
              </div>
              <div>
                <Label>Mês de Início</Label>
                <Select value={form.startMonth} onValueChange={v => setForm(f => ({ ...f, startMonth: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS_FULL.map((m, i) => (
                      <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {!form.isRecurring && (
              <div>
                <Label>Ano de Início</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={form.startYear}
                  onChange={e => setForm(f => ({ ...f, startYear: e.target.value }))}
                />
              </div>
            )}
            <div className={form.isRecurring ? "col-span-2" : ""}>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Cartão de Crédito</Label>
            <Select value={form.paymentMethod} onValueChange={v => setForm(f => ({ ...f, paymentMethod: v }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cardOptions.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}{!p.isCard ? " (não é cartão)" : ""}</SelectItem>
                ))}
                {cardOptions.length === 0 && (
                  <>
                    <SelectItem value="itau_infinite">🔵 Itaú Azul Infinite</SelectItem>
                    <SelectItem value="c6_carbon">⚫ C6 Carbon</SelectItem>
                    <SelectItem value="pix_boleto">🟢 PIX / Boleto</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {(familyMembers || []).length > 0 && (
            <div>
              <Label>Vínculo Familiar</Label>
              <Select
                value={form.memberId ? String(form.memberId) : "none"}
                onValueChange={v => setForm(f => ({ ...f, memberId: v === "none" ? null : parseInt(v) }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Geral (sem vínculo)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Geral (sem vínculo)</SelectItem>
                  {(familyMembers || []).map((m: { id: number; name: string }) => (
                    <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleAdd}
            disabled={addInstallment.isPending || !form.description.trim() || !form.installmentAmount}
          >
            {form.isRecurring ? "Adicionar Conta Recorrente" : "Adicionar Parcelado"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <AppLayout title="Contas Parceladas">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Parcelados Ativos</p>
              <p className="text-2xl font-bold text-orange-600">{activeInstallments.length}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Recorrentes</p>
              <p className="text-2xl font-bold text-blue-600">{recurringInstallments.length}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Comprometimento Mensal</p>
              <p className="text-2xl font-bold text-red-600">{fmt(totalMonthly + totalRecurring)}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Concluídos</p>
              <p className="text-2xl font-bold text-emerald-600">{completedInstallments.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Dialog de confirmação: Limpar Todos */}
        <Dialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Eraser className="w-5 h-5" />
                Limpar todos os parcelados?
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground pt-2">
                Esta ação irá apagar <strong>todos os parcelados e recorrentes</strong> da lista.
                <br /><br />
                <span className="text-red-600 font-semibold">Esta ação não pode ser desfeita.</span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setClearAllDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => clearAllMutation.mutate()}
                disabled={clearAllMutation.isPending}
              >
                {clearAllMutation.isPending ? "Limpando..." : "Sim, apagar tudo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição */}
        {editForm && (
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Editar {editForm.isRecurring ? "Conta Recorrente" : "Parcelado"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div>
                  <Label>Descrição</Label>
                  <Input
                    className="mt-1"
                    value={editForm.description}
                    onChange={e => setEditForm(f => f ? ({ ...f, description: e.target.value }) : f)}
                  />
                </div>
                <div className={editForm.isRecurring ? "" : "grid grid-cols-2 gap-3"}>
                  <div>
                    <Label>Valor Mensal (R$)</Label>
                    <Input
                      className="mt-1"
                      type="number"
                      step="0.01"
                      value={editForm.installmentAmount}
                      onChange={e => setEditForm(f => f ? ({ ...f, installmentAmount: e.target.value }) : f)}
                    />
                  </div>
                  {!editForm.isRecurring && (
                    <div>
                      <Label>Total de Parcelas</Label>
                      <Input
                        className="mt-1"
                        type="number"
                        min="1"
                        value={editForm.totalInstallments}
                        onChange={e => setEditForm(f => f ? ({ ...f, totalInstallments: e.target.value }) : f)}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={editForm.category} onValueChange={v => setEditForm(f => f ? ({ ...f, category: v }) : f)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cartão de Crédito</Label>
                  <Select value={editForm.paymentMethod} onValueChange={v => setEditForm(f => f ? ({ ...f, paymentMethod: v }) : f)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cardOptions.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}{!p.isCard ? " (não é cartão)" : ""}</SelectItem>
                      ))}
                      {cardOptions.length === 0 && (
                        <>
                          <SelectItem value="itau_infinite">🔵 Itaú Azul Infinite</SelectItem>
                          <SelectItem value="c6_carbon">⚫ C6 Carbon</SelectItem>
                          <SelectItem value="pix_boleto">🟢 PIX / Boleto</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {(familyMembers || []).length > 0 && (
                  <div>
                    <Label>Vínculo Familiar</Label>
                    <Select
                      value={editForm.memberId ? String(editForm.memberId) : "none"}
                      onValueChange={v => setEditForm(f => f ? ({ ...f, memberId: v === "none" ? null : parseInt(v) }) : f)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Geral (sem vínculo)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Geral (sem vínculo)</SelectItem>
                        {(familyMembers || []).map((m: { id: number; name: string }) => (
                          <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleEdit} disabled={updateInstallment.isPending}>
                    {updateInstallment.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                  <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditForm(null); }}>Cancelar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Barra de modo em massa */}
        {bulkMode && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{selectedIds.size} selecionado(s)</span>
            <Button size="sm" variant="outline" onClick={() => selectAll([...recurringInstallments, ...activeInstallments])} className="text-xs">
              Selecionar Todos
            </Button>
            <Button size="sm" onClick={() => setBulkDialogOpen(true)} disabled={selectedIds.size === 0} className="text-xs">
              <Users className="w-3.5 h-3.5 mr-1" /> Atribuir Vínculo
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setBulkMode(false); setSelectedIds(new Set()); }} className="text-xs ml-auto">
              Cancelar
            </Button>
          </div>
        )}

        {/* Dialog de atribuição em massa */}
        <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atribuir Vínculo em Massa</DialogTitle>
              <DialogDescription>{selectedIds.size} item(s) selecionado(s)</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Label>Vínculo Familiar</Label>
              <Select value={bulkMemberId} onValueChange={setBulkMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o vínculo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Geral (sem vínculo)</SelectItem>
                  {(familyMembers || []).map((m: { id: number; name: string }) => (
                    <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" onClick={handleBulkAssign} disabled={bulkUpdateMember.isPending}>
                  {bulkUpdateMember.isPending ? "Salvando..." : "Confirmar"}
                </Button>
                <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Contas Recorrentes */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-500" />
                Contas Recorrentes
                <span className="text-xs text-muted-foreground font-normal">(todo mês)</span>
              </CardTitle>
              <div className="flex gap-2">
                {!bulkMode && (
                  <Button size="sm" variant="outline" onClick={() => setBulkMode(true)} className="text-xs">
                    <Users className="w-3.5 h-3.5 mr-1" /> Atribuir Vínculos
                  </Button>
                )}
                {FormDialog}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
            ) : recurringInstallments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma conta recorrente. Clique em "Novo" e ative "Conta Recorrente".
              </p>
            ) : (
              <div className="space-y-2">
                {recurringInstallments.map(inst => (
                  <div key={inst.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    {bulkMode && (
                      <Checkbox
                        checked={selectedIds.has(inst.id)}
                        onCheckedChange={() => toggleSelect(inst.id)}
                      />
                    )}
                    <RefreshCw className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="text-sm flex-1 font-medium">{inst.description}</span>
                    <Badge variant="outline" className="text-xs">{inst.category}</Badge>
                    <span className="text-sm font-semibold text-blue-600">{fmt(parseNum(inst.installmentAmount))}/mês</span>
                    <button
                      onClick={() => {
                        setEditForm({
                          id: inst.id,
                          description: inst.description || "",
                          installmentAmount: String(parseNum(inst.installmentAmount)),
                          totalInstallments: String(inst.totalInstallments),
                          category: inst.category || "Assinaturas",
                          paymentMethod: (inst as any).paymentMethod || "itau_infinite",
                          isRecurring: true,
                          memberId: (inst as any).memberId ?? null,
                        });
                        setEditDialogOpen(true);
                      }}
                      className="text-muted-foreground hover:text-blue-500 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteInstallment.mutate({ id: inst.id })}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-border font-semibold">
                  <span className="text-sm">Total Recorrentes</span>
                  <span className="text-sm text-blue-600">{fmt(totalRecurring)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Parcelados Ativos */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-500" />
                Parcelados Ativos
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:hover:bg-red-950/30"
                onClick={() => setClearAllDialogOpen(true)}
              >
                <Eraser className="w-3.5 h-3.5 mr-1.5" />
                Limpar Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
            ) : activeInstallments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum parcelado ativo. Clique em "Novo" para adicionar.
              </p>
            ) : (
              <div className="space-y-2">
                {activeInstallments.map(inst => {
                  const curInstallNum = (currentYear - inst.startYear) * 12 + (currentMonth - inst.startMonth) + 1;
                  const progress = Math.min(100, (curInstallNum / inst.totalInstallments) * 100);
                  const endYear = inst.startYear + Math.floor((inst.startMonth + inst.totalInstallments - 2) / 12);
                  const endMonthIdx = (inst.startMonth + inst.totalInstallments - 2) % 12;
                  return (
                    <div key={inst.id} className="border border-border rounded-lg p-3 hover:bg-muted/20 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        {bulkMode && (
                          <Checkbox
                            checked={selectedIds.has(inst.id)}
                            onCheckedChange={() => toggleSelect(inst.id)}
                            className="mt-0.5"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">{inst.description}</span>
                            <Badge variant="outline" className="text-xs flex-shrink-0">{inst.category}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="font-semibold text-orange-600">{fmt(parseNum(inst.installmentAmount))}/mês</span>
                            <span>{curInstallNum}/{inst.totalInstallments} parcelas</span>
                            <span>Até {MONTHS_FULL[endMonthIdx]}/{endYear}</span>
                          </div>
                          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => updateInstallment.mutate({ id: inst.id, paid: true })}
                            className="text-muted-foreground hover:text-emerald-600 transition-colors p-1"
                            title="Marcar como pago"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                            setEditForm({
                              id: inst.id,
                              description: inst.description || "",
                              installmentAmount: String(parseNum(inst.installmentAmount)),
                              totalInstallments: String(inst.totalInstallments),
                              category: inst.category || "Parcelados",
                              paymentMethod: (inst as any).paymentMethod || "itau_infinite",
                              isRecurring: false,
                              memberId: (inst as any).memberId ?? null,
                            });
                              setEditDialogOpen(true);
                            }}
                            className="text-muted-foreground hover:text-blue-500 transition-colors p-1"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteInstallment.mutate({ id: inst.id })}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-2 border-t border-border font-semibold">
                  <span className="text-sm">Total Mensal Parcelados</span>
                  <span className="text-sm text-orange-600">{fmt(totalMonthly)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed */}
        {completedInstallments.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Concluídos / Quitados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {completedInstallments.map(inst => (
                  <div key={inst.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0 opacity-60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm flex-1 line-through">{inst.description}</span>
                    <span className="text-xs text-muted-foreground">{inst.totalInstallments}x {fmt(parseNum(inst.installmentAmount))}</span>
                    <button
                      onClick={() => deleteInstallment.mutate({ id: inst.id })}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
