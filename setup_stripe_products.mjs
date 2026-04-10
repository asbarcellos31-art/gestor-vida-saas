import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function main() {
  console.log('Criando produtos e preços no Stripe...\n');

  // Produto 1: Gestão de Tempo
  const prodTime = await stripe.products.create({
    name: 'Gestão de Tempo',
    description: 'Organize seu dia com a metodologia Tríade do Tempo. Inclui Meu Dia, Planejamento Semanal, Score de Produtividade e Timer.',
    metadata: { plan: 'time_management' },
  });
  const priceTime = await stripe.prices.create({
    product: prodTime.id,
    unit_amount: 1990, // R$ 19,90 em centavos
    currency: 'brl',
    recurring: { interval: 'month' },
    metadata: { plan: 'time_management' },
  });
  console.log('✓ Gestão de Tempo:', prodTime.id, '| Price:', priceTime.id);

  // Produto 2: Orçamento Doméstico
  const prodBudget = await stripe.products.create({
    name: 'Orçamento Doméstico',
    description: 'Controle suas finanças com a regra 50/30/20. Inclui orçamento mensal, contas parceladas e projeção de aposentadoria.',
    metadata: { plan: 'budget' },
  });
  const priceBudget = await stripe.prices.create({
    product: prodBudget.id,
    unit_amount: 1990, // R$ 19,90
    currency: 'brl',
    recurring: { interval: 'month' },
    metadata: { plan: 'budget' },
  });
  console.log('✓ Orçamento Doméstico:', prodBudget.id, '| Price:', priceBudget.id);

  // Produto 3: Combo
  const prodCombo = await stripe.products.create({
    name: 'Combo — Gestão de Tempo + Orçamento',
    description: 'Acesso completo a todos os módulos: Gestão de Tempo (Tríade do Tempo) + Orçamento Doméstico (50/30/20). O melhor custo-benefício.',
    metadata: { plan: 'combo' },
  });
  const priceCombo = await stripe.prices.create({
    product: prodCombo.id,
    unit_amount: 3490, // R$ 34,90
    currency: 'brl',
    recurring: { interval: 'month' },
    metadata: { plan: 'combo' },
  });
  console.log('✓ Combo:', prodCombo.id, '| Price:', priceCombo.id);

  console.log('\n=== IDs para usar no código ===');
  console.log(`STRIPE_PRICE_TIME_MANAGEMENT=${priceTime.id}`);
  console.log(`STRIPE_PRICE_BUDGET=${priceBudget.id}`);
  console.log(`STRIPE_PRICE_COMBO=${priceCombo.id}`);

  return {
    time_management: priceTime.id,
    budget: priceBudget.id,
    combo: priceCombo.id,
  };
}

main().catch(console.error);
