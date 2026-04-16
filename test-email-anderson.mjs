import sgMail from "@sendgrid/mail";

const key = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(key);

const FROM_EMAIL = "contato@gestordevida.com.br";
const FROM_NAME = "Gestor de Vida";

function baseTemplate(content) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0918;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0918;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#13122a;border-radius:16px;overflow:hidden;border:1px solid #2d2b5a;max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e1b4b,#312e81);padding:32px 40px;text-align:center;">
            <div style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);border-radius:16px;padding:16px 24px;margin-bottom:16px;">
              <span style="color:#ffffff;font-size:28px;font-weight:900;letter-spacing:2px;">$ GV</span>
            </div>
            <div style="color:#a5b4fc;font-size:13px;letter-spacing:3px;text-transform:uppercase;margin-top:8px;">Gestor de Vida</div>
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
          <td style="background:#0f0e2a;padding:24px 40px;text-align:center;border-top:1px solid #2d2b5a;">
            <p style="color:#4b5563;font-size:12px;margin:0 0 8px;">© 2025 Gestor de Vida. Todos os direitos reservados.</p>
            <p style="color:#374151;font-size:11px;margin:0;">Você está recebendo este e-mail porque criou uma conta no Gestor de Vida.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const firstName = "Anderson";
const html = baseTemplate(`
  <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0 0 8px;">
    Bem-vindo ao Gestor de Vida! 🎉
  </h1>
  <p style="color:#a5b4fc;font-size:15px;margin:0 0 24px;">
    Olá, <strong style="color:#fbbf24;">${firstName}</strong>! Sua conta foi criada com sucesso.
  </p>
  <p style="color:#c7d2fe;font-size:14px;line-height:1.7;margin:0 0 28px;">
    O <strong style="color:#ffffff;">Gestor de Vida</strong> é a plataforma que une os 3 pilares essenciais para você alcançar a liberdade financeira e viver com propósito:
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
    <tr>
      <td style="padding:10px 16px;background:#0f0e2a;border-radius:8px;">
        <span style="color:#fbbf24;font-size:18px;">⏰</span>
        <span style="color:#e2e8f0;font-size:14px;margin-left:10px;"><strong>Tempo</strong> — Organize sua agenda e produtividade</span>
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
  <p style="color:#9ca3af;font-size:13px;margin:0 0 28px;">
    Seu trial de <strong style="color:#fbbf24;">5 dias grátis</strong> já está ativo. Aproveite ao máximo!
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
    <tr>
      <td align="center">
        <a href="https://gestorvida.manus.space"
           style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
          Acessar o Gestor de Vida →
        </a>
      </td>
    </tr>
  </table>
  <p style="color:#6b7280;font-size:12px;margin:0;padding:16px;background:#0f0e2a;border-radius:8px;border-left:3px solid #fbbf24;">
    Dúvidas? Responda este e-mail que nossa equipe te ajuda.
  </p>
`);

try {
  const result = await sgMail.send({
    to: "anderson@barcellosseguros.com",
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: "Bem-vindo ao Gestor de Vida, Anderson! 🎉",
    html,
  });
  console.log("SUCESSO! Status:", result[0].statusCode);
} catch (err) {
  console.error("ERRO:", JSON.stringify(err.response?.body || err.message, null, 2));
}
