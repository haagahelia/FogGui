import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { db } from "@/app/api/database";

export async function openDb() {
  return open({
    filename: "./user.db",
    driver: sqlite3.Database,
  });
}

// Promise wrapper for db.run (INSERT, UPDATE, DELETE)
export function dbRun(sql: string, params: any[]): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Promise wrapper for db.all (SELECT multiple rows)
// Returns an array of rows typed as T
export function dbAll<T>(sql: string, params: any[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}
