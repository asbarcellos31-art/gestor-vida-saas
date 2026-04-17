import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  tinyint,
} from "drizzle-orm/mysql-core";

// ── Usuários ─────────────────────────────────────────────────────────────────
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
  passwordHash: varchar("passwordHash", { length: 255 }),
  emailVerified: tinyint("emailVerified").notNull().default(0),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Assinaturas ───────────────────────────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  plan: mysqlEnum("plan", ["time_management", "budget", "combo"]).notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired", "trialing"]).default("active").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  stripePriceId: varchar("stripePriceId", { length: 128 }),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
  trialEndsAt: timestamp("trialEndsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ── Categorias de Tarefa (configuráveis pelo usuário, ex: 💼 Comercial) ─────────
export const taskCategories = mysqlTable("task_categories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  emoji: varchar("emoji", { length: 8 }).default("📋").notNull(),
  color: varchar("color", { length: 32 }).default("#6366f1").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TaskCategory = typeof taskCategories.$inferSelect;
export type InsertTaskCategory = typeof taskCategories.$inferInsert;

// ── Tarefas (Gestão de Tempo - Tríade do Tempo) ───────────────────────────────
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["important", "urgent", "circumstantial"]).notNull().default("important"),
  taskCategoryId: int("taskCategoryId"), // FK para task_categories (nullable)
  durationMinutes: int("durationMinutes").notNull().default(30),
  scheduledDate: varchar("scheduledDate", { length: 10 }), // YYYY-MM-DD — null = backlog
  scheduledTime: varchar("scheduledTime", { length: 5 }), // HH:MM — opcional
  isRecurring: boolean("isRecurring").default(false).notNull(),
  status: mysqlEnum("status", ["pending", "started", "completed"]).default("pending").notNull(),
  executedMinutes: int("executedMinutes").default(0),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ── Sessões de tempo por tarefa ───────────────────────────────────────────────
export const timeSessions = mysqlTable("time_sessions", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  userId: int("userId").notNull(),
  startedAt: timestamp("startedAt").notNull(),
  endedAt: timestamp("endedAt"),
  durationMinutes: int("durationMinutes"),
});

// ── Lembretes ─────────────────────────────────────────────────────────────────
export const reminders = mysqlTable("reminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  reminderDate: varchar("reminderDate", { length: 10 }).notNull(), // YYYY-MM-DD
  reminderTime: varchar("reminderTime", { length: 5 }).notNull(), // HH:MM
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reminder = typeof reminders.$inferSelect;

// ── Receitas mensais (lançamentos individuais) ────────────────────────────────
// Cada fonte de receita é um lançamento separado (description = nome da fonte)
export const incomeEntries = mysqlTable("income_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  year: int("year").notNull(),
  month: tinyint("month").notNull(),
  description: varchar("description", { length: 255 }).notNull(), // nome da fonte de receita
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  category: varchar("category", { length: 64 }), // opcional
  memberId: int("memberId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IncomeEntry = typeof incomeEntries.$inferSelect;
export type InsertIncomeEntry = typeof incomeEntries.$inferInsert;

// ── Contas fixas mensais (por chave configurável) ─────────────────────────────
// billKey = chave interna (ex: "conta_1"), label configurável via fixed_bill_labels
export const fixedBills = mysqlTable("fixed_bills", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  year: int("year").notNull(),
  month: tinyint("month").notNull(),
  billKey: varchar("billKey", { length: 64 }).notNull(), // chave da conta fixa
  amount: decimal("amount", { precision: 12, scale: 2 }).default("0").notNull(),
  paid: boolean("paid").default(false).notNull(),
  paidDate: varchar("paidDate", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FixedBill = typeof fixedBills.$inferSelect;
export type InsertFixedBill = typeof fixedBills.$inferInsert;

// ── Rótulos personalizados das contas fixas ─────────────────────────────────
export const fixedBillLabels = mysqlTable("fixed_bill_labels", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  billKey: varchar("billKey", { length: 64 }).notNull(),
  label: varchar("label", { length: 128 }).notNull(),
  hidden: tinyint("hidden").default(0).notNull(),
  dueDay: varchar("dueDay", { length: 4 }),       // dia de vencimento (ex: "10")
  category: varchar("category", { length: 64 }),  // categoria da conta
  obs: varchar("obs", { length: 512 }),            // observação livre
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FixedBillLabel = typeof fixedBillLabels.$inferSelect;

// ── Lançamentos avulsos nas Contas a Pagar ───────────────────────────────────
export const billEntries = mysqlTable("bill_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  year: int("year").notNull(),
  month: tinyint("month").notNull(),
  billKey: varchar("billKey", { length: 64 }).notNull(),
  paid: boolean("paid").default(false).notNull(),
  paidDate: varchar("paidDate", { length: 10 }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ── Lançamentos de despesas por categoria ────────────────────────────────────
export const expenseEntries = mysqlTable("expense_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  year: int("year").notNull(),
  month: tinyint("month").notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  expenseDate: varchar("expenseDate", { length: 10 }),
  obs: varchar("obs", { length: 500 }),
  paymentMethod: varchar("paymentMethod", { length: 32 }),
  installmentGroupId: varchar("installmentGroupId", { length: 36 }),
  installmentNumber: tinyint("installmentNumber"),
  installmentTotal: tinyint("installmentTotal"),
  memberId: int("memberId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExpenseEntry = typeof expenseEntries.$inferSelect;

// ── Entradas de orçamento (budget_entries — estrutura genérica) ───────────────
export const budgetEntries = mysqlTable("budget_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["income", "expense", "bill"]).notNull(),
  rule5030Category: varchar("rule5030Category", { length: 64 }), // Essenciais/Estilo de Vida/Investimentos
  category: varchar("category", { length: 64 }),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  month: int("month").notNull(), // YYYYMM ex: 202604
  isPaid: boolean("isPaid").default(false).notNull(),
  dueDay: int("dueDay"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ── Contas parceladas ────────────────────────────────────────────────────────
export const installmentBills = mysqlTable("installment_bills", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  installmentAmount: decimal("installmentAmount", { precision: 12, scale: 2 }).notNull(),
  totalInstallments: int("totalInstallments").notNull(),
  currentInstallment: int("currentInstallment").notNull().default(1),
  startYear: int("startYear").notNull(),
  startMonth: tinyint("startMonth").notNull(),
  category: varchar("category", { length: 64 }).default("Parcelados").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 64 }).default("cartao_1").notNull(),
  paid: boolean("paid").default(false).notNull(),
  isRecurring: boolean("isRecurring").default(false).notNull(),
  memberId: int("memberId"),
  paidMonths: text("paidMonths"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InstallmentBill = typeof installmentBills.$inferSelect;

// ── Parcelamentos (tabela installments — estrutura alternativa) ───────────────
export const installments = mysqlTable("installments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  totalParcels: int("totalParcels").notNull(),
  paidParcels: int("paidParcels").default(0).notNull(),
  monthlyValue: decimal("monthlyValue", { precision: 12, scale: 2 }).notNull(),
  startMonth: int("startMonth").notNull(), // YYYYMM
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  category: varchar("category", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ── Configuração de projeção de aposentadoria ────────────────────────────────
export const retirementConfig = mysqlTable("retirement_config", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  birthDate: varchar("birthDate", { length: 10 }).notNull().default(""),
  retirementAge: int("retirementAge").notNull().default(65),
  yearsUntilRetirement: int("yearsUntilRetirement"),
  useYearsMode: boolean("useYearsMode").default(false).notNull(),
  initialAmount: decimal("initialAmount", { precision: 12, scale: 2 }).default("0").notNull(),
  monthlyContribution: decimal("monthlyContribution", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RetirementConfig = typeof retirementConfig.$inferSelect;

// ── Projeções de aposentadoria ────────────────────────────────────────────────
export const retirementProjections = mysqlTable("retirement_projections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  currentAge: int("currentAge").notNull(),
  retirementAge: int("retirementAge").notNull(),
  currentSavings: decimal("currentSavings", { precision: 12, scale: 2 }).notNull(),
  monthlyContribution: decimal("monthlyContribution", { precision: 12, scale: 2 }).notNull(),
  scenario1Rate: decimal("scenario1Rate", { precision: 5, scale: 2 }),
  scenario1Result: decimal("scenario1Result", { precision: 15, scale: 2 }),
  scenario1MonthlyIncome: decimal("scenario1MonthlyIncome", { precision: 12, scale: 2 }),
  scenario2Rate: decimal("scenario2Rate", { precision: 5, scale: 2 }),
  scenario2Result: decimal("scenario2Result", { precision: 15, scale: 2 }),
  scenario2MonthlyIncome: decimal("scenario2MonthlyIncome", { precision: 12, scale: 2 }),
  scenario3Rate: decimal("scenario3Rate", { precision: 5, scale: 2 }),
  scenario3Result: decimal("scenario3Result", { precision: 15, scale: 2 }),
  scenario3MonthlyIncome: decimal("scenario3MonthlyIncome", { precision: 12, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ── Categorias configuráveis ─────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  rule: mysqlEnum("rule", ["Essenciais (50%)", "Estilo de Vida (30%)", "Investimentos/Dívidas (20%)"]).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;

// ── Vínculos familiares ─────────────────────────────────────────────────────
export const familyMembers = mysqlTable("family_members", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  color: varchar("color", { length: 32 }).default("#6366f1").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FamilyMember = typeof familyMembers.$inferSelect;

// ── Formas de pagamento configuráveis ────────────────────────────────────────
export const paymentMethods = mysqlTable("payment_methods", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  key: varchar("key", { length: 64 }).notNull(),
  label: varchar("label", { length: 64 }).notNull(),
  icon: varchar("icon", { length: 8 }).default("💳").notNull(),
  colorClass: varchar("colorClass", { length: 128 }).default("bg-gray-100 text-gray-700 border-gray-300").notNull(),
  isCard: boolean("isCard").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PaymentMethod = typeof paymentMethods.$inferSelect;

// ── Tokens de autenticação (reset de senha / verificação de e-mail) ──────────
export const authTokens = mysqlTable("auth_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  type: varchar("type", { length: 32 }).notNull(), // 'password_reset' | 'email_verify'
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AuthToken = typeof authTokens.$inferSelect;
