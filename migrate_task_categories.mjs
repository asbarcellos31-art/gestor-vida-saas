import { createConnection } from 'mysql2/promise';

const conn = await createConnection(process.env.DATABASE_URL);

const sqls = [
  // Criar tabela task_categories
  `CREATE TABLE IF NOT EXISTS task_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    name VARCHAR(64) NOT NULL,
    emoji VARCHAR(8) NOT NULL DEFAULT '📋',
    color VARCHAR(32) NOT NULL DEFAULT '#6366f1',
    sortOrder INT NOT NULL DEFAULT 0,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
  )`,

  // Adicionar taskCategoryId na tabela tasks (se não existir)
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS taskCategoryId INT NULL`,

  // Adicionar scheduledTime na tabela tasks (se não existir)
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS scheduledTime VARCHAR(5) NULL`,

  // Adicionar isRecurring na tabela tasks (se não existir)
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS isRecurring BOOLEAN NOT NULL DEFAULT FALSE`,
];

for (const sql of sqls) {
  try {
    await conn.execute(sql);
    console.log('✅ OK:', sql.slice(0, 60) + '...');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('⏭️  Já existe:', sql.slice(0, 60) + '...');
    } else {
      console.error('❌ Erro:', e.message, '\nSQL:', sql.slice(0, 80));
    }
  }
}

await conn.end();
console.log('\n✅ Migração concluída!');
