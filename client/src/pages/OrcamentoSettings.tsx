import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Tag, CreditCard, Settings2, Users } from "lucide-react";

const RULES = [
  "Essenciais (50%)",
  "Estilo de Vida (30%)",
  "Investimentos/Dívidas (20%)",
] as const;

const RULE_COLORS: Record<string, string> = {
  "Essenciais (50%)": "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400",
  "Estilo de Vida (30%)": "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400",
  "Investimentos/Dívidas (20%)": "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const COLOR_PRESETS = [
  { label: "Cinza (padrão)", value: "bg-muted/50 text-foreground/90 border-border", preview: "bg-muted/50 text-foreground/90" },
  { label: "Azul (Itaú)", value: "bg-blue-100 text-blue-800 border-blue-400", preview: "bg-blue-100 text-blue-800" },
  { label: "Preto (C6)", value: "bg-zinc-800 text-zinc-100 border-zinc-600", preview: "bg-zinc-800 text-zinc-100" },
  { label: "Amarelo (XP)", value: "bg-yellow-100 text-yellow-800 border-yellow-400", preview: "bg-yellow-100 text-yellow-800" },
  { label: "Verde", value: "bg-emerald-100 text-emerald-800 border-emerald-400", preview: "bg-emerald-100 text-emerald-800" },
  { label: "Roxo", value: "bg-purple-100 text-purple-800 border-purple-400", preview: "bg-purple-100 text-purple-800" },
  { label: "Vermelho", value: "bg-red-100 text-red-800 border-red-400", preview: "bg-red-100 text-red-800" },
  { label: "Laranja", value: "bg-orange-100 text-orange-800 border-orange-400", preview: "bg-orange-100 text-orange-800" },
];

// ── Category Form ─────────────────────────────────────────────────────────────
function CategoryForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: { id?: number; name: string; rule: string };
  onSave: (name: string, rule: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [rule, setRule] = useState<string>(initial?.rule || RULES[0]);

  return (
    <div className="space-y-4 pt-2">
      <div>
        <Label className="text-sm">Nome da Categoria</Label>
        <Input
          className="mt-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Streaming, Academia, Pets..."
          autoFocus
        />
      </div>
      <div>
        <Label className="text-sm">Grupo (Regra 50/30/20)</Label>
        <Select value={rule} onValueChange={setRule}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RULES.map((r) => (
              <SelectItem key={r} value={r}>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${RULE_COLORS[r]}`}>{r}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
        <Button
          className="flex-1"
          disabled={!name.trim()}
          onClick={() => { onSave(name.trim(), rule); onClose(); }}
        >
          {initial?.id ? "Salvar Alterações" : "Adicionar Categoria"}
        </Button>
      </div>
    </div>
  );
}

// ── Payment Method Form ───────────────────────────────────────────────────────
function PaymentMethodForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: { id?: number; key: string; label: string; icon: string; colorClass: string; isCard: boolean; sortOrder: number };
  onSave: (data: { key: string; label: string; icon: string; colorClass: string; isCard: boolean; sortOrder: number }) => void;
  onClose: () => void;
}) {
  const isEdit = !!initial?.id;
  const [key, setKey] = useState(initial?.key || "");
  const [label, setLabel] = useState(initial?.label || "");
  const [icon, setIcon] = useState(initial?.icon || "💳");
  const [colorClass, setColorClass] = useState(initial?.colorClass || COLOR_PRESETS[0].value);
  const [isCard, setIsCard] = useState(initial?.isCard || false);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder || 0);

  // Auto-gerar key a partir do label
  const handleLabelChange = (v: string) => {
    setLabel(v);
    if (!isEdit) {
      setKey(v.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 64));
    }
  };

  const selectedPreset = COLOR_PRESETS.find((p) => p.value === colorClass);

  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm">Nome exibido</Label>
          <Input
            className="mt-1"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Ex: Nubank, Bradesco..."
            autoFocus
          />
        </div>
        <div>
          <Label className="text-sm">Ícone (emoji)</Label>
          <Input
            className="mt-1"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="💳"
            maxLength={4}
          />
        </div>
      </div>
      {!isEdit && (
        <div>
          <Label className="text-sm">Identificador (automático)</Label>
          <Input
            className="mt-1 text-xs text-muted-foreground"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="ex: nubank"
          />
          <p className="text-xs text-muted-foreground mt-1">Usado internamente para identificar a forma de pagamento.</p>
        </div>
      )}
      <div>
        <Label className="text-sm">Cor</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {COLOR_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setColorClass(p.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-medium transition-all ${p.preview} ${
                colorClass === p.value ? "ring-2 ring-offset-1 ring-current" : "opacity-70 hover:opacity-100"
              }`}
            >
              {colorClass === p.value && <span>✓</span>}
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-sm">Ordem de exibição</Label>
        <Input
          className="mt-1 w-24"
          type="number"
          min="0"
          value={sortOrder}
          onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
        />
      </div>
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        <Switch checked={isCard} onCheckedChange={setIsCard} id="isCard" />
        <div>
          <Label htmlFor="isCard" className="text-sm font-medium cursor-pointer">É um cartão de crédito?</Label>
          <p className="text-xs text-muted-foreground">Ativado: despesas nesta forma somam no total de cartões das Contas a Pagar.</p>
        </div>
      </div>
      {/* Preview */}
      <div className="p-3 rounded-lg bg-muted/30">
        <p className="text-xs text-muted-foreground mb-2">Pré-visualização:</p>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${colorClass}`}>
          {icon} {label || "Nome do cartão"}
          {isCard && <span className="ml-1 text-xs opacity-70">(cartão)</span>}
        </span>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
        <Button
          className="flex-1"
          disabled={!label.trim() || !key.trim()}
          onClick={() => { onSave({ key, label: label.trim(), icon, colorClass, isCard, sortOrder }); onClose(); }}
        >
          {isEdit ? "Salvar Alterações" : "Adicionar Forma de Pagamento"}
        </Button>
      </div>
    </div>
  );
}

const MEMBER_COLOR_PRESETS = [
  { label: "Azul", value: "#3b82f6" },
  { label: "Rosa", value: "#ec4899" },
  { label: "Roxo", value: "#8b5cf6" },
  { label: "Âmbar", value: "#f59e0b" },
  { label: "Verde", value: "#10b981" },
  { label: "Vermelho", value: "#ef4444" },
  { label: "Laranja", value: "#f97316" },
  { label: "Ciano", value: "#06b6d4" },
];

function MemberForm({
  initial, onSave, onClose,
}: {
  initial?: { id?: number; name: string; color: string };
  onSave: (name: string, color: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [color, setColor] = useState(initial?.color || "#6366f1");
  return (
    <div className="space-y-4 pt-2">
      <div>
        <Label className="text-sm">Nome do Vínculo</Label>
        <Input className="mt-1" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Anderson, Fernanda, Casa..." autoFocus />
      </div>
      <div>
        <Label className="text-sm">Cor do Avatar</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {MEMBER_COLOR_PRESETS.map(p => (
            <button key={p.value} type="button" onClick={() => setColor(p.value)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${color === p.value ? "ring-2 ring-offset-2 ring-current scale-110" : "opacity-70 hover:opacity-100"}`}
              style={{ backgroundColor: p.value, borderColor: p.value }}
              title={p.label}
            />
          ))}
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            className="w-8 h-8 rounded-full border-2 cursor-pointer" title="Cor personalizada" />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: color }}>
            {name.charAt(0).toUpperCase() || "?"}
          </div>
          <span className="text-sm text-muted-foreground">Pré-visualização do avatar</span>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
        <Button className="flex-1" disabled={!name.trim()} onClick={() => { onSave(name.trim(), color); onClose(); }}>
          {initial?.id ? "Salvar Alterações" : "Adicionar Vínculo"}
        </Button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function Settings() {
  const utils = trpc.useUtils();

  // Family Members
  const { data: members, isLoading: membersLoading } = trpc.members.list.useQuery();
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<{ id: number; name: string; color: string } | null>(null);

  const seedMembers = trpc.members.seedDefaults.useMutation({
    onSuccess: () => { toast.success("Vínculos padrão criados!"); utils.members.list.invalidate(); },
    onError: () => toast.error("Erro ao criar vínculos padrão"),
  });
  const addMember = trpc.members.add.useMutation({
    onSuccess: () => { toast.success("Vínculo adicionado!"); utils.members.list.invalidate(); },
    onError: () => toast.error("Erro ao adicionar vínculo"),
  });
  const updateMember = trpc.members.update.useMutation({
    onSuccess: () => { toast.success("Vínculo atualizado!"); utils.members.list.invalidate(); },
    onError: () => toast.error("Erro ao atualizar vínculo"),
  });
  const deleteMember = trpc.members.delete.useMutation({
    onSuccess: () => { toast.success("Vínculo removido!"); utils.members.list.invalidate(); },
    onError: () => toast.error("Erro ao remover vínculo"),
  });

  // Categories
  const { data: cats, isLoading: catsLoading } = trpc.categories.list.useQuery();
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<{ id: number; name: string; rule: string } | null>(null);

  const addCat = trpc.categories.add.useMutation({
    onSuccess: () => { toast.success("Categoria adicionada!"); utils.categories.list.invalidate(); },
    onError: () => toast.error("Erro ao adicionar categoria"),
  });
  const updateCat = trpc.categories.update.useMutation({
    onSuccess: () => { toast.success("Categoria atualizada!"); utils.categories.list.invalidate(); },
    onError: () => toast.error("Erro ao atualizar categoria"),
  });
  const deleteCat = trpc.categories.delete.useMutation({
    onSuccess: () => { toast.success("Categoria removida!"); utils.categories.list.invalidate(); },
    onError: () => toast.error("Erro ao remover categoria"),
  });

  // Payment Methods
  const { data: pms, isLoading: pmsLoading } = trpc.paymentMethods.list.useQuery();
  const [pmDialogOpen, setPmDialogOpen] = useState(false);
  const [editingPm, setEditingPm] = useState<{
    id: number; key: string; label: string; icon: string; colorClass: string; isCard: boolean; sortOrder: number;
  } | null>(null);

  const upsertPm = trpc.paymentMethods.upsert.useMutation({
    onSuccess: () => { toast.success("Forma de pagamento salva!"); utils.paymentMethods.list.invalidate(); },
    onError: () => toast.error("Erro ao salvar forma de pagamento"),
  });
  const deletePm = trpc.paymentMethods.delete.useMutation({
    onSuccess: () => { toast.success("Forma de pagamento removida!"); utils.paymentMethods.list.invalidate(); },
    onError: () => toast.error("Erro ao remover forma de pagamento"),
  });

  // Group categories by rule
  const catsByRule: Record<string, typeof cats> = {};
  (cats || []).forEach((c) => {
    if (!catsByRule[c.rule]) catsByRule[c.rule] = [];
    catsByRule[c.rule]!.push(c);
  });

  return (
    <AppLayout title="Configurações">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Settings2 className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Configurações</h1>
            <p className="text-sm text-muted-foreground">Personalize categorias e formas de pagamento para o seu perfil.</p>
          </div>
        </div>

        {/* ── Categorias ─────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Categorias de Despesa</CardTitle>
                <Badge variant="outline" className="text-xs">{(cats || []).length} categorias</Badge>
              </div>
              <Dialog
                open={catDialogOpen}
                onOpenChange={(o) => { setCatDialogOpen(o); if (!o) setEditingCat(null); }}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8">
                    <Plus className="w-4 h-4 mr-1" /> Nova Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>{editingCat ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
                  </DialogHeader>
                  <CategoryForm
                    initial={editingCat || undefined}
                    onSave={(name, rule) => {
                      if (editingCat?.id) {
                        updateCat.mutate({ id: editingCat.id, name, rule: rule as any });
                      } else {
                        addCat.mutate({ name, rule: rule as any });
                      }
                    }}
                    onClose={() => { setCatDialogOpen(false); setEditingCat(null); }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {catsLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
            ) : (
              <div className="space-y-4">
                {RULES.map((rule) => {
                  const ruleCats = catsByRule[rule] || [];
                  return (
                    <div key={rule}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${RULE_COLORS[rule]}`}>
                          {rule}
                        </span>
                        <span className="text-xs text-muted-foreground">({ruleCats.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {ruleCats.map((cat) => (
                          <div
                            key={cat.id}
                            className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors group"
                          >
                            <span className="text-sm font-medium">{cat.name}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingCat({ id: cat.id, name: cat.name, rule: cat.rule });
                                  setCatDialogOpen(true);
                                }}
                                className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                                title="Editar"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button
                                    className="p-1 rounded hover:bg-background text-muted-foreground hover:text-destructive transition-colors"
                                    title="Remover"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remover categoria?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      A categoria <strong>{cat.name}</strong> será removida. Despesas já lançadas com esta categoria não serão afetadas.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => deleteCat.mutate({ id: cat.id })}
                                    >
                                      Remover
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                        {ruleCats.length === 0 && (
                          <p className="text-xs text-muted-foreground col-span-2 py-2 px-3">
                            Nenhuma categoria neste grupo.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Formas de Pagamento ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Formas de Pagamento</CardTitle>
                <Badge variant="outline" className="text-xs">{(pms || []).length} cadastradas</Badge>
              </div>
              <Dialog
                open={pmDialogOpen}
                onOpenChange={(o) => { setPmDialogOpen(o); if (!o) setEditingPm(null); }}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8">
                    <Plus className="w-4 h-4 mr-1" /> Nova Forma
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingPm ? "Editar Forma de Pagamento" : "Nova Forma de Pagamento"}</DialogTitle>
                  </DialogHeader>
                  <PaymentMethodForm
                    initial={editingPm || undefined}
                    onSave={(data) => {
                      upsertPm.mutate(editingPm?.id ? { ...data, id: editingPm.id } : data);
                    }}
                    onClose={() => { setPmDialogOpen(false); setEditingPm(null); }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {pmsLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
            ) : (pms || []).length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <CreditCard className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">Nenhuma forma de pagamento cadastrada.</p>
                <p className="text-xs text-muted-foreground">Clique em "Nova Forma" para adicionar seus cartões e métodos de pagamento.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(pms || []).map((pm) => (
                  <div
                    key={pm.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors group"
                  >
                    {/* Preview badge */}
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium flex-shrink-0 ${pm.colorClass}`}>
                      {pm.icon} {pm.label}
                    </span>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">{pm.key}</span>
                        {pm.isCard && (
                          <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-700">
                            Cartão
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingPm({
                            id: pm.id,
                            key: pm.key,
                            label: pm.label,
                            icon: pm.icon,
                            colorClass: pm.colorClass,
                            isCard: pm.isCard,
                            sortOrder: pm.sortOrder,
                          });
                          setPmDialogOpen(true);
                        }}
                        className="p-1.5 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="p-1.5 rounded hover:bg-background text-muted-foreground hover:text-destructive transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover forma de pagamento?</AlertDialogTitle>
                            <AlertDialogDescription>
                              <strong>{pm.label}</strong> será removida. Despesas já lançadas com esta forma não serão afetadas.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deletePm.mutate({ id: pm.id })}
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Nota sobre formas padrão */}
            <div className="mt-4 p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground">
              <strong>Nota:</strong> As formas de pagamento cadastradas aqui aparecem no seletor ao lançar despesas. Formas marcadas como "Cartão" somam automaticamente no campo Cartões das Contas a Pagar.
            </div>
          </CardContent>
        </Card>

        {/* ── Vínculos Familiares ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4 text-primary" />
                Vínculos Familiares
              </CardTitle>
              <Dialog open={memberDialogOpen && !editingMember} onOpenChange={open => { if (!open) setMemberDialogOpen(false); }}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => { setEditingMember(null); setMemberDialogOpen(true); }}>
                    <Plus className="w-4 h-4 mr-1" /> Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Novo Vínculo</DialogTitle></DialogHeader>
                  <MemberForm
                    onSave={(name, color) => addMember.mutate({ name, color, sortOrder: (members?.length || 0) })}
                    onClose={() => setMemberDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Vincule despesas e contas a membros da família para acompanhar os gastos de cada um.</p>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <div className="text-sm text-muted-foreground py-4 text-center">Carregando...</div>
            ) : !members?.length ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="text-sm text-muted-foreground">Nenhum vínculo cadastrado.</p>
                <button
                  onClick={() => seedMembers.mutate()}
                  disabled={seedMembers.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {seedMembers.isPending ? "Criando..." : "✨ Criar Vínculos Padrão (Anderson, Fernanda, Lívia, Davi, Casa)"}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: m.color }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 font-medium text-sm">{m.name}</span>
                    <div className="flex gap-1">
                      <Dialog open={editingMember?.id === m.id} onOpenChange={open => { if (!open) setEditingMember(null); }}>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingMember({ id: m.id, name: m.name, color: m.color })}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Editar Vínculo</DialogTitle></DialogHeader>
                          {editingMember?.id === m.id && (
                            <MemberForm
                              initial={editingMember}
                              onSave={(name, color) => { updateMember.mutate({ id: m.id, name, color }); setEditingMember(null); }}
                              onClose={() => setEditingMember(null)}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover Vínculo</AlertDialogTitle>
                            <AlertDialogDescription>Tem certeza que deseja remover "{m.name}"? As despesas vinculadas a ele ficarão sem vínculo.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMember.mutate({ id: m.id })} className="bg-destructive text-destructive-foreground">Remover</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground">
              <strong>Dica:</strong> Os vínculos padrão (Anderson, Fernanda, Lívia, Davi, Casa) são criados automaticamente no primeiro acesso.
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
