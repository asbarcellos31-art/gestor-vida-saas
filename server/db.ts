import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  InsertTask,
  InsertReminder,
  InsertSubscription,
  users,
  subscriptions,
  tasks,
  reminders,
  incomeEntries,
  fixedBills,
  expenseEntries,
  installmentBills,
  retirementConfig,
  categories,
  paymentMethods,
  familyMembers,
  billEntries,
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
  // Se estiver em trial, verificar se ainda não expirou
  if (sub && sub.status === "trialing" && sub.trialEndsAt) {
    if (new Date() > sub.trialEndsAt) {
      // Trial expirado — atualizar status no banco
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
    await db
      .update(subscriptions)
      .set(data)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
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
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.scheduledDate, "")))
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

export async function createReminder(data: InsertReminder) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(reminders).values(data);
}

export async function deleteReminder(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(reminders).where(and(eq(reminders.id, id), eq(reminders.userId, userId)));
}

// ── Income ────────────────────────────────────────────────────────────────────
export async function getIncome(userId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(incomeEntries)
    .where(and(eq(incomeEntries.userId, userId), eq(incomeEntries.year, year), eq(incomeEntries.month, month)))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertIncome(
  userId: number,
  year: number,
  month: number,
  data: Partial<typeof incomeEntries.$inferInsert>
) {
  const db = await getDb();
  if (!db) return;
  const existing = await getIncome(userId, year, month);
  if (existing) {
    await db
      .update(incomeEntries)
      .set(data)
      .where(and(eq(incomeEntries.userId, userId), eq(incomeEntries.year, year), eq(incomeEntries.month, month)));
  } else {
    await db.insert(incomeEntries).values({ userId, year, month, ...data });
  }
}

// ── Fixed Bills ───────────────────────────────────────────────────────────────
export async function getFixedBills(userId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(fixedBills)
    .where(and(eq(fixedBills.userId, userId), eq(fixedBills.year, year), eq(fixedBills.month, month)))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertFixedBills(
  userId: number,
  year: number,
  month: number,
  data: Partial<typeof fixedBills.$inferInsert>
) {
  const db = await getDb();
  if (!db) return;
  const existing = await getFixedBills(userId, year, month);
  if (existing) {
    await db
      .update(fixedBills)
      .set(data)
      .where(and(eq(fixedBills.userId, userId), eq(fixedBills.year, year), eq(fixedBills.month, month)));
  } else {
    await db.insert(fixedBills).values({ userId, year, month, ...data });
  }
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

export async function addExpenseEntry(
  userId: number,
  year: number,
  month: number,
  category: string,
  description: string,
  amount: string
) {
  const db = await getDb();
  if (!db) return;
  await db.insert(expenseEntries).values({ userId, year, month, category, description, amount });
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
    await db
      .delete(expenseEntries)
      .where(and(eq(expenseEntries.installmentGroupId, groupId), eq(expenseEntries.userId, userId)));
  } else {
    await db.delete(expenseEntries).where(and(eq(expenseEntries.id, entryId), eq(expenseEntries.userId, userId)));
  }
}

// ── Installment Bills ─────────────────────────────────────────────────────────
export async function getInstallmentBills(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(installmentBills).where(eq(installmentBills.userId, userId));
}

export async function addInstallmentBill(
  userId: number,
  data: Omit<typeof installmentBills.$inferInsert, "id" | "userId" | "createdAt" | "updatedAt">
) {
  const db = await getDb();
  if (!db) return;
  await db.insert(installmentBills).values({ userId, ...data });
}

export async function updateInstallmentBill(
  id: number,
  userId: number,
  data: Partial<typeof installmentBills.$inferInsert>
) {
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

export async function upsertRetirementConfig(
  userId: number,
  data: Partial<typeof retirementConfig.$inferInsert>
) {
  const db = await getDb();
  if (!db) return;
  const existing = await getRetirementConfig(userId);
  if (existing) {
    await db.update(retirementConfig).set(data).where(eq(retirementConfig.userId, userId));
  } else {
    await db.insert(retirementConfig).values({ userId, ...data });
  }
}

// ── Bill Entries ──────────────────────────────────────────────────────────────
export async function getBillEntries(userId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(billEntries).where(and(eq(billEntries.userId, userId), eq(billEntries.year, year), eq(billEntries.month, month)));
}

export async function addBillEntry(
  userId: number,
  year: number,
  month: number,
  data: { description: string; amount: string; paymentMethod?: string; billDate?: string; obs?: string; memberId?: number | null }
) {
  const db = await getDb();
  if (!db) return;
  await db.insert(billEntries).values({ userId, year, month, ...data });
}

export async function deleteBillEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(billEntries).where(and(eq(billEntries.id, id), eq(billEntries.userId, userId)));
}

export async function updateBillEntry(
  id: number,
  userId: number,
  data: { description?: string; amount?: string; paymentMethod?: string; billDate?: string; obs?: string; memberId?: number | null }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(billEntries).set(data).where(and(eq(billEntries.id, id), eq(billEntries.userId, userId)));
}

// ── Categories ────────────────────────────────────────────────────────────────
export async function getUserCategories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.userId, userId));
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
    { name: "Inglês", rule: "Estilo de Vida (30%)" as const },
    { name: "Investimentos", rule: "Investimentos/Dívidas (20%)" as const },
    { name: "Lazer", rule: "Estilo de Vida (30%)" as const },
    { name: "Luz/Água", rule: "Essenciais (50%)" as const },
    { name: "Manicure", rule: "Estilo de Vida (30%)" as const },
    { name: "Moradia", rule: "Essenciais (50%)" as const },
    { name: "Outros", rule: "Estilo de Vida (30%)" as const },
    { name: "Parcelados", rule: "Essenciais (50%)" as const },
    { name: "Pet", rule: "Essenciais (50%)" as const },
    { name: "Pilates", rule: "Estilo de Vida (30%)" as const },
    { name: "Poupança", rule: "Investimentos/Dívidas (20%)" as const },
    { name: "Praia", rule: "Investimentos/Dívidas (20%)" as const },
    { name: "Remédio", rule: "Essenciais (50%)" as const },
    { name: "Reserva", rule: "Investimentos/Dívidas (20%)" as const },
    { name: "Roupas", rule: "Estilo de Vida (30%)" as const },
    { name: "Saúde", rule: "Essenciais (50%)" as const },
    { name: "Seguro", rule: "Essenciais (50%)" as const },
    { name: "Streaming/Hobby", rule: "Estilo de Vida (30%)" as const },
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
export async function getAnnualExpenses(userId: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenseEntries).where(and(eq(expenseEntries.userId, userId), eq(expenseEntries.year, year)));
}

export async function getAnnualIncome(userId: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(incomeEntries).where(and(eq(incomeEntries.userId, userId), eq(incomeEntries.year, year)));
}

export async function getAnnualFixedBills(userId: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fixedBills).where(and(eq(fixedBills.userId, userId), eq(fixedBills.year, year)));
}

export async function getAllAnnualData(userId: number) {
  const db = await getDb();
  if (!db) return { incomes: [], bills: [], expenses: [], installments: [] };
  const [incomes, bills, expenses, installments] = await Promise.all([
    db.select().from(incomeEntries).where(eq(incomeEntries.userId, userId)),
    db.select().from(fixedBills).where(eq(fixedBills.userId, userId)),
    db.select().from(expenseEntries).where(eq(expenseEntries.userId, userId)),
    db.select().from(installmentBills).where(eq(installmentBills.userId, userId)),
  ]);
  return { incomes, bills, expenses, installments };
}

export async function clearMonthData(userId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) return { success: false };
  await db.delete(expenseEntries).where(and(eq(expenseEntries.userId, userId), eq(expenseEntries.year, year), eq(expenseEntries.month, month)));
  await db.delete(incomeEntries).where(and(eq(incomeEntries.userId, userId), eq(incomeEntries.year, year), eq(incomeEntries.month, month)));
  await db.delete(billEntries).where(and(eq(billEntries.userId, userId), eq(billEntries.year, year), eq(billEntries.month, month)));
  const zeroFields = {
    seguroVida: '0.00', gas: '0.00', agua: '0.00', luz: '0.00',
    seguroPai: '0.00', celularNet: '0.00', condominio: '0.00',
    faxina: '0.00', maconaria: '0.00', pet: '0.00', veiculo: '0.00',
    musica: '0.00', colegio: '0.00', cantina: '0.00', manicure: '0.00',
    seguroVeiculo: '0.00', pilates: '0.00', inglesLivia: '0.00',
    ambiental1: '0.00', publiOnline: '0.00', ambiental2: '0.00',
    iptu: '0.00', cartoes: '0.00',
  };
  await db.update(fixedBills).set(zeroFields).where(and(eq(fixedBills.userId, userId), eq(fixedBills.year, year), eq(fixedBills.month, month)));
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
  const billsRows = await db.select().from(fixedBills).where(and(eq(fixedBills.userId, userId), eq(fixedBills.year, year), eq(fixedBills.month, month))).limit(1);
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
  if (billsRows.length > 0) {
    const row = billsRows[0];
    const billFields = ["seguroVida","gas","agua","luz","seguroPai","celularNet","cartoes","condominio","faxina","maconaria","pet","veiculo","musica","colegio","cantina","manicure","seguroVeiculo","pilates","inglesLivia","ambiental1","publiOnline","ambiental2","iptu"] as const;
    let memberJson: Record<string, number> = {};
    try { memberJson = JSON.parse((row as any).billsMember || "{}"); } catch { memberJson = {}; }
    for (const field of billFields) {
      const mid = memberJson[field] ?? null;
      const val = parseFloat(String((row as any)[field])) || 0;
      if (val > 0 && mid != null) {
        const key = ensure(mid);
        totals[key].totalBills += val;
        totals[key].total += val;
      }
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
  const billFields = ["seguroVida","gas","agua","luz","seguroPai","celularNet","cartoes","condominio","faxina","maconaria","pet","veiculo","musica","colegio","cantina","manicure","seguroVeiculo","pilates","inglesLivia","ambiental1","publiOnline","ambiental2","iptu"] as const;
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
    let memberJson: Record<string, number> = {};
    try { memberJson = JSON.parse((row as any).billsMember || "{}"); } catch { memberJson = {}; }
    for (const field of billFields) {
      const mid = memberJson[field] ?? null;
      const val = parseFloat(String((row as any)[field])) || 0;
      if (val > 0 && mid != null) {
        const key = ensure(mid);
        byMember[key].months[row.month - 1] += val;
        byMember[key].monthsBills[row.month - 1] += val;
        byMember[key].total += val;
        byMember[key].totalBills += val;
      }
    }
  }
  return Object.values(byMember).sort((a, b) => b.total - a.total);
}

export async function getFixedBillLabels(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { fixedBillLabels } = await import("../drizzle/schema");
  return db.select().from(fixedBillLabels).where(eq(fixedBillLabels.userId, userId));
}

export async function upsertFixedBillLabel(userId: number, billKey: string, label: string, hidden?: boolean) {
  const db = await getDb();
  if (!db) return;
  const { fixedBillLabels } = await import("../drizzle/schema");
  const existing = await db.select().from(fixedBillLabels).where(and(eq(fixedBillLabels.userId, userId), eq(fixedBillLabels.billKey, billKey))).limit(1);
  if (existing[0]) {
    await db.update(fixedBillLabels).set({ label, hidden: hidden ? 1 : 0 }).where(and(eq(fixedBillLabels.userId, userId), eq(fixedBillLabels.billKey, billKey)));
  } else {
    await db.insert(fixedBillLabels).values({ userId, billKey, label, hidden: hidden ? 1 : 0 });
  }
}
