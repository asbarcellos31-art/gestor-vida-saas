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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus,
  Play,
  CheckCircle2,
  Trash2,
  Edit2,
  Clock,
  BarChart3,
  Calendar,
  Target,
  AlertTriangle,
  Shuffle,
  Timer,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";

type TaskCategory = "important" | "urgent" | "circumstantial";
type TaskStatus = "pending" | "started" | "completed";

const CATEGORY_CONFIG: Record<
  TaskCategory,
  { label: string; color: string; bg: string; icon: React.ElementType; description: string }
> = {
  important: {
    label: "Importante",
    color: "text-violet-700",
    bg: "bg-violet-100",
    icon: Target,
    description: "Contribui para seus objetivos de longo prazo",
  },
  urgent: {
    label: "Urgente",
    color: "text-rose-700",
    bg: "bg-rose-100",
    icon: AlertTriangle,
    description: "Demanda atenção imediata",
  },
  circumstantial: {
    label: "Circunstancial",
    color: "text-amber-700",
    bg: "bg-amber-100",
    icon: Shuffle,
    description: "Pode ser delegado ou adiado",
  },
};

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

interface TaskFormData {
  title: string;
  durationMinutes: number;
  category: TaskCategory;
  scheduledDate: string;
  notes: string;
}

const DEFAULT_FORM: TaskFormData = {
  title: "",
  durationMinutes: 30,
  category: "important",
  scheduledDate: getTodayStr(),
  notes: "",
};

export default function GestaoTempo() {
  const utils = trpc.useUtils();
  const today = useMemo(() => getTodayStr(), []);
  const weekDates = useMemo(() => getWeekDates(), []);

  const [selectedDate, setSelectedDate] = useState(today);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [form, setForm] = useState<TaskFormData>(DEFAULT_FORM);
  const [activeTimer, setActiveTimer] = useState<{ taskId: number; startedAt: Date } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: tasks = [], isLoading } = trpc.tasks.byDate.useQuery({ date: selectedDate });
  const { data: weekTasks = [] } = trpc.tasks.byDateRange.useQuery({
    startDate: weekDates[0],
    endDate: weekDates[6],
  });
  const { data: score } = trpc.tasks.score.useQuery();

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.byDate.invalidate();
      utils.tasks.byDateRange.invalidate();
      utils.tasks.score.invalidate();
      setDialogOpen(false);
      setForm(DEFAULT_FORM);
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
      setForm(DEFAULT_FORM);
      toast.success("Tarefa atualizada!");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      utils.tasks.byDate.invalidate();
      utils.tasks.byDateRange.invalidate();
      utils.tasks.score.invalidate();
      toast.success("Tarefa excluída!");
    },
    onError: (e) => toast.error(e.message),
  });

  // Timer logic
  useEffect(() => {
    if (activeTimer) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - activeTimer.startedAt.getTime()) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTimer]);

  const handleStartTask = (taskId: number) => {
    if (activeTimer?.taskId === taskId) {
      // Stop timer
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
    setForm({
      title: task.title,
      durationMinutes: task.durationMinutes,
      category: task.category as TaskCategory,
      scheduledDate: task.scheduledDate,
      notes: task.notes ?? "",
    });
    setDialogOpen(true);
  };

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const tasksByCategory = useMemo(() => {
    const cats: Record<TaskCategory, typeof tasks> = { important: [], urgent: [], circumstantial: [] };
    tasks.forEach((t) => cats[t.category as TaskCategory].push(t));
    return cats;
  }, [tasks]);

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Tempo</h1>
            <p className="text-gray-500 text-sm mt-0.5">Metodologia Tríade do Tempo</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingTask(null); setForm(DEFAULT_FORM); } }}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700">
                <Plus className="w-4 h-4 mr-1" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="O que você precisa fazer?"
                    className="mt-1"
                  />
                </div>
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
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={form.scheduledDate}
                      onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Categoria (Tríade)</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm((f) => ({ ...f, category: v as TaskCategory }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(CATEGORY_CONFIG) as [TaskCategory, typeof CATEGORY_CONFIG[TaskCategory]][]).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                            <span>{cfg.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {CATEGORY_CONFIG[form.category].description}
                  </p>
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Detalhes opcionais..."
                    className="mt-1 resize-none"
                    rows={2}
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={createTask.isPending || updateTask.isPending}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  {editingTask ? "Salvar alterações" : "Criar tarefa"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="meu-dia">
          <TabsList className="mb-6">
            <TabsTrigger value="meu-dia" className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Meu Dia
            </TabsTrigger>
            <TabsTrigger value="semana" className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Planejamento
            </TabsTrigger>
            <TabsTrigger value="relatorio" className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" />
              Relatório
            </TabsTrigger>
          </TabsList>

          {/* ─── Meu Dia ──────────────────────────────────────────────────────── */}
          <TabsContent value="meu-dia">
            {/* Date selector */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {weekDates.map((d) => {
                const isToday = d === today;
                const isSelected = d === selectedDate;
                const dayTasks = weekTasks.filter((t) => t.scheduledDate === d);
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-violet-600 text-white"
                        : isToday
                        ? "bg-violet-100 text-violet-700 border border-violet-200"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-violet-200"
                    }`}
                  >
                    <span className="uppercase">{formatDate(d).split(",")[0]}</span>
                    <span className="text-base font-bold">{new Date(d + "T12:00:00").getDate()}</span>
                    {dayTasks.length > 0 && (
                      <span
                        className={`mt-0.5 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/70" : "bg-violet-400"}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active timer banner */}
            {activeTimer && (
              <div className="mb-4 p-3 rounded-xl bg-violet-50 border border-violet-200 flex items-center gap-3">
                <Timer className="w-5 h-5 text-violet-600 animate-pulse" />
                <span className="text-sm text-violet-700 font-medium">
                  Tarefa em andamento — {formatElapsed(elapsed)}
                </span>
              </div>
            )}

            {/* Tasks by category */}
            {isLoading ? (
              <div className="text-center py-12 text-gray-400">Carregando...</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Nenhuma tarefa para este dia</p>
                <p className="text-gray-400 text-sm mt-1">Clique em "Nova Tarefa" para começar</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(Object.entries(tasksByCategory) as [TaskCategory, typeof tasks][]).map(([cat, catTasks]) => {
                  if (catTasks.length === 0) return null;
                  const cfg = CATEGORY_CONFIG[cat];
                  return (
                    <div key={cat}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-6 h-6 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                          <cfg.icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm">{cfg.label}</h3>
                        <Badge variant="secondary" className="text-xs">{catTasks.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {catTasks.map((task) => {
                          const isRunning = activeTimer?.taskId === task.id;
                          const isDone = task.status === "completed";
                          return (
                            <div
                              key={task.id}
                              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                                isDone
                                  ? "bg-gray-50 border-gray-100 opacity-70"
                                  : isRunning
                                  ? "bg-violet-50 border-violet-200"
                                  : "bg-white border-gray-100 hover:border-gray-200"
                              }`}
                            >
                              <button
                                onClick={() => handleCompleteTask(task.id)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                  isDone
                                    ? "bg-emerald-500 border-emerald-500"
                                    : "border-gray-300 hover:border-emerald-400"
                                }`}
                              >
                                {isDone && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {task.durationMinutes}min
                                    {task.executedMinutes > 0 && ` (executado: ${task.executedMinutes}min)`}
                                  </span>
                                  {isRunning && (
                                    <span className="text-xs text-violet-600 font-medium">
                                      ⏱ {formatElapsed(elapsed)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {!isDone && (
                                  <button
                                    onClick={() => handleStartTask(task.id)}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      isRunning
                                        ? "bg-violet-100 text-violet-600"
                                        : "hover:bg-gray-100 text-gray-400 hover:text-violet-600"
                                    }`}
                                    title={isRunning ? "Pausar" : "Iniciar"}
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => openEdit(task)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteTask.mutate({ id: task.id })}
                                  className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ─── Planejamento Semanal ─────────────────────────────────────────── */}
          <TabsContent value="semana">
            <div className="grid grid-cols-7 gap-3">
              {weekDates.map((d) => {
                const dayTasks = weekTasks.filter((t) => t.scheduledDate === d);
                const completed = dayTasks.filter((t) => t.status === "completed").length;
                const isToday = d === today;
                return (
                  <div
                    key={d}
                    className={`rounded-xl border p-3 min-h-[200px] ${
                      isToday ? "border-violet-300 bg-violet-50" : "border-gray-100 bg-white"
                    }`}
                  >
                    <div className="text-center mb-3">
                      <p className="text-xs text-gray-500 uppercase font-medium">
                        {new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" })}
                      </p>
                      <p className={`text-lg font-bold ${isToday ? "text-violet-700" : "text-gray-900"}`}>
                        {new Date(d + "T12:00:00").getDate()}
                      </p>
                      {dayTasks.length > 0 && (
                        <p className="text-xs text-gray-400">
                          {completed}/{dayTasks.length}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.map((t) => {
                        const cfg = CATEGORY_CONFIG[t.category as TaskCategory];
                        return (
                          <div
                            key={t.id}
                            className={`text-xs px-2 py-1 rounded-lg ${cfg.bg} ${cfg.color} truncate ${
                              t.status === "completed" ? "opacity-50 line-through" : ""
                            }`}
                            title={t.title}
                          >
                            {t.title}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ─── Relatório ────────────────────────────────────────────────────── */}
          <TabsContent value="relatorio">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-violet-600" />
                    Score de Produtividade (30 dias)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-24 h-24">
                      <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#7c3aed"
                          strokeWidth="3"
                          strokeDasharray={`${score?.score ?? 0}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-900">{score?.score ?? 0}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">{score?.completed ?? 0}</span> tarefas concluídas
                      </p>
                      <p className="text-sm text-gray-600">
                        de <span className="font-semibold text-gray-900">{score?.total ?? 0}</span> planejadas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tríade distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-5 h-5 text-violet-600" />
                    Distribuição da Tríade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(["important", "urgent", "circumstantial"] as TaskCategory[]).map((cat) => {
                      const cfg = CATEGORY_CONFIG[cat];
                      const pct =
                        cat === "important"
                          ? score?.importantPct ?? 0
                          : cat === "urgent"
                          ? score?.urgentPct ?? 0
                          : score?.circumstantialPct ?? 0;
                      return (
                        <div key={cat}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <div className="flex items-center gap-2">
                              <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                              <span className="text-gray-700">{cfg.label}</span>
                            </div>
                            <span className="font-semibold text-gray-900">{pct}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${cfg.bg.replace("bg-", "bg-").replace("-100", "-500")}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-4">
                    Ideal: Foco em tarefas Importantes para crescimento sustentável.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
