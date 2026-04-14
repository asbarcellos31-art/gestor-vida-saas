/**
 * Seed demo data for the 3 demo profiles
 * Run: node scripts/seed-demo-data.mjs
 */
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// IDs dos perfis demo
const SILVA_ID = 480040;   // Família Silva - renda média (~R$9k)
const FERNANDA_ID = 480041; // Dra. Fernanda - profissional liberal (~R$15k)
const SOUZA_ID = 480065;   // Roberto e Maria Souza - baixa renda (~R$4k)

const TODAY = new Date();
const YEAR = TODAY.getFullYear();
const MONTH = TODAY.getMonth() + 1;
const PREV_MONTH = MONTH === 1 ? 12 : MONTH - 1;
const PREV_YEAR = MONTH === 1 ? YEAR - 1 : YEAR;
const TODAY_STR = TODAY.toISOString().split('T')[0];

// Helper para data no mês atual
function dateInMonth(day, m = MONTH, y = YEAR) {
  return `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

async function clearDemoData(userId) {
  await conn.execute('DELETE FROM tasks WHERE userId = ?', [userId]);
  await conn.execute('DELETE FROM income_entries WHERE userId = ?', [userId]);
  await conn.execute('DELETE FROM expense_entries WHERE userId = ?', [userId]);
  await conn.execute('DELETE FROM retirement_config WHERE userId = ?', [userId]);
}

// ─── FAMÍLIA SILVA (renda ~R$9.000) ───────────────────────────────────────────
// Carlos Silva: analista de TI CLT (R$6.000) + Ana Silva: professora (R$3.000)
// 1 filho (10 anos), apartamento alugado, carro financiado
async function seedSilva() {
  await clearDemoData(SILVA_ID);

  // Receitas - mês atual
  const incomes = [
    [SILVA_ID, YEAR, MONTH, 'Salário Carlos - TI', 6000.00, 'Salário'],
    [SILVA_ID, YEAR, MONTH, 'Salário Ana - Professora', 3000.00, 'Salário'],
    [SILVA_ID, PREV_YEAR, PREV_MONTH, 'Salário Carlos - TI', 6000.00, 'Salário'],
    [SILVA_ID, PREV_YEAR, PREV_MONTH, 'Salário Ana - Professora', 3000.00, 'Salário'],
  ];
  for (const i of incomes) {
    await conn.execute('INSERT INTO income_entries (userId, year, month, description, amount, category) VALUES (?,?,?,?,?,?)', i);
  }

  // Despesas - mês atual (regra 50/30/20)
  // Essenciais ~R$4.500 (50%)
  const expenses = [
    [SILVA_ID, YEAR, MONTH, 'Aluguel apartamento', 1800.00, 'Moradia', 'Essenciais (50%)', dateInMonth(5)],
    [SILVA_ID, YEAR, MONTH, 'Condomínio', 350.00, 'Moradia', 'Essenciais (50%)', dateInMonth(5)],
    [SILVA_ID, YEAR, MONTH, 'Parcela carro (Fiat Argo)', 980.00, 'Transporte', 'Essenciais (50%)', dateInMonth(10)],
    [SILVA_ID, YEAR, MONTH, 'Supermercado', 1100.00, 'Alimentação', 'Essenciais (50%)', dateInMonth(8)],
    [SILVA_ID, YEAR, MONTH, 'Escola filho (mensalidade)', 750.00, 'Educação', 'Essenciais (50%)', dateInMonth(5)],
    [SILVA_ID, YEAR, MONTH, 'Plano de saúde família', 680.00, 'Saúde', 'Essenciais (50%)', dateInMonth(5)],
    [SILVA_ID, YEAR, MONTH, 'Luz + água', 280.00, 'Moradia', 'Essenciais (50%)', dateInMonth(12)],
    [SILVA_ID, YEAR, MONTH, 'Internet + celulares', 220.00, 'Moradia', 'Essenciais (50%)', dateInMonth(10)],
    // Estilo de vida ~R$2.700 (30%)
    [SILVA_ID, YEAR, MONTH, 'Restaurantes e delivery', 480.00, 'Alimentação', 'Estilo de Vida (30%)', dateInMonth(20)],
    [SILVA_ID, YEAR, MONTH, 'Academia família', 180.00, 'Saúde', 'Estilo de Vida (30%)', dateInMonth(5)],
    [SILVA_ID, YEAR, MONTH, 'Streaming (Netflix, Spotify)', 85.00, 'Lazer', 'Estilo de Vida (30%)', dateInMonth(15)],
    [SILVA_ID, YEAR, MONTH, 'Roupas e calçados', 350.00, 'Vestuário', 'Estilo de Vida (30%)', dateInMonth(18)],
    [SILVA_ID, YEAR, MONTH, 'Passeios e lazer', 420.00, 'Lazer', 'Estilo de Vida (30%)', dateInMonth(22)],
    [SILVA_ID, YEAR, MONTH, 'Gasolina extra', 280.00, 'Transporte', 'Estilo de Vida (30%)', dateInMonth(25)],
    [SILVA_ID, YEAR, MONTH, 'Curso inglês filho', 250.00, 'Educação', 'Estilo de Vida (30%)', dateInMonth(5)],
    // Investimentos ~R$1.800 (20%)
    [SILVA_ID, YEAR, MONTH, 'Previdência privada Carlos', 600.00, 'Investimento', 'Investimentos/Dívidas (20%)', dateInMonth(5)],
    [SILVA_ID, YEAR, MONTH, 'Tesouro Direto', 400.00, 'Investimento', 'Investimentos/Dívidas (20%)', dateInMonth(5)],
    [SILVA_ID, YEAR, MONTH, 'Reserva emergência', 800.00, 'Investimento', 'Investimentos/Dívidas (20%)', dateInMonth(5)],
  ];
  for (const e of expenses) {
    await conn.execute('INSERT INTO expense_entries (userId, year, month, description, amount, category, rule, expenseDate) VALUES (?,?,?,?,?,?,?,?)', e);
  }

  // Tarefas
  const tasks = [
    [SILVA_ID, 'Revisar orçamento do mês', 30, 'important', 'completed', TODAY_STR],
    [SILVA_ID, 'Pagar contas do mês', 20, 'important', 'completed', TODAY_STR],
    [SILVA_ID, 'Pesquisar investimentos para filho', 45, 'important', 'pending', TODAY_STR],
    [SILVA_ID, 'Reunião escola do Lucas', 60, 'important', 'pending', dateInMonth(TODAY.getDate() + 2)],
    [SILVA_ID, 'Revisar seguro do carro', 30, 'urgent', 'pending', dateInMonth(TODAY.getDate() + 1)],
    [SILVA_ID, 'Planejar férias julho', 60, 'circumstantial', 'pending', dateInMonth(TODAY.getDate() + 3)],
    [SILVA_ID, 'Leitura livro de finanças', 40, 'important', 'completed', dateInMonth(TODAY.getDate() - 1)],
    [SILVA_ID, 'Exercícios físicos', 45, 'important', 'completed', dateInMonth(TODAY.getDate() - 1)],
  ];
  for (const t of tasks) {
    await conn.execute('INSERT INTO tasks (userId, title, durationMinutes, category, status, scheduledDate) VALUES (?,?,?,?,?,?)', t);
  }

  // Aposentadoria
  await conn.execute(
    'INSERT INTO retirement_config (userId, birthDate, retirementAge, yearsUntilRetirement, useYearsMode, initialAmount, monthlyContribution) VALUES (?,?,?,?,?,?,?)',
    [SILVA_ID, '1985-03-15', 60, 0, 0, 45000.00, 1000.00]
  );

  console.log('✅ Família Silva seeded');
}

// ─── DRA. FERNANDA ROCHA (renda ~R$15.000) ────────────────────────────────────
// Médica pediatra, consultório próprio + plantões, solteira, apartamento próprio
async function seedFernanda() {
  await clearDemoData(FERNANDA_ID);

  // Receitas
  const incomes = [
    [FERNANDA_ID, YEAR, MONTH, 'Consultório - consultas', 9500.00, 'Honorários'],
    [FERNANDA_ID, YEAR, MONTH, 'Plantão hospital', 4200.00, 'Plantão'],
    [FERNANDA_ID, YEAR, MONTH, 'Telemedicina', 1300.00, 'Honorários'],
    [FERNANDA_ID, PREV_YEAR, PREV_MONTH, 'Consultório - consultas', 8800.00, 'Honorários'],
    [FERNANDA_ID, PREV_YEAR, PREV_MONTH, 'Plantão hospital', 4200.00, 'Plantão'],
    [FERNANDA_ID, PREV_YEAR, PREV_MONTH, 'Telemedicina', 950.00, 'Honorários'],
  ];
  for (const i of incomes) {
    await conn.execute('INSERT INTO income_entries (userId, year, month, description, amount, category) VALUES (?,?,?,?,?,?)', i);
  }

  // Despesas
  const expenses = [
    // Essenciais ~R$7.500 (50%)
    [FERNANDA_ID, YEAR, MONTH, 'Financiamento apartamento', 2800.00, 'Moradia', 'Essenciais (50%)', dateInMonth(5)],
    [FERNANDA_ID, YEAR, MONTH, 'Condomínio + IPTU', 1200.00, 'Moradia', 'Essenciais (50%)', dateInMonth(5)],
    [FERNANDA_ID, YEAR, MONTH, 'Aluguel consultório', 2200.00, 'Trabalho', 'Essenciais (50%)', dateInMonth(1)],
    [FERNANDA_ID, YEAR, MONTH, 'Plano de saúde premium', 980.00, 'Saúde', 'Essenciais (50%)', dateInMonth(5)],
    [FERNANDA_ID, YEAR, MONTH, 'Supermercado + delivery saudável', 1400.00, 'Alimentação', 'Essenciais (50%)', dateInMonth(10)],
    [FERNANDA_ID, YEAR, MONTH, 'Seguro carro (BMW)', 650.00, 'Transporte', 'Essenciais (50%)', dateInMonth(5)],
    [FERNANDA_ID, YEAR, MONTH, 'Gasolina', 420.00, 'Transporte', 'Essenciais (50%)', dateInMonth(20)],
    [FERNANDA_ID, YEAR, MONTH, 'Luz + água + internet', 380.00, 'Moradia', 'Essenciais (50%)', dateInMonth(12)],
    // Estilo de vida ~R$4.500 (30%)
    [FERNANDA_ID, YEAR, MONTH, 'Restaurantes finos', 1200.00, 'Alimentação', 'Estilo de Vida (30%)', dateInMonth(25)],
    [FERNANDA_ID, YEAR, MONTH, 'Personal trainer', 600.00, 'Saúde', 'Estilo de Vida (30%)', dateInMonth(5)],
    [FERNANDA_ID, YEAR, MONTH, 'Roupas e estética', 800.00, 'Vestuário', 'Estilo de Vida (30%)', dateInMonth(18)],
    [FERNANDA_ID, YEAR, MONTH, 'Viagem / hotel', 1200.00, 'Lazer', 'Estilo de Vida (30%)', dateInMonth(22)],
    [FERNANDA_ID, YEAR, MONTH, 'Streaming + assinaturas', 180.00, 'Lazer', 'Estilo de Vida (30%)', dateInMonth(15)],
    // Investimentos ~R$3.000 (20%)
    [FERNANDA_ID, YEAR, MONTH, 'Previdência PGBL', 1500.00, 'Investimento', 'Investimentos/Dívidas (20%)', dateInMonth(5)],
    [FERNANDA_ID, YEAR, MONTH, 'Ações e FIIs', 1000.00, 'Investimento', 'Investimentos/Dívidas (20%)', dateInMonth(5)],
    [FERNANDA_ID, YEAR, MONTH, 'Reserva emergência', 500.00, 'Investimento', 'Investimentos/Dívidas (20%)', dateInMonth(5)],
  ];
  for (const e of expenses) {
    await conn.execute('INSERT INTO expense_entries (userId, year, month, description, amount, category, rule, expenseDate) VALUES (?,?,?,?,?,?,?,?)', e);
  }

  // Tarefas - mistura de trabalho e vida pessoal
  const tasks = [
    [FERNANDA_ID, 'Revisar prontuários pendentes', 60, 'important', 'completed', TODAY_STR],
    [FERNANDA_ID, 'Plantão hospital - 12h', 720, 'important', 'completed', dateInMonth(TODAY.getDate() - 1)],
    [FERNANDA_ID, 'Estudar artigo sobre pediatria', 45, 'important', 'pending', TODAY_STR],
    [FERNANDA_ID, 'Reunião com contador', 60, 'urgent', 'pending', dateInMonth(TODAY.getDate() + 1)],
    [FERNANDA_ID, 'Renovar CRM', 30, 'urgent', 'pending', dateInMonth(TODAY.getDate() + 2)],
    [FERNANDA_ID, 'Meditação matinal', 20, 'important', 'completed', TODAY_STR],
    [FERNANDA_ID, 'Treino funcional', 50, 'important', 'completed', TODAY_STR],
    [FERNANDA_ID, 'Planejar congresso médico', 45, 'circumstantial', 'pending', dateInMonth(TODAY.getDate() + 4)],
    [FERNANDA_ID, 'Ligar para paciente pós-consulta', 15, 'important', 'completed', TODAY_STR],
    [FERNANDA_ID, 'Revisar investimentos mensais', 30, 'important', 'pending', dateInMonth(TODAY.getDate() + 1)],
  ];
  for (const t of tasks) {
    await conn.execute('INSERT INTO tasks (userId, title, durationMinutes, category, status, scheduledDate) VALUES (?,?,?,?,?,?)', t);
  }

  // Aposentadoria
  await conn.execute(
    'INSERT INTO retirement_config (userId, birthDate, retirementAge, yearsUntilRetirement, useYearsMode, initialAmount, monthlyContribution) VALUES (?,?,?,?,?,?,?)',
    [FERNANDA_ID, '1988-07-22', 55, 0, 0, 180000.00, 2500.00]
  );

  console.log('✅ Dra. Fernanda seeded');
}

// ─── ROBERTO E MARIA SOUZA (renda ~R$4.000) ───────────────────────────────────
// Roberto: operador de caixa CLT (R$2.200) + Maria: diarista (R$1.800 variável)
// 2 filhos (8 e 12 anos), casa alugada, sem carro, dívida no cartão
async function seedSouza() {
  await clearDemoData(SOUZA_ID);

  // Receitas
  const incomes = [
    [SOUZA_ID, YEAR, MONTH, 'Salário Roberto - Operador de Caixa', 2200.00, 'Salário'],
    [SOUZA_ID, YEAR, MONTH, 'Diárias Maria (12 diárias)', 1800.00, 'Autônomo'],
    [SOUZA_ID, PREV_YEAR, PREV_MONTH, 'Salário Roberto - Operador de Caixa', 2200.00, 'Salário'],
    [SOUZA_ID, PREV_YEAR, PREV_MONTH, 'Diárias Maria (10 diárias)', 1500.00, 'Autônomo'],
  ];
  for (const i of incomes) {
    await conn.execute('INSERT INTO income_entries (userId, year, month, description, amount, category) VALUES (?,?,?,?,?,?)', i);
  }

  // Despesas - orçamento apertado, foco em sair das dívidas
  const expenses = [
    // Essenciais ~R$2.000 (50%)
    [SOUZA_ID, YEAR, MONTH, 'Aluguel casa', 900.00, 'Moradia', 'Essenciais (50%)', dateInMonth(5)],
    [SOUZA_ID, YEAR, MONTH, 'Supermercado', 700.00, 'Alimentação', 'Essenciais (50%)', dateInMonth(8)],
    [SOUZA_ID, YEAR, MONTH, 'Luz + água + gás', 220.00, 'Moradia', 'Essenciais (50%)', dateInMonth(12)],
    [SOUZA_ID, YEAR, MONTH, 'Transporte (ônibus)', 280.00, 'Transporte', 'Essenciais (50%)', dateInMonth(1)],
    [SOUZA_ID, YEAR, MONTH, 'Material escolar filhos', 120.00, 'Educação', 'Essenciais (50%)', dateInMonth(5)],
    // Estilo de vida ~R$1.200 (30%)
    [SOUZA_ID, YEAR, MONTH, 'Celular família (2 linhas)', 120.00, 'Comunicação', 'Estilo de Vida (30%)', dateInMonth(10)],
    [SOUZA_ID, YEAR, MONTH, 'Lanche e saída com filhos', 200.00, 'Lazer', 'Estilo de Vida (30%)', dateInMonth(20)],
    [SOUZA_ID, YEAR, MONTH, 'Roupas filhos', 180.00, 'Vestuário', 'Estilo de Vida (30%)', dateInMonth(15)],
    [SOUZA_ID, YEAR, MONTH, 'Internet em casa', 100.00, 'Comunicação', 'Estilo de Vida (30%)', dateInMonth(10)],
    [SOUZA_ID, YEAR, MONTH, 'Farmácia e saúde', 150.00, 'Saúde', 'Estilo de Vida (30%)', dateInMonth(18)],
    // Dívidas / Investimentos ~R$800 (20%)
    [SOUZA_ID, YEAR, MONTH, 'Parcela dívida cartão crédito', 450.00, 'Dívida', 'Investimentos/Dívidas (20%)', dateInMonth(5)],
    [SOUZA_ID, YEAR, MONTH, 'Poupança emergência', 200.00, 'Investimento', 'Investimentos/Dívidas (20%)', dateInMonth(5)],
    [SOUZA_ID, YEAR, MONTH, 'Empréstimo familiar', 150.00, 'Dívida', 'Investimentos/Dívidas (20%)', dateInMonth(10)],
  ];
  for (const e of expenses) {
    await conn.execute('INSERT INTO expense_entries (userId, year, month, description, amount, category, rule, expenseDate) VALUES (?,?,?,?,?,?,?,?)', e);
  }

  // Tarefas - foco em organização e saída das dívidas
  const tasks = [
    [SOUZA_ID, 'Listar todas as dívidas', 30, 'important', 'completed', TODAY_STR],
    [SOUZA_ID, 'Negociar dívida do cartão', 45, 'urgent', 'completed', dateInMonth(TODAY.getDate() - 1)],
    [SOUZA_ID, 'Buscar hora extra no trabalho', 20, 'important', 'pending', TODAY_STR],
    [SOUZA_ID, 'Pesquisar renda extra online', 30, 'important', 'pending', dateInMonth(TODAY.getDate() + 1)],
    [SOUZA_ID, 'Reunião escola dos filhos', 60, 'important', 'pending', dateInMonth(TODAY.getDate() + 2)],
    [SOUZA_ID, 'Fazer orçamento do mês', 30, 'important', 'completed', TODAY_STR],
    [SOUZA_ID, 'Pesquisar curso profissionalizante', 45, 'circumstantial', 'pending', dateInMonth(TODAY.getDate() + 3)],
    [SOUZA_ID, 'Guardar R$50 na poupança', 10, 'important', 'completed', TODAY_STR],
  ];
  for (const t of tasks) {
    await conn.execute('INSERT INTO tasks (userId, title, durationMinutes, category, status, scheduledDate) VALUES (?,?,?,?,?,?)', t);
  }

  // Aposentadoria - começando do zero, contribuição pequena
  await conn.execute(
    'INSERT INTO retirement_config (userId, birthDate, retirementAge, yearsUntilRetirement, useYearsMode, initialAmount, monthlyContribution) VALUES (?,?,?,?,?,?,?)',
    [SOUZA_ID, '1990-11-08', 65, 0, 0, 2500.00, 100.00]
  );

  console.log('✅ Roberto e Maria Souza seeded');
}

// Executar tudo
await seedSilva();
await seedFernanda();
await seedSouza();

console.log('\n🎉 Todos os perfis demo foram populados com sucesso!');
await conn.end();
