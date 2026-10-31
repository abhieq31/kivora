export type Mode = "buy" | "rent" | "sold";

export type CardListing = {
  id: number;
  listing_type: "sale" | "rent";
  status: string;
  property_type: string;
  bhk: number;
  bathrooms: number;
  carpet_sqft: number;
  super_sqft: number | null;
  price: number;
  city: string;
  locality: string;
  society: string;
  photos: string[];
  lat: number;
  lng: number;
  created_at: string;
  posted_by: string;
  verified: boolean;
  is_demo: boolean;
  possession: string;
  furnishing: string;
  closed_on?: string | null;
  price_cut?: number | null;
};

export type Pin = { id: number; lat: number; lng: number; price: number; listing_type: "sale" | "rent"; status: string };

export type SearchParams = {
  mode: Mode;
  city?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  types?: string[];
  furnishing?: string;
  possession?: string;
  postedBy?: string;
  minSqft?: number;
  maxSqft?: number;
  tenant?: string;
  verified?: boolean;
  bounds?: { n: number; s: number; e: number; w: number };
  sort?: string;
  page?: number;
};

export const PROPERTY_TYPES: Record<string, string> = {
  apartment: "Apartment",
  builder_floor: "Builder floor",
  independent_house: "Independent house",
  villa: "Villa",
  plot: "Plot",
};

export const FURNISHING_LABEL: Record<string, string> = { unfurnished: "Unfurnished", semi: "Semi-furnished", full: "Fully furnished" };
export const TENANT_LABEL: Record<string, string> = { any: "Anyone", family: "Family", bachelors: "Bachelors", women: "Women only" };
export const POSTED_BY_LABEL: Record<string, string> = { owner: "Owner", agent: "Agent", builder: "Builder" };
