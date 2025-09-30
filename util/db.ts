/* eslint-disable @typescript-eslint/no-explicit-any */
import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  user: "postgres",
  host: "db.docuhub.me",
  database: "db_docuhub",
  password: "qwer",
  port: 5400,
});

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}
