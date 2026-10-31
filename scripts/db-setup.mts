// Create tables and (optionally) load demo data.
//   npm run db:setup          -> schema only
//   npm run db:setup -- --demo -> schema + demo data (skips if properties already exist)
import { connect, migrate } from "../src/lib/db/core";
import { seedDemo } from "../src/lib/seed/run";

const q = await connect();
await migrate(q);
console.log("schema ready");
if (process.argv.includes("--demo")) {
  const [{ n }] = await q<{ n: number }>("select count(*)::int as n from properties");
  if (n > 0) console.log(`skipping demo seed: ${n} properties already exist`);
  else await seedDemo(q, (s) => console.log(s));
}
process.exit(0);
