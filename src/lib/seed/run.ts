import { bulkInsert, type Query } from "../db/core";
import { hashPassword } from "../password";
import { generate } from "./generate";

export async function seedDemo(q: Query, log: (s: string) => void = () => {}) {
  const t0 = Date.now();
  const data = generate();

  const users = [
    { email: "admin@kivora.dev", name: "Kivora Admin", role: "admin", pw: process.env.SEED_ADMIN_PASSWORD ?? "kivora-admin" },
    { email: "demo@kivora.dev", name: "Demo Buyer", role: "user", pw: process.env.SEED_DEMO_PASSWORD ?? "kivora-demo" },
    { email: "agent@kivora.dev", name: "Demo Agent", role: "agent", pw: process.env.SEED_DEMO_PASSWORD ?? "kivora-demo" },
  ];
  const userIds: Record<string, number> = {};
  for (const u of users) {
    const [row] = await q<{ id: number }>(
      `insert into users (email, name, role, password_hash) values ($1, $2, $3, $4)
       on conflict (email) do update set role = excluded.role returning id`,
      [u.email, u.name, u.role, await hashPassword(u.pw)],
    );
    userIds[u.email] = row.id;
  }

  const agentRows = await bulkInsert(q, "agents", {
    name: "text", agency: "text", phone: "text", email: "text", city: "text", localities: "text[]", rera_id: "text",
    experience_years: "int", deals_closed: "int", sale_fee: "text", rent_fee: "text", languages: "text[]", bio: "text",
    verified: "boolean", is_demo: "boolean",
  }, data.agents, "id");
  const agentIds = agentRows.map((x) => x.id as number);
  // The demo agent login manages the first agent profile.
  await q("update agents set user_id = $1 where id = $2", [userIds["agent@kivora.dev"], agentIds[0]]);
  log(`agents ${agentIds.length}`);

  await bulkInsert(q, "agent_reviews", { agent_id: "int", author: "text", rating: "int", body: "text", deal_type: "text", created_at: "timestamptz" },
    data.reviews.map(({ agentIndex, ...rv }) => ({ ...rv, agent_id: agentIds[agentIndex] })));

  const projRows = await bulkInsert(q, "projects", {
    name: "text", builder: "text", city: "text", locality: "text", lat: "float8", lng: "float8", rera_id: "text", possession_date: "date",
    status: "text", price_min: "float8", price_max: "float8", configurations: "text[]", amenities: "text[]", towers: "int",
    units_total: "int", land_acres: "float8", description: "text", photos: "text[]", is_demo: "boolean",
  }, data.projects, "id");
  const projectIds = projRows.map((x) => x.id as number);
  log(`projects ${projectIds.length}`);

  const props = data.properties.map((p, i) => ({
    ...p,
    project_id: data.projectRefs[i] >= 0 ? projectIds[data.projectRefs[i]] : null,
    agent_id: data.agentRefs[i] >= 0 ? agentIds[data.agentRefs[i]] : null,
  }));
  const propRows = await bulkInsert(q, "properties", {
    listing_type: "text", status: "text", property_type: "text", description: "text", city: "text", locality: "text", society: "text",
    address: "text", pincode: "text", lat: "float8", lng: "float8", bhk: "int", bathrooms: "int", balconies: "int", carpet_sqft: "int",
    builtup_sqft: "int", super_sqft: "int", floor: "int", total_floors: "int", facing: "text", furnishing: "text", age_years: "int",
    possession: "text", possession_date: "date", price: "float8", deposit: "float8", maintenance_monthly: "float8", negotiable: "boolean",
    parking_covered: "int", parking_open: "int", amenities: "text[]", tenant_pref: "text", pets_allowed: "boolean", ownership: "text",
    rera_id: "text", posted_by: "text", photos: "text[]", available_from: "date", views: "int", verified: "boolean", is_demo: "boolean",
    created_at: "timestamptz", updated_at: "timestamptz", project_id: "int", agent_id: "int",
  }, props, "id");
  const propIds = propRows.map((x) => x.id as number);
  log(`properties ${propIds.length}`);

  await bulkInsert(q, "price_events", { property_id: "int", event: "text", price: "float8", date: "date" },
    data.events.map(({ propertyIndex, ...e }) => ({ ...e, property_id: propIds[propertyIndex] })));

  await bulkInsert(q, "transactions", {
    kind: "text", city: "text", locality: "text", property_type: "text", bhk: "int", carpet_sqft: "int", floor: "int",
    age_years: "int", price: "float8", date: "date", lat: "float8", lng: "float8", source: "text", is_demo: "boolean",
  }, data.transactions);
  log(`transactions ${data.transactions.length} in ${Date.now() - t0}ms`);
}
