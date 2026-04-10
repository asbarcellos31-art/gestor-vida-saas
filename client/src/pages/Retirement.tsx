import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, TrendingUp, Calendar, DollarSign, Target, Clock, Info } from "lucide-react";

const fmt = (v: number | null | undefined) => {
  const n = Number(v);
  if (!isFinite(n)) return "R$\u00a00,00";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
};
const parseNum = (v: string | number | null | undefined) => {
  const n = parseFloat(String(v || "0").replace(",", "."));
  return isFinite(n) ? n : 0;
};
const safeInt = (v: number | null | undefined) => {
  const n = Number(v);
  return isFinite(n) ? n : 0;
};

type ScenarioData = {
  montanteFinal: number;
  rendaMensalSemGasto: number;
  rendaMensalConsumindo: number;
};

type ScenarioSet = {
  pessimista: ScenarioData;
  regular: ScenarioData;
  otimista: ScenarioData;
};

function ScenarioCard({
  title,
  rate,
  data,
  colorClass,
  badgeClass,
}: {
  title: string;
  rate: string;
  data: ScenarioData;
  colorClass: string;
  badgeClass: string;
}) {
  return (
    <Card className={`border-2 ${colorClass}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-sm font-bold ${colorClass.replace("border-", "text-").replace("-200", "-700").replace("-900", "-400")}`}>
            {title}
          </CardTitle>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>{rate}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">Montante Final</p>
          <p className={`text-xl font-bold ${colorClass.replace("border-", "text-").replace("-200", "-700").replace("-900", "-400")}`}>
            {fmt(data.montanteFinal)}
          </p>
        </div>
        <div className="border-t border-border pt-3 space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Renda Vitalícia (sem consumir capital)</p>
            <p className="text-base font-bold text-foreground">{fmt(data.rendaMensalSemGasto)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Renda Vitalícia (consumindo em 30 anos)</p>
            <p className="text-base font-bold text-foreground">{fmt(data.rendaMensalConsumindo)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectionBlock({ title, subtitle, scenarios, badge }: {
  title: string;
  subtitle: string;
  scenarios: ScenarioSet;
  badge?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            {title} {badge}
          </h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScenarioCard
          title="Pessimista"
          rate="6% a.a."
          data={scenarios.pessimista}
          colorClass="border-orange-200 dark:border-orange-900"
          badgeClass="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400"
        />
        <ScenarioCard
          title="Regular"
          rate="8% a.a."
          data={scenarios.regular}
          colorClass="border-blue-200 dark:border-blue-900"
          badgeClass="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400"
        />
        <ScenarioCard
          title="Otimista"
          rate="10% a.a."
          data={scenarios.otimista}
          colorClass="border-emerald-200 dark:border-emerald-900"
          badgeClass="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
        />
      </div>
    </div>
  );
}

export default function Retirement() {
  const [inputMode, setInputMode] = useState<"birthdate" | "years">("birthdate");
  const [form, setForm] = useState({
    birthDate: "",
    retirementAge: "65",
    yearsUntilRetirement: "20",
    initialAmount: "0",
    monthlyContribution: "0",
    inflationRate: "4.5",
  });
  const [dirty, setDirty] = useState(false);

  const utils = trpc.useUtils();
  const { data: config } = trpc.retirement.get.useQuery();

  const useYearsMode = inputMode === "years";

  const inflationRate = parseNum(form.inflationRate) / 100;
  // Taxa nominal = (1 + real) * (1 + inflação) - 1
  const nominalRates = {
    pessimista: ((1 + 0.06) * (1 + inflationRate) - 1) * 100,
    regular: ((1 + 0.08) * (1 + inflationRate) - 1) * 100,
    otimista: ((1 + 0.10) * (1 + inflationRate) - 1) * 100,
  };

  const calcInput = {
    birthDate: form.birthDate,
    retirementAge: parseInt(form.retirementAge) || 65,
    yearsUntilRetirement: parseInt(form.yearsUntilRetirement) || 20,
    useYearsMode,
    initialAmount: parseNum(form.initialAmount),
    monthlyContribution: parseNum(form.monthlyContribution),
  };

  const canCalculate = useYearsMode
    ? (parseInt(form.yearsUntilRetirement) || 0) > 0
    : !!form.birthDate;

  const { data: projection } = trpc.retirement.calculate.useQuery(calcInput, {
    enabled: canCalculate,
  });

  const saveConfig = trpc.retirement.save.useMutation({
    onSuccess: () => {
      toast.success("Configuração salva!");
      setDirty(false);
      utils.retirement.get.invalidate();
    },
    onError: () => toast.error("Erro ao salvar"),
  });

  useEffect(() => {
    if (config) {
      const usesYears = config.useYearsMode ?? false;
      setInputMode(usesYears ? "years" : "birthdate");
      setForm({
        birthDate: config.birthDate || "",
        retirementAge: String(config.retirementAge || 65),
        yearsUntilRetirement: String(config.yearsUntilRetirement || 20),
        initialAmount: String(parseFloat(String(config.initialAmount || "0"))),
        monthlyContribution: String(parseFloat(String(config.monthlyContribution || "0"))),
        inflationRate: "4.5",
      });
      setDirty(false);
    }
  }, [config]);

  const handleChange = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    saveConfig.mutate({
      birthDate: form.birthDate,
      retirementAge: parseInt(form.retirementAge) || 65,
      yearsUntilRetirement: parseInt(form.yearsUntilRetirement) || 20,
      useYearsMode,
      initialAmount: form.initialAmount,
      monthlyContribution: form.monthlyContribution,
    });
  };

  return (
    <AppLayout title="Projeção de Aposentadoria">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Simulador de Aposentadoria</h2>
              <p className="text-sm text-muted-foreground">
                Calcule sua renda futura em 3 cenários — e compare o planejado com o que de fato está sobrando no orçamento.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dados para Projeção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Toggle modo de entrada */}
            <div>
              <Label className="mb-2 block text-sm text-muted-foreground">Como prefere informar o prazo?</Label>
              <Tabs value={inputMode} onValueChange={(v) => { setInputMode(v as "birthdate" | "years"); setDirty(true); }}>
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="birthdate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Data de Nascimento
                  </TabsTrigger>
                  <TabsTrigger value="years" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Anos Restantes
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inputMode === "birthdate" ? (
                <>
                  <div>
                    <Label className="flex items-center gap-2 mb-1.5">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      Data de Nascimento (DD/MM/AAAA)
                    </Label>
                    <Input
                      value={form.birthDate}
                      onChange={(e) => handleChange("birthDate", e.target.value)}
                      placeholder="Ex: 15/03/1985"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2 mb-1.5">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      Idade de Aposentadoria
                    </Label>
                    <Input
                      type="number"
                      min="40"
                      max="100"
                      value={form.retirementAge}
                      onChange={(e) => handleChange("retirementAge", e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <Label className="flex items-center gap-2 mb-1.5">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Anos até a Aposentadoria
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="80"
                    value={form.yearsUntilRetirement}
                    onChange={(e) => handleChange("yearsUntilRetirement", e.target.value)}
                    placeholder="Ex: 20"
                  />
                </div>
              )}

              <div>
                <Label className="flex items-center gap-2 mb-1.5">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  Montante Inicial (R$)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.initialAmount}
                  onChange={(e) => handleChange("initialAmount", e.target.value)}
                  placeholder="0,00"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1.5">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  Aporte Mensal Almejado (R$)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.monthlyContribution}
                  onChange={(e) => handleChange("monthlyContribution", e.target.value)}
                  placeholder="0,00"
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="flex items-center gap-2 mb-1.5">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  Inflação Esperada (IPCA % a.a.) — para calcular taxa nominal equivalente
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={form.inflationRate}
                    onChange={(e) => handleChange("inflationRate", e.target.value)}
                    placeholder="4.5"
                    className="w-32"
                  />
                  <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>Taxas nominais equivalentes:</span>
                    <span className="text-orange-600 font-semibold">Pessimista: {nominalRates.pessimista.toFixed(2)}% a.a.</span>
                    <span className="text-blue-600 font-semibold">Regular: {nominalRates.regular.toFixed(2)}% a.a.</span>
                    <span className="text-emerald-600 font-semibold">Otimista: {nominalRates.otimista.toFixed(2)}% a.a.</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  As taxas 6%, 8% e 10% são <strong>reais</strong> (acima da inflação). A taxa nominal é o que você precisa render para atingir esse ganho real.
                </p>
              </div>
            </div>

            {dirty && (
              <Button onClick={handleSave} disabled={saveConfig.isPending} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" /> Salvar Configuração
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Status cards */}
        {projection && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {useYearsMode ? "Prazo Informado" : "Idade Atual"}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {useYearsMode ? safeInt(projection.yearsToRetirement) : safeInt(projection.currentAge)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {useYearsMode ? "anos até aposentadoria" : "anos"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Tempo até Aposentadoria</p>
                <p className="text-3xl font-bold text-primary">{safeInt(projection.yearsToRetirement)}</p>
                <p className="text-xs text-muted-foreground">anos ({safeInt(projection.monthsToRetirement)} meses)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Aporte Almejado</p>
                <p className="text-2xl font-bold text-emerald-600">{fmt(parseNum(form.monthlyContribution))}</p>
                <p className="text-xs text-muted-foreground">por mês</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projeção Almejada */}
        {projection && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Projeção Almejada
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Calculada com o aporte mensal fixo de {fmt(parseNum(form.monthlyContribution))} que você deseja investir.
              </p>
            </CardHeader>
            <CardContent>
              <ProjectionBlock
                title=""
                subtitle=""
                scenarios={projection.almejada}
              />
            </CardContent>
          </Card>
        )}

        {/* Projeção Real */}
        {projection && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Projeção Real (baseada no orçamento)
              </CardTitle>
              {projection.real ? (
                <div className="flex flex-wrap gap-4 mt-1">
                  <p className="text-xs text-muted-foreground">
                    Calculada com o saldo real de cada mês lançado no orçamento.
                    Meses futuros usam a média de{" "}
                    <span className="font-semibold text-foreground">{fmt(projection.real.mediaMensalReal)}</span>/mês
                    ({projection.real.mesesComDados} meses com dados).
                  </p>
                </div>
              ) : (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Nenhum dado de orçamento encontrado. Lance receitas e despesas nos meses para ver a projeção real.
                </p>
              )}
            </CardHeader>
            <CardContent>
              {projection.real ? (
                <>
                  <ProjectionBlock
                    title=""
                    subtitle=""
                    scenarios={projection.real}
                  />

                  {/* Tabela de saldos reais */}
                  {projection.real.saldosPorMes.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        Saldos Reais Utilizados na Projeção
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 font-medium text-muted-foreground">Período</th>
                              <th className="text-right py-2 font-medium text-muted-foreground">Saldo Real</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projection.real.saldosPorMes.map(({ periodo, saldo }) => {
                              const [yr, mo] = periodo.split("-");
                              const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
                              const label = `${meses[(parseInt(mo) - 1)]}/${yr}`;
                              return (
                                <tr key={periodo} className="border-b border-border/50 hover:bg-muted/20">
                                  <td className="py-2 text-muted-foreground">{label}</td>
                                  <td className={`py-2 text-right font-medium ${saldo > 0 ? "text-emerald-600" : "text-red-500"}`}>
                                    {fmt(saldo)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-8 text-center">
                  <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    Lance suas receitas e despesas mensais no orçamento para ver a projeção baseada na realidade financeira.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Comparativo */}
        {projection && projection.real && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Comparativo: Almejado vs. Real</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium text-muted-foreground">Cenário</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Montante Almejado</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Montante Real</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Diferença</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(["pessimista", "regular", "otimista"] as const).map((key) => {
                      const labels: Record<string, string> = {
                        pessimista: "Pessimista (6% a.a.)",
                        regular: "Regular (8% a.a.)",
                        otimista: "Otimista (10% a.a.)",
                      };
                      const colors: Record<string, string> = {
                        pessimista: "text-orange-600",
                        regular: "text-blue-600",
                        otimista: "text-emerald-600",
                      };
                      const almejadoVal = projection.almejada[key].montanteFinal;
                      const realVal = projection.real![key].montanteFinal;
                      const diff = realVal - almejadoVal;
                      return (
                        <tr key={key} className="border-b border-border/50 hover:bg-muted/20">
                          <td className={`py-2 font-medium ${colors[key]}`}>{labels[key]}</td>
                          <td className="py-2 text-right">{fmt(almejadoVal)}</td>
                          <td className="py-2 text-right">{fmt(realVal)}</td>
                          <td className={`py-2 text-right font-semibold ${diff >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {diff >= 0 ? "+" : ""}{fmt(diff)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {!canCalculate && (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {inputMode === "birthdate"
                  ? "Preencha sua data de nascimento para ver a projeção de aposentadoria."
                  : "Informe quantos anos faltam para a aposentadoria."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
