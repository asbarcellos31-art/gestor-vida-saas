import Stripe from "stripe";
import { Request, Response } from "express";
import { getDb } from "./db";
import { subscriptions, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.warn("[Stripe] STRIPE_SECRET_KEY não configurada — pagamentos desativados.");
    return null;
  }
  return new Stripe(key);
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const stripe = getStripe();
  if (!stripe) return res.status(503).json({ error: "Stripe não configurado" });

  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

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

        const existing = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, userId))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(subscriptions)
            .set({ plan, status: "active", stripeCustomerId, stripeSubscriptionId, trialEndsAt: null })
            .where(eq(subscriptions.userId, userId));
        } else {
          await db.insert(subscriptions).values({ userId, plan, status: "active", stripeCustomerId, stripeSubscriptionId });
        }

        await db.update(users).set({ updatedAt: new Date() }).where(eq(users.id, userId));
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const stripeSubscriptionId = sub.id;
        const status = sub.status;

        console.log(`[Webhook] Subscription updated: ${stripeSubscriptionId}, status=${status}`);

        let ourStatus: "active" | "cancelled" | "expired" | "trialing" = "active";
        if (status === "canceled" || status === "incomplete_expired") ourStatus = "cancelled";
        else if (status === "trialing") ourStatus = "trialing";
        else if (status === "past_due" || status === "unpaid") ourStatus = "expired";

        await db.update(subscriptions).set({ status: ourStatus }).where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const stripeSubscriptionId = sub.id;

        console.log(`[Webhook] Subscription deleted: ${stripeSubscriptionId}`);

        await db.update(subscriptions).set({ status: "cancelled" }).where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
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
