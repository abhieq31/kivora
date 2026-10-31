import "server-only";
import { db } from "../db";

export type MonthPoint = { month: string; ppsf: number; n: number };

/** Median price per sq ft by month (sale) or median rent per sq ft (rent). */
export async function trend(kind: "sale" | "rent", city: string, locality?: string) {
  const q = await db();
  return q<MonthPoint>(
    `select to_char(date_trunc('month', date), 'YYYY-MM') as month,
            percentile_cont(0.5) within group (order by price / carpet_sqft)::float as ppsf, count(*)::int as n
     from transactions where kind = $1 and city = $2 and ($3::text is null or locality = $3) and property_type <> 'plot'
       and date > now() - interval '24 months'
     group by 1 order by 1`,
    [kind, city, locality ?? null],
  );
}

export type LocalityStat = {
  locality: string;
  sale_ppsf: number | null;
  rent_ppsf: number | null;
  sales: number;
  rents: number;
  yoy: number | null;
  active_sale: number;
  active_rent: number;
};

export async function localityStats(city: string) {
  const q = await db();
  return q<LocalityStat>(
    `with t as (select * from transactions where city = $1 and property_type <> 'plot')
     select l.locality,
       (select percentile_cont(0.5) within group (order by price / carpet_sqft) from t where t.locality = l.locality and kind = 'sale' and date > now() - interval '6 months')::float as sale_ppsf,
       (select percentile_cont(0.5) within group (order by price / carpet_sqft) from t where t.locality = l.locality and kind = 'rent' and date > now() - interval '6 months')::float as rent_ppsf,
       (select count(*) from t where t.locality = l.locality and kind = 'sale')::int as sales,
       (select count(*) from t where t.locality = l.locality and kind = 'rent')::int as rents,
       ((select percentile_cont(0.5) within group (order by price / carpet_sqft) from t where t.locality = l.locality and kind = 'sale' and date > now() - interval '6 months')
        / nullif((select percentile_cont(0.5) within group (order by price / carpet_sqft) from t where t.locality = l.locality and kind = 'sale' and date between now() - interval '18 months' and now() - interval '12 months'), 0) - 1)::float as yoy,
       (select count(*) from properties p where p.city = $1 and p.locality = l.locality and p.status = 'active' and p.listing_type = 'sale')::int as active_sale,
       (select count(*) from properties p where p.city = $1 and p.locality = l.locality and p.status = 'active' and p.listing_type = 'rent')::int as active_rent
     from (select distinct locality from t) l order by sale_ppsf desc nulls last`,
    [city],
  );
}

export type CityStat = { city: string; sale_ppsf: number | null; rent_ppsf: number | null; active_sale: number; active_rent: number; yoy: number | null };

export async function cityStats() {
  const q = await db();
  return q<CityStat>(
    `select c.city,
       (select percentile_cont(0.5) within group (order by price / carpet_sqft) from transactions t where t.city = c.city and kind = 'sale' and property_type <> 'plot' and date > now() - interval '6 months')::float as sale_ppsf,
       (select percentile_cont(0.5) within group (order by price / carpet_sqft) from transactions t where t.city = c.city and kind = 'rent' and date > now() - interval '6 months')::float as rent_ppsf,
       (select count(*) from properties p where p.city = c.city and p.status = 'active' and p.listing_type = 'sale')::int as active_sale,
       (select count(*) from properties p where p.city = c.city and p.status = 'active' and p.listing_type = 'rent')::int as active_rent,
       ((select percentile_cont(0.5) within group (order by price / carpet_sqft) from transactions t where t.city = c.city and kind = 'sale' and property_type <> 'plot' and date > now() - interval '6 months')
        / nullif((select percentile_cont(0.5) within group (order by price / carpet_sqft) from transactions t where t.city = c.city and kind = 'sale' and property_type <> 'plot' and date between now() - interval '18 months' and now() - interval '12 months'), 0) - 1)::float as yoy
     from (select distinct city from properties) c order by active_sale desc`,
  );
}

export async function cityCounts() {
  const q = await db();
  return q<{ city: string; sale: number; rent: number }>(
    `select city, count(*) filter (where listing_type = 'sale')::int as sale, count(*) filter (where listing_type = 'rent')::int as rent
     from properties where status = 'active' group by city`,
  );
}
