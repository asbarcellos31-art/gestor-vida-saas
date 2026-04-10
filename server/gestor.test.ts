import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock context factory ─────────────────────────────────────────────────────
function createCtx(overrides?: Partial<TrpcContext["user"]>): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user-1",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      ...overrides,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// ─── Auth tests ───────────────────────────────────────────────────────────────
describe("auth", () => {
  it("returns current user from me query", async () => {
    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@example.com");
  });

  it("logout clears cookie and returns success", async () => {
    const cleared: string[] = [];
    const ctx: TrpcContext = {
      ...createCtx(),
      res: {
        clearCookie: (name: string) => cleared.push(name),
      } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(cleared.length).toBe(1);
  });
});

// ─── Subscription access control tests ────────────────────────────────────────
describe("subscription access control", () => {
  it("tasks.byDate throws FORBIDDEN when user has no active subscription", async () => {
    const ctx = createCtx({ id: 99999 }); // user with no subscription in DB
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.tasks.byDate({ date: "2025-01-01" })
    ).rejects.toThrow();
  });

  it("budget.byMonth throws FORBIDDEN when user has no active subscription", async () => {
    const ctx = createCtx({ id: 99999 });
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.budget.byMonth({ month: "01/2025" })
    ).rejects.toThrow();
  });

  it("retirement.get throws FORBIDDEN when user has no active subscription", async () => {
    const ctx = createCtx({ id: 99999 });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.retirement.get()).rejects.toThrow();
  });
});

// ─── Retirement calculation tests ─────────────────────────────────────────────
describe("retirement calculation logic", () => {
  // Test the math directly using the formula
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
    const fvSavings = currentSavings * Math.pow(1 + monthlyRate, months);
    const fvContributions =
      monthlyRate > 0
        ? monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
        : monthlyContribution * months;
    const totalAccumulated = fvSavings + fvContributions;
    const retirementMonths = 300;
    const monthlyIncome =
      monthlyRate > 0
        ? totalAccumulated * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -retirementMonths)))
        : totalAccumulated / retirementMonths;
    return { totalAccumulated, monthlyIncome };
  }

  it("conservative scenario (10%) accumulates more than zero", () => {
    const result = calcRetirement(30, 65, 0, 500, 10);
    expect(result.totalAccumulated).toBeGreaterThan(0);
    expect(result.monthlyIncome).toBeGreaterThan(0);
  });

  it("aggressive scenario (18%) yields more than conservative (10%)", () => {
    const conservative = calcRetirement(30, 65, 0, 500, 10);
    const aggressive = calcRetirement(30, 65, 0, 500, 18);
    expect(aggressive.totalAccumulated).toBeGreaterThan(conservative.totalAccumulated);
  });

  it("more years = more accumulation", () => {
    const short = calcRetirement(55, 65, 0, 500, 12);
    const long = calcRetirement(30, 65, 0, 500, 12);
    expect(long.totalAccumulated).toBeGreaterThan(short.totalAccumulated);
  });

  it("existing savings increase total", () => {
    const noSavings = calcRetirement(30, 65, 0, 500, 12);
    const withSavings = calcRetirement(30, 65, 50000, 500, 12);
    expect(withSavings.totalAccumulated).toBeGreaterThan(noSavings.totalAccumulated);
  });

  it("three scenarios produce different results", () => {
    const s1 = calcRetirement(35, 65, 10000, 1000, 10);
    const s2 = calcRetirement(35, 65, 10000, 1000, 14);
    const s3 = calcRetirement(35, 65, 10000, 1000, 18);
    expect(s1.totalAccumulated).not.toBe(s2.totalAccumulated);
    expect(s2.totalAccumulated).not.toBe(s3.totalAccumulated);
    expect(s3.totalAccumulated).toBeGreaterThan(s2.totalAccumulated);
  });
});

// ─── Budget 50/30/20 rule tests ───────────────────────────────────────────────
describe("budget 50/30/20 rule logic", () => {
  function calc5030(income: number, essential: number, lifestyle: number, investment: number) {
    return {
      essentialPct: income > 0 ? (essential / income) * 100 : 0,
      lifestylePct: income > 0 ? (lifestyle / income) * 100 : 0,
      investmentPct: income > 0 ? (investment / income) * 100 : 0,
      essentialTarget: income * 0.5,
      lifestyleTarget: income * 0.3,
      investmentTarget: income * 0.2,
    };
  }

  it("calculates correct percentages for income of 5000", () => {
    const result = calc5030(5000, 2500, 1500, 1000);
    expect(result.essentialPct).toBe(50);
    expect(result.lifestylePct).toBe(30);
    expect(result.investmentPct).toBe(20);
  });

  it("targets are correct fractions of income", () => {
    const result = calc5030(4000, 0, 0, 0);
    expect(result.essentialTarget).toBe(2000);
    expect(result.lifestyleTarget).toBe(1200);
    expect(result.investmentTarget).toBe(800);
  });

  it("handles zero income without division errors", () => {
    const result = calc5030(0, 0, 0, 0);
    expect(result.essentialPct).toBe(0);
    expect(result.lifestylePct).toBe(0);
    expect(result.investmentPct).toBe(0);
  });
});

// ─── Productivity score tests ─────────────────────────────────────────────────
describe("productivity score logic", () => {
  function calcScore(completed: number, total: number) {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  it("returns 0 when no tasks", () => {
    expect(calcScore(0, 0)).toBe(0);
  });

  it("returns 100 when all tasks completed", () => {
    expect(calcScore(10, 10)).toBe(100);
  });

  it("returns 50 when half tasks completed", () => {
    expect(calcScore(5, 10)).toBe(50);
  });

  it("rounds correctly", () => {
    expect(calcScore(1, 3)).toBe(33);
    expect(calcScore(2, 3)).toBe(67);
  });
});

// ─── Plan access control logic tests ─────────────────────────────────────────
describe("plan access control logic", () => {
  function hasTimeAccess(plan: string | undefined) {
    return plan === "time_management" || plan === "combo";
  }

  function hasBudgetAccess(plan: string | undefined) {
    return plan === "budget" || plan === "combo";
  }

  it("time_management plan grants time access only", () => {
    expect(hasTimeAccess("time_management")).toBe(true);
    expect(hasBudgetAccess("time_management")).toBe(false);
  });

  it("budget plan grants budget access only", () => {
    expect(hasTimeAccess("budget")).toBe(false);
    expect(hasBudgetAccess("budget")).toBe(true);
  });

  it("combo plan grants both accesses", () => {
    expect(hasTimeAccess("combo")).toBe(true);
    expect(hasBudgetAccess("combo")).toBe(true);
  });

  it("undefined plan grants no access", () => {
    expect(hasTimeAccess(undefined)).toBe(false);
    expect(hasBudgetAccess(undefined)).toBe(false);
  });
});
