// Database access usable both from Next.js and from node scripts (no "server-only").
import { SCHEMA, statements } from "./schema";

export type Row = Record<string, unknown>;
export type Query = <T = Row>(text: string, params?: unknown[]) => Promise<T[]>;

export async function connect(): Promise<Query> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    return (text, params = []) => sql.query(text, params) as never;
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { mkdirSync } = await import("node:fs");
  const dir = process.env.PGLITE_DIR ?? "./.data/pglite";
  mkdirSync(dir, { recursive: true });
  const pg = new PGlite(dir);
  return async (text, params = []) => (await pg.query(text, params)).rows as never;
}

export async function migrate(q: Query) {
  for (const s of statements(SCHEMA)) await q(s);
}

/** Insert many rows with one statement per chunk using jsonb_to_recordset. */
export async function bulkInsert(q: Query, table: string, columns: Record<string, string>, rows: Row[], returning?: string) {
  const out: Row[] = [];
  const cols = Object.keys(columns);
  const def = cols.map((c) => `${c} ${columns[c]}`).join(", ");
  for (let i = 0; i < rows.length; i += 400) {
    const chunk = rows.slice(i, i + 400);
    const res = await q(
      `insert into ${table} (${cols.join(", ")})
       select ${cols.join(", ")} from jsonb_to_recordset($1::jsonb) as x(${def})
       ${returning ? `returning ${returning}` : ""}`,
      [JSON.stringify(chunk)],
    );
    out.push(...res);
  }
  return out;
}
