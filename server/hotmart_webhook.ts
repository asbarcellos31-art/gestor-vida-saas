import type { Request, Response } from "express";
import { sql } from "drizzle-orm";
import { sendPostPurchaseEmail, sendAccessActivatedEmail } from "./email";
import { getDb } from "./db";

const OFFER_EBOOK   = "gqtt03zn";
const OFFER_SISTEMA = "6vlpofwo";
const OFFER_COMBO   = "zys6qohw";

// Chamado após login: verifica se esse email tem compra pendente e ativa o plano
export async function checkAndGrantPendingHotmartAccess(userId: number, email: string): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const result = await db.execute(
      sql`SELECT plan FROM hotmart_purchases WHERE buyerEmail = ${email} AND plan != 'time_management' LIMIT 1`
    ) as any;
    const rows = Array.isArray(result[0]) ? result[0] : (Array.isArray(result) ? result : []);
    if (!rows.length) return;

    const plan = rows[0].plan;

    const existingResult = await db.execute(
      sql`SELECT id FROM subscriptions WHERE userId = ${userId} LIMIT 1`
    ) as any;
    const existing = Array.isArray(existingResult[0]) ? existingResult[0] : (Array.isArray(existingResult) ? existingResult : []);

    if (existing.length > 0) {
      await db.execute(
        sql`UPDATE subscriptions SET plan = ${plan}, status = 'active', updatedAt = NOW() WHERE userId = ${userId}`
      );
    } else {
      await db.execute(
        sql`INSERT INTO subscriptions (userId, plan, status, createdAt, updatedAt) VALUES (${userId}, ${plan}, 'active', NOW(), NOW())`
      );
    }

    // Marca como acesso concedido
    await db.execute(
      sql`UPDATE hotmart_purchases SET accessGranted = 1, userId = ${userId} WHERE buyerEmail = ${email}`
    );

    console.log(`[Hotmart] Acesso pendente liberado para ${email} — plano: ${plan}`);
  } catch (err) {
    console.error("[Hotmart] Erro ao verificar acesso pendente:", err);
  }
}

export async function handleHotmartWebhook(req: Request, res: Response) {
  try {
    const body = req.body;

    // Hotmart pode enviar payload com ou sem wrapper "data"
    const data = body?.data ?? body;
    const event = body?.event ?? body?.data?.event ?? "";

    console.log(`[Hotmart Webhook] Evento: ${event}`);
    console.log(`[Hotmart Webhook] Payload:`, JSON.stringify(body).slice(0, 500));

    const approvedEvents = [
      "PURCHASE_APPROVED", "PURCHASE_COMPLETE",
      "purchase.approved", "purchase.complete",
    ];

    if (!approvedEvents.includes(event) && event !== "") {
      console.log(`[Hotmart Webhook] Evento ignorado: ${event}`);
      return res.status(200).json({ received: true });
    }

    const buyerEmail: string | null =
      data?.buyer?.email || body?.buyer?.email || null;

    const buyerName: string | null =
      data?.buyer?.name || body?.buyer?.name || null;

    const offerCode: string | null =
      data?.purchase?.offer?.code || body?.purchase?.offer?.code || null;

    // hotmartTransactionId é NOT NULL UNIQUE — extrai do payload
    const transactionId: string =
      data?.purchase?.transaction ||
      body?.purchase?.transaction ||
      data?.purchase?.order_date ||   // fallback para testes
      `UNKNOWN-${Date.now()}`;

    const productId: string | null =
      data?.product?.id || body?.product?.id || null;

    const productName: string | null =
      data?.product?.name || body?.product?.name || null;

    if (!buyerEmail) {
      console.log("[Hotmart Webhook] Payload sem e-mail do comprador");
      return res.status(400).json({ error: "Missing buyer email" });
    }

    const isEbook  = offerCode === OFFER_EBOOK;
    const isSistema = offerCode === OFFER_SISTEMA;
    const plan: "combo" | "budget" | "time_management" =
      isEbook   ? "time_management" :
      isSistema ? "budget" :
                  "combo"; // default: combo (inclui oferta sem código)

    console.log(`[Hotmart Webhook] email: ${buyerEmail} | oferta: ${offerCode} | plano: ${plan} | tx: ${transactionId}`);

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "DB unavailable" });

    // Salva/atualiza a compra — usa hotmartTransactionId como chave de idempotência
    await db.execute(
      sql`INSERT INTO hotmart_purchases
            (hotmartTransactionId, buyerEmail, buyerName, productId, productName, plan, status, rawPayload, createdAt)
          VALUES
            (${transactionId}, ${buyerEmail}, ${buyerName}, ${productId}, ${productName}, ${plan}, 'approved', ${JSON.stringify(body)}, NOW())
          ON DUPLICATE KEY UPDATE
            plan        = ${plan},
            status      = 'approved',
            updatedAt   = NOW()`
    );

    // E-book: sem acesso ao sistema, mas salva a compra para histórico
    if (isEbook) {
      console.log(`[Hotmart Webhook] E-book comprado por ${buyerEmail} — sem acesso ao sistema`);
      return res.status(200).json({ received: true, access: "ebook_only" });
    }

    // Verifica se comprador já tem conta
    const userResult = await db.execute(
      sql`SELECT id FROM users WHERE email = ${buyerEmail} LIMIT 1`
    ) as any;
    const userRows = Array.isArray(userResult[0]) ? userResult[0] : (Array.isArray(userResult) ? userResult : []);

    if (userRows.length > 0) {
      const userId = userRows[0].id;

      const subResult = await db.execute(
        sql`SELECT id FROM subscriptions WHERE userId = ${userId} LIMIT 1`
      ) as any;
      const subRows = Array.isArray(subResult[0]) ? subResult[0] : (Array.isArray(subResult) ? subResult : []);

      if (subRows.length > 0) {
        await db.execute(
          sql`UPDATE subscriptions SET plan = ${plan}, status = 'active', updatedAt = NOW() WHERE userId = ${userId}`
        );
      } else {
        await db.execute(
          sql`INSERT INTO subscriptions (userId, plan, status, createdAt, updatedAt) VALUES (${userId}, ${plan}, 'active', NOW(), NOW())`
        );
      }

      await db.execute(
        sql`UPDATE hotmart_purchases SET accessGranted = 1, userId = ${userId} WHERE hotmartTransactionId = ${transactionId}`
      );

      console.log(`[Hotmart Webhook] Assinatura ${plan} ativada para ${buyerEmail} (userId=${userId})`);
      sendAccessActivatedEmail(buyerEmail, buyerName).catch(() => {});
    } else {
      console.log(`[Hotmart Webhook] ${buyerEmail} ainda não tem conta — acesso pendente`);
      sendPostPurchaseEmail(buyerEmail, buyerName).catch(() => {});
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("[Hotmart Webhook] Erro:", err);
    return res.status(500).json({ error: err.message });
  }
}
