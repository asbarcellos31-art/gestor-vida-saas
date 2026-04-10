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
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ── Tarefas (Gestão de Tempo - Tríade do Tempo) ───────────────────────────────
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["important", "urgent", "circumstantial"]).notNull().default("important"),
  durationMinutes: int("durationMinutes").notNull().default(30),
  scheduledDate: varchar("scheduledDate", { length: 10 }).notNull(), // YYYY-MM-DD
  status: mysqlEnum("status", ["pending", "started", "completed"]).default("pending").notNull(),
  executedMinutes: int("executedMinutes").default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ── Lembretes ─────────────────────────────────────────────────────────────────
export const reminders = mysqlTable("reminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  emoji: varchar("emoji", { length: 8 }).default("🔔").notNull(),
  reminderTime: varchar("reminderTime", { length: 5 }).notNull(), // HH:MM
  reminderDate: varchar("reminderDate", { length: 10 }).notNull(), // YYYY-MM-DD
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

// ── Receitas mensais ─────────────────────────────────────────────────────────
export const incomeEntries = mysqlTable("income_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  year: int("year").notNull(),
  month: tinyint("month").notNull(),
  corretora: decimal("corretora", { precision: 12, scale: 2 }).default("0").notNull(),
  distribuicao: decimal("distribuicao", { precision: 12, scale: 2 }).default("0").notNull(),
  carteiraFer: decimal("carteiraFer", { precision: 12, scale: 2 }).default("0").notNull(),
  angariacao: decimal("angariacao", { precision: 12, scale: 2 }).default("0").notNull(),
  advocacia: decimal("advocacia", { precision: 12, scale: 2 }).default("0").notNull(),
  outros: decimal("outros", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ── Contas a pagar fixas mensais ─────────────────────────────────────────────
export const fixedBills = mysqlTable("fixed_bills", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  year: int("year").notNull(),
  month: tinyint("month").notNull(),
  seguroVida: decimal("seguroVida", { precision: 12, scale: 2 }).default("0").notNull(),
  gas: decimal("gas", { precision: 12, scale: 2 }).default("0").notNull(),
  agua: decimal("agua", { precision: 12, scale: 2 }).default("0").notNull(),
  luz: decimal("luz", { precision: 12, scale: 2 }).default("0").notNull(),
  seguroPai: decimal("seguroPai", { precision: 12, scale: 2 }).default("0").notNull(),
  celularNet: decimal("celularNet", { precision: 12, scale: 2 }).default("0").notNull(),
  cartoes: decimal("cartoes", { precision: 12, scale: 2 }).default("0").notNull(),
  condominio: decimal("condominio", { precision: 12, scale: 2 }).default("0").notNull(),
  faxina: decimal("faxina", { precision: 12, scale: 2 }).default("0").notNull(),
  maconaria: decimal("maconaria", { precision: 12, scale: 2 }).default("0").notNull(),
  pet: decimal("pet", { precision: 12, scale: 2 }).default("0").notNull(),
  veiculo: decimal("veiculo", { precision: 12, scale: 2 }).default("0").notNull(),
  musica: decimal("musica", { precision: 12, scale: 2 }).default("0").notNull(),
  colegio: decimal("colegio", { precision: 12, scale: 2 }).default("0").notNull(),
  cantina: decimal("cantina", { precision: 12, scale: 2 }).default("0").notNull(),
  manicure: decimal("manicure", { precision: 12, scale: 2 }).default("0").notNull(),
  seguroVeiculo: decimal("seguroVeiculo", { precision: 12, scale: 2 }).default("0").notNull(),
  pilates: decimal("pilates", { precision: 12, scale: 2 }).default("0").notNull(),
  inglesLivia: decimal("inglesLivia", { precision: 12, scale: 2 }).default("0").notNull(),
  ambiental1: decimal("ambiental1", { precision: 12, scale: 2 }).default("0").notNull(),
  publiOnline: decimal("publiOnline", { precision: 12, scale: 2 }).default("0").notNull(),
  ambiental2: decimal("ambiental2", { precision: 12, scale: 2 }).default("0").notNull(),
  iptu: decimal("iptu", { precision: 12, scale: 2 }).default("0").notNull(),
  billsObs: varchar("billsObs", { length: 1000 }),
  billsDueDay: varchar("billsDueDay", { length: 500 }),
  billsCategory: varchar("billsCategory", { length: 1000 }),
  billsMember: varchar("billsMember", { length: 1000 }),
  billsPaid: varchar("billsPaid", { length: 1000 }),
  billsLabels: text("billsLabels"),
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

// ── Lançamentos avulsos nas Contas a Pagar ───────────────────────────────────
export const billEntries = mysqlTable("bill_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  year: int("year").notNull(),
  month: tinyint("month").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 32 }).default("pix_boleto"),
  billDate: varchar("billDate", { length: 10 }),
  obs: varchar("obs", { length: 500 }),
  memberId: int("memberId"),
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
  paymentMethod: varchar("paymentMethod", { length: 64 }).default("itau_infinite").notNull(),
  paid: boolean("paid").default(false).notNull(),
  isRecurring: boolean("isRecurring").default(false).notNull(),
  memberId: int("memberId"),
  paidMonths: text("paidMonths"),
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

// ── Categorias configuráveis ─────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  rule: mysqlEnum("rule", ["Essenciais (50%)", "Estilo de Vida (30%)", "Investimentos/Dívidas (20%)"]).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ── Vínculos familiares ─────────────────────────────────────────────────────
export const familyMembers = mysqlTable("family_members", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  color: varchar("color", { length: 32 }).default("#6366f1").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

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

// ── Rótulos personalizados das contas fixas ─────────────────────────────────
export const fixedBillLabels = mysqlTable("fixed_bill_labels", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  billKey: varchar("billKey", { length: 64 }).notNull(),
  label: varchar("label", { length: 128 }).notNull(),
  hidden: tinyint("hidden").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ── Types ─────────────────────────────────────────────────────────────────────
export type IncomeEntry = typeof incomeEntries.$inferSelect;
export type InsertIncomeEntry = typeof incomeEntries.$inferInsert;
export type FixedBill = typeof fixedBills.$inferSelect;
export type InsertFixedBill = typeof fixedBills.$inferInsert;
export type ExpenseEntry = typeof expenseEntries.$inferSelect;
export type InstallmentBill = typeof installmentBills.$inferSelect;
export type RetirementConfig = typeof retirementConfig.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type FixedBillLabel = typeof fixedBillLabels.$inferSelect;
