import type { Request, Response } from "express";
import { sendPostPurchaseEmail, sendAccessActivatedEmail } from "./email";
import { getDb } from "./db";

const OFFER_EBOOK = "cu6bor2b";
const OFFER_SISTEMA = "l8k18cwx";
const OFFER_COMBO = "401asx1p";

export async function checkAndGrantPendingHotmartAccess(userId: number, email: string): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const purchases = await db.execute(
      `SELECT plan FROM hotmart_purchases WHERE email = ? AND plan != 'ebook' LIMIT 1`,
      [email]
    ) as any[];

    const rows = purchases[0] as any[];
    if (!rows || rows.length === 0) return;

    const plan = rows[0].plan;

    const existing = await db.execute(
      `SELECT id FROM subscriptions WHERE userId = ? LIMIT 1`,
      [userId]
    ) as any[];

    const existingRows = existing[0] as any[];

    if (existingRows && existingRows.length > 0) {
      await db.execute(
        `UPDATE subscriptions SET plan = ?, status = 'active', updatedAt = NOW() WHERE userId = ?`,
        [plan, userId]
      );
    } else {
      await db.execute(
        `INSERT INTO subscriptions (userId, plan, status, createdAt, updatedAt) VALUES (?, ?, 'active', NOW(), NOW())`,
        [userId, plan]
      );
    }

    console.log(`[Hotmart] Acesso pendente liberado para ${email} — plano: ${plan}`);
  } catch (err) {
    console.error("[Hotmart] Erro ao verificar acesso pendente:", err);
  }
}

export async function handleHotmartWebhook(req: Request, res: Response) {
  try {
    const body = req.body;
    const payload = body?.data ? body : { event: body?.event, data: body };
    const event = payload?.event ?? body?.event ?? "";

    console.log(`[Hotmart Webhook] Evento recebido: ${event}`);

    const buyerEmail =
      payload?.data?.buyer?.email ||
      body?.buyer?.email ||
      body?.data?.buyer?.email ||
      null;

    const buyerName =
      payload?.data?.buyer?.name ||
      body?.buyer?.name ||
      body?.data?.buyer?.name ||
      null;

    const offerCode =
      payload?.data?.purchase?.offer?.code ||
      body?.purchase?.offer?.code ||
      body?.data?.purchase?.offer?.code ||
      null;

    if (!buyerEmail) {
      console.log("[Hotmart Webhook] Payload sem e-mail do comprador");
      return res.status(400).json({ error: "Missing buyer email" });
    }

    const isEbook = offerCode === OFFER_EBOOK;
    const isCombo = offerCode === OFFER_COMBO || !offerCode;
    const plan = isCombo ? "combo" : "budget";

    const approvedEvents = ["PURCHASE_APPROVED", "PURCHASE_COMPLETE", "purchase.approved", "purchase.complete"];

    if (!approvedEvents.includes(event) && event !== "") {
      console.log(`[Hotmart Webhook] Evento ignorado: ${event}`);
      return res.status(200).json({ received: true });
    }

    console.log(`[Hotmart Webhook] Compra — email: ${buyerEmail} | oferta: ${offerCode} | ebook: ${isEbook}`);

    if (isEbook) {
      console.log(`[Hotmart Webhook] Oferta e-book — sem acesso ao sistema para ${buyerEmail}`);
      return res.status(200).json({ received: true, access: "ebook_only" });
    }

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "DB unavailable" });

    await db.execute(
      `INSERT INTO hotmart_purchases (buyerEmail, buyerName, plan, status, createdAt)
       VALUES (?, ?, ?, 'APPROVED', NOW())
       ON DUPLICATE KEY UPDATE plan = ?, status = 'APPROVED', updatedAt = NOW()`,
      [buyerEmail, buyerName, plan, plan]
    );

    const users = await db.execute(`SELECT id FROM users WHERE email = ? LIMIT 1`, [buyerEmail]) as any[];
    const userRows = users[0] as any[];

    if (userRows && userRows.length > 0) {
      const userId = userRows[0].id;
      const existing = await db.execute(`SELECT id FROM subscriptions WHERE userId = ? LIMIT 1`, [userId]) as any[];
      const existingRows = existing[0] as any[];

      if (existingRows && existingRows.length > 0) {
        await db.execute(`UPDATE subscriptions SET plan = ?, status = 'active', updatedAt = NOW() WHERE userId = ?`, [plan, userId]);
      } else {
        await db.execute(`INSERT INTO subscriptions (userId, plan, status, createdAt, updatedAt) VALUES (?, ?, 'active', NOW(), NOW())`, [userId, plan]);
      }
      console.log(`[Hotmart Webhook] Assinatura ativada para: ${buyerEmail}`);
      sendAccessActivatedEmail(buyerEmail, buyerName).catch(() => {});
    } else {
      console.log(`[Hotmart Webhook] Comprador ${buyerEmail} ainda não tem conta — acesso pendente`);
      sendPostPurchaseEmail(buyerEmail, buyerName).catch(() => {});
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("[Hotmart Webhook] Erro:", err);
    return res.status(500).json({ error: err.message });
  }
}
