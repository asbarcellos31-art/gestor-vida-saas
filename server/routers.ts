import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createBudgetEntry,
  createInstallment,
  createSubscription,
  createTask,
  deleteBudgetEntry,
  deleteInstallment,
  deleteTask,
  getActiveSubscription,
  getBudgetEntriesByMonth,
  getBudgetSummaryByYear,
  getInstallments,
  getProductivityScore,
  getRetirementProjection,
  getSubscriptionByStripeId,
  getTasksByDate,
  getTasksByDateRange,
  getUserSubscription,
  updateBudgetEntry,
  updateInstallment,
  updateSubscription,
  updateTask,
  upsertRetirementProjection,
  upsertSubscriptionByStripeId,
} from "./db";

// ─── Helpers ──────────────────────────────────────────────────────────────────
type PlanType = "time_management" | "budget" | "combo";

function hasTimeAccess(plan: PlanType) {
  return plan === "time_management" || plan === "combo";
}

function hasBudgetAccess(plan: PlanType) {
  return plan === "budget" || plan === "combo";
}

async function requireTimeAccess(userId: number) {
  const sub = await getActiveSubscription(userId);
  if (!sub || !hasTimeAccess(sub.plan)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Seu plano não inclui o módulo de Gestão de Tempo.",
    });
  }
  return sub;
}

async function requireBudgetAccess(userId: number) {
  const sub = await getActiveSubscription(userId);
  if (!sub || !hasBudgetAccess(sub.plan)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Seu plano não inclui o módulo de Orçamento Doméstico.",
    });
  }
  return sub;
}

// ─── Retirement calculation helper ────────────────────────────────────────────
function calcRetirement(
  currentAge: number,
  retirementAge: number,
  currentSavings: number,
  monthlyContribution: number,
  annualRate: number
) {
  const years = retirementAge - currentAge;
  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;

  // Future value of current savings
  const fvSavings = currentSavings * Math.pow(1 + monthlyRate, months);
  // Future value of monthly contributions
  const fvContributions =
    monthlyRate > 0
      ? monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
      : monthlyContribution * months;

  const totalAccumulated = fvSavings + fvContributions;
  // Monthly income assuming 25 years of retirement (300 months)
  const retirementMonths = 300;
  const monthlyIncome =
    monthlyRate > 0
      ? totalAccumulated * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -retirementMonths)))
      : totalAccumulated / retirementMonths;

  return { totalAccumulated, monthlyIncome };
}

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

  // ─── Subscriptions ──────────────────────────────────────────────────────────
  subscription: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getUserSubscription(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          plan: z.enum(["time_management", "budget", "combo"]),
          stripeCustomerId: z.string().optional(),
          stripeSubscriptionId: z.string().optional(),
          stripePriceId: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await getActiveSubscription(ctx.user.id);
        if (existing) {
          await updateSubscription(existing.id, {
            plan: input.plan,
            stripeCustomerId: input.stripeCustomerId,
            stripeSubscriptionId: input.stripeSubscriptionId,
            stripePriceId: input.stripePriceId,
            status: "active",
          });
          return { success: true };
        }
        await createSubscription({
          userId: ctx.user.id,
          plan: input.plan,
          status: "active",
          stripeCustomerId: input.stripeCustomerId,
          stripeSubscriptionId: input.stripeSubscriptionId,
          stripePriceId: input.stripePriceId,
          cancelAtPeriodEnd: false,
        });
        return { success: true };
      }),

    cancel: protectedProcedure.mutation(async ({ ctx }) => {
      const sub = await getActiveSubscription(ctx.user.id);
      if (!sub) throw new TRPCError({ code: "NOT_FOUND", message: "Assinatura não encontrada." });
      await updateSubscription(sub.id, { status: "cancelled" });
      return { success: true };
    }),

    // Webhook handler (public - validated by Stripe signature in production)
    stripeWebhook: publicProcedure
      .input(
        z.object({
          stripeSubscriptionId: z.string(),
          status: z.enum(["active", "cancelled", "expired"]),
          plan: z.enum(["time_management", "budget", "combo"]).optional(),
          currentPeriodEnd: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await upsertSubscriptionByStripeId(input.stripeSubscriptionId, {
          status: input.status,
          ...(input.plan && { plan: input.plan }),
          ...(input.currentPeriodEnd && { currentPeriodEnd: input.currentPeriodEnd }),
        });
        return { success: true };
      }),
  }),

  // ─── Tasks (Gestão de Tempo) ─────────────────────────────────────────────────
  tasks: router({
    byDate: protectedProcedure
      .input(z.object({ date: z.string() }))
      .query(async ({ ctx, input }) => {
        await requireTimeAccess(ctx.user.id);
        return getTasksByDate(ctx.user.id, input.date);
      }),

    byDateRange: protectedProcedure
      .input(z.object({ startDate: z.string(), endDate: z.string() }))
      .query(async ({ ctx, input }) => {
        await requireTimeAccess(ctx.user.id);
        return getTasksByDateRange(ctx.user.id, input.startDate, input.endDate);
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          durationMinutes: z.number().min(1).max(480).default(30),
          category: z.enum(["important", "urgent", "circumstantial"]).default("important"),
          scheduledDate: z.string(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await requireTimeAccess(ctx.user.id);
        await createTask({
          userId: ctx.user.id,
          title: input.title,
          durationMinutes: input.durationMinutes,
          category: input.category,
          scheduledDate: input.scheduledDate,
          notes: input.notes,
          status: "pending",
          executedMinutes: 0,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).optional(),
          durationMinutes: z.number().min(1).max(480).optional(),
          category: z.enum(["important", "urgent", "circumstantial"]).optional(),
          scheduledDate: z.string().optional(),
          notes: z.string().optional(),
          status: z.enum(["pending", "started", "completed"]).optional(),
          executedMinutes: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await requireTimeAccess(ctx.user.id);
        const { id, ...data } = input;
        const updateData: Record<string, unknown> = { ...data };
        if (data.status === "completed") {
          updateData.completedAt = new Date();
        } else if (data.status === "started") {
          updateData.startedAt = new Date();
        }
        await updateTask(id, ctx.user.id, updateData as Parameters<typeof updateTask>[2]);
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
  }),

  // ─── Budget (Orçamento Doméstico) ────────────────────────────────────────────
  budget: router({
    byMonth: protectedProcedure
      .input(z.object({ month: z.string() })) // MM/YYYY
      .query(async ({ ctx, input }) => {
        await requireBudgetAccess(ctx.user.id);
        const entries = await getBudgetEntriesByMonth(ctx.user.id, input.month);
        const income = entries
          .filter((e) => e.type === "income")
          .reduce((s, e) => s + parseFloat(e.amount), 0);
        const fixedExpenses = entries
          .filter((e) => e.type === "fixed_expense")
          .reduce((s, e) => s + parseFloat(e.amount), 0);
        const variableExpenses = entries
          .filter((e) => e.type === "variable_expense")
          .reduce((s, e) => s + parseFloat(e.amount), 0);
        const totalExpenses = fixedExpenses + variableExpenses;
        const balance = income - totalExpenses;

        // Regra 50/30/20
        const essential = entries
          .filter((e) => e.rule5030Category === "essential")
          .reduce((s, e) => s + parseFloat(e.amount), 0);
        const lifestyle = entries
          .filter((e) => e.rule5030Category === "lifestyle")
          .reduce((s, e) => s + parseFloat(e.amount), 0);
        const investment = entries
          .filter((e) => e.rule5030Category === "investment")
          .reduce((s, e) => s + parseFloat(e.amount), 0);

        return {
          entries,
          summary: {
            income,
            fixedExpenses,
            variableExpenses,
            totalExpenses,
            balance,
            essential,
            lifestyle,
            investment,
            essentialTarget: income * 0.5,
            lifestyleTarget: income * 0.3,
            investmentTarget: income * 0.2,
          },
        };
      }),

    annualSummary: protectedProcedure
      .input(z.object({ year: z.string() }))
      .query(async ({ ctx, input }) => {
        await requireBudgetAccess(ctx.user.id);
        return getBudgetSummaryByYear(ctx.user.id, input.year);
      }),

    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(["income", "fixed_expense", "variable_expense"]),
          rule5030Category: z.enum(["essential", "lifestyle", "investment"]).optional(),
          category: z.string().min(1),
          description: z.string().min(1),
          amount: z.number().positive(),
          month: z.string(),
          isPaid: z.boolean().default(false),
          dueDay: z.number().min(1).max(31).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await requireBudgetAccess(ctx.user.id);
        await createBudgetEntry({
          userId: ctx.user.id,
          type: input.type,
          rule5030Category: input.rule5030Category,
          category: input.category,
          description: input.description,
          amount: String(input.amount),
          month: input.month,
          isPaid: input.isPaid,
          dueDay: input.dueDay,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          type: z.enum(["income", "fixed_expense", "variable_expense"]).optional(),
          rule5030Category: z.enum(["essential", "lifestyle", "investment"]).optional().nullable(),
          category: z.string().optional(),
          description: z.string().optional(),
          amount: z.number().positive().optional(),
          month: z.string().optional(),
          isPaid: z.boolean().optional(),
          dueDay: z.number().min(1).max(31).optional().nullable(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await requireBudgetAccess(ctx.user.id);
        const { id, amount, ...rest } = input;
        await updateBudgetEntry(id, ctx.user.id, {
          ...rest,
          ...(amount !== undefined && { amount: String(amount) }),
        } as Parameters<typeof updateBudgetEntry>[2]);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireBudgetAccess(ctx.user.id);
        await deleteBudgetEntry(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ─── Installments ────────────────────────────────────────────────────────────
  installments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      await requireBudgetAccess(ctx.user.id);
      return getInstallments(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          description: z.string().min(1),
          totalAmount: z.number().positive(),
          totalParcels: z.number().min(1),
          startMonth: z.string(),
          category: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await requireBudgetAccess(ctx.user.id);
        const monthlyValue = input.totalAmount / input.totalParcels;
        await createInstallment({
          userId: ctx.user.id,
          description: input.description,
          totalAmount: String(input.totalAmount),
          totalParcels: input.totalParcels,
          paidParcels: 0,
          monthlyValue: String(monthlyValue),
          startMonth: input.startMonth,
          status: "active",
          category: input.category,
        });
        return { success: true };
      }),

    payParcel: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireBudgetAccess(ctx.user.id);
        const list = await getInstallments(ctx.user.id);
        const inst = list.find((i) => i.id === input.id);
        if (!inst) throw new TRPCError({ code: "NOT_FOUND" });
        const newPaid = inst.paidParcels + 1;
        const newStatus = newPaid >= inst.totalParcels ? "completed" : "active";
        await updateInstallment(input.id, ctx.user.id, {
          paidParcels: newPaid,
          status: newStatus,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireBudgetAccess(ctx.user.id);
        await deleteInstallment(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ─── Retirement ───────────────────────────────────────────────────────────────
  retirement: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      await requireBudgetAccess(ctx.user.id);
      return getRetirementProjection(ctx.user.id);
    }),

    calculate: protectedProcedure
      .input(
        z.object({
          currentAge: z.number().min(18).max(80),
          retirementAge: z.number().min(40).max(90),
          currentSavings: z.number().min(0),
          monthlyContribution: z.number().min(0),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await requireBudgetAccess(ctx.user.id);
        const { currentAge, retirementAge, currentSavings, monthlyContribution } = input;

        const s1 = calcRetirement(currentAge, retirementAge, currentSavings, monthlyContribution, 10);
        const s2 = calcRetirement(currentAge, retirementAge, currentSavings, monthlyContribution, 14);
        const s3 = calcRetirement(currentAge, retirementAge, currentSavings, monthlyContribution, 18);

        await upsertRetirementProjection(ctx.user.id, {
          userId: ctx.user.id,
          currentAge,
          retirementAge,
          currentSavings: String(currentSavings),
          monthlyContribution: String(monthlyContribution),
          scenario1Rate: "10.00",
          scenario1Result: String(s1.totalAccumulated.toFixed(2)),
          scenario1MonthlyIncome: String(s1.monthlyIncome.toFixed(2)),
          scenario2Rate: "14.00",
          scenario2Result: String(s2.totalAccumulated.toFixed(2)),
          scenario2MonthlyIncome: String(s2.monthlyIncome.toFixed(2)),
          scenario3Rate: "18.00",
          scenario3Result: String(s3.totalAccumulated.toFixed(2)),
          scenario3MonthlyIncome: String(s3.monthlyIncome.toFixed(2)),
        });

        return {
          scenario1: { rate: 10, label: "Conservador (CDI ~10%)", ...s1 },
          scenario2: { rate: 14, label: "Moderado (CDI + Inflação ~14%)", ...s2 },
          scenario3: { rate: 18, label: "Agressivo (Renda Variável ~18%)", ...s3 },
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
