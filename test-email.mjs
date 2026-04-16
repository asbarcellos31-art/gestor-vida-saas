import sgMail from "@sendgrid/mail";

const key = process.env.SENDGRID_API_KEY;
console.log("Key exists:", !!key, key ? key.substring(0, 15) + "..." : "MISSING");

if (!key) {
  console.error("SENDGRID_API_KEY não encontrada!");
  process.exit(1);
}

sgMail.setApiKey(key);

try {
  const result = await sgMail.send({
    to: "contato@gestordevida.com.br",
    from: { email: "contato@gestordevida.com.br", name: "Gestor de Vida" },
    subject: "Teste de e-mail - Gestor de Vida",
    html: "<h1>Teste funcionando!</h1><p>Se você recebeu este e-mail, o sistema está funcionando corretamente.</p>",
  });
  console.log("SUCESSO! Status:", result[0].statusCode);
} catch (err) {
  console.error("ERRO:", JSON.stringify(err.response?.body || err.message, null, 2));
}
