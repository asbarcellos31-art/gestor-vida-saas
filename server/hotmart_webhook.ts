/**
 * Webhook do Hotmart — /api/hotmart/webhook
 *
 * Fluxo:
 * 1. Hotmart envia evento PURCHASE_APPROVED (ou PURCHASE_REFUNDED etc.)
 * 2. Validamos o token secreto no header hottok
 * 3. Mapeamos o produto para o plano correto (time_management | budget | combo)
 * 4. Registramos a compra na tabela hotmart_purchases
 * 5. Se o comprador já tem conta → liberamos o acesso imediatamente
 * 6. Se não tem conta → acesso fica pendente e é liberado no primeiro login
 *
 * Para cancelamentos/reembolsos: marcamos status e cancelamos a subscription.
 */

import type { Request, Response } from "express";
import { getDb } from "./db";
import { hotmartPurchases, subscriptions, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// ── Mapeamento de produto Hotmart → plano interno ─────────────────────────────
// Preencha com os IDs reais dos seus produtos no Hotmart após criá-los
const PRODUCT_PLAN_MAP: Record<string, "time_management" | "budget" | "combo"> = {
  // "ID_DO_PRODUTO_EBOOK": "time_management",
  // "ID_DO_PRODUTO_SISTEMA": "budget",
  // "ID_DO_PRODUTO_COMBO": "combo",
  // Fallback por nome (case-insensitive parcial)
};

function detectPlanFromPayload(payload: HotmartPayload): "time_management" | "budget" | "combo" {
  const productId = String(payload.data?.product?.id ?? "");
  const productName = (payload.data?.product?.name ?? "").toLowerCase();

  if (PRODUCT_PLAN_MAP[productId]) return PRODUCT_PLAN_MAP[productId];

  // Detecção por nome do produto
  if (productName.includes("combo")) return "combo";
  if (productName.includes("sistema") || productName.includes("vitalício") || productName.includes("vitalicio")) return "budget";
  if (productName.includes("ebook") || productName.includes("e-book") || productName.includes("livro")) return "time_management";

  // Fallback: combo (produto mais completo)
  return "combo";
}

// ── Tipos do payload Hotmart ──────────────────────────────────────────────────
interface HotmartPayload {
  event: string;
  data?: {
    buyer?: {
      email?: string;
      name?: string;
    };
    product?: {
      id?: number | string;
      name?: string;
    };
    purchase?: {
      transaction?: string;
      status?: string;
    };
  };
}

// ── Liberar acesso para um usuário ────────────────────────────────────────────
async function grantAccess(userId: number, plan: "time_management" | "budget" | "combo") {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);

  if (existing[0]) {
    await db
      .update(subscriptions)
      .set({ plan, status: "active", trialEndsAt: null, cancelAtPeriodEnd: false })
      .where(eq(subscriptions.userId, userId));
  } else {
    await db.insert(subscriptions).values({ userId, plan, status: "active" });
  }
}

// ── Revogar acesso (reembolso / cancelamento) ─────────────────────────────────
async function revokeAccess(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(subscriptions)
    .set({ status: "cancelled" })
    .where(eq(subscriptions.userId, userId));
}

// ── Handler principal ─────────────────────────────────────────────────────────
export async function handleHotmartWebhook(req: Request, res: Response) {
  try {
    // 1. Validar token secreto (configurado no painel Hotmart)
    const hotmartToken = process.env.HOTMART_WEBHOOK_TOKEN;
    if (hotmartToken) {
      const receivedToken =
        req.headers["hottok"] ||
        req.headers["x-hotmart-webhook-token"] ||
        req.query.hottok;

      if (receivedToken !== hotmartToken) {
        console.warn("[Hotmart Webhook] Token inválido recebido:", receivedToken);
        return res.status(401).json({ error: "Unauthorized" });
      }
    }

    const payload: HotmartPayload = req.body;
    const event = payload?.event ?? "";

    console.log(`[Hotmart Webhook] Evento recebido: ${event}`);

    // 2. Extrair dados do comprador
    const buyerEmail = (payload.data?.buyer?.email ?? "").toLowerCase().trim();
    const buyerName = payload.data?.buyer?.name ?? null;
    const transactionId = payload.data?.purchase?.transaction ?? `evt_${Date.now()}`;
    const productId = String(payload.data?.product?.id ?? "");
    const productName = payload.data?.product?.name ?? null;

    if (!buyerEmail) {
      console.warn("[Hotmart Webhook] Payload sem e-mail do comprador");
      return res.status(400).json({ error: "Missing buyer email" });
    }

    const plan = detectPlanFromPayload(payload);
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "DB unavailable" });

    // 3. Processar por tipo de evento
    if (event === "PURCHASE_APPROVED" || event === "PURCHASE_COMPLETE") {
      // Verificar se já processamos esta transação
      const existing = await db
        .select()
        .from(hotmartPurchases)
        .where(eq(hotmartPurchases.hotmartTransactionId, transactionId))
        .limit(1);

      if (existing[0]) {
        console.log(`[Hotmart Webhook] Transação ${transactionId} já processada`);
        return res.json({ ok: true, message: "Already processed" });
      }

      // Verificar se o comprador já tem conta
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, buyerEmail))
        .limit(1);

      const userId = user[0]?.id ?? null;
      let accessGranted = false;

      if (userId) {
        await grantAccess(userId, plan);
        accessGranted = true;
        console.log(`[Hotmart Webhook] Acesso liberado para userId=${userId} (${buyerEmail}) → plano=${plan}`);
      } else {
        console.log(`[Hotmart Webhook] Comprador ${buyerEmail} ainda não tem conta — acesso pendente`);
      }

      // Registrar compra
      await db.insert(hotmartPurchases).values({
        hotmartTransactionId: transactionId,
        buyerEmail,
        buyerName,
        productId,
        productName,
        plan,
        status: "approved",
        userId,
        accessGranted,
        rawPayload: JSON.stringify(payload),
      });

      return res.json({ ok: true, accessGranted, plan });
    }

    if (
      event === "PURCHASE_REFUNDED" ||
      event === "PURCHASE_CANCELLED" ||
      event === "PURCHASE_CHARGEBACK"
    ) {
      const statusMap: Record<string, "refunded" | "cancelled" | "chargeback"> = {
        PURCHASE_REFUNDED: "refunded",
        PURCHASE_CANCELLED: "cancelled",
        PURCHASE_CHARGEBACK: "chargeback",
      };

      // Atualizar registro
      await db
        .update(hotmartPurchases)
        .set({ status: statusMap[event] ?? "cancelled" })
        .where(eq(hotmartPurchases.hotmartTransactionId, transactionId));

      // Revogar acesso se o usuário tiver conta
      const purchase = await db
        .select()
        .from(hotmartPurchases)
        .where(eq(hotmartPurchases.hotmartTransactionId, transactionId))
        .limit(1);

      if (purchase[0]?.userId) {
        await revokeAccess(purchase[0].userId);
        console.log(`[Hotmart Webhook] Acesso revogado para userId=${purchase[0].userId} (evento: ${event})`);
      }

      return res.json({ ok: true, event });
    }

    // Evento não tratado — retornar 200 para não gerar retry no Hotmart
    console.log(`[Hotmart Webhook] Evento ignorado: ${event}`);
    return res.json({ ok: true, message: "Event ignored" });
  } catch (err) {
    console.error("[Hotmart Webhook] Erro:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Chamado no login do usuário para verificar se há compras pendentes
 * com o e-mail dele e liberar o acesso automaticamente.
 */
export async function checkAndGrantPendingHotmartAccess(userId: number, email: string) {
  try {
    const db = await getDb();
    if (!db) return;

    const normalizedEmail = email.toLowerCase().trim();

    // Buscar compras aprovadas e não liberadas para este e-mail
    const pending = await db
      .select()
      .from(hotmartPurchases)
      .where(eq(hotmartPurchases.buyerEmail, normalizedEmail))
      .limit(10);

    const approvedPending = pending.filter(
      (p: typeof pending[0]) => p.status === "approved" && !p.accessGranted
    );

    if (approvedPending.length === 0) return;

    // Determinar o melhor plano (combo > budget > time_management)
    const planPriority = { combo: 3, budget: 2, time_management: 1 };
    type PlanKey = "time_management" | "budget" | "combo";
    type PRow = (typeof approvedPending)[0];
    const bestPlan = approvedPending.reduce((best: PRow, p: PRow) =>
      (planPriority[p.plan as PlanKey] ?? 0) > (planPriority[best.plan as PlanKey] ?? 0) ? p : best
    ).plan;

    await grantAccess(userId, bestPlan);

    // Marcar todas como liberadas e vincular ao userId
    for (const p of approvedPending) {
      await db
        .update(hotmartPurchases)
        .set({ accessGranted: true, userId })
        .where(eq(hotmartPurchases.id, p.id));
    }

    console.log(`[Hotmart] Acesso pendente liberado para userId=${userId} (${email}) → plano=${bestPlan}`);
  } catch (err) {
    console.error("[Hotmart] Erro ao verificar acesso pendente:", err);
  }
}
