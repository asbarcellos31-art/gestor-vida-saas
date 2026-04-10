import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const conn = await createConnection(process.env.DATABASE_URL);
  const [cols] = await conn.execute('DESCRIBE expense_entries');
  const names = cols.map(c => c.Field);
  console.log('Colunas atuais:', names.join(', '));

  if (!names.includes('installmentGroupId')) {
    await conn.execute('ALTER TABLE expense_entries ADD COLUMN installmentGroupId varchar(36) NULL');
    console.log('✓ installmentGroupId adicionado');
  } else {
    console.log('- installmentGroupId já existe');
  }
  if (!names.includes('installmentNumber')) {
    await conn.execute('ALTER TABLE expense_entries ADD COLUMN installmentNumber tinyint NULL');
    console.log('✓ installmentNumber adicionado');
  } else {
    console.log('- installmentNumber já existe');
  }
  if (!names.includes('installmentTotal')) {
    await conn.execute('ALTER TABLE expense_entries ADD COLUMN installmentTotal tinyint NULL');
    console.log('✓ installmentTotal adicionado');
  } else {
    console.log('- installmentTotal já existe');
  }

  // Testar inserção completa
  try {
    await conn.execute(
      'INSERT INTO expense_entries (userId, year, month, description, amount, category, rule, paymentMethod) VALUES (1, 2026, 4, ?, 100.00, ?, ?, ?)',
      ['Teste despesa', 'Outros', 'Estilo de Vida (30%)', 'pix_boleto']
    );
    console.log('✓ Inserção de teste OK');
    await conn.execute("DELETE FROM expense_entries WHERE description = 'Teste despesa' AND userId = 1");
    console.log('✓ Limpeza OK');
  } catch (e) {
    console.error('✗ Erro na inserção de teste:', e.message);
  }

  const [newCols] = await conn.execute('DESCRIBE expense_entries');
  console.log('Colunas finais:', newCols.map(c => c.Field).join(', '));
  await conn.end();
}

migrate().catch(e => console.error('Fatal:', e.message));
