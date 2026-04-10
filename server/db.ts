import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  budgetEntries,
  installments,
  InsertBudgetEntry,
  InsertInstallment,
  InsertRetirementProjection,
  InsertSubscription,
  InsertTask,
  InsertUser,
  retirementProjections,
  subscriptions,
  tasks,
  timeSessions,
  users,
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

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  textFields.forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });

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
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
export async function getActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .limit(1);
  return result[0] ?? null;
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

// ─── Tasks ────────────────────────────────────────────────────────────────────
export async function getTasksByDate(userId: number, dateStr: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.scheduledDate, dateStr)))
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

// ─── Budget Entries ────────────────────────────────────────────────────────────
export async function getBudgetEntriesByMonth(userId: number, month: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(budgetEntries)
    .where(and(eq(budgetEntries.userId, userId), eq(budgetEntries.month, month)))
    .orderBy(budgetEntries.type, budgetEntries.createdAt);
}

export async function getBudgetSummaryByYear(userId: number, year: string) {
  const db = await getDb();
  if (!db) return [];

  const months = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, "0");
    return `${m}/${year}`;
  });

  const results = [];
  for (const month of months) {
    const entries = await db
      .select()
      .from(budgetEntries)
      .where(and(eq(budgetEntries.userId, userId), eq(budgetEntries.month, month)));

    const income = entries
      .filter((e) => e.type === "income")
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const expenses = entries
      .filter((e) => e.type !== "income")
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const essential = entries
      .filter((e) => e.rule5030Category === "essential")
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const lifestyle = entries
      .filter((e) => e.rule5030Category === "lifestyle")
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const investment = entries
      .filter((e) => e.rule5030Category === "investment")
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    results.push({ month, income, expenses, balance: income - expenses, essential, lifestyle, investment });
  }
  return results;
}

export async function createBudgetEntry(data: InsertBudgetEntry) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(budgetEntries).values(data);
}

export async function updateBudgetEntry(id: number, userId: number, data: Partial<InsertBudgetEntry>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db
    .update(budgetEntries)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(budgetEntries.id, id), eq(budgetEntries.userId, userId)));
}

export async function deleteBudgetEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db
    .delete(budgetEntries)
    .where(and(eq(budgetEntries.id, id), eq(budgetEntries.userId, userId)));
}

// ─── Installments ─────────────────────────────────────────────────────────────
export async function getInstallments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(installments)
    .where(eq(installments.userId, userId))
    .orderBy(desc(installments.createdAt));
}

export async function createInstallment(data: InsertInstallment) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(installments).values(data);
}

export async function updateInstallment(id: number, userId: number, data: Partial<InsertInstallment>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db
    .update(installments)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(installments.id, id), eq(installments.userId, userId)));
}

export async function deleteInstallment(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db
    .delete(installments)
    .where(and(eq(installments.id, id), eq(installments.userId, userId)));
}

// ─── Retirement Projections ────────────────────────────────────────────────────
export async function getRetirementProjection(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(retirementProjections)
    .where(eq(retirementProjections.userId, userId))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertRetirementProjection(userId: number, data: InsertRetirementProjection) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await getRetirementProjection(userId);
  if (existing) {
    await db
      .update(retirementProjections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(retirementProjections.userId, userId));
  } else {
    await db.insert(retirementProjections).values(data);
  }
}
