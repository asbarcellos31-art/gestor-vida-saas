// Stripe Products & Prices — Gestor de Vida SaaS
// Gerado automaticamente via setup_stripe_products.mjs
// Ambiente: TEST (sandbox)

export const STRIPE_PRICES = {
  time_management: "price_1TKedyDB1g4P9Hqym6cRl0c7",
  budget: "price_1TKedyDB1g4P9HqyxjbH2oXE",
  combo: "price_1TKedzDB1g4P9HqyGwwsSmm2",
} as const;

export type PlanKey = keyof typeof STRIPE_PRICES;

export const PLAN_LABELS: Record<PlanKey, string> = {
  time_management: "Gestão de Tempo",
  budget: "Orçamento Doméstico",
  combo: "Combo — Gestão de Tempo + Orçamento",
};

export const PLAN_AMOUNTS: Record<PlanKey, number> = {
  time_management: 1990,
  budget: 1990,
  combo: 3490,
};
