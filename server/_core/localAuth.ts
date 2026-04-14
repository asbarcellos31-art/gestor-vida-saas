/**
 * localAuth.ts — Autenticação própria com e-mail + senha
 * Complementa o Manus OAuth sem substituí-lo.
 * Gera o mesmo JWT que o sdk.ts, compatível com authenticateRequest.
 */
import bcrypt from "bcryptjs";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { sdk } from "./sdk";
import { getSessionCookieOptions } from "./cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { nanoid } from "nanoid";

const SALT_ROUNDS = 12;

export function registerLocalAuthRoutes(app: Express) {
  // ── Cadastro ──────────────────────────────────────────────────────────────
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body as {
        name?: string;
        email?: string;
        password?: string;
      };

      if (!name || !email || !password) {
        res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
        return;
      }

      const emailLower = email.toLowerCase().trim();

      // Verificar se e-mail já existe
      const existing = await db.getUserByEmail(emailLower);
      if (existing) {
        res.status(409).json({ error: "Este e-mail já está cadastrado." });
        return;
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      // openId único para usuários locais
      const openId = `local_${nanoid(20)}`;

      await db.upsertUser({
        openId,
        name: name.trim(),
        email: emailLower,
        loginMethod: "email",
        lastSignedIn: new Date(),
        passwordHash,
        emailVerified: 0,
      });

      const user = await db.getUserByOpenId(openId);
      if (!user) {
        res.status(500).json({ error: "Erro ao criar usuário." });
        return;
      }

      // Criar trial de 5 dias automaticamente
      await db.createTrialSubscription(user.id, "combo");

      // Gerar sessão JWT
      const sessionToken = await sdk.signSession(
        { openId, appId: process.env.VITE_APP_ID || "gestor-vida", name: name.trim() },
        { expiresInMs: ONE_YEAR_MS }
      );

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      console.error("[LocalAuth] Register failed", error);
      res.status(500).json({ error: "Erro interno ao cadastrar." });
    }
  });

  // ── Login ─────────────────────────────────────────────────────────────────
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as { email?: string; password?: string };

      if (!email || !password) {
        res.status(400).json({ error: "E-mail e senha são obrigatórios." });
        return;
      }

      const emailLower = email.toLowerCase().trim();
      const user = await db.getUserByEmail(emailLower);

      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "E-mail ou senha incorretos." });
        return;
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "E-mail ou senha incorretos." });
        return;
      }

      await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });

      const sessionToken = await sdk.signSession(
        { openId: user.openId, appId: process.env.VITE_APP_ID || "gestor-vida", name: user.name || "" },
        { expiresInMs: ONE_YEAR_MS }
      );

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      console.error("[LocalAuth] Login failed", error);
      res.status(500).json({ error: "Erro interno ao fazer login." });
    }
  });
}
