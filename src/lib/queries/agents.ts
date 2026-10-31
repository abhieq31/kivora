import "server-only";
import { db } from "../db";

export type AgentCard = {
  id: number;
  name: string;
  agency: string;
  phone: string;
  email: string;
  city: string;
  localities: string[];
  rera_id: string;
  experience_years: number;
  deals_closed: number;
  sale_fee: string;
  rent_fee: string;
  languages: string[];
  bio: string;
  verified: boolean;
  is_demo: boolean;
  user_id: number | null;
  rating: number | null;
  reviews: number;
  active: number;
};

const AGENT_COLS = `a.*,
  (select round(avg(rating)::numeric, 1)::float from agent_reviews r where r.agent_id = a.id) as rating,
  (select count(*)::int from agent_reviews r where r.agent_id = a.id) as reviews,
  (select count(*)::int from properties p where p.agent_id = a.id and p.status = 'active') as active`;

export async function searchAgents(opts: { city?: string; q?: string; sort?: string }) {
  const q = await db();
  const order = opts.sort === "deals" ? "a.deals_closed desc" : opts.sort === "experience" ? "a.experience_years desc" : "rating desc nulls last, reviews desc";
  return q<AgentCard>(
    `select ${AGENT_COLS} from agents a
     where ($1::text is null or a.city = $1)
       and ($2::text is null or a.name ilike $2 or a.agency ilike $2 or exists (select 1 from unnest(a.localities) l where l ilike $2))
     order by a.verified desc, ${order} limit 60`,
    [opts.city ?? null, opts.q ? `%${opts.q}%` : null],
  );
}

export async function getAgent(id: number) {
  const q = await db();
  const [a] = await q<AgentCard>(`select ${AGENT_COLS} from agents a where a.id = $1`, [id]);
  return a ?? null;
}

export async function agentForUser(userId: number) {
  const q = await db();
  const [a] = await q<AgentCard>(`select ${AGENT_COLS} from agents a where a.user_id = $1`, [userId]);
  return a ?? null;
}

export async function agentReviews(id: number) {
  const q = await db();
  return q<{ id: number; author: string; rating: number; body: string; deal_type: string; created_at: string }>(
    "select id, author, rating, body, deal_type, created_at from agent_reviews where agent_id = $1 order by created_at desc limit 50",
    [id],
  );
}
