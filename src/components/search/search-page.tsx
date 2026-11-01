import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CITY_BY_SLUG } from "@/lib/geo";
import { parseSearch } from "@/lib/search-params";
import { searchProperties } from "@/lib/queries/properties";
import { getUser } from "@/lib/auth";
import { savedIds } from "@/lib/queries/user";
import type { Mode } from "@/lib/types";
import { SearchView } from "./search-view";

type Props = { params: Promise<{ city?: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export function searchMetadata(mode: Mode) {
  return async ({ params }: Pick<Props, "params">) => {
    const slug = (await params).city?.[0];
    const city = slug ? CITY_BY_SLUG[slug]?.name : null;
    const what = mode === "rent" ? "Flats & houses for rent" : mode === "sold" ? "Recently sold homes" : "Flats & houses for sale";
    return { title: `${what} in ${city ?? "India"}`, description: `${what} in ${city ?? "India"} on a map, with price history, Nakshly Estimates and owner listings.` };
  };
}

export function SearchPage({ mode, ...props }: Props & { mode: Mode }) {
  return (
    <Suspense fallback={<div className="h-[calc(100dvh-4rem)] animate-pulse bg-paper" />}>
      <Results mode={mode} {...props} />
    </Suspense>
  );
}

async function Results({ mode, params, searchParams }: Props & { mode: Mode }) {
  await connection();
  const segs = (await params).city ?? [];
  const slug = segs[0];
  if (segs.length > 1 || (slug && !CITY_BY_SLUG[slug])) notFound();
  const city = slug ? CITY_BY_SLUG[slug] : null;
  const sp = parseSearch(mode, slug, await searchParams);
  const [res, user] = await Promise.all([searchProperties(sp), getUser()]);
  const saved = await savedIds(user?.id);
  return (
    <SearchView
      key={`${mode}-${slug ?? "all"}`}
      initialParams={sp}
      initial={{ ...res, saved: [...saved] }}
      cityName={city?.name ?? null}
      center={city ? [city.lat, city.lng] : [21.5, 79]}
      zoom={city ? 11 : 5}
    />
  );
}
