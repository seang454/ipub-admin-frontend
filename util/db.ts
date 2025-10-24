import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  user: "postgres",
  host: "db.docuhub.me",
  database: "db_docuhub",
  password: "qwer",
  port: 5400,
});

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}
