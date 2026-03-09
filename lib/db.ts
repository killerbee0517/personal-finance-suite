import mysql from "mysql2/promise";

const baseConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
};

export const dbName = process.env.DB_NAME || "personal_finance_desktop";

export const adminPool = mysql.createPool({
  ...baseConfig,
  waitForConnections: true,
  connectionLimit: 5,
});

export const pool = mysql.createPool({
  ...baseConfig,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
});

export async function sql<T>(query: string, params: unknown[] = []) {
  const [rows] = await pool.query(query, params);
  return rows as T[];
}
