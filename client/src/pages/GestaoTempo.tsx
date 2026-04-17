import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Trash2,
  Edit2,
  Clock,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bell,
  Settings,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";

type TaskCategory = "important" | "urgent" | "circumstantial";

const TRIADE_CONFIG = {
  important: {
    label: "Importante",
    dot: "bg-green-500",
    text: "text-green-700",
    bg: "bg-green-50",
    activeBg: "bg-green-50",
    activeText: "text-green-700",
    activeBorder: "border-green-400",
  },
  urgent: {
    label: "Urgente",
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50",
    activeBg: "bg-red-50",
    activeText: "text-red-700",
    activeBorder: "border-red-400",
  },
  circumstantial: {
    label: "Circunstancial",
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
    activeBg: "bg-amber-50",
    activeText: "text-amber-700",
    activeBorder: "border-amber-400",
  },
} as const;

const REMINDER_EMOJIS = ["📌", "🎂", "🍴", "📞", "💼", "🏥", "✈️", "🎯"];

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getWeekDates(baseDate: string) {
  const base = new Date(baseDate + "T12:00:00");
  const day = base.getDay();
  const sunday = new Date(base);
  sunday.setDate(base.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDate();
  const month = d.toLocaleDateString("pt-BR", { month: "long" });
  const year = d.getFullYear();
  const weekday = d.toLocaleDateString("pt-BR", { weekday: "long" });
  return {
    full: `${day} ${month.charAt(0).toUpperCase() + month.slice(1)}, ${year}`,
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
  };
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return {
    weekday: d
      .toLocaleDateString("pt-BR", { weekday: "short" })
      .replace(".", "")
      .toUpperCase(),
    day: d.getDate(),
    month: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
  };
}

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatMinutes(mins: number) {
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
  }
  return `${mins}min`;
}

interface TaskFormData {
  title: string;
  durationMinutes: number;
  category: TaskCategory;
  taskCategoryId: number | null;
  scheduledDate: string;
  scheduledTime: string;
  isRecurring: boolean;
  notes: string;
}

const DEFAULT_FORM = (date: string): TaskFormData => ({
  title: "",
  durationMinutes: 30,
  category: "important",
  taskCategoryId: null,
  scheduledDate: date,
  scheduledTime: "",
  isRecurring: false,
  notes: "",
});

export default function GestaoTempo() {
  const utils = trpc.useUtils();
  const today = useMemo(() => getTodayStr(), []);

  const [selectedDate, setSelectedDate] = useState(today);
  const [activeTab, setActiveTab] = useState<"meu-dia" | "planejamento" | "relatorio">("meu-dia");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [form, setForm] = useState<TaskFormData>(DEFAULT_FORM(today));
  const [quickTitle, setQuickTitle] = useState("");
  // Timer persistido no localStorage para sobreviver a troca de aba
  const [activeTimer, setActiveTimer] = useState<{ taskId: number; startedAt: Date } | null>(() => {
    try {
      const saved = localStorage.getItem("gestor_active_timer");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { taskId: parsed.taskId, startedAt: new Date(parsed.startedAt) };
      }
    } catch {}
    return null;
  });
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeTimerRef = useRef<{ taskId: number; startedAt: Date } | null>(null);
  const [collapsedCompleted, setCollapsedCompleted] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [reminderEmoji, setReminderEmoji] = useState("📌");
  const [reminderText, setReminderText] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminders, setReminders] = useState<{ emoji: string; text: string; time: string }[]>([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("📋");

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const { data: tasks = [], isLoading } = trpc.tasks.byDate.useQuery({ date: selectedDate });
  const { data: weekTasks = [] } = trpc.tasks.byDateRange.useQuery({
    startDate: weekDates[0],
    endDate: weekDates[6],
  });
  const { data: score } = trpc.tasks.score.useQuery();
  const { data: backlogTasks = [] } = trpc.tasks.backlog.useQuery();
  const { data: taskCategories = [] } = trpc.taskCategories.list.useQuery();

  // Manter ref sincronizada com o estado para evitar closure stale
  useEffect(() => {
    activeTimerRef.current = activeTimer;
  }, [activeTimer]);

  // Timer persistido no localStorage — abordagem robusta com ref
  useEffect(() => {
    // Limpar intervalo anterior sempre
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (activeTimer) {
      localStorage.setItem("gestor_active_timer", JSON.stringify({
        taskId: activeTimer.taskId,
        startedAt: activeTimer.startedAt.toISOString(),
      }));
      // Atualizar imediatamente
      setElapsed(Math.floor((Date.now() - activeTimer.startedAt.getTime()) / 1000));
      // Usar ref para evitar closure stale
      const startedAtMs = activeTimer.startedAt.getTime();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAtMs) / 1000));
      }, 1000);
    } else {
      localStorage.removeItem("gestor_active_timer");
      setElapsed(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeTimer]);

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.byDate.invalidate();
      utils.tasks.byDateRange.invalidate();
      utils.tasks.backlog.invalidate();
      utils.tasks.score.invalidate();
      setDialogOpen(false);
      setForm(DEFAULT_FORM(selectedDate));
      toast.success("Tarefa criada!");
    },
    onError: (e) => toast.error(e.message),
  });

  // updateTask para salvar formulário (fecha diálogo)
  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.byDate.invalidate();
      utils.tasks.byDateRange.invalidate();
      utils.tasks.score.invalidate();
      utils.tasks.backlog.invalidate();
      setDialogOpen(false);
      setEditingTask(null);
      setForm(DEFAULT_FORM(selectedDate));
    },
    onError: (e) => toast.error(e.message),
  });

  // updateTaskStatus para play/pause/complete (NÃO fecha diálogo nem reseta form)
  const updateTaskStatus = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.byDate.invalidate();
      utils.tasks.byDateRange.invalidate();
      utils.tasks.score.invalidate();
      utils.tasks.backlog.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      utils.tasks.byDate.invalidate();
      utils.tasks.byDateRange.invalidate();
      utils.tasks.score.invalidate();
      utils.tasks.backlog.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const createCategory = trpc.taskCategories.create.useMutation({
    onSuccess: () => {
      utils.taskCategories.list.invalidate();
      setNewCatName("");
      setNewCatEmoji("📋");
      toast.success("Categoria criada!");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteCategory = trpc.taskCategories.delete.useMutation({
    onSuccess: () => utils.taskCategories.list.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  const handleQuickCreate = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && quickTitle.trim()) {
      createTask.mutate({
        title: quickTitle.trim(),
        durationMinutes: 30,
        category: "important",
        scheduledDate: selectedDate,
        notes: "",
      });
      setQuickTitle("");
    }
  };

  const handleStartTask = (taskId: number) => {
    if (activeTimer?.taskId === taskId) {
      // Pausar: salvar tempo executado
      const mins = Math.floor(elapsed / 60);
      updateTaskStatus.mutate({ id: taskId, status: "pending", executedMinutes: mins });
      setActiveTimer(null);
    } else {
      // Iniciar: setar timer
      setActiveTimer({ taskId, startedAt: new Date() });
      updateTaskStatus.mutate({ id: taskId, status: "started" });
    }
  };

  const handleCompleteTask = (taskId: number) => {
    const mins = activeTimer?.taskId === taskId ? Math.floor(elapsed / 60) : undefined;
    if (activeTimer?.taskId === taskId) setActiveTimer(null);
    updateTaskStatus.mutate({ id: taskId, status: "completed", ...(mins !== undefined && { executedMinutes: mins }) });
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return toast.error("Informe o título da tarefa.");
    const payload = {
      ...form,
      scheduledDate: form.scheduledDate?.trim() || undefined,
      scheduledTime: form.scheduledTime?.trim() || undefined,
      taskCategoryId: form.taskCategoryId ?? undefined,
    };
    if (editingTask) {
      updateTask.mutate({ id: editingTask, ...payload });
    } else {
      createTask.mutate(payload);
    }
  };

  const openEdit = (task: (typeof tasks)[0]) => {
    setEditingTask(task.id);
    setForm({
      title: task.title,
      durationMinutes: task.durationMinutes,
      category: task.category as TaskCategory,
      taskCategoryId: (task as any).taskCategoryId ?? null,
      scheduledDate: task.scheduledDate ?? "",
      scheduledTime: (task as any).scheduledTime ?? "",
      isRecurring: (task as any).isRecurring ?? false,
      notes: task.notes ?? "",
    });
    setDialogOpen(true);
  };

  const openNew = (cat?: TaskCategory) => {
    setEditingTask(null);
    setForm({ ...DEFAULT_FORM(selectedDate), ...(cat ? { category: cat } : {}) });
    setDialogOpen(true);
  };

  const navigateDay = (dir: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + dir);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const toggleCompletedSection = (groupKey: string) => {
    setCollapsedCompleted((prev) => {
      const next = new Set(prev);
      next.has(groupKey) ? next.delete(groupKey) : next.add(groupKey);
      return next;
    });
  };

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(groupKey) ? next.delete(groupKey) : next.add(groupKey);
      return next;
    });
  };

  const addReminder = () => {
    if (!reminderText.trim()) return;
    setReminders((prev) => [...prev, { emoji: reminderEmoji, text: reminderText, time: reminderTime }]);
    setReminderText("");
    setReminderTime("");
  };

  // Group tasks by user category (taskCategoryId), fallback to "__none__"
  const tasksByUserCategory = useMemo(() => {
    const groups: Record<string, { label: string; emoji: string; tasks: typeof tasks }> = {};
    groups["__none__"] = { label: "Sem categoria", emoji: "📋", tasks: [] };
    taskCategories.forEach((cat) => {
      groups[String(cat.id)] = { label: cat.name, emoji: cat.emoji, tasks: [] };
    });
    tasks.forEach((t) => {
      const catId = (t as any).taskCategoryId;
      const key = catId ? String(catId) : "__none__";
      if (groups[key]) {
        groups[key].tasks.push(t);
      } else {
        groups["__none__"].tasks.push(t);
      }
    });
    return Object.entries(groups).filter(([, g]) => g.tasks.length > 0);
  }, [tasks, taskCategories]);

  // Stats
  const totalPlanned = tasks.reduce((s, t) => s + t.durationMinutes, 0);
  const totalExecuted = tasks.reduce((s, t) => s + (t.executedMinutes ?? 0), 0);
  const totalRemaining = Math.max(0, totalPlanned - totalExecuted);
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const completionPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Score breakdown
  const scoreData = score ?? { score: 0, completed: 0, total: 0, importantPct: 0, urgentPct: 0, circumstantialPct: 0 };
  const impPct = scoreData.importantPct ?? 0;
  const urgPct = scoreData.urgentPct ?? 0;
  const circPct = scoreData.circumstantialPct ?? 0;
  const scoreBarPct = scoreData.score ?? 0;
  const dateInfo = formatFullDate(selectedDate);

  return (
    <AppLayout>
      <div className="p-3 sm:p-5 max-w-5xl mx-auto">

        {/* ─── Header: Data + Navegação ─────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={() => navigateDay(-1)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground/70 hover:bg-muted/50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              {dateInfo.full}
              <button className="text-muted-foreground/70 hover:text-muted-foreground transition-colors">
                <Calendar className="w-4 h-4" />
              </button>
            </h1>
            <p className="text-sm text-muted-foreground">{dateInfo.weekday}</p>
          </div>
          <button
            onClick={() => navigateDay(1)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground/70 hover:bg-muted/50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="ml-auto">
            <button
              onClick={() => setShowCategoryManager(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground/90 px-3 py-1.5 rounded-lg border border-border hover:bg-muted/30 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Categorias
            </button>
          </div>
        </div>

        {/* ─── Tab Bar ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-0 mb-4 border-b border-border">
          {(["meu-dia", "planejamento", "relatorio"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-muted-foreground hover:text-foreground/90"
              }`}
            >
              {tab === "meu-dia" ? "Meu Dia" : tab === "planejamento" ? "Planejamento" : "Relatório"}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ABA MEU DIA */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "meu-dia" && (
          <div className="space-y-3">
            {/* Stats bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-foreground/90">
                {tasks.length} {tasks.length === 1 ? "atividade" : "atividades"}
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                {formatMinutes(totalPlanned)} plan.
              </span>
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Clock className="w-3.5 h-3.5" />
                {formatMinutes(totalExecuted)} exec.
              </span>
              <span className="flex items-center gap-1 text-sm text-amber-600">
                <Clock className="w-3.5 h-3.5" />
                {formatMinutes(totalRemaining)} rest.
              </span>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {completedCount}
                </div>
                <div className="w-28 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
                </div>
                <span className="text-sm font-semibold text-foreground/90">{completionPct}%</span>
              </div>
            </div>

            {/* Score 30 dias */}
            {scoreData.total > 0 && (
              <div className="bg-gray-900 rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
                <BarChart3 className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                <span className="text-sm text-muted-foreground/60 shrink-0">
                  Score 30 dias ({scoreData.completed} concluídas)
                </span>
                <div className="flex-1 h-2.5 bg-gray-700 rounded-full overflow-hidden min-w-[80px]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${scoreBarPct}%`,
                      background: "linear-gradient(90deg, #22c55e 0%, #22c55e 80%, #f59e0b 100%)",
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-green-400 shrink-0">{impPct}% Imp.</span>
                <span className="text-sm font-semibold text-red-400 shrink-0">{urgPct}% Urg.</span>
                <span className="text-sm font-semibold text-amber-400 shrink-0">{circPct}% Circ.</span>
              </div>
            )}

            {/* Quick create */}
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm">
              <span className="text-amber-400 text-base">⚡</span>
              <input
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                onKeyDown={handleQuickCreate}
                placeholder="Criar nova tarefa rápida (Enter para salvar)"
                className="flex-1 text-sm bg-transparent outline-none text-foreground/90 placeholder-gray-400"
              />
              <Button
                size="sm"
                onClick={() => openNew()}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1 h-8 px-3"
              >
                <Plus className="w-3.5 h-3.5" /> Nova
              </Button>
            </div>

            {/* Tasks grouped by user category */}
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground/70 text-sm">Carregando...</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground/70">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma atividade para este dia</p>
                <Button size="sm" onClick={() => openNew()} className="mt-3 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar tarefa
                </Button>
              </div>
            ) : (
              tasksByUserCategory.map(([groupKey, group]) => {
                const pending = group.tasks.filter((t) => t.status !== "completed");
                const completed = group.tasks.filter((t) => t.status === "completed");
                const groupTotalMins = group.tasks.reduce((s, t) => s + t.durationMinutes, 0);
                const groupExecMins = group.tasks.reduce((s, t) => s + (t.executedMinutes ?? 0), 0);
                const isGroupCollapsed = collapsedGroups.has(groupKey);
                const isCompletedCollapsed = collapsedCompleted.has(groupKey);

                return (
                  <div key={groupKey} className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm">
                    {/* Group header */}
                    <div
                      className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors select-none"
                      onClick={() => toggleGroup(groupKey)}
                    >
                      <span className="text-base">{group.emoji}</span>
                      <span className="font-semibold text-foreground text-sm">{group.label}</span>
                      <span className="text-xs text-muted-foreground/70 font-medium ml-1">{group.tasks.length}</span>
                      <span className="text-xs text-muted-foreground/70 ml-1">
                        {formatMinutes(groupExecMins)}/{formatMinutes(groupTotalMins)}
                      </span>
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); openNew(); }}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground/70 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground/60 transition-transform ${isGroupCollapsed ? "-rotate-90" : ""}`}
                        />
                      </div>
                    </div>

                    {!isGroupCollapsed && (
                      <>
                        {/* Column headers */}
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-muted/30 border-t border-border/50 text-[10px] uppercase tracking-wide text-muted-foreground/70 font-medium">
                          <span className="w-5 shrink-0" />
                          <span className="w-2.5 shrink-0" />
                          <span className="flex-1">Nome</span>
                          <span className="w-16 text-right hidden sm:block">Duração</span>
                          <span className="w-20 text-right hidden sm:block">Timer</span>
                          <span className="w-20 shrink-0" />
                        </div>

                        {/* Pending tasks */}
                        <div className="divide-y divide-gray-50">
                          {pending.map((task) => {
                            const isRunning = activeTimer?.taskId === task.id;
                            const triade = TRIADE_CONFIG[task.category as TaskCategory];
                            return (
                              <div
                                key={task.id}
                                className={`flex items-center gap-2 sm:gap-3 px-4 py-3 transition-colors ${isRunning ? "bg-blue-50/50" : "hover:bg-muted/30/30"}`}
                              >
                                <button
                                  onClick={() => handleCompleteTask(task.id)}
                                  className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center shrink-0 hover:border-green-400 transition-colors"
                                />
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${triade.dot}`} />
                                <span className="flex-1 text-sm text-foreground min-w-0 truncate">{task.title}</span>
                                <span className="text-xs text-muted-foreground/70 w-16 text-right hidden sm:block shrink-0">
                                  <Clock className="w-3 h-3 inline mr-0.5" />{task.durationMinutes}min
                                </span>
                                <span className="font-mono text-xs w-20 text-right hidden sm:block shrink-0">
                                  {isRunning ? (
                                    <span className="text-blue-600 font-bold">{formatTime(elapsed)}</span>
                                  ) : (
                                    <span className="text-muted-foreground/70">{formatTime((task.executedMinutes ?? 0) * 60)}</span>
                                  )}
                                </span>
                                <div className="flex items-center gap-0.5 shrink-0 w-20 justify-end">
                                  <button
                                    onClick={() => handleStartTask(task.id)}
                                    className={`p-1.5 rounded-lg transition-colors ${isRunning ? "text-blue-600 bg-blue-100" : "text-muted-foreground/70 hover:text-blue-600 hover:bg-blue-50"}`}
                                    title={isRunning ? "Pausar" : "Iniciar"}
                                  >
                                    {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => openEdit(task)}
                                    className="p-1.5 rounded-lg text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
                                    title="Editar"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteTask.mutate({ id: task.id })}
                                    className="p-1.5 rounded-lg text-muted-foreground/70 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Completed section */}
                        {completed.length > 0 && (
                          <>
                            <button
                              onClick={() => toggleCompletedSection(groupKey)}
                              className="w-full flex items-center gap-2 px-4 py-2 bg-green-50/50 text-green-700 text-xs font-medium hover:bg-green-50 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Concluídas ({completed.length})
                              <ChevronDown
                                className={`w-3.5 h-3.5 ml-auto transition-transform ${isCompletedCollapsed ? "-rotate-90" : ""}`}
                              />
                            </button>
                            {!isCompletedCollapsed && (
                              <div className="divide-y divide-border/30">
                                {completed.map((task) => {
                                  const triade = TRIADE_CONFIG[task.category as TaskCategory];
                                  const execMins = task.executedMinutes ?? 0;
                                  return (
                                    <div key={task.id} className="flex items-center gap-2 sm:gap-3 px-4 py-2.5 bg-green-50/20 dark:bg-green-900/10 hover:bg-green-50/40 dark:hover:bg-green-900/20 transition-colors">
                                      {/* Botão desfazer conclusão */}
                                      <button
                                        onClick={() => updateTaskStatus.mutate({ id: task.id, status: "pending" })}
                                        title="Desfazer conclusão"
                                        className="w-5 h-5 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center shrink-0 hover:bg-green-600 hover:border-green-600 transition-colors"
                                      >
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                      </button>
                                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${triade.dot}`} />
                                      {/* Título */}
                                      <span className="flex-1 text-sm text-muted-foreground/60 line-through min-w-0 truncate">{task.title}</span>
                                      {/* Tempo executado */}
                                      {execMins > 0 && (
                                        <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 shrink-0">
                                          <CheckCircle2 className="w-3 h-3" />
                                          {formatTime(execMins * 60)}
                                        </span>
                                      )}
                                      {/* Duração planejada */}
                                      <span className="text-xs text-muted-foreground/50 w-14 text-right hidden sm:block shrink-0">
                                        {task.durationMinutes}min
                                      </span>
                                      {/* Ações */}
                                      <div className="flex items-center gap-0.5 shrink-0">
                                        <button
                                          onClick={() => openEdit(task)}
                                          title="Editar"
                                          className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => deleteTask.mutate({ id: task.id })}
                                          title="Excluir"
                                          className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}

            {/* Lembretes */}
            <div className="mt-4 bg-card rounded-xl border border-border/50 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
                <Bell className="w-4 h-4 text-muted-foreground/70" />
                <span className="font-semibold text-foreground/90 text-sm">Lembretes</span>
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-3">
                  <select
                    value={reminderEmoji}
                    onChange={(e) => setReminderEmoji(e.target.value)}
                    className="border border-border rounded-lg px-2 py-2 text-sm bg-card"
                  >
                    {REMINDER_EMOJIS.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                  <Input
                    value={reminderText}
                    onChange={(e) => setReminderText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addReminder()}
                    placeholder="Aniversário, almoço, consulta... (Enter para salvar)"
                    className="flex-1 text-sm"
                  />
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="border border-border rounded-lg px-2 py-2 text-sm bg-card w-28"
                  />
                </div>
                {reminders.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground/70 text-sm">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Nenhum lembrete para hoje. Adicione aniversários, almoços, compromissos...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {reminders.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-foreground/90">
                        <span>{r.emoji}</span>
                        <span className="flex-1">{r.text}</span>
                        {r.time && <span className="text-muted-foreground/70 text-xs">{r.time}</span>}
                        <button
                          onClick={() => setReminders((prev) => prev.filter((_, j) => j !== i))}
                          className="text-muted-foreground/60 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ABA PLANEJAMENTO */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "planejamento" && (
          <div>
            {/* Week navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  const d = new Date(weekDates[0] + "T12:00:00");
                  d.setDate(d.getDate() - 7);
                  setSelectedDate(d.toISOString().split("T")[0]);
                }}
                className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <p className="text-sm font-semibold text-foreground/90">
                {new Date(weekDates[0] + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                {" — "}
                {new Date(weekDates[6] + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </p>
              <button
                onClick={() => {
                  const d = new Date(weekDates[6] + "T12:00:00");
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d.toISOString().split("T")[0]);
                }}
                className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-3">
              {/* Backlog */}
              <div className="w-44 sm:w-52 flex-shrink-0">
                <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-50 bg-muted/30">
                    <span className="text-xs font-semibold text-muted-foreground">Tarefas pendentes</span>
                    <button
                      onClick={() => openNew()}
                      className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-2 space-y-1.5 max-h-[500px] overflow-y-auto">
                    {backlogTasks.filter((t) => t.status !== "completed").length === 0 ? (
                      <p className="text-xs text-muted-foreground/70 text-center py-4">Nenhuma tarefa no backlog</p>
                    ) : (
                      backlogTasks.filter((t) => t.status !== "completed").map((t) => {
                        const triade = TRIADE_CONFIG[t.category as TaskCategory];
                        return (
                          <div
                            key={t.id}
                            className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs ${triade.bg} ${triade.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${triade.dot} flex-shrink-0`} />
                            <span className="truncate flex-1">{t.title}</span>
                            <span className="text-[10px] opacity-60 group-hover:hidden">{t.durationMinutes}min</span>
                            <button
                              onClick={() => deleteTask.mutate({ id: t.id })}
                              className="hidden group-hover:flex items-center justify-center w-4 h-4 rounded text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors flex-shrink-0"
                              title="Excluir"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Week columns */}
              <div className="flex-1 overflow-x-auto">
                <div className="flex gap-2 min-w-[560px]">
                  {weekDates.map((d) => {
                    const dayTasks = weekTasks.filter((t) => t.scheduledDate === d);
                    const completedDay = dayTasks.filter((t) => t.status === "completed").length;
                    const isToday = d === today;
                    const fmt = formatShortDate(d);
                    return (
                      <div
                        key={d}
                        className={`flex-1 rounded-xl border overflow-hidden ${isToday ? "border-blue-300" : "border-border/50"}`}
                      >
                        <div className={`text-center py-2 border-b ${isToday ? "bg-blue-50 border-blue-100" : "bg-muted/30 border-gray-50"}`}>
                          <p className="text-[10px] text-muted-foreground/70 uppercase font-medium">{fmt.weekday}</p>
                          <p className={`text-base font-bold ${isToday ? "text-blue-700" : "text-foreground"}`}>{fmt.day}/{fmt.month}</p>
                          {dayTasks.length > 0 && (
                            <p className="text-[10px] text-muted-foreground/70">✅ {completedDay}/{dayTasks.length}</p>
                          )}
                        </div>
                        <div className="p-1.5 space-y-1 min-h-[160px] bg-card">
                          {dayTasks.map((t) => {
                            const triade = TRIADE_CONFIG[t.category as TaskCategory];
                            return (
                              <div
                                key={t.id}
                                className={`group text-[11px] px-1.5 py-1 rounded flex items-center gap-1 ${triade.bg} ${triade.text} ${t.status === "completed" ? "opacity-40 line-through" : ""}`}
                                title={t.title}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${triade.dot} flex-shrink-0`} />
                                <span className="truncate flex-1">{t.title}</span>
                                {t.status !== "completed" && (
                                  <button
                                    onClick={() => deleteTask.mutate({ id: t.id })}
                                    className="hidden group-hover:flex items-center justify-center w-3.5 h-3.5 rounded text-red-400 hover:text-red-600 flex-shrink-0"
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                          <button
                            onClick={() => { setSelectedDate(d); openNew(); }}
                            className="w-full text-[11px] text-muted-foreground/70 hover:text-blue-600 py-1 text-center hover:bg-blue-50 rounded transition-colors"
                          >
                            + add
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
              {(Object.entries(TRIADE_CONFIG) as [TaskCategory, (typeof TRIADE_CONFIG)[TaskCategory]][]).map(([key, cfg]) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ABA RELATÓRIO */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "relatorio" && (
          <div className="space-y-4">
            {/* Date navigation */}
            <div className="flex items-center justify-between">
              <button onClick={() => navigateDay(-1)} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <p className="text-base font-bold text-foreground capitalize">{dateInfo.full}</p>
              <button onClick={() => navigateDay(1)} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* 4 stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total de tarefas", value: tasks.length, color: "text-foreground" },
                { label: "Concluídas", value: completedCount, color: "text-green-600" },
                { label: "Horas planejadas", value: formatMinutes(totalPlanned), color: "text-blue-600" },
                { label: "Horas executadas", value: formatMinutes(totalExecuted), color: "text-violet-600" },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl border border-border/50 p-4 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Resumo por Categoria */}
            <div className="bg-card rounded-xl border border-border/50 p-4">
              <h3 className="text-sm font-semibold text-foreground/90 mb-3">Resumo por Categoria (Gestão do Tempo)</h3>
              {(Object.entries(TRIADE_CONFIG) as [TaskCategory, (typeof TRIADE_CONFIG)[TaskCategory]][]).map(([cat, cfg]) => {
                const catTasks = tasks.filter((t) => t.category === cat);
                if (catTasks.length === 0) return null;
                const totalSecs = catTasks.reduce((s, t) => s + (t.executedMinutes ?? 0) * 60, 0);
                return (
                  <div key={cat} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className="text-sm text-foreground/90">{cfg.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatTime(totalSecs)} • {catTasks.length} tarefas</span>
                  </div>
                );
              })}
              {tasks.length === 0 && <p className="text-sm text-muted-foreground/70 text-center py-4">Nenhuma tarefa neste dia</p>}
            </div>

            {/* Detalhamento por tarefa */}
            <div className="bg-card rounded-xl border border-border/50 p-4">
              <h3 className="text-sm font-semibold text-foreground/90 mb-3">Detalhamento por Tarefa</h3>
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground/70 text-center py-4">Nenhuma tarefa neste dia</p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((t) => {
                    const cfg = TRIADE_CONFIG[t.category as TaskCategory];
                    return (
                      <div key={t.id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0`} />
                        <span className={`text-sm flex-1 ${t.status === "completed" ? "line-through text-muted-foreground/70" : "text-foreground/90"}`}>{t.title}</span>
                        <span className="text-xs text-muted-foreground/70">{t.executedMinutes ? formatTime(t.executedMinutes * 60) : "—"}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Task Dialog ─────────────────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) { setEditingTask(null); setForm(DEFAULT_FORM(selectedDate)); }
        }}
      >
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Título */}
            <div>
              <Label>Título *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="O que precisa ser feito?"
                className="mt-1"
                autoFocus
              />
            </div>

            {/* Classificação (Gestão do Tempo) - botões grandes */}
            <div>
              <Label>Classificação (Gestão do Tempo)</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(Object.entries(TRIADE_CONFIG) as [TaskCategory, (typeof TRIADE_CONFIG)[TaskCategory]][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: key }))}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${
                      form.category === key
                        ? `${cfg.activeBg} ${cfg.activeBorder} ${cfg.activeText}`
                        : "border-border text-muted-foreground hover:border-border"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${cfg.dot}`} />
                    <span className="text-xs font-medium">{cfg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Categoria do usuário */}
            {taskCategories.length > 0 && (
              <div>
                <Label>Categoria</Label>
                <Select
                  value={form.taskCategoryId ? String(form.taskCategoryId) : "__none__"}
                  onValueChange={(v) => setForm((f) => ({ ...f, taskCategoryId: v === "__none__" ? null : Number(v) }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">📋 Sem categoria</SelectItem>
                    {taskCategories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.emoji} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Duração + Data lado a lado */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duração (min)</Label>
                <Input
                  type="number"
                  min={1}
                  max={480}
                  value={form.durationMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Data</Label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <Checkbox
                      checked={!form.scheduledDate}
                      onCheckedChange={(v) => setForm((f) => ({ ...f, scheduledDate: v ? "" : getTodayStr() }))}
                    />
                    <span className="text-xs text-muted-foreground">Definir depois</span>
                  </label>
                </div>
                <Input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                  className="mt-0"
                  disabled={!form.scheduledDate}
                  placeholder="Sem data (backlog)"
                />
                {!form.scheduledDate && (
                  <p className="text-[11px] text-amber-500 mt-1">📋 Irá para o backlog</p>
                )}
              </div>
            </div>

            {/* Hora */}
            <div>
              <Label>Hora</Label>
              <Input
                type="time"
                value={form.scheduledTime}
                onChange={(e) => setForm((f) => ({ ...f, scheduledTime: e.target.value }))}
                className="mt-1"
              />
            </div>

            {/* Tarefa recorrente */}
            <div className="flex items-center gap-3 p-3 border border-border rounded-xl">
              <Checkbox
                id="isRecurring"
                checked={form.isRecurring}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isRecurring: !!v }))}
              />
              <label htmlFor="isRecurring" className="text-sm text-foreground/90 cursor-pointer select-none">
                Tarefa recorrente
              </label>
            </div>

            {/* Descrição */}
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Detalhes opcionais..."
                className="mt-1 resize-none"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createTask.isPending || updateTask.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {editingTask ? "Salvar alterações" : "Criar Tarefa"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Category Manager Dialog ─────────────────────────────────────────── */}
      <Dialog open={showCategoryManager} onOpenChange={setShowCategoryManager}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Gerenciar Categorias</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-xs text-muted-foreground">
              Crie categorias personalizadas para agrupar suas tarefas (ex: 💼 Comercial, 🏥 Saúde, 📚 Estudos).
            </p>
            <div className="flex gap-2">
              <Input
                value={newCatEmoji}
                onChange={(e) => setNewCatEmoji(e.target.value)}
                placeholder="Emoji"
                className="w-16 text-center"
                maxLength={2}
              />
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nome da categoria"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCatName.trim()) {
                    createCategory.mutate({ name: newCatName.trim(), emoji: newCatEmoji });
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (!newCatName.trim()) return;
                  createCategory.mutate({ name: newCatName.trim(), emoji: newCatEmoji });
                }}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={createCategory.isPending}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {taskCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground/70 text-center py-4">Nenhuma categoria criada</p>
              ) : (
                taskCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                    <span>{cat.emoji}</span>
                    <span className="flex-1 text-sm text-foreground/90">{cat.name}</span>
                    <button
                      onClick={() => deleteCategory.mutate({ id: cat.id })}
                      className="text-muted-foreground/70 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
