import { getLeadsPendingRemarketing, markLeadRemarketingSent } from "../db";
import { sendRemarketingEmail } from "../email";

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1h
const MIN_HOURS_OLD = 20;

async function processPendingRemarketing() {
  const leads = await getLeadsPendingRemarketing(MIN_HOURS_OLD);
  for (const lead of leads) {
    try {
      const sent = await sendRemarketingEmail(lead.email, lead.name, lead.planName, lead.planPrice);
      if (sent) {
        await markLeadRemarketingSent(lead.email);
        console.log(`[LeadRemarketing] Enviado automaticamente para ${lead.email}`);
      }
    } catch (err) {
      console.error(`[LeadRemarketing] Erro ao processar lead ${lead.email}:`, err);
    }
  }
}

export function startLeadRemarketing() {
  setTimeout(() => {
    processPendingRemarketing();
    setInterval(processPendingRemarketing, CHECK_INTERVAL_MS);
  }, 60 * 1000);

  console.log("[LeadRemarketing] Disparo automático iniciado (verifica a cada 1h, leads com 20h+ sem compra)");
}
