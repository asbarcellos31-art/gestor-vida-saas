import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plan: mysqlEnum("plan", ["time_management", "budget", "combo"]).notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired", "trialing"]).default("active").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  stripePriceId: varchar("stripePriceId", { length: 128 }),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ─── Tasks (Gestão de Tempo - Tríade do Tempo) ────────────────────────────────
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  durationMinutes: int("durationMinutes").default(30).notNull(),
  // Tríade do Tempo: Importante, Urgente, Circunstancial
  category: mysqlEnum("category", ["important", "urgent", "circumstantial"]).default("important").notNull(),
  status: mysqlEnum("status", ["pending", "started", "completed"]).default("pending").notNull(),
  scheduledDate: varchar("scheduledDate", { length: 10 }).notNull(), // YYYY-MM-DD
  executedMinutes: int("executedMinutes").default(0).notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ─── Time Sessions ────────────────────────────────────────────────────────────
export const timeSessions = mysqlTable("time_sessions", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  userId: int("userId").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
  durationMinutes: int("durationMinutes").default(0).notNull(),
});

export type TimeSession = typeof timeSessions.$inferSelect;
export type InsertTimeSession = typeof timeSessions.$inferInsert;

// ─── Budget Entries (Orçamento Doméstico) ─────────────────────────────────────
export const budgetEntries = mysqlTable("budget_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["income", "fixed_expense", "variable_expense"]).notNull(),
  // Categorias para regra 50/30/20
  rule5030Category: mysqlEnum("rule5030Category", ["essential", "lifestyle", "investment"]),
  category: varchar("category", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  month: varchar("month", { length: 7 }).notNull(), // MM/YYYY
  isPaid: boolean("isPaid").default(false).notNull(),
  dueDay: int("dueDay"), // dia do vencimento (1-31)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BudgetEntry = typeof budgetEntries.$inferSelect;
export type InsertBudgetEntry = typeof budgetEntries.$inferInsert;

// ─── Installments (Contas Parceladas) ─────────────────────────────────────────
export const installments = mysqlTable("installments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  totalParcels: int("totalParcels").notNull(),
  paidParcels: int("paidParcels").default(0).notNull(),
  monthlyValue: decimal("monthlyValue", { precision: 12, scale: 2 }).notNull(),
  startMonth: varchar("startMonth", { length: 7 }).notNull(), // MM/YYYY
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Installment = typeof installments.$inferSelect;
export type InsertInstallment = typeof installments.$inferInsert;

// ─── Retirement Projections (Projeção de Aposentadoria) ───────────────────────
export const retirementProjections = mysqlTable("retirement_projections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  currentAge: int("currentAge").notNull(),
  retirementAge: int("retirementAge").notNull(),
  currentSavings: decimal("currentSavings", { precision: 15, scale: 2 }).default("0").notNull(),
  monthlyContribution: decimal("monthlyContribution", { precision: 12, scale: 2 }).notNull(),
  // Cenário 1: Conservador (CDI ~10%)
  scenario1Rate: decimal("scenario1Rate", { precision: 5, scale: 2 }).default("10.00").notNull(),
  scenario1Result: decimal("scenario1Result", { precision: 15, scale: 2 }),
  scenario1MonthlyIncome: decimal("scenario1MonthlyIncome", { precision: 12, scale: 2 }),
  // Cenário 2: Moderado (CDI + inflação ~14%)
  scenario2Rate: decimal("scenario2Rate", { precision: 5, scale: 2 }).default("14.00").notNull(),
  scenario2Result: decimal("scenario2Result", { precision: 15, scale: 2 }),
  scenario2MonthlyIncome: decimal("scenario2MonthlyIncome", { precision: 12, scale: 2 }),
  // Cenário 3: Agressivo (Renda variável ~18%)
  scenario3Rate: decimal("scenario3Rate", { precision: 5, scale: 2 }).default("18.00").notNull(),
  scenario3Result: decimal("scenario3Result", { precision: 15, scale: 2 }),
  scenario3MonthlyIncome: decimal("scenario3MonthlyIncome", { precision: 12, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RetirementProjection = typeof retirementProjections.$inferSelect;
export type InsertRetirementProjection = typeof retirementProjections.$inferInsert;
