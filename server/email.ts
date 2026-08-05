import sgMail from "@sendgrid/mail";

const FROM_EMAIL = "contato@gestordevida.com.br";
const FROM_NAME = "Gestor de Vida";

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

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Gestor de Vida</title></head>
<body style="margin:0;padding:0;background-color:#0f0e2a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0e2a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1940;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#3730a3,#4f46e5);padding:32px 40px;text-align:center;">
          <div style="font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-1px;"><span style="color:#fbbf24;">$</span>GV</div>
          <div style="color:#c7d2fe;font-size:13px;margin-top:4px;letter-spacing:2px;text-transform:uppercase;">Gestor de Vida</div>
        </td></tr>
        <tr><td style="padding:40px;">${content}</td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #2d2b5e;text-align:center;">
          <p style="color:#6b7280;font-size:12px;margin:0;">Gestor de Vida · gestordevida.com.br<br/><span style="color:#4b5563;">Dúvidas? contato@gestordevida.com.br</span></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  if (!isConfigured) return false;
  const firstName = name.split(" ")[0];
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Bem-vindo ao Gestor de Vida</title></head>
<body style="margin:0;padding:0;background-color:#0a0f1e;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0f1e;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td align="center" style="padding:40px 0 30px;">
            <div style="background:linear-gradient(135deg,#1a2744,#0d1b3e);border:1px solid #d4af37;border-radius:12px;padding:20px 40px;display:inline-block;">
              <h1 style="color:#d4af37;margin:0;font-size:28px;font-weight:700;letter-spacing:2px;">GESTOR DE VIDA</h1>
              <p style="color:#8899bb;margin:4px 0 0;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Os 3 Pilares da Vida</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:linear-gradient(135deg,#0d1b3e,#1a2744);border:1px solid #1e3a6e;border-radius:16px;padding:40px;">
            <h2 style="color:#ffffff;font-size:24px;margin:0 0 16px;font-weight:600;">Bem-vindo, ${firstName}! 🎉</h2>
            <p style="color:#8899bb;font-size:16px;line-height:1.6;margin:0 0 24px;">
              Sua conta no <strong style="color:#d4af37;">Gestor de Vida</strong> foi criada com sucesso.
              Você está a um passo de transformar sua relação com <strong style="color:#ffffff;">Tempo, Dinheiro e Futuro</strong>.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
              <tr>
                <td width="32%" style="background:#0a1628;border:1px solid #1e3a6e;border-radius:10px;padding:16px;text-align:center;">
                  <div style="font-size:24px;margin-bottom:8px;">⏰</div>
                  <div style="color:#d4af37;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Tempo</div>
                  <div style="color:#8899bb;font-size:11px;margin-top:4px;">Organize sua vida</div>
                </td>
                <td width="4%"></td>
                <td width="32%" style="background:#0a1628;border:1px solid #1e3a6e;border-radius:10px;padding:16px;text-align:center;">
                  <div style="font-size:24px;margin-bottom:8px;">💰</div>
                  <div style="color:#d4af37;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Dinheiro</div>
                  <div style="color:#8899bb;font-size:11px;margin-top:4px;">Controle financeiro</div>
                </td>
                <td width="4%"></td>
                <td width="32%" style="background:#0a1628;border:1px solid #1e3a6e;border-radius:10px;padding:16px;text-align:center;">
                  <div style="font-size:24px;margin-bottom:8px;">🚀</div>
                  <div style="color:#d4af37;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Futuro</div>
                  <div style="color:#8899bb;font-size:11px;margin-top:4px;">Planeje seu amanhã</div>
                </td>
              </tr>
            </table>
            <div style="background:linear-gradient(135deg,#1a3a1a,#0f2a0f);border:1px solid #2d6a2d;border-radius:10px;padding:16px 20px;margin:24px 0;">
              <p style="color:#4ade80;margin:0;font-size:14px;font-weight:600;">✅ Seu trial de 5 dias está ativo</p>
              <p style="color:#8899bb;margin:6px 0 0;font-size:13px;">Explore todas as funcionalidades do sistema durante seu período de avaliação.</p>
            </div>
            <div style="text-align:center;margin:32px 0 16px;">
              <a href="https://www.gestordevida.com.br" style="background:linear-gradient(135deg,#d4af37,#b8960c);color:#0a0f1e;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:1px;display:inline-block;">ACESSAR MEU PAINEL →</a>
            </div>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:24px 0;">
            <p style="color:#4a5568;font-size:12px;margin:0;">Gestor de Vida · contato@gestordevida.com.br</p>
            <p style="color:#4a5568;font-size:11px;margin:4px 0 0;">Você recebeu este e-mail porque criou uma conta no Gestor de Vida.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  try {
    await sgMail.send({ to, from: { email: FROM_EMAIL, name: FROM_NAME }, subject: `Bem-vindo ao Gestor de Vida, ${firstName}!`, html });
    console.log(`[Email] Boas-vindas enviado para ${to}`);
    return true;
  } catch (err) {
    console.error("[Email] Erro ao enviar boas-vindas:", err);
    return false;
  }
}

export async function sendPostPurchaseEmail(to: string, name: string | null): Promise<boolean> {
  if (!isConfigured) return false;
  const firstName = name ? name.split(" ")[0] : "Cliente";
  const cadastroUrl = "https://www.gestordevida.com.br/cadastro";
  const html = baseTemplate(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;">Parabéns pela sua compra, ${firstName}! 🎉</h1>
    <p style="color:#a5b4fc;font-size:15px;margin:0 0 24px;">Seu acesso ao <strong style="color:#fbbf24;">Gestor de Vida</strong> está pronto.</p>
    <p style="color:#c7d2fe;font-size:14px;line-height:1.7;margin:0 0 28px;">Use o mesmo e-mail desta compra para criar sua conta — o acesso será liberado automaticamente.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td align="center">
        <a href="${cadastroUrl}" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#E2C97E);color:#0B1437;font-size:16px;font-weight:700;padding:16px 40px;border-radius:8px;text-decoration:none;">Criar minha conta agora →</a>
      </td></tr>
    </table>
    <p style="color:#9ca3af;font-size:13px;margin:0;padding:16px;background:#0f0e2a;border-radius:8px;border-left:3px solid #fbbf24;">⚠️ <strong style="color:#fbbf24;">Importante:</strong> Use o mesmo e-mail desta compra para criar sua conta.</p>
  `);
  try {
    await sgMail.send({ to, from: { email: FROM_EMAIL, name: FROM_NAME }, subject: "Seu acesso ao Gestor de Vida está pronto! 🎉", html });
    console.log(`[Email] Pós-compra enviado para ${to}`);
    return true;
  } catch (err) {
    console.error("[Email] Erro ao enviar email pós-compra:", err);
    return false;
  }
}

export async function sendAccessActivatedEmail(to: string, name: string | null): Promise<boolean> {
  if (!isConfigured) return false;
  const firstName = name ? name.split(" ")[0] : "Cliente";
  const loginUrl = "https://www.gestordevida.com.br/login";
  const html = baseTemplate(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;">Parabéns pela sua compra, ${firstName}! 🎉</h1>
    <p style="color:#a5b4fc;font-size:15px;margin:0 0 24px;">Seu acesso ao <strong style="color:#fbbf24;">Gestor de Vida</strong> foi ativado com sucesso.</p>
    <p style="color:#c7d2fe;font-size:14px;line-height:1.7;margin:0 0 28px;">Sua conta já está pronta — é só entrar e começar a organizar os seus <strong>3 Pilares da Vida</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td align="center">
        <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#E2C97E);color:#0B1437;font-size:16px;font-weight:700;padding:16px 40px;border-radius:8px;text-decoration:none;">Acessar minha conta →</a>
      </td></tr>
    </table>
    <p style="color:#9ca3af;font-size:13px;margin:0;padding:16px;background:#0f0e2a;border-radius:8px;border-left:3px solid #fbbf24;">💡 Use o e-mail <strong style="color:#fbbf24;">${to}</strong> para entrar na plataforma.</p>
  `);
  try {
    await sgMail.send({ to, from: { email: FROM_EMAIL, name: FROM_NAME }, subject: "Seu acesso ao Gestor de Vida foi ativado! 🎉", html });
    console.log(`[Email] Acesso ativado enviado para ${to}`);
    return true;
  } catch (err) {
    console.error("[Email] Erro ao enviar email de acesso ativado:", err);
    return false;
  }
}

export async function sendPasswordResetEmail(to: string, name: string, resetToken: string, origin: string): Promise<boolean> {
  if (!isConfigured) return false;
  const firstName = name.split(" ")[0];
  const resetUrl = `${origin}/redefinir-senha?token=${resetToken}`;
  const html = baseTemplate(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;">Redefinir sua senha</h1>
    <p style="color:#a5b4fc;font-size:15px;margin:0 0 24px;">Olá, <strong style="color:#fbbf24;">${firstName}</strong>. Recebemos uma solicitação para redefinir a senha da sua conta.</p>
    <p style="color:#c7d2fe;font-size:14px;line-height:1.7;margin:0 0 28px;">Clique no botão abaixo para criar uma nova senha. Este link é válido por <strong>1 hora</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td align="center"><a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;">Redefinir Senha</a></td></tr>
    </table>
    <p style="color:#818cf8;font-size:12px;word-break:break-all;margin:0 0 24px;">${resetUrl}</p>
    <p style="color:#6b7280;font-size:12px;margin:0;padding:16px;background:#0f0e2a;border-radius:8px;border-left:3px solid #fbbf24;">Se você não solicitou a redefinição de senha, ignore este e-mail.</p>
  `);
  try {
    await sgMail.send({ to, from: { email: FROM_EMAIL, name: FROM_NAME }, subject: "Redefinição de senha — Gestor de Vida", html });
    console.log(`[Email] Reset de senha enviado para ${to}`);
    return true;
  } catch (err) {
    console.error("[Email] Erro ao enviar reset de senha:", err);
    return false;
  }
}

export async function sendRemarketingEmail(to: string, name: string | null, planName: string | null, planPrice: string | null): Promise<boolean> {
  if (!isConfigured) return false;
  const firstName = name ? name.split(" ")[0] : "Olá";
  const HOTMART_LINKS: Record<string, string> = {
    "eBook": "https://pay.hotmart.com/M105784997J?checkoutMode=2&off=cu6bor2b",
    "Sistema Gestor": "https://pay.hotmart.com/M105784997J?checkoutMode=2&off=l8k18cwx",
    "Combo Promocional": "https://pay.hotmart.com/M105784997J?checkoutMode=2&off=401asx1p",
  };
  const checkoutUrl = (planName && HOTMART_LINKS[planName]) || "https://www.gestordevida.com.br/#planos";
  const planDisplay = planName ?? "Gestor de Vida";
  const priceDisplay = planPrice ? `R$ ${planPrice}/mês` : "";
  const html = baseTemplate(`
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 8px;">${firstName}, você esqueceu algo aqui 👀</h1>
    <p style="color:#a5b4fc;font-size:15px;margin:0 0 20px;">Você estava quase finalizando sua assinatura do <strong style="color:#fbbf24;">${planDisplay}</strong>${priceDisplay ? ` por <strong style="color:#fbbf24;">${priceDisplay}</strong>` : ""} — mas não concluiu.</p>
    <p style="color:#c7d2fe;font-size:14px;line-height:1.7;margin:0 0 24px;">Sabemos que a vida é corrida, mas a sua organização financeira e de tempo não pode esperar.</p>
    <div style="background:#1a1940;border:1px solid #3730a3;border-radius:12px;padding:20px;margin:0 0 28px;">
      <p style="color:#fbbf24;font-size:13px;font-weight:700;margin:0 0 8px;">O que você vai ter acesso:</p>
      <ul style="color:#c7d2fe;font-size:13px;line-height:1.8;margin:0;padding-left:20px;">
        <li>Controle financeiro completo (50/30/20)</li>
        <li>Gestão de tempo e produtividade</li>
        <li>Planejamento de aposentadoria</li>
        <li>Relatórios e dashboards mensais/anuais</li>
      </ul>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr><td align="center">
        <a href="${checkoutUrl}&checkoutEmail=${encodeURIComponent(to)}" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#E2C97E);color:#0B1437;font-size:16px;font-weight:700;padding:16px 40px;border-radius:8px;text-decoration:none;">Completar minha assinatura →</a>
      </td></tr>
    </table>
    <p style="color:#9ca3af;font-size:12px;margin:0;padding:14px;background:#0f0e2a;border-radius:8px;border-left:3px solid #fbbf24;">🛡️ <strong style="color:#fbbf24;">Garantia de 7 dias</strong> — Se não gostar, devolvemos 100% do seu dinheiro, sem perguntas.</p>
  `);
  try {
    await sgMail.send({ to, from: { email: FROM_EMAIL, name: FROM_NAME }, subject: `${firstName}, seu acesso ao Gestor de Vida ainda está disponível ⏳`, html });
    console.log(`[Email] Remarketing enviado para ${to}`);
    return true;
  } catch (err) {
    console.error("[Email] Erro ao enviar remarketing:", err);
    return false;
  }
}

export async function sendEmailVerification(to: string, name: string, verifyToken: string, origin: string): Promise<boolean> {
  if (!isConfigured) return false;
  const firstName = name.split(" ")[0];
  const verifyUrl = `${origin}/verify-email?token=${verifyToken}`;
  const html = baseTemplate(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;">Confirme seu e-mail</h1>
    <p style="color:#a5b4fc;font-size:15px;margin:0 0 24px;">Olá, <strong style="color:#fbbf24;">${firstName}</strong>! Só mais um passo para ativar sua conta.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td align="center"><a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:#ffffff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;">Confirmar E-mail</a></td></tr>
    </table>
  `);
  try {
    await sgMail.send({ to, from: { email: FROM_EMAIL, name: FROM_NAME }, subject: "Confirme seu e-mail — Gestor de Vida", html });
    console.log(`[Email] Verificação enviada para ${to}`);
    return true;
  } catch (err) {
    console.error("[Email] Erro ao enviar verificação:", err);
    return false;
  }
}
