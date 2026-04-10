import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getActiveSubscription,
  getUserSubscription,
  createSubscription,
  updateSubscription,
  upsertSubscriptionByStripeId,
  getSubscriptionByStripeId,
  getTasksByDate,
  getTasksByDateRange,
  getBacklogTasks,
  createTask,
  updateTask,
  deleteTask,
  getProductivityScore,
  getRemindersByDate,
  createReminder,
  deleteReminder,
  getIncome,
  upsertIncome,
  getFixedBills,
  upsertFixedBills,
  getExpenseEntries,
  addExpenseEntryFull,
  updateExpenseEntry,
  deleteExpenseEntry,
  deleteExpenseEntriesByGroup,
  getInstallmentBills,
  addInstallmentBill,
  updateInstallmentBill,
  deleteInstallmentBill,
  getRetirementConfig,
  upsertRetirementConfig,
  getUserCategories,
  initDefaultCategories,
  getAnnualExpenses,
  getAnnualIncome,
  getAnnualFixedBills,
  getAllAnnualData,
  getUserPaymentMethods,
  upsertUserPaymentMethod,
  deleteUserPaymentMethod,
  addUserCategory,
  updateUserCategory,
  deleteUserCategory,
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  getBillEntries,
  addBillEntry,
  deleteBillEntry,
  updateBillEntry,
  clearMonthData,
  getDb,
  getMemberBreakdownMonthly,
  getMemberBreakdownAnnual,
  getExpensesEndingNextMonth,
  clearAllInstallments,
} from "./db";

// ─── Access control helpers ───────────────────────────────────────────────────
type PlanType = "time_management" | "budget" | "combo";

function hasTimeAccess(plan: PlanType) {
  return plan === "time_management" || plan === "combo";
}

function hasBudgetAccess(plan: PlanType) {
  return plan === "budget" || plan === "combo";
}

async function isAdminUser(userId: number): Promise<boolean> {
  const { users } = await import("../drizzle/schema");
  const conn = await getDb();
  if (!conn) return false;
  const result = await conn.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
  return result[0]?.role === "admin";
}

async function requireTimeAccess(userId: number) {
  if (await isAdminUser(userId)) return null;
  const sub = await getActiveSubscription(userId);
  if (!sub || !hasTimeAccess(sub.plan)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Seu plano não inclui o módulo de Gestão de Tempo." });
  }
  return sub;
}

async function requireBudgetAccess(userId: number) {
  if (await isAdminUser(userId)) return null;
  const sub = await getActiveSubscription(userId);
  if (!sub || !hasBudgetAccess(sub.plan)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Seu plano não inclui o módulo de Orçamento Doméstico." });
  }
  return sub;
}

// ─── Retirement calculation helpers ──────────────────────────────────────────
function calcRetirementScenario(
  annualRate: number,
  monthsToRetirement: number,
  initialAmount: number,
  monthlyContributions: number[],
  monthlyContributionFixed: number
) {
  const monthlyRate = annualRate / 12 / 100;
  let montante = initialAmount;
  if (monthlyContributions.length > 0) {
    for (let i = 0; i < monthsToRetirement; i++) {
      const aporte = i < monthlyContributions.length ? monthlyContributions[i] : 0;
      montante = montante * (1 + monthlyRate) + aporte;
    }
  } else if (monthlyRate > 0) {
    const factor = Math.pow(1 + monthlyRate, monthsToRetirement);
    montante = initialAmount * factor + monthlyContributionFixed * ((factor - 1) / monthlyRate);
  } else {
    montante = initialAmount + monthlyContributionFixed * monthsToRetirement;
  }
  const rendaSemGasto = monthlyRate > 0 ? montante * monthlyRate : 0;
  const lifeMonths = 360;
  let rendaConsumindo = 0;
  if (monthlyRate > 0) {
    rendaConsumindo = (montante * monthlyRate * Math.pow(1 + monthlyRate, lifeMonths)) / (Math.pow(1 + monthlyRate, lifeMonths) - 1);
  } else {
    rendaConsumindo = montante / lifeMonths;
  }
  return { montanteFinal: montante, rendaMensalSemGasto: rendaSemGasto, rendaMensalConsumindo: rendaConsumindo };
}

function resolveYearsToRetirement(input: {
  useYearsMode: boolean;
  yearsUntilRetirement: number;
  birthDate: string;
  retirementAge: number;
}): { currentAge: number; yearsToRetirement: number; monthsToRetirement: number } {
  if (input.useYearsMode) {
    const ytr = Math.max(0, input.yearsUntilRetirement || 0);
    return { currentAge: 0, yearsToRetirement: ytr, monthsToRetirement: ytr * 12 };
  }
  let currentAge = 0;
  if (input.birthDate) {
    const parts = input.birthDate.split("/");
    if (parts.length === 3) {
      let birthYear = parseInt(parts[2]);
      if (birthYear < 100) birthYear += 1900;
      const birthMonth = parseInt(parts[1]) - 1;
      const birthDay = parseInt(parts[0]);
      const today = new Date();
      currentAge = today.getFullYear() - birthYear;
      if (today.getMonth() < birthMonth || (today.getMonth() === birthMonth && today.getDate() < birthDay)) {
        currentAge--;
      }
    }
  }
  const yearsToRetirement = Math.max(0, input.retirementAge - currentAge);
  return { currentAge, yearsToRetirement, monthsToRetirement: yearsToRetirement * 12 };
}

/// ─── Subscription Router ──────────────────────────────────────────────────────
const subscriptionRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    if (await isAdminUser(ctx.user.id)) {
      return { plan: "combo" as const, status: "active" as const, isAdmin: true, trialEndsAt: null as Date | null, trialDaysLeft: null as number | null };
    }
    // Usa getActiveSubscription para garantir que trials expirados sejam marcados e não retornados
    const activeSub = await getActiveSubscription(ctx.user.id);
    if (activeSub) {
      let trialDaysLeft: number | null = null;
      if (activeSub.status === "trialing" && activeSub.trialEndsAt) {
        const msLeft = activeSub.trialEndsAt.getTime() - Date.now();
        trialDaysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      }
      return { ...activeSub, trialDaysLeft };
    }
    // Sem assinatura ativa — verificar se há subscription expirada/cancelada para mostrar status correto
    const anySub = await getUserSubscription(ctx.user.id);
    if (!anySub) return null;
    return { ...anySub, trialDaysLeft: null };
  }),
  startTrial: protectedProcedure.mutation(async ({ ctx }) => {
    // Verificar se já tem trial ou assinatura ativa (não bloquear por subscriptions expiradas/canceladas)
    const existing = await getActiveSubscription(ctx.user.id);
    if (existing) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Você já possui uma assinatura ou trial ativo." });
    }
    // Verificar se já usou o trial anteriormente
    const anyPrevious = await getUserSubscription(ctx.user.id);
    if (anyPrevious && (anyPrevious.status === "trialing" || anyPrevious.status === "expired")) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Você já utilizou o período de trial gratuito. Escolha um plano para continuar." });
    }
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 5);
    await createSubscription({
      userId: ctx.user.id,
      plan: "combo",
      status: "trialing",
      trialEndsAt,
    });
    return { success: true, trialEndsAt };
  }),
  activate: protectedProcedure
    .input(z.object({ plan: z.enum(["time_management", "budget", "combo"]) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getUserSubscription(ctx.user.id);
      if (existing) {
        await updateSubscription(existing.id, { plan: input.plan, status: "active" });
      } else {
        await createSubscription({ userId: ctx.user.id, plan: input.plan, status: "active" });
      }
      return { success: true };
    }),
  cancel: protectedProcedure.mutation(async ({ ctx }) => {
    const sub = await getUserSubscription(ctx.user.id);
    if (sub) await updateSubscription(sub.id, { status: "cancelled" });
    return { success: true };
  }),
});

// ─── Tasks Router (Gestão de Tempo) ──────────────────────────────────────────
const tasksRouter = router({
  byDate: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      await requireTimeAccess(ctx.user.id);
      return getTasksByDate(ctx.user.id, input.date);
    }),

  backlog: protectedProcedure.query(async ({ ctx }) => {
    await requireTimeAccess(ctx.user.id);
    return getBacklogTasks(ctx.user.id);
  }),

  byDateRange: protectedProcedure
    .input(z.object({ startDate: z.string(), endDate: z.string() }))
    .query(async ({ ctx, input }) => {
      await requireTimeAccess(ctx.user.id);
      return getTasksByDateRange(ctx.user.id, input.startDate, input.endDate);
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      durationMinutes: z.number().min(1).max(480).default(30),
      category: z.enum(["important", "urgent", "circumstantial"]).default("important"),
      scheduledDate: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireTimeAccess(ctx.user.id);
      await createTask({ ...input, userId: ctx.user.id, status: "pending", executedMinutes: 0 });
      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(255).optional(),
      durationMinutes: z.number().min(1).max(480).optional(),
      category: z.enum(["important", "urgent", "circumstantial"]).optional(),
      status: z.enum(["pending", "started", "completed"]).optional(),
      scheduledDate: z.string().optional(),
      executedMinutes: z.number().optional(),
      notes: z.string().optional(),
      startedAt: z.date().optional(),
      completedAt: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireTimeAccess(ctx.user.id);
      const { id, ...data } = input;
      await updateTask(id, ctx.user.id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await requireTimeAccess(ctx.user.id);
      await deleteTask(input.id, ctx.user.id);
      return { success: true };
    }),

  score: protectedProcedure.query(async ({ ctx }) => {
    await requireTimeAccess(ctx.user.id);
    return getProductivityScore(ctx.user.id);
  }),
});

// ─── Reminders Router ─────────────────────────────────────────────────────────
const remindersRouter = router({
  byDate: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      await requireTimeAccess(ctx.user.id);
      return getRemindersByDate(ctx.user.id, input.date);
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      emoji: z.string().max(8).default("🔔"),
      reminderTime: z.string().default("09:00"),
      reminderDate: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireTimeAccess(ctx.user.id);
      await createReminder({ ...input, userId: ctx.user.id });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await requireTimeAccess(ctx.user.id);
      await deleteReminder(input.id, ctx.user.id);
      return { success: true };
    }),
});

// ─── Income Router ────────────────────────────────────────────────────────────
const incomeRouter = router({
  get: protectedProcedure
    .input(z.object({ year: z.number(), month: z.number().min(1).max(12) }))
    .query(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      return getIncome(ctx.user.id, input.year, input.month);
    }),

  save: protectedProcedure
    .input(z.object({
      year: z.number(),
      month: z.number().min(1).max(12),
      corretora: z.string().default("0"),
      distribuicao: z.string().default("0"),
      carteiraFer: z.string().default("0"),
      angariacao: z.string().default("0"),
      advocacia: z.string().default("0"),
      outros: z.string().default("0"),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      const { year, month, ...data } = input;
      await upsertIncome(ctx.user.id, year, month, data);
      return { success: true };
    }),
});

// ─── Fixed Bills Router ───────────────────────────────────────────────────────
const fixedBillsRouter = router({
  get: protectedProcedure
    .input(z.object({ year: z.number(), month: z.number().min(1).max(12) }))
    .query(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      return getFixedBills(ctx.user.id, input.year, input.month);
    }),

  save: protectedProcedure
    .input(z.object({
      year: z.number(),
      month: z.number().min(1).max(12),
      seguroVida: z.string().default("0"),
      gas: z.string().default("0"),
      agua: z.string().default("0"),
      luz: z.string().default("0"),
      seguroPai: z.string().default("0"),
      celularNet: z.string().default("0"),
      cartoes: z.string().default("0"),
      condominio: z.string().default("0"),
      faxina: z.string().default("0"),
      maconaria: z.string().default("0"),
      pet: z.string().default("0"),
      veiculo: z.string().default("0"),
      musica: z.string().default("0"),
      colegio: z.string().default("0"),
      cantina: z.string().default("0"),
      manicure: z.string().default("0"),
      seguroVeiculo: z.string().default("0"),
      pilates: z.string().default("0"),
      inglesLivia: z.string().default("0"),
      ambiental1: z.string().default("0"),
      publiOnline: z.string().default("0"),
      ambiental2: z.string().default("0"),
      iptu: z.string().default("0"),
      billsObs: z.string().optional(),
      billsDueDay: z.string().optional(),
      billsCategory: z.string().optional(),
      billsMember: z.string().optional(),
      billsPaid: z.string().optional(),
      billsLabels: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      const { year, month, billsObs, billsDueDay, billsCategory, billsMember, billsPaid, billsLabels, ...numericFields } = input;
      const numericKeys = ["seguroVida","gas","agua","luz","seguroPai","celularNet","cartoes","condominio","faxina","maconaria","pet","veiculo","musica","colegio","cantina","manicure","seguroVeiculo","pilates","inglesLivia","ambiental1","publiOnline","ambiental2","iptu"] as const;
      const sanitized: Record<string, string> = {};
      for (const key of numericKeys) {
        const val = (numericFields as Record<string, string>)[key];
        const parsed = parseFloat(String(val ?? "0").replace(",", "."));
        sanitized[key] = isNaN(parsed) ? "0" : String(parsed);
      }
      const data = { ...sanitized, billsObs, billsDueDay, billsCategory, billsMember, billsPaid, billsLabels };
      await upsertFixedBills(ctx.user.id, year, month, data);
      return { success: true };
    }),

  getCardTotal: protectedProcedure
    .input(z.object({ year: z.number(), month: z.number().min(1).max(12) }))
    .query(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      const { year, month } = input;
      const expenses = await getExpenseEntries(ctx.user.id, year, month);
      const userPayMethods = await getUserPaymentMethods(ctx.user.id);
      const DEFAULT_CARD_KEYS = ["itau_infinite", "c6_carbon", "xp"];
      const cardKeys = userPayMethods.length > 0
        ? userPayMethods.filter((p) => p.isCard).map((p) => p.key)
        : DEFAULT_CARD_KEYS;
      const expensesTotal = expenses
        .filter((e) => e.paymentMethod != null && cardKeys.includes(e.paymentMethod))
        .reduce((s, e) => s + (parseFloat(e.amount as string) || 0), 0);
      const byCard: Record<string, number> = {};
      for (const m of cardKeys) {
        byCard[m] = expenses
          .filter((e) => e.paymentMethod === m)
          .reduce((s, e) => s + (parseFloat(e.amount as string) || 0), 0);
      }
      const allInstallments = await getInstallmentBills(ctx.user.id);
      const targetDate = year * 12 + month;
      let installmentsTotal = 0;
      for (const inst of allInstallments) {
        if (inst.paid) continue;
        const startDate = inst.startYear * 12 + inst.startMonth;
        const isActive = inst.isRecurring
          ? targetDate >= startDate
          : targetDate >= startDate && targetDate <= startDate + inst.totalInstallments - 1;
        if (!isActive) continue;
        const val = parseFloat(inst.installmentAmount as string) || 0;
        installmentsTotal += val;
        const pm = (inst as Record<string, unknown>).paymentMethod as string || "itau_infinite";
        if (cardKeys.includes(pm)) {
          byCard[pm] = (byCard[pm] || 0) + val;
        }
      }
      return { total: expensesTotal + installmentsTotal, byCard, expensesTotal, installmentsTotal };
    }),
});

// ─── Fixed Bill Labels Router ─────────────────────────────────────────────────
const fixedBillLabelsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    await requireBudgetAccess(ctx.user.id);
    const { fixedBillLabels } = await import("../drizzle/schema");
    const db = await getDb();
    if (!db) return [];
    return db.select().from(fixedBillLabels).where(eq(fixedBillLabels.userId, ctx.user.id));
  }),

  upsert: protectedProcedure
    .input(z.object({ billKey: z.string(), label: z.string(), hidden: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      const { fixedBillLabels } = await import("../drizzle/schema");
      const db = await getDb();
      if (!db) return { success: false };
      const existing = await db.select().from(fixedBillLabels)
        .where(and(eq(fixedBillLabels.userId, ctx.user.id), eq(fixedBillLabels.billKey, input.billKey)));
      if (existing.length > 0) {
        await db.update(fixedBillLabels)
          .set({ label: input.label, hidden: input.hidden ? 1 : 0 })
          .where(and(eq(fixedBillLabels.userId, ctx.user.id), eq(fixedBillLabels.billKey, input.billKey)));
      } else {
        await db.insert(fixedBillLabels).values({ userId: ctx.user.id, billKey: input.billKey, label: input.label, hidden: input.hidden ? 1 : 0 });
      }
      return { success: true };
    }),

  toggleHidden: protectedProcedure
    .input(z.object({ billKey: z.string(), hidden: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      const { fixedBillLabels } = await import("../drizzle/schema");
      const db = await getDb();
      if (!db) return { success: false };
      const existing = await db.select().from(fixedBillLabels)
        .where(and(eq(fixedBillLabels.userId, ctx.user.id), eq(fixedBillLabels.billKey, input.billKey)));
      if (existing.length > 0) {
        await db.update(fixedBillLabels)
          .set({ hidden: input.hidden ? 1 : 0 })
          .where(and(eq(fixedBillLabels.userId, ctx.user.id), eq(fixedBillLabels.billKey, input.billKey)));
      } else {
        await db.insert(fixedBillLabels).values({ userId: ctx.user.id, billKey: input.billKey, label: input.billKey, hidden: input.hidden ? 1 : 0 });
      }
      return { success: true };
    }),
});

// ─── Expense Entries Router ───────────────────────────────────────────────────
const expensesRouter = router({
  list: protectedProcedure
    .input(z.object({ year: z.number(), month: z.number().min(1).max(12) }))
    .query(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      return getExpenseEntries(ctx.user.id, input.year, input.month);
    }),

  add: protectedProcedure
    .input(z.object({
      year: z.number(),
      month: z.number().min(1).max(12),
      category: z.string(),
      description: z.string(),
      amount: z.string(),
      expenseDate: z.string().optional(),
      obs: z.string().optional(),
      paymentMethod: z.string().optional().default("pix_boleto"),
      installmentTotal: z.number().min(1).max(120).optional().default(1),
      memberId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      const { year, month, category, description, amount, expenseDate, obs, paymentMethod, installmentTotal, memberId } = input;
      const total = installmentTotal ?? 1;
      if (total <= 1) {
        await addExpenseEntryFull(ctx.user.id, year, month, { category, description, amount, expenseDate, obs, paymentMethod, memberId });
      } else {
        const groupId = crypto.randomUUID();
        for (let i = 0; i < total; i++) {
          const totalMonths = (month - 1) + i;
          const targetYear = year + Math.floor(totalMonths / 12);
          const targetMonth = (totalMonths % 12) + 1;
          const label = `${description} (${i + 1}/${total})`;
          await addExpenseEntryFull(ctx.user.id, targetYear, targetMonth, {
            category, description: label, amount, expenseDate: i === 0 ? expenseDate : undefined,
            obs: i === 0 ? obs : undefined, paymentMethod, installmentGroupId: groupId,
            installmentNumber: i + 1, installmentTotal: total, memberId,
          });
        }
      }
      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      description: z.string().optional(),
      amount: z.string().optional(),
      category: z.string().optional(),
      expenseDate: z.string().optional(),
      obs: z.string().optional(),
      paymentMethod: z.string().optional(),
      memberId: z.number().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      const { id, ...data } = input;
      await updateExpenseEntry(id, ctx.user.id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number(), deleteGroup: z.boolean().default(false) }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      if (input.deleteGroup) {
        await deleteExpenseEntriesByGroup(input.id, ctx.user.id);
      } else {
        await deleteExpenseEntry(input.id, ctx.user.id);
      }
      return { success: true };
    }),

  clearMonth: protectedProcedure
    .input(z.object({ year: z.number(), month: z.number().min(1).max(12) }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      return clearMonthData(ctx.user.id, input.year, input.month);
    }),
  endingNextMonth: protectedProcedure
    .input(z.object({ year: z.number(), month: z.number().min(1).max(12) }))
    .query(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      return getExpensesEndingNextMonth(ctx.user.id, input.year, input.month);
    }),
});

// ─── Installment Bills Router ─────────────────────────────────────────────────
const installmentsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    await requireBudgetAccess(ctx.user.id);
    return getInstallmentBills(ctx.user.id);
  }),

  add: protectedProcedure
    .input(z.object({
      description: z.string(),
      totalAmount: z.string(),
      installmentAmount: z.string(),
      totalInstallments: z.number(),
      currentInstallment: z.number().default(1),
      startYear: z.number(),
      startMonth: z.number().min(1).max(12),
      category: z.string().default("Parcelados"),
      paymentMethod: z.string().default("itau_infinite"),
      isRecurring: z.boolean().default(false),
      memberId: z.number().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      let { startYear, startMonth } = input;
      if (!input.isRecurring && input.currentInstallment > 1) {
        const offset = input.currentInstallment - 1;
        const totalMonths = startYear * 12 + startMonth - offset;
        startYear = Math.floor((totalMonths - 1) / 12);
        startMonth = ((totalMonths - 1) % 12) + 1;
      }
      await addInstallmentBill(ctx.user.id, { ...input, startYear, startMonth });
      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      description: z.string().optional(),
      totalAmount: z.string().optional(),
      installmentAmount: z.string().optional(),
      totalInstallments: z.number().optional(),
      currentInstallment: z.number().optional(),
      paid: z.boolean().optional(),
      category: z.string().optional(),
      paymentMethod: z.string().optional(),
      memberId: z.number().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      const { id, ...data } = input;
      await updateInstallmentBill(id, ctx.user.id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      await deleteInstallmentBill(input.id, ctx.user.id);
      return { success: true };
    }),

  togglePaidMonth: protectedProcedure
    .input(z.object({ id: z.number(), year: z.number(), month: z.number().min(1).max(12) }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      const db = await getDb();
      if (!db) return { success: false };
      const { installmentBills } = await import("../drizzle/schema");
      const [inst] = await db.select({ paidMonths: installmentBills.paidMonths })
        .from(installmentBills)
        .where(and(eq(installmentBills.id, input.id), eq(installmentBills.userId, ctx.user.id)))
        .limit(1);
      if (!inst) return { success: false };
      const key = `${input.year}-${input.month}`;
      let paidMap: Record<string, boolean> = {};
      try { paidMap = JSON.parse(inst.paidMonths || "{}"); } catch { paidMap = {}; }
      if (paidMap[key]) { delete paidMap[key]; } else { paidMap[key] = true; }
      await db.update(installmentBills)
        .set({ paidMonths: JSON.stringify(paidMap) })
        .where(and(eq(installmentBills.id, input.id), eq(installmentBills.userId, ctx.user.id)));
      return { success: true, paid: !!paidMap[key] };
    }),

  bulkUpdateMember: protectedProcedure
    .input(z.object({ ids: z.array(z.number()), memberId: z.number().nullable() }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      const db = await getDb();
      if (!db) return { success: false };
      const { installmentBills } = await import("../drizzle/schema");
      await db.update(installmentBills)
        .set({ memberId: input.memberId })
        .where(and(inArray(installmentBills.id, input.ids), eq(installmentBills.userId, ctx.user.id)));
      return { success: true, updated: input.ids.length };
    }),
  clearAll: protectedProcedure.mutation(async ({ ctx }) => {
    await requireBudgetAccess(ctx.user.id);
    await clearAllInstallments(ctx.user.id);
    return { success: true };
  }),
});
// ─── Retirement Routerr ────────────────────────────────────────────────────────
const retirementRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    await requireBudgetAccess(ctx.user.id);
    return getRetirementConfig(ctx.user.id);
  }),

  save: protectedProcedure
    .input(z.object({
      birthDate: z.string(),
      retirementAge: z.number().min(0).max(100),
      yearsUntilRetirement: z.number().min(0).max(80).optional(),
      useYearsMode: z.boolean().default(false),
      initialAmount: z.string(),
      monthlyContribution: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      await upsertRetirementConfig(ctx.user.id, input);
      return { success: true };
    }),

  calculate: protectedProcedure
    .input(z.object({
      birthDate: z.string(),
      retirementAge: z.number(),
      yearsUntilRetirement: z.number().optional(),
      useYearsMode: z.boolean().default(false),
      initialAmount: z.number(),
      monthlyContribution: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      const { currentAge, yearsToRetirement, monthsToRetirement } = resolveYearsToRetirement({
        useYearsMode: input.useYearsMode,
        yearsUntilRetirement: input.yearsUntilRetirement ?? 0,
        birthDate: input.birthDate,
        retirementAge: input.retirementAge,
      });
      const almejada = {
        pessimista: calcRetirementScenario(6, monthsToRetirement, input.initialAmount, [], input.monthlyContribution),
        regular: calcRetirementScenario(8, monthsToRetirement, input.initialAmount, [], input.monthlyContribution),
        otimista: calcRetirementScenario(10, monthsToRetirement, input.initialAmount, [], input.monthlyContribution),
      };
      const [allData, userPayMethods] = await Promise.all([
        getAllAnnualData(ctx.user.id),
        getUserPaymentMethods(ctx.user.id),
      ]);
      const { incomes, bills, expenses, installments } = allData;
      const DEFAULT_CARD_KEYS = ["itau_infinite", "c6_carbon", "xp"];
      const cardKeys: string[] = userPayMethods.length > 0
        ? userPayMethods.filter((p) => p.isCard).map((p) => p.key)
        : DEFAULT_CARD_KEYS;
      const saldoMap: Record<string, number> = {};
      const allYears = Array.from(new Set(incomes.map((i) => i.year))).sort();
      for (const yr of allYears) {
        for (let m = 1; m <= 12; m++) {
          const monthIncome = incomes.find((i) => i.year === yr && i.month === m);
          const monthBills = bills.find((b) => b.year === yr && b.month === m);
          const monthExpenses = expenses.filter((e) => e.year === yr && e.month === m);
          const totalIncome = monthIncome
            ? [monthIncome.corretora, monthIncome.distribuicao, monthIncome.carteiraFer, monthIncome.angariacao, monthIncome.advocacia, monthIncome.outros]
                .reduce((s, v) => s + (parseFloat(v as string) || 0), 0)
            : 0;
          const monthBillEntries = await getBillEntries(ctx.user.id, yr, m);
          const totalBillEntries = monthBillEntries.reduce((s, e) => s + (parseFloat(e.amount as string) || 0), 0);
          const BILLS_SKIP = new Set(['id','userId','year','month','createdAt','updatedAt','billsObs','billsDueDay','billsCategory','billsMember','cartoes']);
          const billsSemCartoes = (monthBills
            ? Object.entries(monthBills).filter(([k]) => !BILLS_SKIP.has(k)).reduce((s, [, v]) => s + (parseFloat(v as string) || 0), 0)
            : 0) + totalBillEntries;
          const monthCardExpenses = monthExpenses
            .filter((e) => e.paymentMethod != null && cardKeys.includes(e.paymentMethod as string))
            .reduce((s, e) => s + (parseFloat(e.amount as string) || 0), 0);
          const monthActiveInst = (installments || []).filter((inst) => {
            if (inst.paid) return false;
            const startDate = inst.startYear * 12 + inst.startMonth;
            const curDate = yr * 12 + m;
            if (inst.isRecurring) return curDate >= startDate;
            const endDate = startDate + inst.totalInstallments - 1;
            return curDate >= startDate && curDate <= endDate;
          });
          const monthInstTotal = monthActiveInst.reduce((s, i) => s + (parseFloat(i.installmentAmount as string) || 0), 0);
          const cartoesRealtime = monthCardExpenses + monthInstTotal;
          const totalSaidas = billsSemCartoes + cartoesRealtime;
          const saldo = totalIncome - totalSaidas;
          if (totalIncome > 0 || totalSaidas > 0) {
            saldoMap[`${yr}-${m}`] = saldo;
          }
        }
      }
      const realContributions = Object.values(saldoMap).filter((s) => s > 0);
      const hasRealData = realContributions.length > 0;
      const avgRealContribution = hasRealData ? realContributions.reduce((s, v) => s + v, 0) / realContributions.length : 0;
      const realContributionsFull: number[] = [];
      for (let i = 0; i < monthsToRetirement; i++) {
        realContributionsFull.push(i < realContributions.length ? realContributions[i] : avgRealContribution);
      }
      const real = hasRealData ? {
        pessimista: calcRetirementScenario(6, monthsToRetirement, input.initialAmount, realContributionsFull, 0),
        regular: calcRetirementScenario(8, monthsToRetirement, input.initialAmount, realContributionsFull, 0),
        otimista: calcRetirementScenario(10, monthsToRetirement, input.initialAmount, realContributionsFull, 0),
        mesesComDados: realContributions.length,
        mediaMensalReal: avgRealContribution,
        saldosPorMes: Object.entries(saldoMap).map(([key, saldo]) => ({ periodo: key, saldo })),
      } : null;
      return {
        currentAge, yearsToRetirement, monthsToRetirement, almejada, real,
        pessimista: almejada.pessimista, regular: almejada.regular, otimista: almejada.otimista,
      };
    }),
});

// ─── Categories Router ────────────────────────────────────────────────────────
const categoriesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    await requireBudgetAccess(ctx.user.id);
    await initDefaultCategories(ctx.user.id);
    return getUserCategories(ctx.user.id);
  }),

  add: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(64),
      rule: z.enum(["Essenciais (50%)", "Estilo de Vida (30%)", "Investimentos/Dívidas (20%)"]),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      return addUserCategory(ctx.user.id, input.name, input.rule);
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(64),
      rule: z.enum(["Essenciais (50%)", "Estilo de Vida (30%)", "Investimentos/Dívidas (20%)"]),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      await updateUserCategory(ctx.user.id, input.id, input.name, input.rule);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      await deleteUserCategory(ctx.user.id, input.id);
      return { success: true };
    }),
  seedDefaults: protectedProcedure.mutation(async ({ ctx }) => {
    await requireBudgetAccess(ctx.user.id);
    await initDefaultCategories(ctx.user.id);
    return getUserCategories(ctx.user.id);
  }),
});

// ─── Payment Methods Router ───────────────────────────────────────────────────
const paymentMethodsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    await requireBudgetAccess(ctx.user.id);
    return getUserPaymentMethods(ctx.user.id);
  }),

  upsert: protectedProcedure
    .input(z.object({
      id: z.number().optional(),
      key: z.string().min(1).max(64),
      label: z.string().min(1).max(64),
      icon: z.string().max(8).default("💳"),
      colorClass: z.string().max(128).default("bg-gray-100 text-gray-700 border-gray-300"),
      isCard: z.boolean().default(false),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      return upsertUserPaymentMethod(ctx.user.id, input);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      await deleteUserPaymentMethod(ctx.user.id, input.id);
      return { success: true };
    }),
});

// ─── Members Router ───────────────────────────────────────────────────────────
const membersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    await requireBudgetAccess(ctx.user.id);
    return getFamilyMembers(ctx.user.id);
  }),

  add: protectedProcedure
    .input(z.object({ name: z.string().min(1), color: z.string().default("#6366f1"), sortOrder: z.number().default(0) }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      return addFamilyMember(ctx.user.id, input.name, input.color, input.sortOrder);
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string().min(1), color: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      await updateFamilyMember(ctx.user.id, input.id, input.name, input.color);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      await deleteFamilyMember(ctx.user.id, input.id);
      return { success: true };
    }),
  seedDefaults: protectedProcedure.mutation(async ({ ctx }) => {
    await requireBudgetAccess(ctx.user.id);
    const existing = await getFamilyMembers(ctx.user.id);
    if (existing.length === 0) {
      const defaults = [
        { name: "Eu", color: "#6366f1", sortOrder: 0 },
        { name: "Cônjuge", color: "#ec4899", sortOrder: 1 },
        { name: "Filho(a)", color: "#f59e0b", sortOrder: 2 },
      ];
      for (const m of defaults) {
        await addFamilyMember(ctx.user.id, m.name, m.color, m.sortOrder);
      }
    }
    return getFamilyMembers(ctx.user.id);
  }),
  breakdownMonthly: protectedProcedure
    .input(z.object({ year: z.number(), month: z.number().min(1).max(12) }))
    .query(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      return getMemberBreakdownMonthly(ctx.user.id, input.year, input.month);
    }),
  breakdownAnnual: protectedProcedure
    .input(z.object({ year: z.number() }))
    .query(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      return getMemberBreakdownAnnual(ctx.user.id, input.year);
    }),
});
// ─── Dashboard Routerr ─────────────────────────────────────────────────────────
const dashboardRouter = router({
  annual: protectedProcedure
    .input(z.object({ year: z.number() }))
    .query(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      const [expenses, incomes, bills, allInstallments, userPayMethods] = await Promise.all([
        getAnnualExpenses(ctx.user.id, input.year),
        getAnnualIncome(ctx.user.id, input.year),
        getAnnualFixedBills(ctx.user.id, input.year),
        getInstallmentBills(ctx.user.id),
        getUserPaymentMethods(ctx.user.id),
      ]);
      const DEFAULT_CARD_KEYS = ["itau_infinite", "c6_carbon", "xp"];
      const cardKeys = userPayMethods.length > 0
        ? userPayMethods.filter((p) => p.isCard).map((p) => p.key)
        : DEFAULT_CARD_KEYS;
      const categoryTotals: Record<string, number> = {};
      for (const e of expenses) {
        const amt = parseFloat(e.amount as string) || 0;
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + amt;
      }
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const maxMonth = input.year < currentYear ? 12 : input.year === currentYear ? currentMonth : 0;
      const months = [];
      for (let m = 1; m <= maxMonth; m++) {
        const monthIncome = incomes.find((i) => i.month === m);
        const monthBills = bills.find((b) => b.month === m);
        const monthExpenses = expenses.filter((e) => e.month === m);
        const totalIncome = monthIncome
          ? [monthIncome.corretora, monthIncome.distribuicao, monthIncome.carteiraFer, monthIncome.angariacao, monthIncome.advocacia, monthIncome.outros]
              .reduce((s, v) => s + (parseFloat(v as string) || 0), 0)
          : 0;
        const monthBillEntriesData = await getBillEntries(ctx.user.id, input.year, m);
        const totalBillEntriesData = monthBillEntriesData.reduce((s, e) => s + (parseFloat(e.amount as string) || 0), 0);
        const monthCardExpenses = monthExpenses
          .filter((e) => e.paymentMethod != null && cardKeys.includes(e.paymentMethod as string))
          .reduce((s, e) => s + (parseFloat(e.amount as string) || 0), 0);
        const monthActiveInstallments = (allInstallments || []).filter((inst) => {
          if (inst.paid) return false;
          const startDate = inst.startYear * 12 + inst.startMonth;
          const curDate = input.year * 12 + m;
          if (inst.isRecurring) return curDate >= startDate;
          const endDate = startDate + inst.totalInstallments - 1;
          return curDate >= startDate && curDate <= endDate;
        });
        const monthInstallmentsTotal = monthActiveInstallments.reduce((s, i) => s + (parseFloat(i.installmentAmount as string) || 0), 0);
        const cartoesRealtime = monthCardExpenses + monthInstallmentsTotal;
        const SKIP_BILLS = ['id','userId','year','month','createdAt','updatedAt','billsObs','billsDueDay','billsCategory','billsMember','cartoes','billsPaid','billsLabels'];
        const totalBills = (monthBills
          ? Object.entries(monthBills).filter(([k]) => !SKIP_BILLS.includes(k)).reduce((s, [, v]) => s + (parseFloat(v as string) || 0), 0)
          : 0) + totalBillEntriesData + cartoesRealtime;
        const totalExpenses = monthExpenses.reduce((s, e) => s + (parseFloat(e.amount as string) || 0), 0);
        const monthInstallments = (allInstallments || []).filter((inst) => {
          const startDate = inst.startYear * 12 + inst.startMonth;
          const endDate = startDate + inst.totalInstallments - 1;
          const curDate = input.year * 12 + m;
          return curDate >= startDate && curDate <= endDate && !inst.paid;
        });
        const totalInstallments = monthInstallments.reduce((s, i) => s + (parseFloat(i.installmentAmount as string) || 0), 0);
        const catMap: Record<string, number> = {};
        for (const e of monthExpenses) {
          const amt = parseFloat(e.amount as string) || 0;
          catMap[e.category] = (catMap[e.category] || 0) + amt;
        }
        if (totalInstallments > 0) catMap['Parcelados'] = (catMap['Parcelados'] || 0) + totalInstallments;
        months.push({
          month: m, totalIncome, totalBills, totalExpenses, totalInstallments,
          saldo: totalIncome - totalBills,
          categoryBreakdown: Object.entries(catMap).map(([category, total]) => ({ category, total })),
        });
      }
      const totalIncome = months.reduce((s, m) => s + m.totalIncome, 0);
      const totalBills = months.reduce((s, m) => s + m.totalBills, 0);
      const totalExpenses = months.reduce((s, m) => s + m.totalExpenses, 0);
      const totalInstallmentsYear = months.reduce((s, m) => s + m.totalInstallments, 0);
      const totalSaldo = totalIncome - totalBills;
      const pctGuardado = totalIncome > 0 ? (totalSaldo / totalIncome) * 100 : 0;
      return {
        categoryTotals, months,
        summary: { totalIncome, totalBills, totalExpenses, totalInstallments: totalInstallmentsYear, totalSaldo, pctGuardado, meta20Atingida: pctGuardado >= 20 },
      };
    }),

  monthly: protectedProcedure
    .input(z.object({ year: z.number(), month: z.number().min(1).max(12) }))
    .query(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      const [income, bills, expenses] = await Promise.all([
        getIncome(ctx.user.id, input.year, input.month),
        getFixedBills(ctx.user.id, input.year, input.month),
        getExpenseEntries(ctx.user.id, input.year, input.month),
      ]);
      const totalIncome = income
        ? [income.corretora, income.distribuicao, income.carteiraFer, income.angariacao, income.advocacia, income.outros]
            .reduce((s, v) => s + (parseFloat(v as string) || 0), 0)
        : 0;
      const monthlyBillEntries = await getBillEntries(ctx.user.id, input.year, input.month);
      const totalMonthlyBillEntries = monthlyBillEntries.reduce((s, e) => s + (parseFloat(e.amount as string) || 0), 0);
      const SKIP_BILLS_MONTHLY = ['id','userId','year','month','createdAt','updatedAt','billsObs','billsDueDay','billsCategory','billsMember','billsPaid','billsLabels'];
      const totalBills = (bills
        ? Object.entries(bills).filter(([k]) => !SKIP_BILLS_MONTHLY.includes(k)).reduce((s, [, v]) => s + (parseFloat(v as string) || 0), 0)
        : 0) + totalMonthlyBillEntries;
      const totalExpenses = expenses.reduce((s, e) => s + (parseFloat(e.amount as string) || 0), 0);
      const saldoFinal = totalIncome - totalBills;
      const pctGuardado = totalIncome > 0 ? (saldoFinal / totalIncome) * 100 : 0;
      const categoryTotals: Record<string, number> = {};
      for (const e of expenses) {
        const amt = parseFloat(e.amount as string) || 0;
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + amt;
      }
      return {
        income, bills, expenses, categoryTotals,
        metrics: { totalIncome, totalBills, totalExpenses, saldoFinal, pctGuardado, meta20Atingida: pctGuardado >= 20 },
      };
    }),
});

// ─── Bill Entries Router ──────────────────────────────────────────────────────
const billEntriesRouter = router({
  list: protectedProcedure
    .input(z.object({ year: z.number(), month: z.number().min(1).max(12) }))
    .query(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      return getBillEntries(ctx.user.id, input.year, input.month);
    }),

  add: protectedProcedure
    .input(z.object({
      year: z.number(),
      month: z.number().min(1).max(12),
      description: z.string().min(1),
      amount: z.string(),
      paymentMethod: z.string().optional().default("pix_boleto"),
      billDate: z.string().optional(),
      obs: z.string().optional(),
      memberId: z.number().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      const { year, month, description, amount, paymentMethod, billDate, obs, memberId } = input;
      await addBillEntry(ctx.user.id, year, month, { description, amount, paymentMethod, billDate, obs, memberId });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      await deleteBillEntry(input.id, ctx.user.id);
      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      description: z.string().optional(),
      amount: z.string().optional(),
      paymentMethod: z.string().optional(),
      billDate: z.string().optional(),
      obs: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireBudgetAccess(ctx.user.id);
      const { id, ...data } = input;
      await updateBillEntry(id, ctx.user.id, data);
      return { success: true };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  subscription: subscriptionRouter,
  tasks: tasksRouter,
  reminders: remindersRouter,
  income: incomeRouter,
  fixedBills: fixedBillsRouter,
  fixedBillLabels: fixedBillLabelsRouter,
  expenses: expensesRouter,
  installments: installmentsRouter,
  retirement: retirementRouter,
  categories: categoriesRouter,
  paymentMethods: paymentMethodsRouter,
  members: membersRouter,
  dashboard: dashboardRouter,
  billEntries: billEntriesRouter,
});

export type AppRouter = typeof appRouter;
