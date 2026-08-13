import { getDb } from "./db";

// BCB series IDs — variação mensal por grupo IPCA
const BCB_SERIES: Record<string, number> = {
  "Alimentação e bebidas":     1635,
  "Habitação":                 1636,
  "Artigos de residência":     1637,
  "Vestuário":                 1638,
  "Transportes":               1639,
  "Comunicação":               1640,
  "Saúde e cuidados pessoais": 1641,
  "Despesas pessoais":         1642,
  "Educação":                  1643,
};
const BCB_IPCA_TOTAL = 433;

// Mapeamento: categoria do usuário → grupos IPCA com peso de distribuição
// Chave: categoria normalizada (lowercase). Valor: { grupo: fração }
export const CATEGORY_IPCA_MAP: Record<string, Record<string, number>> = {
  // Alimentação doméstica
  "alimentação":       { "Alimentação e bebidas": 1.0 },
  "alimentacao":       { "Alimentação e bebidas": 1.0 },
  "supermercado":      { "Alimentação e bebidas": 1.0 },
  "mercado":           { "Alimentação e bebidas": 1.0 },
  "feira":             { "Alimentação e bebidas": 1.0 },
  "padaria":           { "Alimentação e bebidas": 1.0 },
  "hortifruti":        { "Alimentação e bebidas": 1.0 },
  "bebidas":           { "Alimentação e bebidas": 1.0 },
  // Lazer: mistura de restaurantes (Desp. pessoais), supermercado e transporte
  "lazer":             { "Despesas pessoais": 0.65, "Alimentação e bebidas": 0.20, "Transportes": 0.15 },
  "entretenimento":    { "Despesas pessoais": 1.0 },
  "diversão":          { "Despesas pessoais": 1.0 },
  "diversao":          { "Despesas pessoais": 1.0 },
  "restaurante":       { "Despesas pessoais": 1.0 },
  "bar":               { "Despesas pessoais": 1.0 },
  "viagem":            { "Transportes": 0.6, "Despesas pessoais": 0.4 },
  // Transporte
  "transporte":        { "Transportes": 1.0 },
  "transportes":       { "Transportes": 1.0 },
  "combustível":       { "Transportes": 1.0 },
  "combustivel":       { "Transportes": 1.0 },
  "gasolina":          { "Transportes": 1.0 },
  "uber":              { "Transportes": 1.0 },
  "estacionamento":    { "Transportes": 1.0 },
  // Saúde
  "saúde":             { "Saúde e cuidados pessoais": 1.0 },
  "saude":             { "Saúde e cuidados pessoais": 1.0 },
  "farmácia":          { "Saúde e cuidados pessoais": 1.0 },
  "farmacia":          { "Saúde e cuidados pessoais": 1.0 },
  "médico":            { "Saúde e cuidados pessoais": 1.0 },
  "medico":            { "Saúde e cuidados pessoais": 1.0 },
  "plano de saúde":    { "Saúde e cuidados pessoais": 1.0 },
  "beleza":            { "Saúde e cuidados pessoais": 1.0 },
  "higiene":           { "Saúde e cuidados pessoais": 1.0 },
  "academia":          { "Saúde e cuidados pessoais": 1.0 },
  // Vestuário
  "roupas":            { "Vestuário": 1.0 },
  "vestuário":         { "Vestuário": 1.0 },
  "vestuario":         { "Vestuário": 1.0 },
  "calçados":          { "Vestuário": 1.0 },
  "calcados":          { "Vestuário": 1.0 },
  // Educação
  "educação":          { "Educação": 1.0 },
  "educacao":          { "Educação": 1.0 },
  "escola":            { "Educação": 1.0 },
  "faculdade":         { "Educação": 1.0 },
  "curso":             { "Educação": 1.0 },
  "livros":            { "Educação": 1.0 },
  // Habitação
  "habitação":         { "Habitação": 1.0 },
  "habitacao":         { "Habitação": 1.0 },
  "aluguel":           { "Habitação": 1.0 },
  "condomínio":        { "Habitação": 1.0 },
  "condominio":        { "Habitação": 1.0 },
  "moradia":           { "Habitação": 1.0 },
  "casa essencial":    { "Habitação": 1.0 },
  "luz":               { "Habitação": 1.0 },
  "energia":           { "Habitação": 1.0 },
  "água":              { "Habitação": 1.0 },
  "agua":              { "Habitação": 1.0 },
  "gás":               { "Habitação": 1.0 },
  "gas":               { "Habitação": 1.0 },
  "casa":              { "Habitação": 0.7, "Artigos de residência": 0.3 },
  // Comunicação
  "internet":          { "Comunicação": 1.0 },
  "telefone":          { "Comunicação": 1.0 },
  "celular":           { "Comunicação": 1.0 },
  "comunicação":       { "Comunicação": 1.0 },
  "comunicacao":       { "Comunicação": 1.0 },
  "assinaturas":       { "Comunicação": 0.7, "Despesas pessoais": 0.3 },
  "streaming":         { "Comunicação": 1.0 },
  "trabalho":          { "Comunicação": 0.7, "Despesas pessoais": 0.3 },
  // Artigos de residência
  "móveis":            { "Artigos de residência": 1.0 },
  "moveis":            { "Artigos de residência": 1.0 },
  "eletrodomésticos":  { "Artigos de residência": 1.0 },
  "eletrodomesticos":  { "Artigos de residência": 1.0 },
  // Despesas pessoais (padrão para miscelânea)
  "outros":            { "Despesas pessoais": 1.0 },
  "pet":               { "Despesas pessoais": 1.0 },
  "presentes":         { "Despesas pessoais": 1.0 },
  "pessoal":           { "Despesas pessoais": 1.0 },
};

type IpcaCache = {
  groups: Record<string, number>;
  total: number;
  updatedAt: number;
};

let ipcaCache: IpcaCache | null = null;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 horas

function getLastNMonthsRange(n: number): { start: string; end: string } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  const start = new Date(end);
  start.setMonth(start.getMonth() - n);
  const fmt = (d: Date) =>
    `01/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return { start: fmt(start), end: fmt(end) };
}

async function fetchBCBSeries(serieId: number, start: string, end: string): Promise<number[]> {
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serieId}/dados?formato=json&dataInicial=${start}&dataFinal=${end}`;
  const resp = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!resp.ok) throw new Error(`BCB ${serieId}: ${resp.status}`);
  const data: Array<{ valor: string }> = await resp.json();
  return data.map((d) => parseFloat(d.valor));
}

function accumulated12m(monthly: number[]): number {
  const last12 = monthly.slice(-12);
  return last12.reduce((acc, v) => acc * (1 + v / 100), 1) - 1;
}

export async function fetchIPCAGroups(): Promise<IpcaCache> {
  if (ipcaCache && Date.now() - ipcaCache.updatedAt < CACHE_TTL) {
    return ipcaCache;
  }

  const { start, end } = getLastNMonthsRange(14);
  const groups: Record<string, number> = {};

  await Promise.allSettled(
    Object.entries(BCB_SERIES).map(async ([group, serieId]) => {
      try {
        const values = await fetchBCBSeries(serieId, start, end);
        groups[group] = accumulated12m(values) * 100;
      } catch (e) {
        console.error(`[Inflation] BCB série ${serieId} (${group}):`, e);
      }
    })
  );

  let total = 4.71; // fallback
  try {
    const values = await fetchBCBSeries(BCB_IPCA_TOTAL, start, end);
    total = accumulated12m(values) * 100;
  } catch (e) {
    console.error("[Inflation] BCB IPCA total:", e);
  }

  ipcaCache = { groups, total, updatedAt: Date.now() };
  return ipcaCache;
}

function resolveIPCAGroup(category: string): Record<string, number> {
  const key = category.toLowerCase().trim();
  if (CATEGORY_IPCA_MAP[key]) return CATEGORY_IPCA_MAP[key];
  // Busca parcial
  for (const [mapKey, groups] of Object.entries(CATEGORY_IPCA_MAP)) {
    if (key.includes(mapKey) || mapKey.includes(key)) return groups;
  }
  return { "Despesas pessoais": 1.0 };
}

export type InflationResult = {
  personalInflation: number;
  ipcaGeral: number;
  difference: number;
  totalSpend: number;
  months: number;
  categories: Array<{
    category: string;
    amount: number;
    weight: number;
    ipcaGroup: string;
    effectiveRate: number;
  }>;
  groups: Array<{
    group: string;
    weight: number;
    rate: number;
    contribution: number;
  }>;
  updatedAt: number;
};

export async function calculatePersonalInflation(userId: number): Promise<InflationResult | null> {
  const db = await getDb();
  if (!db) return null;

  // Últimos 6 meses completos
  const now = new Date();
  const currentYearMonth = now.getFullYear() * 100 + (now.getMonth() + 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const fromYearMonth = sixMonthsAgo.getFullYear() * 100 + (sixMonthsAgo.getMonth() + 1);

  const result = await db.execute(
    `SELECT category, SUM(amount) as total
     FROM expense_entries
     WHERE userId = ?
       AND (year * 100 + month) >= ?
       AND (year * 100 + month) <= ?
     GROUP BY category
     HAVING total > 0`,
    [userId, fromYearMonth, currentYearMonth]
  ) as any[];

  const rows: Array<{ category: string; total: string }> = (result[0] as any[]) ?? [];
  if (rows.length === 0) return null;

  const totalSpend = rows.reduce((s, r) => s + parseFloat(r.total), 0);

  const { groups: ipcaGroups, total: ipcaTotal, updatedAt } = await fetchIPCAGroups();
  const fallbackRate = ipcaTotal;

  // Acumular pesos por grupo IPCA
  const groupWeights: Record<string, number> = {};
  const categories = rows.map((row) => {
    const amount = parseFloat(row.total);
    const weight = amount / totalSpend;
    const mapping = resolveIPCAGroup(row.category);
    let effectiveRate = 0;
    for (const [group, frac] of Object.entries(mapping)) {
      const rate = ipcaGroups[group] ?? fallbackRate;
      effectiveRate += frac * rate;
      groupWeights[group] = (groupWeights[group] ?? 0) + weight * frac;
    }
    const primaryGroup = Object.entries(mapping).sort((a, b) => b[1] - a[1])[0][0];
    return { category: row.category, amount, weight, ipcaGroup: primaryGroup, effectiveRate };
  });

  let personalInflation = 0;
  const groups = Object.entries(groupWeights)
    .map(([group, weight]) => {
      const rate = ipcaGroups[group] ?? fallbackRate;
      const contribution = weight * rate;
      personalInflation += contribution;
      return { group, weight, rate, contribution };
    })
    .sort((a, b) => b.weight - a.weight);

  return {
    personalInflation: Math.round(personalInflation * 100) / 100,
    ipcaGeral: Math.round(ipcaTotal * 100) / 100,
    difference: Math.round((personalInflation - ipcaTotal) * 100) / 100,
    totalSpend,
    months: 6,
    categories: categories.sort((a, b) => b.amount - a.amount),
    groups,
    updatedAt,
  };
}
