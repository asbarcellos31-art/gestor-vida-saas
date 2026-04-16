import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao Gestor de Vida</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0f1e;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0f1e;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding:40px 0 30px;">
              <div style="background:linear-gradient(135deg,#1a2744,#0d1b3e);border:1px solid #d4af37;border-radius:12px;padding:20px 40px;display:inline-block;">
                <h1 style="color:#d4af37;margin:0;font-size:28px;font-weight:700;letter-spacing:2px;">GESTOR DE VIDA</h1>
                <p style="color:#8899bb;margin:4px 0 0;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Os 3 Pilares da Vida</p>
              </div>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d1b3e,#1a2744);border:1px solid #1e3a6e;border-radius:16px;padding:40px;">
              
              <h2 style="color:#ffffff;font-size:24px;margin:0 0 16px;font-weight:600;">
                Bem-vindo, Anderson! 🎉
              </h2>
              
              <p style="color:#8899bb;font-size:16px;line-height:1.6;margin:0 0 24px;">
                Sua conta no <strong style="color:#d4af37;">Gestor de Vida</strong> foi criada com sucesso. 
                Você está a um passo de transformar sua relação com <strong style="color:#ffffff;">Tempo, Dinheiro e Futuro</strong>.
              </p>

              <!-- 3 Pilares -->
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

              <!-- Trial Info -->
              <div style="background:linear-gradient(135deg,#1a3a1a,#0f2a0f);border:1px solid #2d6a2d;border-radius:10px;padding:16px 20px;margin:24px 0;">
                <p style="color:#4ade80;margin:0;font-size:14px;font-weight:600;">
                  ✅ Seu trial de 5 dias está ativo
                </p>
                <p style="color:#8899bb;margin:6px 0 0;font-size:13px;">
                  Explore todas as funcionalidades do sistema durante seu período de avaliação.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin:32px 0 16px;">
                <a href="https://gestorvida.manus.space/dashboard" 
                   style="background:linear-gradient(135deg,#d4af37,#b8960c);color:#0a0f1e;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:1px;display:inline-block;">
                  ACESSAR MEU PAINEL →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 0;">
              <p style="color:#4a5568;font-size:12px;margin:0;">
                Gestor de Vida · contato@gestordevida.com.br
              </p>
              <p style="color:#4a5568;font-size:11px;margin:4px 0 0;">
                Você recebeu este e-mail porque criou uma conta no Gestor de Vida.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const msg = {
  to: 'asbarcellos31@gmail.com',
  from: { email: 'contato@gestordevida.com.br', name: 'Gestor de Vida' },
  subject: '🎉 Bem-vindo ao Gestor de Vida — Seu trial de 5 dias começa agora!',
  html: html,
  text: 'Bem-vindo ao Gestor de Vida! Sua conta foi criada com sucesso. Acesse: https://gestorvida.manus.space/dashboard'
};

try {
  const response = await sgMail.send(msg);
  console.log('✅ E-mail enviado com sucesso! Status:', response[0].statusCode);
} catch (error) {
  console.error('❌ Erro ao enviar:', error.response?.body || error.message);
}
