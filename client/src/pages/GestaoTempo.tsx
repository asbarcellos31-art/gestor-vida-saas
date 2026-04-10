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
  Bell,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";

type TaskCategory = "important" | "urgent" | "circumstantial";
type TaskStatus = "pending" | "started" | "completed";

const CATEGORY_CONFIG = {
  important: { label: "Importante", dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
  urgent: { label: "Urgente", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  circumstantial: { label: "Circunstancial", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
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
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return {
    weekday: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "").toUpperCase(),
    day: d.getDate(),
    month: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
  };
}

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatMinutes(mins: number) {
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h${String(m).padStart(2, "0")}min` : `${h}h`;
  }
  return `${mins}min`;
}

interface TaskFormData {
  title: string;
  durationMinutes: number;
  category: TaskCategory;
  scheduledDate: string;
  notes: string;
}

const DEFAULT_FORM = (date: string): TaskFormData => ({
  title: "",
  durationMinutes: 30,
  category: "important",
  scheduledDate: date,
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
  const [activeTimer, setActiveTimer] = useState<{ taskId: number; startedAt: Date } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [reminderEmoji, setReminderEmoji] = useState("📌");
  const [reminderText, setReminderText] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminders, setReminders] = useState<{ emoji: string; text: string; time: string }[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const { data: tasks = [], isLoading } = trpc.tasks.byDate.useQuery({ date: selectedDate });
  const { data: weekTasks = [] } = trpc.tasks.byDateRange.useQuery({
    startDate: weekDates[0],
    endDate: weekDates[6],
  });
  const { data: score } = trpc.tasks.score.useQuery();

  // Timer
  useEffect(() => {
    if (activeTimer) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - activeTimer.startedAt.getTime()) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeTimer]);

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.byDate.invalidate();
      utils.tasks.byDateRange.invalidate();
      utils.tasks.score.invalidate();
      setDialogOpen(false);
      setForm(DEFAULT_FORM(selectedDate));
      toast.success("Tarefa criada!");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.byDate.invalidate();
      utils.tasks.byDateRange.invalidate();
      utils.tasks.score.invalidate();
      setDialogOpen(false);
      setEditingTask(null);
      setForm(DEFAULT_FORM(selectedDate));
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      utils.tasks.byDate.invalidate();
      utils.tasks.byDateRange.invalidate();
      utils.tasks.score.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleQuickCreate = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && quickTitle.trim()) {
      createTask.mutate({ title: quickTitle.trim(), durationMinutes: 30, category: "important", scheduledDate: selectedDate, notes: "" });
      setQuickTitle("");
    }
  };

  const handleStartTask = (taskId: number) => {
    if (activeTimer?.taskId === taskId) {
      const mins = Math.floor(elapsed / 60);
      updateTask.mutate({ id: taskId, status: "started", executedMinutes: mins });
      setActiveTimer(null);
    } else {
      setActiveTimer({ taskId, startedAt: new Date() });
      updateTask.mutate({ id: taskId, status: "started" });
    }
  };

  const handleCompleteTask = (taskId: number) => {
    const mins = activeTimer?.taskId === taskId ? Math.floor(elapsed / 60) : undefined;
    if (activeTimer?.taskId === taskId) setActiveTimer(null);
    updateTask.mutate({ id: taskId, status: "completed", ...(mins !== undefined && { executedMinutes: mins }) });
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return toast.error("Informe o título da tarefa.");
    if (editingTask) {
      updateTask.mutate({ id: editingTask, ...form });
    } else {
      createTask.mutate(form);
    }
  };

  const openEdit = (task: (typeof tasks)[0]) => {
    setEditingTask(task.id);
    setForm({ title: task.title, durationMinutes: task.durationMinutes, category: task.category as TaskCategory, scheduledDate: task.scheduledDate, notes: task.notes ?? "" });
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

  const toggleGroup = (cat: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const addReminder = () => {
    if (!reminderText.trim()) return;
    setReminders(prev => [...prev, { emoji: reminderEmoji, text: reminderText, time: reminderTime }]);
    setReminderText("");
    setReminderTime("");
  };

  // Group tasks by category
  const tasksByCategory = useMemo(() => {
    const cats: Record<TaskCategory, typeof tasks> = { important: [], urgent: [], circumstantial: [] };
    tasks.forEach((t) => cats[t.category as TaskCategory].push(t));
    return cats;
  }, [tasks]);

  // Stats
  const totalPlanned = tasks.reduce((s, t) => s + t.durationMinutes, 0);
  const totalExecuted = tasks.reduce((s, t) => s + (t.executedMinutes ?? 0), 0);
  const totalRemaining = Math.max(0, totalPlanned - totalExecuted);
  const completedCount = tasks.filter(t => t.status === "completed").length;

  // Score breakdown
  const scoreData = score ?? { score: 0, completed: 0, total: 0, importantPct: 0, urgentPct: 0, circumstantialPct: 0 };
  const impPct = scoreData.importantPct ?? 0;
  const urgPct = scoreData.urgentPct ?? 0;
  const circPct = scoreData.circumstantialPct ?? 0;
  const scoreBarPct = scoreData.score ?? 0;


  return (
    <AppLayout>
      <div className="p-3 sm:p-5 max-w-6xl mx-auto">

        {/* ─── Tab Bar ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
          {(["meu-dia", "planejamento", "relatorio"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab
                  ? "border-violet-600 text-violet-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "meu-dia" ? "Meu Dia" : tab === "planejamento" ? "Planejamento" : "Relatório"}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MEU DIA                                                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "meu-dia" && (
          <div>
            {/* Date navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => navigateDay(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <p className="text-base sm:text-lg font-bold text-gray-900 capitalize">
                  {formatFullDate(selectedDate)}
                </p>
              </div>
              <button onClick={() => navigateDay(1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Week mini-nav */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
              {weekDates.map((d) => {
                const isToday = d === today;
                const isSelected = d === selectedDate;
                const fmt = formatShortDate(d);
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    className={`flex-shrink-0 flex flex-col items-center px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors min-w-[44px] ${
                      isSelected ? "bg-violet-600 text-white" : isToday ? "bg-violet-100 text-violet-700 border border-violet-200" : "bg-white text-gray-600 border border-gray-200 hover:border-violet-200"
                    }`}
                  >
                    <span className="text-[10px] uppercase">{fmt.weekday.slice(0, 3)}</span>
                    <span className="text-sm font-bold">{fmt.day}</span>
                  </button>
                );
              })}
            </div>

            {/* Day stats bar */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-4 px-1 text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{tasks.length} atividades</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400" />{formatMinutes(totalPlanned)} plan.</span>
              <span className="flex items-center gap-1"><Play className="w-3.5 h-3.5 text-green-500" />{formatMinutes(totalExecuted)} exec.</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" />{formatMinutes(totalRemaining)} rest.</span>
              <span className="ml-auto font-bold text-gray-800">{completedCount}/{tasks.length}</span>
            </div>

            {/* Score 30 days */}
            <div className="mb-4 p-3 rounded-xl bg-white border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Score 30 dias ({scoreData.total} tarefas)
                </span>
                <span className="text-xs font-bold text-gray-700">{scoreBarPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-green-500 transition-all" style={{ width: `${impPct}%` }} />
                <div className="h-full bg-red-500 transition-all" style={{ width: `${urgPct}%` }} />
                <div className="h-full bg-amber-400 transition-all" style={{ width: `${circPct}%` }} />
              </div>
              <div className="flex gap-3 mt-1.5 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{impPct}% Imp.</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{urgPct}% Urg.</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{circPct}% Circ.</span>
              </div>
            </div>

            {/* Quick create */}
            <div className="flex gap-2 mb-5">
              <Input
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                onKeyDown={handleQuickCreate}
                placeholder="Criar nova tarefa rápida (Enter para salvar)"
                className="flex-1 bg-white border-gray-200 text-sm"
              />
              <Button onClick={() => openNew()} className="bg-violet-600 hover:bg-violet-700 shrink-0 text-sm px-3">
                <Plus className="w-4 h-4 mr-1" />
                Nova
              </Button>
            </div>

            {/* Active timer banner */}
            {activeTimer && (
              <div className="mb-4 p-3 rounded-xl bg-violet-50 border border-violet-200 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-sm text-violet-700 font-medium flex-1">
                  Tarefa em andamento
                </span>
                <span className="font-mono text-violet-700 font-bold text-sm">{formatTime(elapsed)}</span>
              </div>
            )}

            {/* Tasks grouped by category */}
            {isLoading ? (
              <div className="text-center py-12 text-gray-400">Carregando...</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Nenhuma tarefa para este dia</p>
                <p className="text-gray-400 text-sm mt-1">Use o campo acima para criar uma tarefa rápida</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(Object.entries(tasksByCategory) as [TaskCategory, typeof tasks][]).map(([cat, catTasks]) => {
                  if (catTasks.length === 0) return null;
                  const cfg = CATEGORY_CONFIG[cat];
                  const totalMins = catTasks.reduce((s, t) => s + t.durationMinutes, 0);
                  const executedMins = catTasks.reduce((s, t) => s + (t.executedMinutes ?? 0), 0);
                  const collapsed = collapsedGroups.has(cat);

                  return (
                    <div key={cat} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                      {/* Group header */}
                      <div
                        className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleGroup(cat)}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} flex-shrink-0`} />
                        <span className="font-semibold text-gray-800 text-sm flex-1">{cfg.label}</span>
                        <span className="text-xs text-gray-400">{catTasks.length}</span>
                        <span className="text-xs text-gray-400">{formatMinutes(executedMins)}/{formatMinutes(totalMins)}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); openNew(cat); }}
                          className="ml-1 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                          title={`Nova tarefa em ${cfg.label}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${collapsed ? "" : "rotate-90"}`} />
                      </div>

                      {/* Task list */}
                      {!collapsed && (
                        <div className="divide-y divide-gray-50">
                          {/* Column headers */}
                          <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 text-[10px] uppercase tracking-wide text-gray-400 font-medium">
                            <span className="flex-1">Nome</span>
                            <span className="w-16 text-right hidden sm:block">Duração</span>
                            <span className="w-20 text-right hidden sm:block">Timer</span>
                            <span className="w-24" />
                          </div>
                          {catTasks.map((task) => {
                            const isRunning = activeTimer?.taskId === task.id;
                            const isDone = task.status === "completed";
                            return (
                              <div
                                key={task.id}
                                className={`flex items-center gap-2 sm:gap-3 px-4 py-3 transition-colors ${
                                  isDone ? "bg-gray-50/50" : isRunning ? "bg-violet-50/50" : "hover:bg-gray-50/50"
                                }`}
                              >
                                {/* Complete button */}
                                <button
                                  onClick={() => handleCompleteTask(task.id)}
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                    isDone ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-green-400"
                                  }`}
                                  title="Concluir tarefa"
                                >
                                  {isDone && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </button>

                                {/* Title */}
                                <span className={`flex-1 text-sm min-w-0 truncate ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
                                  {task.title}
                                </span>

                                {/* Duration */}
                                <span className="text-xs text-gray-400 w-16 text-right hidden sm:block shrink-0">
                                  <Clock className="w-3 h-3 inline mr-0.5" />{task.durationMinutes}min
                                </span>

                                {/* Timer display */}
                                <span className="font-mono text-xs text-gray-400 w-20 text-right hidden sm:block shrink-0">
                                  {isRunning ? (
                                    <span className="text-violet-600 font-bold">{formatTime(elapsed)}</span>
                                  ) : (
                                    formatTime((task.executedMinutes ?? 0) * 60)
                                  )}
                                </span>

                                {/* Action buttons */}
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    onClick={() => handleCompleteTask(task.id)}
                                    className={`p-1.5 rounded-lg text-xs transition-colors ${isDone ? "text-green-500" : "text-gray-400 hover:text-green-600 hover:bg-green-50"}`}
                                    title="Concluir tarefa"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </button>
                                  {!isDone && (
                                    <button
                                      onClick={() => handleStartTask(task.id)}
                                      className={`p-1.5 rounded-lg transition-colors ${isRunning ? "text-violet-600 bg-violet-100" : "text-gray-400 hover:text-violet-600 hover:bg-violet-50"}`}
                                      title={isRunning ? "Pausar" : "Iniciar"}
                                    >
                                      {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => openEdit(task)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                    title="Editar"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteTask.mutate({ id: task.id })}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Lembretes */}
            <div className="mt-6 bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
                <Bell className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-gray-700 text-sm">Lembretes</span>
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-3">
                  <select
                    value={reminderEmoji}
                    onChange={(e) => setReminderEmoji(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white"
                  >
                    {REMINDER_EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
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
                    className="border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white w-28"
                  />
                </div>
                {reminders.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Nenhum lembrete para hoje. Adicione aniversários, almoços, compromissos...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {reminders.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <span>{r.emoji}</span>
                        <span className="flex-1">{r.text}</span>
                        {r.time && <span className="text-gray-400 text-xs">{r.time}</span>}
                        <button onClick={() => setReminders(prev => prev.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400 transition-colors">
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
        {/* PLANEJAMENTO SEMANAL                                               */}
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
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <p className="text-sm font-semibold text-gray-700">
                {new Date(weekDates[0] + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} — {new Date(weekDates[6] + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </p>
              <button
                onClick={() => {
                  const d = new Date(weekDates[6] + "T12:00:00");
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d.toISOString().split("T")[0]);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-3">
              {/* Backlog */}
              <div className="w-44 sm:w-52 flex-shrink-0">
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-50 bg-gray-50">
                    <span className="text-xs font-semibold text-gray-600">Tarefas pendentes</span>
                    <button onClick={() => openNew()} className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-2 space-y-1.5 max-h-[500px] overflow-y-auto">
                    {weekTasks.filter(t => t.status !== "completed").length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">Nenhuma tarefa pendente</p>
                    ) : (
                      weekTasks.filter(t => t.status !== "completed").map(t => {
                        const cfg = CATEGORY_CONFIG[t.category as TaskCategory];
                        return (
                          <div key={t.id} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs ${cfg.bg} ${cfg.text} cursor-pointer hover:opacity-80`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
                            <span className="truncate flex-1">{t.title}</span>
                            <span className="text-[10px] opacity-60">{t.durationMinutes}min</span>
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
                    const completed = dayTasks.filter((t) => t.status === "completed").length;
                    const isToday = d === today;
                    const fmt = formatShortDate(d);
                    return (
                      <div
                        key={d}
                        className={`flex-1 rounded-xl border overflow-hidden ${isToday ? "border-violet-300" : "border-gray-100"}`}
                      >
                        <div className={`text-center py-2 border-b ${isToday ? "bg-violet-50 border-violet-100" : "bg-gray-50 border-gray-50"}`}>
                          <p className="text-[10px] text-gray-400 uppercase font-medium">{fmt.weekday}</p>
                          <p className={`text-base font-bold ${isToday ? "text-violet-700" : "text-gray-800"}`}>{fmt.day}/{fmt.month}</p>
                          {dayTasks.length > 0 && (
                            <p className="text-[10px] text-gray-400">✅ {completed}/{dayTasks.length}</p>
                          )}
                        </div>
                        <div className="p-1.5 space-y-1 min-h-[160px] bg-white">
                          {dayTasks.map((t) => {
                            const cfg = CATEGORY_CONFIG[t.category as TaskCategory];
                            return (
                              <div
                                key={t.id}
                                className={`text-[11px] px-1.5 py-1 rounded flex items-center gap-1 ${cfg.bg} ${cfg.text} ${t.status === "completed" ? "opacity-40 line-through" : ""}`}
                                title={t.title}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
                                <span className="truncate">{t.title}</span>
                              </div>
                            );
                          })}
                          <button
                            onClick={() => { setSelectedDate(d); openNew(); }}
                            className="w-full text-[11px] text-gray-400 hover:text-violet-600 py-1 text-center hover:bg-violet-50 rounded transition-colors"
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
            <div className="flex gap-4 mt-4 text-xs text-gray-500">
              {(Object.entries(CATEGORY_CONFIG) as [TaskCategory, typeof CATEGORY_CONFIG[TaskCategory]][]).map(([key, cfg]) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* RELATÓRIO                                                          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "relatorio" && (
          <div>
            {/* Date navigation */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => navigateDay(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <p className="text-base font-bold text-gray-900 capitalize">{formatFullDate(selectedDate)}</p>
              <button onClick={() => navigateDay(1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* 4 stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Total de tarefas", value: tasks.length, color: "text-gray-800" },
                { label: "Concluídas", value: completedCount, color: "text-green-600" },
                { label: "Tempo total", value: `${Math.floor(totalExecuted / 60)}h${String(totalExecuted % 60).padStart(2, "0")}m`, color: "text-violet-700" },
                { label: "Taxa de conclusão", value: `${tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%`, color: "text-blue-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Tempo por categoria */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tempo por Categoria</h3>
              {(Object.entries(tasksByCategory) as [TaskCategory, typeof tasks][]).map(([cat, catTasks]) => {
                if (catTasks.length === 0) return null;
                const cfg = CATEGORY_CONFIG[cat];
                const totalSecs = catTasks.reduce((s, t) => s + (t.executedMinutes ?? 0) * 60, 0);
                return (
                  <div key={cat} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className="text-sm text-gray-700">{cfg.label}</span>
                    </div>
                    <span className="text-sm text-gray-500">{formatTime(totalSecs)} • {catTasks.length} tarefas</span>
                  </div>
                );
              })}
              {tasks.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nenhuma tarefa neste dia</p>}
            </div>

            {/* Detalhamento por tarefa */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Detalhamento por Tarefa</h3>
              {tasks.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Nenhuma tarefa neste dia</p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((t) => {
                    const cfg = CATEGORY_CONFIG[t.category as TaskCategory];
                    return (
                      <div key={t.id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0`} />
                        <span className={`text-sm flex-1 ${t.status === "completed" ? "line-through text-gray-400" : "text-gray-700"}`}>{t.title}</span>
                        <span className="text-xs text-gray-400">{t.executedMinutes ? formatTime(t.executedMinutes * 60) : "—"}</span>
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
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingTask(null); setForm(DEFAULT_FORM(selectedDate)); } }}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Título</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="O que você precisa fazer?" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duração (min)</Label>
                <Input type="number" min={1} max={480} value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))} className="mt-1" />
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" value={form.scheduledDate} onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Categoria (Tríade)</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as TaskCategory }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(CATEGORY_CONFIG) as [TaskCategory, typeof CATEGORY_CONFIG[TaskCategory]][]).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span>{cfg.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Detalhes opcionais..." className="mt-1 resize-none" rows={2} />
            </div>
            <Button onClick={handleSubmit} disabled={createTask.isPending || updateTask.isPending} className="w-full bg-violet-600 hover:bg-violet-700">
              {editingTask ? "Salvar alterações" : "Criar tarefa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
