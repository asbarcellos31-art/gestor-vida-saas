import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Clock, Zap, X } from "lucide-react";
import { useState } from "react";

export default function TrialBanner() {
  const { data: subscription } = trpc.subscription.get.useQuery();
  const [, navigate] = useLocation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;
  if (!subscription) return null;

  const sub = subscription as { status?: string; trialDaysLeft?: number | null; isAdmin?: boolean };

  if (sub.isAdmin || sub.status !== "trialing") return null;

  const daysLeft = sub.trialDaysLeft ?? 0;

  const bgStyle =
    daysLeft <= 1
      ? { background: "#8B1A1A", borderBottom: "1px solid rgba(255,100,100,0.3)" }
      : daysLeft <= 2
      ? { background: "#7A4A00", borderBottom: "1px solid rgba(201,168,76,0.4)" }
      : { background: "rgba(201,168,76,0.12)", borderBottom: "1px solid rgba(201,168,76,0.3)" };

  return (
    <div
      className="px-4 py-2.5 flex items-center justify-between gap-3 text-sm"
      style={bgStyle}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "#C9A84C" }} />
        <span className="font-medium truncate" style={{ color: "#F0E6C8" }}>
          {daysLeft <= 0
            ? "Seu período de avaliação expirou."
            : daysLeft === 1
            ? "⚠️ Último dia de avaliação gratuita!"
            : `Avaliação gratuita — ${daysLeft} dias restantes`}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => navigate("/planos")}
          className="flex items-center gap-1.5 transition-colors px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}
        >
          <Zap className="w-3 h-3" />
          Assinar agora
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="transition-colors"
          style={{ color: "#8A9BB5" }}
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
