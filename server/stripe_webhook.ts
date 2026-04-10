import Stripe from "stripe";
import { Request, Response } from "express";
import { getDb } from "./db";
import { subscriptions, users } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Test events — return immediately
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Webhook] Event: ${event.type} | ID: ${event.id}`);

  const db = await getDb();
  if (!db) {
    console.error("[Webhook] DB unavailable");
    return res.status(500).json({ error: "DB unavailable" });
  }

  try {
    switch (event.type) {
      // ── Checkout concluído ──────────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = parseInt(session.metadata?.user_id || "0");
        const plan = session.metadata?.plan as "time_management" | "budget" | "combo";
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        if (!userId || !plan) {
          console.error("[Webhook] Missing userId or plan in metadata", session.metadata);
          break;
        }

        console.log(`[Webhook] Checkout completed: userId=${userId}, plan=${plan}`);

        // Verificar se já existe subscription para este usuário
        const existing = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, userId))
          .limit(1);

        if (existing.length > 0) {
          // Atualizar subscription existente
          await db
            .update(subscriptions)
            .set({
              plan,
              status: "active",
              stripeCustomerId,
              stripeSubscriptionId,
              trialEndsAt: null,
            })
            .where(eq(subscriptions.userId, userId));
        } else {
          // Criar nova subscription
          await db.insert(subscriptions).values({
            userId,
            plan,
            status: "active",
            stripeCustomerId,
            stripeSubscriptionId,
          });
        }

        // Salvar stripeCustomerId no usuário para futuras referências
        await db
          .update(users)
          .set({ updatedAt: new Date() })
          .where(eq(users.id, userId));

        break;
      }

      // ── Assinatura atualizada ───────────────────────────────────────────
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const stripeSubscriptionId = sub.id;
        const status = sub.status; // active, past_due, canceled, etc.

        console.log(`[Webhook] Subscription updated: ${stripeSubscriptionId}, status=${status}`);

        // Mapear status Stripe → nosso status
        let ourStatus: "active" | "cancelled" | "expired" | "trialing" = "active";
        if (status === "canceled" || status === "incomplete_expired") {
          ourStatus = "cancelled";
        } else if (status === "trialing") {
          ourStatus = "trialing";
        } else if (status === "past_due" || status === "unpaid") {
          ourStatus = "expired";
        }

        await db
          .update(subscriptions)
          .set({ status: ourStatus })
          .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));

        break;
      }

      // ── Assinatura cancelada ────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const stripeSubscriptionId = sub.id;

        console.log(`[Webhook] Subscription deleted: ${stripeSubscriptionId}`);

        await db
          .update(subscriptions)
          .set({ status: "cancelled" })
          .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));

        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error("[Webhook] Processing error:", err);
    res.status(500).json({ error: err.message });
  }
}
