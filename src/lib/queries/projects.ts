import "server-only";
import { db } from "../db";

export type Project = {
  id: number;
  name: string;
  builder: string;
  city: string;
  locality: string;
  lat: number;
  lng: number;
  rera_id: string;
  possession_date: string | null;
  status: string;
  price_min: number;
  price_max: number;
  configurations: string[];
  amenities: string[];
  towers: number | null;
  units_total: number | null;
  land_acres: number | null;
  description: string;
  photos: string[];
  is_demo: boolean;
  listings: number;
};

export async function searchProjects(opts: { city?: string; status?: string; config?: string }) {
  const q = await db();
  return q<Project>(
    `select pr.*, (select count(*)::int from properties p where p.project_id = pr.id and p.status = 'active') as listings from projects pr
     where ($1::text is null or pr.city = $1) and ($2::text is null or pr.status = $2) and ($3::text is null or $3 = any(pr.configurations))
     order by pr.possession_date asc nulls last limit 60`,
    [opts.city ?? null, opts.status ?? null, opts.config ?? null],
  );
}

export async function getProject(id: number) {
  const q = await db();
  const [p] = await q<Project>(
    "select pr.*, (select count(*)::int from properties p where p.project_id = pr.id and p.status = 'active') as listings from projects pr where pr.id = $1",
    [id],
  );
  return p ?? null;
}
