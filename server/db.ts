import { and, desc, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  InsertTask,
  InsertSubscription,
  InsertTaskCategory,
  users,
  subscriptions,
  tasks,
  taskCategories,
  timeSessions,
  reminders,
  incomeEntries,
  fixedBills,
  fixedBillLabels,
  billEntries,
  expenseEntries,
  installmentBills,
  retirementConfig,
  categories,
  paymentMethods,
  familyMembers,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── Users ─────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ── Subscriptions ─────────────────────────────────────────────────────────────
export async function getActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), inArray(subscriptions.status, ["active", "trialing"])))
    .limit(1);
  const sub = result[0] ?? null;
  if (sub && sub.status === "trialing" && sub.trialEndsAt) {
    if (new Date() > sub.trialEndsAt) {
      await db.update(subscriptions).set({ status: "expired" }).where(eq(subscriptions.id, sub.id));
      return null;
    }
  }
  return sub;
}

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(subscriptions).values(data);
}

export async function updateSubscription(id: number, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(subscriptions).set(data).where(eq(subscriptions.id, id));
}

export async function upsertSubscriptionByStripeId(
  stripeSubscriptionId: string,
  data: Partial<InsertSubscription>
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  if (existing[0]) {
    await db.update(subscriptions).set(data).where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
  }
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  return result[0] ?? null;
}

// ── Tasks (Gestão de Tempo) ───────────────────────────────────────────────────
export async function getTasksByDate(userId: number, dateStr: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.scheduledDate, dateStr)))
    .orderBy(tasks.createdAt);
}

export async function getBacklogTasks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  // Backlog = tarefas sem data (null ou string vazia)
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), or(isNull(tasks.scheduledDate), eq(tasks.scheduledDate, ""))))
    .orderBy(tasks.createdAt);
}

export async function getTasksByDateRange(userId: number, startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        gte(tasks.scheduledDate, startDate),
        lte(tasks.scheduledDate, endDate)
      )
    )
    .orderBy(tasks.scheduledDate, tasks.createdAt);
}

export async function createTask(data: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(tasks).values(data);
  return result;
}

export async function updateTask(id: number, userId: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db
    .update(tasks)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}

export async function deleteTask(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}

export async function getProductivityScore(userId: number) {
  const db = await getDb();
  if (!db) return { score: 0, completed: 0, total: 0, importantPct: 0, urgentPct: 0, circumstantialPct: 0 };

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

  const allTasks = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), gte(tasks.scheduledDate, dateStr)));

  const total = allTasks.length;
  const completed = allTasks.filter((t) => t.status === "completed").length;
  const important = allTasks.filter((t) => t.category === "important").length;
  const urgent = allTasks.filter((t) => t.category === "urgent").length;
  const circumstantial = allTasks.filter((t) => t.category === "circumstantial").length;

  return {
    score: total > 0 ? Math.round((completed / total) * 100) : 0,
    completed,
    total,
    importantPct: total > 0 ? Math.round((important / total) * 100) : 0,
    urgentPct: total > 0 ? Math.round((urgent / total) * 100) : 0,
    circumstantialPct: total > 0 ? Math.round((circumstantial / total) * 100) : 0,
  };
}

// ── Time Sessions ─────────────────────────────────────────────────────────────
export async function startTimeSession(taskId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(timeSessions).values({ taskId, userId, startedAt: new Date() });
  await db.update(tasks).set({ status: "started", startedAt: new Date(), updatedAt: new Date() }).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
}

export async function endTimeSession(taskId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const openSession = await db
    .select()
    .from(timeSessions)
    .where(and(eq(timeSessions.taskId, taskId), eq(timeSessions.userId, userId), isNull(timeSessions.endedAt)))
    .limit(1);
  if (openSession[0]) {
    const durationMs = new Date().getTime() - openSession[0].startedAt.getTime();
    const durationMinutes = Math.round(durationMs / 60000);
    await db.update(timeSessions).set({ endedAt: new Date(), durationMinutes }).where(eq(timeSessions.id, openSession[0].id));
    // Atualizar executedMinutes na tarefa
    const task = await db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId))).limit(1);
    if (task[0]) {
      await db.update(tasks).set({ executedMinutes: (task[0].executedMinutes ?? 0) + durationMinutes, updatedAt: new Date() }).where(eq(tasks.id, taskId));
    }
  }
}

// ── Reminders ─────────────────────────────────────────────────────────────────
export async function getRemindersByDate(userId: number, dateStr: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(reminders)
    .where(and(eq(reminders.userId, userId), eq(reminders.reminderDate, dateStr)))
    .orderBy(reminders.reminderTime);
}

export async function createReminder(data: { userId: number; title: string; description?: string; reminderDate: string; reminderTime: string }) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(reminders).values({ ...data, description: data.description ?? null });
}

export async function deleteReminder(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(reminders).where(and(eq(reminders.id, id), eq(reminders.userId, userId)));
}

// ── Income Entries (Receitas — lançamentos individuais) ───────────────────────
export async function getIncomeEntries(userId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(incomeEntries)
    .where(and(eq(incomeEntries.userId, userId), eq(incomeEntries.year, year), eq(incomeEntries.month, month)))
    .orderBy(incomeEntries.createdAt);
}

export async function addIncomeEntry(userId: number, year: number, month: number, description: string, amount: string, category?: string | null, memberId?: number | null) {
  const db = await getDb();
  if (!db) return;
  await db.insert(incomeEntries).values({ userId, year, month, description, amount, category: category || "Outros", memberId: memberId ?? null });
}

export async function updateIncomeEntry(id: number, userId: number, data: { description?: string; amount?: string; category?: string | null }) {
  const db = await getDb();
  if (!db) return;
  await db.update(incomeEntries).set(data).where(and(eq(incomeEntries.id, id), eq(incomeEntries.userId, userId)));
}

export async function deleteIncomeEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(incomeEntries).where(and(eq(incomeEntries.id, id), eq(incomeEntries.userId, userId)));
}

// Compatibilidade para relatórios anuais
export async function getAnnualIncome(userId: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(incomeEntries).where(and(eq(incomeEntries.userId, userId), eq(incomeEntries.year, year)));
}

// ── Fixed Bills (Contas Fixas — por billKey) ──────────────────────────────────
export async function getFixedBills(userId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(fixedBills)
    .where(and(eq(fixedBills.userId, userId), eq(fixedBills.year, year), eq(fixedBills.month, month)))
    .orderBy(fixedBills.billKey);
}

export async function upsertFixedBill(userId: number, year: number, month: number, billKey: string, amount: string, paid?: boolean, paidDate?: string | null) {
  const db = await getDb();
  if (!db) return;
  const existing = await db
    .select()
    .from(fixedBills)
    .where(and(eq(fixedBills.userId, userId), eq(fixedBills.year, year), eq(fixedBills.month, month), eq(fixedBills.billKey, billKey)))
    .limit(1);
  if (existing.length > 0) {
    const upd: Record<string, unknown> = { amount };
    if (paid !== undefined) upd.paid = paid;
    if (paidDate !== undefined) upd.paidDate = paidDate;
    await db.update(fixedBills).set(upd).where(and(eq(fixedBills.userId, userId), eq(fixedBills.year, year), eq(fixedBills.month, month), eq(fixedBills.billKey, billKey)));
  } else {
    await db.insert(fixedBills).values({ userId, year, month, billKey, amount, paid: paid ?? false, paidDate: paidDate ?? null });
  }
}

export async function toggleFixedBillPaid(userId: number, year: number, month: number, billKey: string, paid: boolean, paidDate?: string | null) {
  const db = await getDb();
  if (!db) return;
  await db.update(fixedBills).set({ paid, paidDate: paidDate ?? null }).where(and(eq(fixedBills.userId, userId), eq(fixedBills.year, year), eq(fixedBills.month, month), eq(fixedBills.billKey, billKey)));
}

export async function getAnnualFixedBills(userId: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fixedBills).where(and(eq(fixedBills.userId, userId), eq(fixedBills.year, year)));
}

// ── Fixed Bill Labels (Rótulos das Contas Fixas) ──────────────────────────────
const DEFAULT_FIXED_BILL_LABELS = [
  { key: "conta_1", label: "Conta 1" },
  { key: "conta_2", label: "Conta 2" },
  { key: "conta_3", label: "Conta 3" },
  { key: "conta_4", label: "Conta 4" },
  { key: "conta_5", label: "Conta 5" },
  { key: "conta_6", label: "Conta 6" },
  { key: "conta_7", label: "Conta 7" },
  { key: "conta_8", label: "Conta 8" },
  { key: "cartoes", label: "Cartões" },
];

export async function initDefaultFixedBillLabels(userId: number) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(fixedBillLabels).where(eq(fixedBillLabels.userId, userId)).limit(1);
  if (existing.length > 0) return;
  for (const item of DEFAULT_FIXED_BILL_LABELS) {
    await db.insert(fixedBillLabels).values({ userId, billKey: item.key, label: item.label, hidden: 0 });
  }
}

export async function getFixedBillLabels(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fixedBillLabels).where(eq(fixedBillLabels.userId, userId));
}

export async function upsertFixedBillLabel(userId: number, billKey: string, label: string, hidden?: boolean) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(fixedBillLabels).where(and(eq(fixedBillLabels.userId, userId), eq(fixedBillLabels.billKey, billKey))).limit(1);
  if (existing[0]) {
    await db.update(fixedBillLabels).set({ label, hidden: hidden ? 1 : 0 }).where(and(eq(fixedBillLabels.userId, userId), eq(fixedBillLabels.billKey, billKey)));
  } else {
    await db.insert(fixedBillLabels).values({ userId, billKey, label, hidden: hidden ? 1 : 0 });
  }
}

export async function deleteFixedBillLabel(userId: number, billKey: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(fixedBillLabels).where(and(eq(fixedBillLabels.userId, userId), eq(fixedBillLabels.billKey, billKey)));
  // Também remove os valores dessa conta fixa
  await db.delete(fixedBills).where(and(eq(fixedBills.userId, userId), eq(fixedBills.billKey, billKey)));
}

// ── Bill Entries ──────────────────────────────────────────────────────────────
export async function getBillEntries(userId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(billEntries)
    .where(and(eq(billEntries.userId, userId), eq(billEntries.year, year), eq(billEntries.month, month)));
}

export async function addBillEntry(userId: number, year: number, month: number, billKey: string, amount: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(billEntries).values({ userId, year, month, billKey, amount });
}

export async function deleteBillEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(billEntries).where(and(eq(billEntries.id, id), eq(billEntries.userId, userId)));
}

export async function updateBillEntry(id: number, userId: number, data: { paid?: boolean; paidDate?: string | null; amount?: string; description?: string }) {
  const db = await getDb();
  if (!db) return;
  // Mapeia description para billKey (nome do lançamento avulso)
  const { description, ...rest } = data;
  const updateData: Record<string, unknown> = { ...rest };
  if (description !== undefined) updateData.billKey = description;
  await db.update(billEntries).set(updateData).where(and(eq(billEntries.id, id), eq(billEntries.userId, userId)));
}

// ── Expense Entries ───────────────────────────────────────────────────────────
export async function getExpenseEntries(userId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(expenseEntries)
    .where(and(eq(expenseEntries.userId, userId), eq(expenseEntries.year, year), eq(expenseEntries.month, month)));
}

export async function addExpenseEntryFull(
  userId: number,
  year: number,
  month: number,
  data: {
    category: string;
    description: string;
    amount: string;
    expenseDate?: string;
    obs?: string;
    paymentMethod?: string;
    installmentGroupId?: string;
    installmentNumber?: number;
    installmentTotal?: number;
    memberId?: number;
  }
) {
  const db = await getDb();
  if (!db) return;
  await db.insert(expenseEntries).values({
    userId, year, month,
    category: data.category,
    description: data.description,
    amount: data.amount,
    expenseDate: data.expenseDate ?? null,
    obs: data.obs ?? null,
    paymentMethod: data.paymentMethod ?? "pix_boleto",
    installmentGroupId: data.installmentGroupId ?? null,
    installmentNumber: data.installmentNumber ?? null,
    installmentTotal: data.installmentTotal ?? null,
    memberId: data.memberId ?? null,
  });
}

export async function updateExpenseEntry(id: number, userId: number, data: { description?: string; amount?: string; category?: string; obs?: string; paymentMethod?: string; expenseDate?: string; memberId?: number | null }) {
  const db = await getDb();
  if (!db) return;
  await db.update(expenseEntries).set(data).where(and(eq(expenseEntries.id, id), eq(expenseEntries.userId, userId)));
}

export async function deleteExpenseEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(expenseEntries).where(and(eq(expenseEntries.id, id), eq(expenseEntries.userId, userId)));
}

export async function deleteExpenseEntriesByGroup(entryId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  const entry = await db
    .select({ installmentGroupId: expenseEntries.installmentGroupId })
    .from(expenseEntries)
    .where(and(eq(expenseEntries.id, entryId), eq(expenseEntries.userId, userId)))
    .limit(1);
  const groupId = entry[0]?.installmentGroupId;
  if (groupId) {
    await db.delete(expenseEntries).where(and(eq(expenseEntries.installmentGroupId, groupId), eq(expenseEntries.userId, userId)));
  } else {
    await db.delete(expenseEntries).where(and(eq(expenseEntries.id, entryId), eq(expenseEntries.userId, userId)));
  }
}

export async function getAnnualExpenses(userId: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenseEntries).where(and(eq(expenseEntries.userId, userId), eq(expenseEntries.year, year)));
}

// ── Installment Bills ─────────────────────────────────────────────────────────
export async function getInstallmentBills(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(installmentBills).where(eq(installmentBills.userId, userId)).orderBy(installmentBills.createdAt);
}

export async function addInstallmentBill(userId: number, data: {
  description: string;
  totalAmount: string;
  installmentAmount: string;
  totalInstallments: number;
  startYear: number;
  startMonth: number;
  category?: string;
  paymentMethod?: string;
  memberId?: number | null;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(installmentBills).values({ userId, ...data, category: data.category ?? "Parcelados", paymentMethod: data.paymentMethod ?? "cartao_1", memberId: data.memberId ?? null });
}

export async function updateInstallmentBill(id: number, userId: number, data: Partial<typeof installmentBills.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(installmentBills).set(data).where(and(eq(installmentBills.id, id), eq(installmentBills.userId, userId)));
}

export async function deleteInstallmentBill(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(installmentBills).where(and(eq(installmentBills.id, id), eq(installmentBills.userId, userId)));
}

// ── Retirement Config ─────────────────────────────────────────────────────────
export async function getRetirementConfig(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(retirementConfig).where(eq(retirementConfig.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function upsertRetirementConfig(userId: number, data: {
  birthDate?: string;
  retirementAge?: number;
  yearsUntilRetirement?: number | null;
  useYearsMode?: boolean;
  initialAmount?: string;
  monthlyContribution?: string;
}) {
  const db = await getDb();
  if (!db) return;
  const existing = await getRetirementConfig(userId);
  if (existing) {
    await db.update(retirementConfig).set(data).where(eq(retirementConfig.userId, userId));
  } else {
    await db.insert(retirementConfig).values({ userId, birthDate: data.birthDate ?? "", retirementAge: data.retirementAge ?? 65, yearsUntilRetirement: data.yearsUntilRetirement ?? null, useYearsMode: data.useYearsMode ?? false, initialAmount: data.initialAmount ?? "0", monthlyContribution: data.monthlyContribution ?? "0" });
  }
}

// ── Categories ────────────────────────────────────────────────────────────────
export async function getUserCategories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.userId, userId)).orderBy(categories.sortOrder, categories.name);
}

export async function initDefaultCategories(userId: number) {
  const db = await getDb();
  if (!db) return;
  const existing = await getUserCategories(userId);
  if (existing.length > 0) return;

  const defaults = [
    { name: "Alimentação", rule: "Essenciais (50%)" as const },
    { name: "Assinaturas", rule: "Estilo de Vida (30%)" as const },
    { name: "Beleza", rule: "Estilo de Vida (30%)" as const },
    { name: "Cantina", rule: "Estilo de Vida (30%)" as const },
    { name: "Combustível", rule: "Essenciais (50%)" as const },
    { name: "Compras Casa", rule: "Essenciais (50%)" as const },
    { name: "Condomínio", rule: "Essenciais (50%)" as const },
    { name: "Consórcio", rule: "Investimentos/Dívidas (20%)" as const },
    { name: "Dívidas", rule: "Investimentos/Dívidas (20%)" as const },
    { name: "Educação", rule: "Essenciais (50%)" as const },
    { name: "Farmácia", rule: "Estilo de Vida (30%)" as const },
    { name: "Faxina", rule: "Essenciais (50%)" as const },
    { name: "Hobby", rule: "Estilo de Vida (30%)" as const },
    { name: "Imposto", rule: "Investimentos/Dívidas (20%)" as const },
    { name: "Investimentos", rule: "Investimentos/Dívidas (20%)" as const },
    { name: "Lazer", rule: "Estilo de Vida (30%)" as const },
    { name: "Luz/Água", rule: "Essenciais (50%)" as const },
    { name: "Manicure", rule: "Estilo de Vida (30%)" as const },
    { name: "Moradia", rule: "Essenciais (50%)" as const },
    { name: "Outros", rule: "Estilo de Vida (30%)" as const },
    { name: "Parcelados", rule: "Essenciais (50%)" as const },
    { name: "Pet", rule: "Essenciais (50%)" as const },
    { name: "Poupança", rule: "Investimentos/Dívidas (20%)" as const },
    { name: "Remédio", rule: "Essenciais (50%)" as const },
    { name: "Reserva", rule: "Investimentos/Dívidas (20%)" as const },
    { name: "Roupas", rule: "Estilo de Vida (30%)" as const },
    { name: "Saúde", rule: "Essenciais (50%)" as const },
    { name: "Seguro", rule: "Essenciais (50%)" as const },
    { name: "Streaming", rule: "Estilo de Vida (30%)" as const },
    { name: "Transporte", rule: "Essenciais (50%)" as const },
  ];

  for (const cat of defaults) {
    await db.insert(categories).values({ userId, ...cat });
  }
}

export async function addUserCategory(
  userId: number,
  name: string,
  rule: "Essenciais (50%)" | "Estilo de Vida (30%)" | "Investimentos/Dívidas (20%)"
) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(categories).values({ userId, name, rule, sortOrder: 0 });
}

export async function updateUserCategory(
  userId: number,
  id: number,
  name: string,
  rule: "Essenciais (50%)" | "Estilo de Vida (30%)" | "Investimentos/Dívidas (20%)"
) {
  const db = await getDb();
  if (!db) return;
  await db.update(categories).set({ name, rule }).where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

export async function deleteUserCategory(userId: number, id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

// ── Payment Methods ───────────────────────────────────────────────────────────
export async function getUserPaymentMethods(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId)).orderBy(paymentMethods.sortOrder);
}

export async function initDefaultPaymentMethods(userId: number) {
  const db = await getDb();
  if (!db) return;
  const existing = await getUserPaymentMethods(userId);
  if (existing.length > 0) return;
  const defaults = [
    { key: "pix_boleto", label: "Pix / Boleto", icon: "💸", colorClass: "bg-green-100 text-green-700 border-green-300", isCard: false, sortOrder: 0 },
    { key: "cartao_1", label: "Cartão 1", icon: "💳", colorClass: "bg-blue-100 text-blue-700 border-blue-300", isCard: true, sortOrder: 1 },
    { key: "cartao_2", label: "Cartão 2", icon: "💳", colorClass: "bg-purple-100 text-purple-700 border-purple-300", isCard: true, sortOrder: 2 },
    { key: "cartao_3", label: "Cartão 3", icon: "💳", colorClass: "bg-orange-100 text-orange-700 border-orange-300", isCard: true, sortOrder: 3 },
    { key: "cartao_4", label: "Cartão 4", icon: "💳", colorClass: "bg-pink-100 text-pink-700 border-pink-300", isCard: true, sortOrder: 4 },
    { key: "cartao_5", label: "Cartão 5", icon: "💳", colorClass: "bg-yellow-100 text-yellow-700 border-yellow-300", isCard: true, sortOrder: 5 },
  ];
  for (const pm of defaults) {
    await db.insert(paymentMethods).values({ userId, ...pm });
  }
}

export async function upsertUserPaymentMethod(
  userId: number,
  data: { id?: number; key: string; label: string; icon: string; colorClass: string; isCard: boolean; sortOrder: number }
) {
  const db = await getDb();
  if (!db) return null;
  if (data.id) {
    await db
      .update(paymentMethods)
      .set({ label: data.label, icon: data.icon, colorClass: data.colorClass, isCard: data.isCard, sortOrder: data.sortOrder })
      .where(and(eq(paymentMethods.id, data.id), eq(paymentMethods.userId, userId)));
    return { id: data.id };
  } else {
    return db.insert(paymentMethods).values({ userId, key: data.key, label: data.label, icon: data.icon, colorClass: data.colorClass, isCard: data.isCard, sortOrder: data.sortOrder });
  }
}

export async function deleteUserPaymentMethod(userId: number, id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(paymentMethods).where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, userId)));
}

// ── Family Members ────────────────────────────────────────────────────────────
const DEFAULT_MEMBERS = [
  { name: "Eu", color: "#3b82f6", sortOrder: 0 },
  { name: "Cônjuge", color: "#ec4899", sortOrder: 1 },
  { name: "Filho(a) 1", color: "#8b5cf6", sortOrder: 2 },
  { name: "Filho(a) 2", color: "#f59e0b", sortOrder: 3 },
  { name: "Casa", color: "#10b981", sortOrder: 4 },
];

export async function getFamilyMembers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(familyMembers).where(eq(familyMembers.userId, userId)).orderBy(familyMembers.sortOrder);
  if (rows.length === 0) {
    await db.insert(familyMembers).values(DEFAULT_MEMBERS.map(m => ({ userId, ...m })));
    return db.select().from(familyMembers).where(eq(familyMembers.userId, userId)).orderBy(familyMembers.sortOrder);
  }
  return rows;
}

export async function addFamilyMember(userId: number, name: string, color: string, sortOrder: number) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(familyMembers).values({ userId, name, color, sortOrder });
}

export async function updateFamilyMember(userId: number, id: number, name: string, color: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(familyMembers).set({ name, color }).where(and(eq(familyMembers.id, id), eq(familyMembers.userId, userId)));
}

export async function deleteFamilyMember(userId: number, id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(familyMembers).where(and(eq(familyMembers.id, id), eq(familyMembers.userId, userId)));
}

// ── Annual Data ───────────────────────────────────────────────────────────────
export async function getAllAnnualData(userId: number) {
  const db = await getDb();
  if (!db) return { incomes: [], bills: [], expenses: [], installments: [] };
  const [incomes, bills, expenses, installmentsList] = await Promise.all([
    db.select().from(incomeEntries).where(eq(incomeEntries.userId, userId)),
    db.select().from(fixedBills).where(eq(fixedBills.userId, userId)),
    db.select().from(expenseEntries).where(eq(expenseEntries.userId, userId)),
    db.select().from(installmentBills).where(eq(installmentBills.userId, userId)),
  ]);
  return { incomes, bills, expenses, installments: installmentsList };
}

export async function clearMonthData(userId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) return { success: false };
  await db.delete(expenseEntries).where(and(eq(expenseEntries.userId, userId), eq(expenseEntries.year, year), eq(expenseEntries.month, month)));
  await db.delete(incomeEntries).where(and(eq(incomeEntries.userId, userId), eq(incomeEntries.year, year), eq(incomeEntries.month, month)));
  await db.delete(billEntries).where(and(eq(billEntries.userId, userId), eq(billEntries.year, year), eq(billEntries.month, month)));
  await db.delete(fixedBills).where(and(eq(fixedBills.userId, userId), eq(fixedBills.year, year), eq(fixedBills.month, month)));
  return { success: true };
}

export async function clearAllInstallments(userId: number) {
  const db = await getDb();
  if (!db) return { success: false };
  await db.delete(installmentBills).where(eq(installmentBills.userId, userId));
  await db.execute(
    `DELETE FROM expense_entries WHERE userId = ${userId} AND installmentTotal > 1`
  ).catch(() => {});
  return { success: true };
}

export async function getExpensesEndingNextMonth(userId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) return [];
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonthExpenses = await db
    .select()
    .from(expenseEntries)
    .where(and(eq(expenseEntries.userId, userId), eq(expenseEntries.year, nextYear), eq(expenseEntries.month, nextMonth)));
  return nextMonthExpenses.filter(
    (e) => e.installmentGroupId && e.installmentNumber !== null && e.installmentTotal !== null && e.installmentNumber === e.installmentTotal
  );
}

export async function getMemberBreakdownMonthly(userId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) return [];
  const expenses = await db.select().from(expenseEntries).where(and(eq(expenseEntries.userId, userId), eq(expenseEntries.year, year), eq(expenseEntries.month, month)));
  const billsRows = await getFixedBills(userId, year, month);
  const members = await getFamilyMembers(userId);
  const memberMap: Record<number, { name: string; color: string }> = {};
  members.forEach(m => { memberMap[m.id] = { name: m.name, color: m.color }; });
  const totals: Record<string, { memberId: number | null; name: string; color: string; totalExpenses: number; totalBills: number; total: number }> = {};
  const ensure = (mid: number | null) => {
    const key = mid != null ? String(mid) : "sem_vinculo";
    if (!totals[key]) {
      totals[key] = { memberId: mid, name: mid != null ? (memberMap[mid]?.name ?? "Desconhecido") : "Sem vínculo", color: mid != null ? (memberMap[mid]?.color ?? "#94a3b8") : "#94a3b8", totalExpenses: 0, totalBills: 0, total: 0 };
    }
    return key;
  };
  for (const e of expenses) {
    const key = ensure(e.memberId);
    const val = parseFloat(String(e.amount)) || 0;
    totals[key].totalExpenses += val;
    totals[key].total += val;
  }
  for (const bill of billsRows) {
    const val = parseFloat(String(bill.amount)) || 0;
    if (val > 0) {
      const key = ensure(null);
      totals[key].totalBills += val;
      totals[key].total += val;
    }
  }
  return Object.values(totals).sort((a, b) => b.total - a.total);
}

export async function getMemberBreakdownAnnual(userId: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  const expenses = await db.select().from(expenseEntries).where(and(eq(expenseEntries.userId, userId), eq(expenseEntries.year, year)));
  const allBills = await db.select().from(fixedBills).where(and(eq(fixedBills.userId, userId), eq(fixedBills.year, year)));
  const members = await getFamilyMembers(userId);
  const memberMap: Record<number, { name: string; color: string }> = {};
  members.forEach(m => { memberMap[m.id] = { name: m.name, color: m.color }; });
  const byMember: Record<string, { memberId: number | null; name: string; color: string; months: number[]; monthsExpenses: number[]; monthsBills: number[]; total: number; totalExpenses: number; totalBills: number }> = {};
  const ensure = (mid: number | null) => {
    const key = mid != null ? String(mid) : "sem_vinculo";
    if (!byMember[key]) {
      byMember[key] = { memberId: mid, name: mid != null ? (memberMap[mid]?.name ?? "Desconhecido") : "Sem vínculo", color: mid != null ? (memberMap[mid]?.color ?? "#94a3b8") : "#94a3b8", months: Array(12).fill(0), monthsExpenses: Array(12).fill(0), monthsBills: Array(12).fill(0), total: 0, totalExpenses: 0, totalBills: 0 };
    }
    return key;
  };
  for (const e of expenses) {
    const key = ensure(e.memberId);
    const val = parseFloat(String(e.amount)) || 0;
    byMember[key].months[e.month - 1] += val;
    byMember[key].monthsExpenses[e.month - 1] += val;
    byMember[key].total += val;
    byMember[key].totalExpenses += val;
  }
  for (const row of allBills) {
    const val = parseFloat(String(row.amount)) || 0;
    if (val > 0) {
      const key = ensure(null);
      byMember[key].months[row.month - 1] += val;
      byMember[key].monthsBills[row.month - 1] += val;
      byMember[key].total += val;
      byMember[key].totalBills += val;
    }
  }
  return Object.values(byMember).sort((a, b) => b.total - a.total);
}

// ── Admin functions ───────────────────────────────────────────────────────────
export async function getAllUsersWithSubscriptions() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
      subId: subscriptions.id,
      plan: subscriptions.plan,
      status: subscriptions.status,
      trialEndsAt: subscriptions.trialEndsAt,
      subCreatedAt: subscriptions.createdAt,
    })
    .from(users)
    .leftJoin(subscriptions, eq(subscriptions.userId, users.id))
    .orderBy(desc(users.createdAt));
  return rows;
}

export async function getAdminMetrics() {
  const db = await getDb();
  if (!db) return null;
  const allSubs = await db.select().from(subscriptions);
  const allUsers = await db.select({ id: users.id, role: users.role }).from(users);
  const now = new Date();
  const activeSubs = allSubs.filter(s => s.status === "active");
  const activeTrials = allSubs.filter(s => s.status === "trialing" && s.trialEndsAt && new Date(s.trialEndsAt) > now);
  const expiredTrials = allSubs.filter(s => s.status === "expired" || (s.status === "trialing" && s.trialEndsAt && new Date(s.trialEndsAt) <= now));
  const cancelled = allSubs.filter(s => s.status === "cancelled");
  const PRICES: Record<string, number> = { time_management: 1990, budget: 1990, combo: 3490 };
  const mrr = activeSubs.reduce((sum, s) => sum + (PRICES[s.plan] || 0), 0);
  const byPlan = {
    time_management: activeSubs.filter(s => s.plan === "time_management").length,
    budget: activeSubs.filter(s => s.plan === "budget").length,
    combo: activeSubs.filter(s => s.plan === "combo").length,
  };
  const totalWithSub = allSubs.length;
  const conversionRate = totalWithSub > 0 ? Math.round((activeSubs.length / totalWithSub) * 100) : 0;
  return {
    totalUsers: allUsers.length,
    activeSubscribers: activeSubs.length,
    activeTrials: activeTrials.length,
    expiredTrials: expiredTrials.length,
    cancelled: cancelled.length,
    mrrCents: mrr,
    byPlan,
    conversionRate,
  };
}

export async function adminSetUserPlan(userId: number, plan: "time_management" | "budget" | "combo" | null) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  if (plan === null) {
    if (existing[0]) {
      await db.update(subscriptions).set({ status: "cancelled" }).where(eq(subscriptions.userId, userId));
    }
    return;
  }
  if (existing[0]) {
    await db.update(subscriptions).set({ plan, status: "active", trialEndsAt: null }).where(eq(subscriptions.userId, userId));
  } else {
    await db.insert(subscriptions).values({ userId, plan, status: "active" });
  }
}

// ── Task Categories (Categorias de Tarefa configuráveis pelo usuário) ──────────
export async function getTaskCategories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(taskCategories)
    .where(eq(taskCategories.userId, userId))
    .orderBy(taskCategories.sortOrder, taskCategories.createdAt);
}

export async function createTaskCategory(data: InsertTaskCategory) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(taskCategories).values(data);
  return result;
}

export async function updateTaskCategory(id: number, userId: number, data: Partial<InsertTaskCategory>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db
    .update(taskCategories)
    .set(data)
    .where(and(eq(taskCategories.id, id), eq(taskCategories.userId, userId)));
}

export async function deleteTaskCategory(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  // Desvincula tarefas desta categoria antes de deletar
  await db
    .update(tasks)
    .set({ taskCategoryId: null })
    .where(and(eq(tasks.taskCategoryId, id), eq(tasks.userId, userId)));
  await db.delete(taskCategories).where(and(eq(taskCategories.id, id), eq(taskCategories.userId, userId)));
}
