import type { Request, Response } from "express";
import { sendPostPurchaseEmail } from "./email";
import { getDb } from "./db";

const OFFER_EBOOK = "cu6bor2b";
const OFFER_SISTEMA = "l8k18cwx";
const OFFER_COMBO = "401asx1p";

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
    const isSistema = offerCode === OFFER_SISTEMA;
    const isCombo = offerCode === OFFER_COMBO || !offerCode;

    const approvedEvents = [
      "PURCHASE_APPROVED",
      "PURCHASE_COMPLETE",
      "purchase.approved",
      "purchase.complete",
    ];

    if (!approvedEvents.includes(event) && event !== "") {
      console.log(`[Hotmart Webhook] Evento ignorado: ${event}`);
      return res.status(200).json({ received: true });
    }

    console.log(`[Hotmart Webhook] Compra aprovada — email: ${buyerEmail} | oferta: ${offerCode} | ebook: ${isEbook} | sistema: ${isSistema} | combo: ${isCombo}`);

    if (isEbook) {
      // Só e-book — não libera acesso ao sistema
      console.log(`[Hotmart Webhook] Oferta e-book — sem acesso ao sistema para ${buyerEmail}`);
      return res.status(200).json({ received: true, access: "ebook_only" });
    }

    // Sistema ou Combo — libera acesso
    const db = await getDb();
    if (!db) {
      console.error("[Hotmart Webhook] DB indisponível");
      return res.status(500).json({ error: "DB unavailable" });
    }

    const plan = isCombo ? "combo" : "budget";

    // Salva compra no banco
    await db.execute(
      `INSERT INTO hotmart_purchases (email, name, offer_code, plan, created_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE offer_code = ?, plan = ?, updated_at = NOW()`,
      [buyerEmail, buyerName, offerCode, plan, offerCode, plan]
    );

    // Verifica se usuário já tem conta
    const users = await db.execute(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [buyerEmail]
    );

    const userRows = users[0] as any[];

    if (userRows.length > 0) {
      const userId = userRows[0].id;
      await db.execute(
        `INSERT INTO subscriptions (userId, plan, status, createdAt, updatedAt)
         VALUES (?, ?, 'active', NOW(), NOW())
         ON DUPLICATE KEY UPDATE plan = ?, status = 'active', updatedAt = NOW()`,
        [userId, plan, plan]
      );
      console.log(`[Hotmart Webhook] Assinatura ativada para usuário existente: ${buyerEmail}`);
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
