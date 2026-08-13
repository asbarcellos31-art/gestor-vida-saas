import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Minus, RefreshCw, Info } from "lucide-react";
import { useState } from "react";

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E2C97E";
const TEXT_PRIMARY = "var(--gv-text-primary)";
const TEXT_MUTED = "var(--gv-text-muted)";
const NAVY_BORDER = "var(--gv-navy-border)";

const GROUP_COLORS: Record<string, string> = {
  "Alimentação e bebidas":     "#F59E0B",
  "Despesas pessoais":          "#8B5CF6",
  "Transportes":                "#3B82F6",
  "Saúde e cuidados pessoais":  "#10B981",
  "Vestuário":                  "#EC4899",
  "Comunicação":                "#06B6D4",
  "Educação":                   "#F97316",
  "Habitação":                  "#EF4444",
  "Artigos de residência":      "#84CC16",
};

function formatPct(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function updatedLabel(ts: number) {
  const d = new Date(ts);
  return `Atualizado em ${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function InflacaoPessoal() {
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading, refetch, isFetching } = trpc.inflation.personal.useQuery(undefined, {
    staleTime: 12 * 60 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card style={{ background: "var(--gv-card-bg)", borderColor: NAVY_BORDER }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold" style={{ color: TEXT_PRIMARY }}>
            Inflação Pessoal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm" style={{ color: TEXT_MUTED }}>
            <RefreshCw className="w-4 h-4 animate-spin" style={{ color: GOLD }} />
            Calculando com dados reais do BCB…
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card style={{ background: "var(--gv-card-bg)", borderColor: NAVY_BORDER }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold" style={{ color: TEXT_PRIMARY }}>
            Inflação Pessoal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm" style={{ color: TEXT_MUTED }}>
            Lance pelo menos 1 mês de despesas para calcular sua inflação pessoal.
          </p>
        </CardContent>
      </Card>
    );
  }

  const diffPositive = data.difference > 0;
  const diffZero = Math.abs(data.difference) < 0.05;
  const DiffIcon = diffZero ? Minus : diffPositive ? TrendingUp : TrendingDown;
  const diffColor = diffZero ? TEXT_MUTED : diffPositive ? "#EF4444" : "#10B981";
  const diffLabel = diffZero
    ? "igual ao IPCA geral"
    : diffPositive
    ? `${data.difference.toFixed(2)}% acima do IPCA geral`
    : `${Math.abs(data.difference).toFixed(2)}% abaixo do IPCA geral`;

  return (
    <Card style={{ background: "var(--gv-card-bg)", borderColor: NAVY_BORDER }}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold" style={{ color: TEXT_PRIMARY }}>
          Inflação Pessoal
        </CardTitle>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-lg p-1.5 transition-colors"
          style={{ color: TEXT_MUTED }}
          title="Atualizar dados do BCB"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Números principais */}
        <div className="flex items-end gap-4">
          <div>
            <p className="text-xs mb-1" style={{ color: TEXT_MUTED }}>Sua inflação</p>
            <p className="text-3xl font-extrabold" style={{ color: GOLD }}>
              {data.personalInflation.toFixed(2)}%
            </p>
            <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>últimos 12 meses</p>
          </div>
          <div className="pb-1">
            <p className="text-xs mb-1" style={{ color: TEXT_MUTED }}>IPCA geral</p>
            <p className="text-xl font-bold" style={{ color: TEXT_MUTED }}>
              {data.ipcaGeral.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Badge de diferença */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
          style={{ background: `${diffColor}15`, border: `1px solid ${diffColor}40`, color: diffColor }}
        >
          <DiffIcon className="w-4 h-4" />
          {diffLabel}
        </div>

        {/* Barra de grupos IPCA */}
        <div>
          <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: TEXT_MUTED }}>
            Composição por grupo IPCA
          </p>
          <div className="flex h-3 rounded-full overflow-hidden w-full">
            {data.groups.map((g) => (
              <div
                key={g.group}
                title={`${g.group}: ${(g.weight * 100).toFixed(1)}%`}
                style={{
                  width: `${g.weight * 100}%`,
                  background: GROUP_COLORS[g.group] ?? "#6B7280",
                  minWidth: g.weight > 0.005 ? "3px" : "0",
                }}
              />
            ))}
          </div>
          {/* Legenda */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {data.groups.filter(g => g.weight > 0.01).map((g) => (
              <span key={g.group} className="flex items-center gap-1 text-xs" style={{ color: TEXT_MUTED }}>
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: GROUP_COLORS[g.group] ?? "#6B7280" }}
                />
                {g.group.replace(" e cuidados pessoais", "").replace(" de residência", "")}
                {" "}{(g.weight * 100).toFixed(0)}%
              </span>
            ))}
          </div>
        </div>

        {/* Detalhamento expandível */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left text-xs font-semibold flex items-center gap-1 pt-1"
          style={{ color: GOLD }}
        >
          <Info className="w-3 h-3" />
          {expanded ? "Ocultar detalhamento" : "Ver por categoria"}
        </button>

        {expanded && (
          <div className="space-y-1.5 pt-1">
            {data.categories.map((cat) => (
              <div
                key={cat.category}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: GROUP_COLORS[cat.ipcaGroup] ?? "#6B7280" }}
                  />
                  <span className="truncate" style={{ color: TEXT_PRIMARY }}>{cat.category}</span>
                  <span style={{ color: TEXT_MUTED }}>{(cat.weight * 100).toFixed(1)}%</span>
                </div>
                <span className="font-semibold ml-2 flex-shrink-0" style={{ color: GOLD_LIGHT }}>
                  {cat.effectiveRate.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Nota metodológica */}
        <p className="text-xs leading-relaxed" style={{ color: TEXT_MUTED, borderTop: `1px solid ${NAVY_BORDER}`, paddingTop: "8px" }}>
          Calculado com seus pesos reais de gasto × variação IPCA por grupo (Banco Central).
          Período de gastos: últimos 6 meses. {data.updatedAt ? updatedLabel(data.updatedAt) : ""}
        </p>
      </CardContent>
    </Card>
  );
}
