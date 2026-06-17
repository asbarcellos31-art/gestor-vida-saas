import mysql from 'mysql2/promise';
import sgMail from '@sendgrid/mail';

const DB = process.env.DATABASE_URL || process.env.MYSQL_URL;
const SGKEY = process.env.SENDGRID_API_KEY;

if (!SGKEY) { console.error('SENDGRID_API_KEY não configurado'); process.exit(1); }
sgMail.setApiKey(SGKEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'contato@gestordevida.com.br';
const FROM_NAME = 'Gestor de Vida';

const conn = await mysql.createConnection(DB);

// Busca compra mais recente que ainda não tem conta criada (ou que tem)
const [purchases] = await conn.query(
  `SELECT hp.email, hp.name, hp.plan, hp.created_at,
          u.id as userId
   FROM hotmart_purchases hp
   LEFT JOIN users u ON u.email = hp.email
   ORDER BY hp.created_at DESC LIMIT 10`
);

console.log('\n=== Compras recentes ===');
purchases.forEach((r, i) => {
  console.log(`${i+1}. ${r.email} | ${r.name} | plano: ${r.plan} | conta: ${r.userId ? 'SIM' : 'NÃO'} | ${r.created_at}`);
});

// Pega o mais recente
const last = purchases[0];
if (!last) { console.log('Nenhuma compra encontrada'); process.exit(0); }

const firstName = last.name ? last.name.split(' ')[0] : 'Cliente';
let html, subject;

if (last.userId) {
  // Já tem conta — email de acesso ativado
  subject = 'Seu acesso ao Gestor de Vida foi ativado! 🎉';
  const loginUrl = 'https://www.gestordevida.com.br/login';
  html = `<div style="background:#0B1437;padding:40px;font-family:sans-serif;border-radius:12px;max-width:560px;margin:0 auto">
    <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 8px">Parabéns pela sua compra, ${firstName}! 🎉</h1>
    <p style="color:#a5b4fc;font-size:15px;margin:0 0 24px">Seu acesso ao <strong style="color:#fbbf24">Gestor de Vida</strong> foi ativado com sucesso.</p>
    <p style="color:#c7d2fe;font-size:14px;line-height:1.7;margin:0 0 28px">Sua conta já está pronta — é só entrar e começar a organizar os seus <strong>3 Pilares da Vida</strong>.</p>
    <div style="text-align:center;margin:0 0 28px">
      <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#E2C97E);color:#0B1437;font-size:16px;font-weight:700;padding:16px 40px;border-radius:8px;text-decoration:none">Acessar minha conta →</a>
    </div>
    <p style="color:#9ca3af;font-size:13px;margin:0;padding:16px;background:#0f0e2a;border-radius:8px;border-left:3px solid #fbbf24">💡 Use o e-mail <strong style="color:#fbbf24">${last.email}</strong> para entrar na plataforma.</p>
  </div>`;
} else {
  // Sem conta — email para criar
  subject = 'Seu acesso ao Gestor de Vida está pronto! 🎉';
  const cadastroUrl = 'https://www.gestordevida.com.br/cadastro';
  html = `<div style="background:#0B1437;padding:40px;font-family:sans-serif;border-radius:12px;max-width:560px;margin:0 auto">
    <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 8px">Parabéns pela sua compra, ${firstName}! 🎉</h1>
    <p style="color:#a5b4fc;font-size:15px;margin:0 0 24px">Seu acesso ao <strong style="color:#fbbf24">Gestor de Vida</strong> está pronto.</p>
    <p style="color:#c7d2fe;font-size:14px;line-height:1.7;margin:0 0 28px">Use o mesmo e-mail desta compra para criar sua conta — o acesso será liberado automaticamente.</p>
    <div style="text-align:center;margin:0 0 28px">
      <a href="${cadastroUrl}" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#E2C97E);color:#0B1437;font-size:16px;font-weight:700;padding:16px 40px;border-radius:8px;text-decoration:none">Criar minha conta agora →</a>
    </div>
    <p style="color:#9ca3af;font-size:13px;margin:0;padding:16px;background:#0f0e2a;border-radius:8px;border-left:3px solid #fbbf24">⚠️ <strong style="color:#fbbf24">Importante:</strong> Use o mesmo e-mail desta compra para criar sua conta.</p>
  </div>`;
}

console.log(`\nEnviando email para: ${last.email} (${last.name})`);
await sgMail.send({ to: last.email, from: { email: FROM_EMAIL, name: FROM_NAME }, subject, html });
console.log('✅ Email enviado com sucesso!');

await conn.end();
