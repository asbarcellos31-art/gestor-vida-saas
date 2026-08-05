import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerLocalAuthRoutes } from "./localAuth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleStripeWebhook } from "../stripe_webhook";
import { handleHotmartWebhook } from "../hotmart_webhook";
import { startUserMonitor } from "./userMonitor";
import { ensureStorageUpgradesTable, ensureBudgetTables, ensureLeadsTable } from "../db";
import { registerStorageProxy } from "./storageProxy";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ⚠️ Stripe webhook MUST use raw body BEFORE express.json()
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

  // Hotmart webhook — libera acesso após compra aprovada no Hotmart
  app.post("/api/hotmart/webhook", handleHotmartWebhook);

  // Endpoint temporário — dispara email para a compra mais recente
  app.post("/api/admin/resend-last-purchase", async (req, res) => {
    const secret = req.headers["x-admin-secret"];
    if (secret !== "gv-resend-2026") return res.status(403).json({ error: "Forbidden" });
    try {
      const mysql2 = await import("mysql2/promise");
      const { sendPostPurchaseEmail, sendAccessActivatedEmail } = await import("../email");
      const conn = await mysql2.createConnection(process.env.DATABASE_URL!);
      const [cols] = await conn.query(`DESCRIBE hotmart_purchases`) as any[];
      const colNames = (cols as any[]).map((c:any) => c.Field);
      const dateCol = colNames.find((c:string) => c.includes('creat') || c.includes('date') || c.includes('at')) || colNames[colNames.length-1];
      const [rows] = await conn.query(`SELECT * FROM hotmart_purchases ORDER BY ${dateCol} DESC LIMIT 5`) as any[];
      const last = (rows as any[])[0];
      if (!last) { await conn.end(); return res.status(404).json({ error: "Nenhuma compra encontrada", cols: colNames }); }
      const buyerEmail = last.email || last.buyer_email || last.comprador_email;
      const buyerName = last.name || last.buyer_name || last.nome;
      const [userRows] = await conn.query(`SELECT id FROM users WHERE email = ? LIMIT 1`, [buyerEmail]) as any[];
      const hasAccount = (userRows as any[]).length > 0;
      await conn.end();
      if (hasAccount) {
        await sendAccessActivatedEmail(buyerEmail, buyerName);
      } else {
        await sendPostPurchaseEmail(buyerEmail, buyerName);
      }
      const all = (rows as any[]).map((r: any) => ({ email: r.email||r.buyer_email, name: r.name||r.buyer_name }));
      return res.json({ ok: true, email: buyerEmail, name: buyerName, hasAccount, cols: colNames, ultimas: all });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Storage proxy — serve /manus-storage/* assets
  registerStorageProxy(app);

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Local auth (e-mail + senha)
  registerLocalAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000");

server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
    startUserMonitor();
    ensureStorageUpgradesTable().catch(console.error);
    ensureBudgetTables().catch(console.error);
    ensureLeadsTable().catch(console.error);
  });
}

startServer().catch(console.error);
