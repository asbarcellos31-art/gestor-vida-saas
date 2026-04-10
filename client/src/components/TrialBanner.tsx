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

  const bgColor =
    daysLeft <= 1
      ? "bg-red-500"
      : daysLeft <= 2
      ? "bg-orange-500"
      : "bg-violet-600";

  return (
    <div className={`${bgColor} text-white px-4 py-2.5 flex items-center justify-between gap-3 text-sm`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Clock className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium truncate">
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
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors px-3 py-1 rounded-full text-xs font-semibold"
        >
          <Zap className="w-3 h-3" />
          Assinar agora
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/70 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
