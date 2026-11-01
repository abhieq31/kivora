// Idempotent schema. Prices are double precision so values above ₹21 Cr stay JS numbers.
export const SCHEMA = `
create table if not exists users (
  id serial primary key,
  created_at timestamptz not null default now(),
  email text not null unique,
  name text not null,
  phone text,
  password_hash text not null,
  role text not null default 'user'
);
create table if not exists sessions (
  id text primary key,
  user_id int not null references users(id) on delete cascade,
  expires_at timestamptz not null
);
create table if not exists agents (
  id serial primary key,
  created_at timestamptz not null default now(),
  user_id int references users(id) on delete set null,
  name text not null,
  agency text not null default '',
  phone text not null,
  email text not null default '',
  city text not null,
  localities text[] not null default '{}',
  rera_id text not null default '',
  experience_years int not null default 0,
  deals_closed int not null default 0,
  sale_fee text not null default '',
  rent_fee text not null default '',
  languages text[] not null default '{}',
  bio text not null default '',
  verified boolean not null default false,
  is_demo boolean not null default false
);
create table if not exists agent_reviews (
  id serial primary key,
  created_at timestamptz not null default now(),
  agent_id int not null references agents(id) on delete cascade,
  user_id int references users(id) on delete set null,
  author text not null,
  rating int not null check (rating between 1 and 5),
  body text not null default '',
  deal_type text not null default 'buy'
);
create table if not exists projects (
  id serial primary key,
  created_at timestamptz not null default now(),
  name text not null,
  builder text not null,
  city text not null,
  locality text not null,
  lat double precision not null,
  lng double precision not null,
  rera_id text not null default '',
  possession_date date,
  status text not null default 'under_construction',
  price_min double precision not null,
  price_max double precision not null,
  configurations text[] not null default '{}',
  amenities text[] not null default '{}',
  towers int,
  units_total int,
  land_acres double precision,
  description text not null default '',
  photos text[] not null default '{}',
  is_demo boolean not null default false
);
create table if not exists properties (
  id serial primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  listing_type text not null,
  status text not null default 'active',
  property_type text not null,
  title text not null default '',
  description text not null default '',
  city text not null,
  locality text not null,
  address text not null default '',
  society text not null default '',
  pincode text not null default '',
  lat double precision not null,
  lng double precision not null,
  bhk int not null default 0,
  bathrooms int not null default 0,
  balconies int not null default 0,
  carpet_sqft int not null,
  builtup_sqft int,
  super_sqft int,
  floor int,
  total_floors int,
  facing text not null default '',
  furnishing text not null default 'unfurnished',
  age_years int,
  possession text not null default 'ready',
  possession_date date,
  price double precision not null,
  deposit double precision,
  maintenance_monthly double precision,
  negotiable boolean not null default false,
  parking_covered int not null default 0,
  parking_open int not null default 0,
  amenities text[] not null default '{}',
  tenant_pref text not null default 'any',
  pets_allowed boolean not null default false,
  ownership text not null default 'freehold',
  rera_id text not null default '',
  posted_by text not null default 'owner',
  owner_id int references users(id) on delete set null,
  agent_id int references agents(id) on delete set null,
  project_id int references projects(id) on delete set null,
  photos text[] not null default '{}',
  available_from date,
  views int not null default 0,
  verified boolean not null default false,
  is_demo boolean not null default false
);
create index if not exists properties_search on properties (city, listing_type, status);
create index if not exists properties_geo on properties (lat, lng);
create table if not exists price_events (
  id serial primary key,
  property_id int not null references properties(id) on delete cascade,
  event text not null,
  price double precision not null,
  date date not null
);
create index if not exists price_events_property on price_events (property_id, date);
create table if not exists transactions (
  id serial primary key,
  kind text not null,
  city text not null,
  locality text not null,
  property_type text not null,
  bhk int not null,
  carpet_sqft int not null,
  floor int,
  age_years int,
  price double precision not null,
  date date not null,
  lat double precision not null,
  lng double precision not null,
  source text not null default 'demo',
  is_demo boolean not null default true
);
create index if not exists transactions_city on transactions (city, kind, locality, date);
create table if not exists saved_homes (
  user_id int not null references users(id) on delete cascade,
  property_id int not null references properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);
create table if not exists saved_searches (
  id serial primary key,
  user_id int not null references users(id) on delete cascade,
  name text not null,
  path text not null,
  notify boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists inquiries (
  id serial primary key,
  created_at timestamptz not null default now(),
  property_id int references properties(id) on delete set null,
  agent_id int references agents(id) on delete set null,
  project_id int references projects(id) on delete set null,
  from_user_id int references users(id) on delete set null,
  to_user_id int references users(id) on delete set null,
  kind text not null default 'contact',
  name text not null,
  phone text not null,
  email text not null default '',
  tour_date date,
  tour_mode text,
  status text not null default 'new'
);
create table if not exists messages (
  id serial primary key,
  inquiry_id int not null references inquiries(id) on delete cascade,
  sender_id int references users(id) on delete set null,
  sender_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create table if not exists renter_profiles (
  user_id int primary key references users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  occupation text not null default '',
  employer text not null default '',
  monthly_income double precision,
  household text not null default '',
  occupants int not null default 1,
  move_in date,
  pets boolean not null default false,
  vegetarian boolean,
  about text not null default '',
  updated_at timestamptz not null default now()
);
create table if not exists applications (
  id serial primary key,
  created_at timestamptz not null default now(),
  property_id int not null references properties(id) on delete cascade,
  user_id int not null references users(id) on delete cascade,
  status text not null default 'submitted',
  note text not null default '',
  unique (property_id, user_id)
);
create table if not exists leases (
  id serial primary key,
  created_at timestamptz not null default now(),
  landlord_id int not null references users(id) on delete cascade,
  property_id int references properties(id) on delete set null,
  label text not null,
  tenant_name text not null,
  tenant_phone text not null,
  rent double precision not null,
  deposit double precision not null default 0,
  due_day int not null default 5,
  start_date date not null,
  end_date date not null,
  escalation_pct double precision not null default 5
);
create table if not exists rent_payments (
  id serial primary key,
  lease_id int not null references leases(id) on delete cascade,
  month date not null,
  amount double precision not null,
  paid_on date,
  method text not null default 'UPI',
  unique (lease_id, month)
);
create table if not exists loan_leads (
  id serial primary key,
  created_at timestamptz not null default now(),
  user_id int references users(id) on delete set null,
  name text not null,
  phone text not null,
  city text not null,
  monthly_income double precision,
  loan_amount double precision,
  employment text not null default 'salaried'
);
create table if not exists home_owners (
  id serial primary key,
  created_at timestamptz not null default now(),
  user_id int not null references users(id) on delete cascade,
  city text not null,
  locality text not null,
  property_type text not null,
  bhk int not null,
  carpet_sqft int not null,
  floor int,
  age_years int,
  label text not null default 'My home'
);
-- Added after launch: keep these as idempotent alters so existing databases upgrade in place.
alter table properties add column if not exists survey_no text not null default '';
alter table users add column if not exists ref_code text unique;
alter table users add column if not exists referred_by int references users(id) on delete set null;
create table if not exists service_requests (
  id serial primary key,
  created_at timestamptz not null default now(),
  user_id int references users(id) on delete set null,
  service text not null,
  name text not null,
  phone text not null,
  city text not null default '',
  property_id int references properties(id) on delete set null,
  notes text not null default '',
  price double precision,
  status text not null default 'new'
);
create table if not exists share_events (
  id serial primary key,
  created_at timestamptz not null default now(),
  property_id int references properties(id) on delete cascade,
  channel text not null
);
create table if not exists agreements (
  id serial primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by int not null references users(id) on delete cascade,
  landlord_id int references users(id) on delete set null,
  tenant_id int references users(id) on delete set null,
  property_id int references properties(id) on delete set null,
  state text not null,
  city text not null,
  terms jsonb not null,
  token text not null unique,
  landlord_accepted_at timestamptz,
  tenant_accepted_at timestamptz,
  steps jsonb not null default '{}'
);
create table if not exists agreement_notes (
  id serial primary key,
  created_at timestamptz not null default now(),
  agreement_id int not null references agreements(id) on delete cascade,
  user_id int not null references users(id) on delete cascade,
  kind text not null default 'note',
  body text not null
);
create table if not exists tenancy_reviews (
  id serial primary key,
  created_at timestamptz not null default now(),
  agreement_id int not null references agreements(id) on delete cascade,
  author_id int not null references users(id) on delete cascade,
  about text not null,
  rating int not null check (rating between 1 and 5),
  body text not null default '',
  unique (agreement_id, author_id)
);
create table if not exists login_attempts (
  key text not null,
  at timestamptz not null default now()
);
create index if not exists login_attempts_key on login_attempts (key, at);
`;

export function statements(sql: string) {
  return sql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}
