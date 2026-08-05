import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

await conn.execute(`
  CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(128),
    planName VARCHAR(128),
    planPrice VARCHAR(16),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log("✅ Tabela leads criada/verificada.");
await conn.end();
