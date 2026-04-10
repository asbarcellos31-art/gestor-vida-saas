import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const conn = await createConnection(process.env.DATABASE_URL);
  
  // 1. Verificar scheduledDate
  const [cols] = await conn.execute('DESCRIBE tasks');
  const sdCol = cols.find(c => c.Field === 'scheduledDate');
  console.log('scheduledDate atual:', sdCol.Type, 'Null:', sdCol.Null);
  
  if (sdCol.Null === 'NO') {
    // Alterar para nullable
    await conn.execute("ALTER TABLE tasks MODIFY COLUMN scheduledDate varchar(10) NULL DEFAULT NULL");
    console.log('✓ scheduledDate agora é nullable');
  } else {
    console.log('- scheduledDate já é nullable');
  }
  
  // 2. Testar criação de tarefa sem data (backlog)
  try {
    const [r] = await conn.execute(
      "INSERT INTO tasks (userId, title, durationMinutes, category, status, scheduledDate, executedMinutes, isRecurring) VALUES (1, 'Teste backlog', 30, 'important', 'pending', NULL, 0, 0)"
    );
    console.log('✓ Tarefa sem data criada com id:', r.insertId);
    await conn.execute("DELETE FROM tasks WHERE id = ?", [r.insertId]);
    console.log('✓ Limpeza OK');
  } catch (e) {
    console.error('✗ Erro ao criar tarefa sem data:', e.message);
  }
  
  // 3. Verificar tarefas existentes com scheduledDate vazio
  const [emptyDate] = await conn.execute("SELECT COUNT(*) as cnt FROM tasks WHERE scheduledDate = ''");
  console.log('Tarefas com scheduledDate vazio:', emptyDate[0].cnt);
  if (emptyDate[0].cnt > 0) {
    await conn.execute("UPDATE tasks SET scheduledDate = NULL WHERE scheduledDate = ''");
    console.log('✓ Convertido scheduledDate vazio para NULL');
  }
  
  await conn.end();
  console.log('Migração concluída!');
}

migrate().catch(e => console.error('Fatal:', e.message));
