/**
 * email.ts — Serviço de e-mail transacional via SendGrid
 * Usado para: boas-vindas, recuperação de senha, verificação de e-mail
 */
import sgMail from "@sendgrid/mail";

const FROM_EMAIL = "noreply@gestordevida.com.br";
const FROM_NAME = "Gestor de Vida";
const BRAND_COLOR = "#4f46e5";

function initSendGrid() {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) {
    console.warn("[Email] SENDGRID_API_KEY não configurada — e-mails não serão enviados.");
    return false;
  }
  sgMail.setApiKey(key);
  return true;
}

const isConfigured = initSendGrid();

// ── Templates HTML ────────────────────────────────────────────────────────────

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gestor de Vida</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0e2a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0e2a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1940;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#3730a3,#4f46e5);padding:32px 40px;text-align:center;">
              <div style="font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-1px;">
                <span style="color:#fbbf24;">$</span>GV
              </div>
              <div style="color:#c7d2fe;font-size:13px;margin-top:4px;letter-spacing:2px;text-transform:uppercase;">Gestor de Vida</div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #2d2b5e;text-align:center;">
              <p style="color:#6b7280;font-size:12px;margin:0;">
                Gestor de Vida &nbsp;·&nbsp; gestordevida.com.br<br/>
                <span style="color:#4b5563;">Você está recebendo este e-mail porque possui uma conta no Gestor de Vida.</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Funções de envio ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  if (!isConfigured) return false;
  const firstName = name.split(" ")[0];
  const html = baseTemplate(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;">
      Bem-vindo, ${firstName}! 🎉
    </h1>
    <p style="color:#a5b4fc;font-size:15px;margin:0 0 24px;">
      Sua conta no <strong style="color:#fbbf24;">Gestor de Vida</strong> foi criada com sucesso.
    </p>
    <p style="color:#c7d2fe;font-size:14px;line-height:1.7;margin:0 0 16px;">
      Agora você tem acesso completo às ferramentas para organizar seus <strong>3 Pilares da Vida</strong>:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr>
        <td style="padding:10px 16px;background:#0f0e2a;border-radius:8px;margin-bottom:8px;">
          <span style="color:#38bdf8;font-size:18px;">⏰</span>
          <span style="color:#e2e8f0;font-size:14px;margin-left:10px;"><strong>Tempo</strong> — Organize sua rotina e produtividade</span>
        </td>
      </tr>
      <tr><td style="height:8px;"></td></tr>
      <tr>
        <td style="padding:10px 16px;background:#0f0e2a;border-radius:8px;">
          <span style="color:#4ade80;font-size:18px;">💰</span>
          <span style="color:#e2e8f0;font-size:14px;margin-left:10px;"><strong>Dinheiro</strong> — Controle suas finanças com clareza</span>
        </td>
      </tr>
      <tr><td style="height:8px;"></td></tr>
      <tr>
        <td style="padding:10px 16px;background:#0f0e2a;border-radius:8px;">
          <span style="color:#c084fc;font-size:18px;">🚀</span>
          <span style="color:#e2e8f0;font-size:14px;margin-left:10px;"><strong>Futuro</strong> — Projete sua aposentadoria e metas</span>
        </td>
      </tr>
    </table>
    <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;">
      Seu trial de <strong style="color:#fbbf24;">5 dias grátis</strong> já está ativo. Aproveite!
    </p>
  `);

  try {
    await sgMail.send({
      to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `Bem-vindo ao Gestor de Vida, ${firstName}!`,
      html,
    });
    console.log(`[Email] Boas-vindas enviado para ${to}`);
    return true;
  } catch (err: unknown) {
    console.error("[Email] Erro ao enviar boas-vindas:", err);
    return false;
  }
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string,
  origin: string
): Promise<boolean> {
  if (!isConfigured) return false;
  const firstName = name.split(" ")[0];
  const resetUrl = `${origin}/redefinir-senha?token=${resetToken}`;
  const html = baseTemplate(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;">
      Redefinir sua senha
    </h1>
    <p style="color:#a5b4fc;font-size:15px;margin:0 0 24px;">
      Olá, <strong style="color:#fbbf24;">${firstName}</strong>. Recebemos uma solicitação para redefinir a senha da sua conta.
    </p>
    <p style="color:#c7d2fe;font-size:14px;line-height:1.7;margin:0 0 28px;">
      Clique no botão abaixo para criar uma nova senha. Este link é válido por <strong>1 hora</strong>.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr>
        <td align="center">
          <a href="${resetUrl}"
             style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
            Redefinir Senha
          </a>
        </td>
      </tr>
    </table>
    <p style="color:#6b7280;font-size:12px;margin:0 0 8px;">
      Ou copie e cole este link no navegador:
    </p>
    <p style="color:#818cf8;font-size:12px;word-break:break-all;margin:0 0 24px;">
      ${resetUrl}
    </p>
    <p style="color:#6b7280;font-size:12px;margin:0;padding:16px;background:#0f0e2a;border-radius:8px;border-left:3px solid #fbbf24;">
      Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha permanece a mesma.
    </p>
  `);

  try {
    await sgMail.send({
      to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: "Redefinição de senha — Gestor de Vida",
      html,
    });
    console.log(`[Email] Reset de senha enviado para ${to}`);
    return true;
  } catch (err: unknown) {
    console.error("[Email] Erro ao enviar reset de senha:", err);
    return false;
  }
}

export async function sendEmailVerification(
  to: string,
  name: string,
  verifyToken: string,
  origin: string
): Promise<boolean> {
  if (!isConfigured) return false;
  const firstName = name.split(" ")[0];
  const verifyUrl = `${origin}/verify-email?token=${verifyToken}`;
  const html = baseTemplate(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;">
      Confirme seu e-mail
    </h1>
    <p style="color:#a5b4fc;font-size:15px;margin:0 0 24px;">
      Olá, <strong style="color:#fbbf24;">${firstName}</strong>! Só mais um passo para ativar sua conta.
    </p>
    <p style="color:#c7d2fe;font-size:14px;line-height:1.7;margin:0 0 28px;">
      Clique no botão abaixo para confirmar seu endereço de e-mail. Este link é válido por <strong>24 horas</strong>.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr>
        <td align="center">
          <a href="${verifyUrl}"
             style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:#ffffff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
            Confirmar E-mail
          </a>
        </td>
      </tr>
    </table>
    <p style="color:#6b7280;font-size:12px;margin:0;padding:16px;background:#0f0e2a;border-radius:8px;border-left:3px solid #4ade80;">
      Se você não criou esta conta, ignore este e-mail.
    </p>
  `);

  try {
    await sgMail.send({
      to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: "Confirme seu e-mail — Gestor de Vida",
      html,
    });
    console.log(`[Email] Verificação de e-mail enviada para ${to}`);
    return true;
  } catch (err: unknown) {
    console.error("[Email] Erro ao enviar verificação:", err);
    return false;
  }
}
