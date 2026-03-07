import { SQLiteBindValue } from "expo-sqlite";
import { getDb } from "./client";

export const allAsync = async <T>(sql: string, params: SQLiteBindValue[] = []): Promise<T[]> => {
  const db = await getDb();
  return db.getAllAsync<T>(sql, params);
};

export const getAsync = async <T>(sql: string, params: SQLiteBindValue[] = []): Promise<T | null> => {
  const db = await getDb();
  return db.getFirstAsync<T>(sql, params);
};

export const runAsync = async (sql: string, params: SQLiteBindValue[] = []): Promise<number> => {
  const db = await getDb();
  const result = await db.runAsync(sql, params);
  return result.lastInsertRowId;
};
