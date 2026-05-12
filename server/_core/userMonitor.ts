import sgMail from "@sendgrid/mail";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { sql } from "drizzle-orm";

const OWNER_EMAIL = "asbarcellos31@gmail.com";
const FROM_EMAIL = "contato@gestordevida.com.br";
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
const DB_LIMIT_MB = 1024;
const DB_ALERT_THRESHOLD = 0.8;

const alertsSent = new Set<string>();

function initSendGrid(): boolean {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) return false;
  sgMail.setApiKey(key);
  return true;
}

async function getUserCount(): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;
    const result = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    return Number(result[0]?.count ?? 0);
  } catch { return 0; }
}

async function getDbSizeMB(): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;
    const result = await db.execute(sql`
      SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
    `);
    const rows = result[0] as any[];
    return Number(rows[0]?.size_mb ?? 0);
  } catch { return 0; }
}

async function sendAlert(subject: string, body: string) {
  if (!initSendGrid()) return;
  try {
    await sgMail.send({
      to: OWNER_EMAIL,
      from: { email: FROM_EMAIL, name: "Gestor de Vida" },
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          ${body}
          <hr>
          <p style="color:#999;font-size:12px;">Monitoramento automático — Gestor de Vida</p>
        </div>
      `,
    });
    console.log(`[Monitor] Alerta enviado: ${subject}`);
  } catch (err) {
    console.error("[Monitor] Erro ao enviar alerta:", err);
  }
}

async function checkMetrics() {
  const userCount = await getUserCount();
  const dbSizeMB = await getDbSizeMB();
  const dbPercent = (dbSizeMB / DB_LIMIT_MB) * 100;

  console.log(`[Monitor] Usuários: ${userCount} | Banco: ${dbSizeMB}MB (${dbPercent.toFixed(1)}%)`);

  // Alertas de usuários
  if (userCount >= 500 && !alertsSent.has("users_500")) {
    alertsSent.add("users_500");
    await sendAlert(
      `🚨 Gestor de Vida — 500 usuários atingidos`,
      `<h2>500 usuários cadastrados</h2>
       <p>O sistema atingiu <strong>${userCount} usuários</strong>. Considere comunicar sobre taxa de manutenção anual (R$19,90/ano).</p>
       <p><a href="https://railway.app">Ver painel do Railway</a></p>`
    );
  } else if (userCount >= 400 && !alertsSent.has("users_400")) {
    alertsSent.add("users_400");
    await sendAlert(
      `⚠️ Gestor de Vida — ${userCount} usuários (aviso)`,
      `<h2>Aviso: ${userCount} usuários cadastrados</h2>
       <p>Você está se aproximando de 500 usuários. Prepare-se para comunicar sobre manutenção.</p>`
    );
  }

  // Alertas de banco de dados
  if (dbPercent >= 90 && !alertsSent.has("db_90")) {
    alertsSent.add("db_90");
    await sendAlert(
      `🚨 Banco de dados com ${dbPercent.toFixed(0)}% de capacidade`,
      `<h2>Ação urgente necessária</h2>
       <p>O banco de dados está com <strong>${dbSizeMB}MB de ${DB_LIMIT_MB}MB</strong> (${dbPercent.toFixed(0)}%).</p>
       <p>É necessário fazer upgrade do banco de dados imediatamente.</p>
       <p>Comunique os usuários sobre a taxa de manutenção anual de <strong>R$19,90/ano</strong>.</p>
       <p><a href="https://railway.app">Fazer upgrade agora</a></p>`
    );
  } else if (dbPercent >= 80 && !alertsSent.has("db_80")) {
    alertsSent.add("db_80");
    await sendAlert(
      `⚠️ Banco de dados com ${dbPercent.toFixed(0)}% de capacidade`,
      `<h2>Aviso de capacidade do banco</h2>
       <p>O banco de dados está com <strong>${dbSizeMB}MB de ${DB_LIMIT_MB}MB</strong> (${dbPercent.toFixed(0)}%).</p>
       <p>Prepare-se para fazer upgrade e comunicar os usuários sobre a taxa de manutenção.</p>
       <p><a href="https://railway.app">Ver painel do Railway</a></p>`
    );
  }
}

export function startUserMonitor() {
  setTimeout(() => {
    checkMetrics();
    setInterval(checkMetrics, CHECK_INTERVAL_MS);
  }, 60 * 1000);

  console.log("[Monitor] Monitoramento iniciado (verifica a cada 6h)");
}
