// lib/db.server.ts
import mysql from 'mysql2/promise';

let globalPool: mysql.Pool | null = null;

function getPool() {
  if (!globalPool) {
    globalPool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      ssl: {
        rejectUnauthorized: true  // Required for Aiven
      }
    });
  }
  return globalPool;
}

export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  const pool = getPool();
  try {
    const [rows] = await pool.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
}