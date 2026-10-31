import "server-only";
import { connect, migrate, type Query } from "./core";

const g = globalThis as unknown as { __kivoraDb?: Promise<Query> };

async function init() {
  const q = await connect();
  await migrate(q);
  // Local dev convenience: seed demo data automatically into an empty embedded database.
  if (!process.env.DATABASE_URL || process.env.AUTO_SEED === "1") {
    const [{ n }] = await q<{ n: number }>("select count(*)::int as n from properties");
    if (n === 0) {
      const { seedDemo } = await import("../seed/run");
      await seedDemo(q);
    }
  }
  return q;
}

export function db(): Promise<Query> {
  g.__kivoraDb ??= init().catch((e) => {
    g.__kivoraDb = undefined;
    throw e;
  });
  return g.__kivoraDb;
}

export type { Query };
