-- Apply only to the dedicated Linnarz Immobilien project.
begin;
create table public.catalog_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.catalog_admins enable row level security;
revoke all on public.catalog_admins from anon, authenticated;
grant select on public.catalog_admins to authenticated;
create policy "Admins may read their own membership" on public.catalog_admins for select to authenticated using (user_id=(select auth.uid()));

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (length(reference) between 1 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug)<=120),
  title text not null check (length(title) between 1 and 180),
  type text not null check (type in ('Kauf','Miete')),
  status text not null default 'Verfügbar' check(status in ('Verfügbar','Reserviert','Verkauft','Vermietet')),
  price_amount numeric check(price_amount>=0),
  area numeric check(area>=0), rooms numeric check(rooms>=0),
  description text not null default '' check(length(description)<=20000),
  equipment text not null default '' check(length(equipment)<=12000),
  location text not null default '' check(length(location)<=12000),
  details jsonb not null default '{}' check(jsonb_typeof(details)='object'),
  media_order uuid[] not null default '{}' check(cardinality(media_order)<=60),
  published boolean not null default false,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not published or (length(description)>0 and coalesce(length(details->>'city'),0)>0 and cardinality(media_order)>0))
);
alter table public.properties enable row level security;
revoke all on public.properties from anon, authenticated;
grant select on public.properties to anon, authenticated;
grant insert,update on public.properties to authenticated;
create index properties_published_date on public.properties(created_at desc) where published;
create policy "Published properties are readable" on public.properties for select to anon,authenticated using(published);
create policy "Catalog admins read drafts" on public.properties for select to authenticated using(exists(select 1 from public.catalog_admins where user_id=(select auth.uid())));
create policy "Catalog admins create properties" on public.properties for insert to authenticated with check(exists(select 1 from public.catalog_admins where user_id=(select auth.uid())));
create policy "Catalog admins update properties" on public.properties for update to authenticated using(exists(select 1 from public.catalog_admins where user_id=(select auth.uid()))) with check(exists(select 1 from public.catalog_admins where user_id=(select auth.uid())));

create table public.property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  path text not null unique,
  kind text not null check(kind in ('photo','floorplan')),
  label text not null default '' check(length(label)<=180),
  created_at timestamptz not null default now()
);
create index property_media_property_id on public.property_media(property_id);
alter table public.property_media enable row level security;
revoke all on public.property_media from anon,authenticated;
grant select on public.property_media to anon,authenticated;
grant insert on public.property_media to authenticated;
create policy "Only published selected media are readable" on public.property_media for select to anon,authenticated using(exists(select 1 from public.properties p where p.id=property_id and p.published and property_media.id=any(p.media_order)));
create policy "Catalog admins read all media" on public.property_media for select to authenticated using(exists(select 1 from public.catalog_admins where user_id=(select auth.uid())));
create policy "Catalog admins add media" on public.property_media for insert to authenticated with check(exists(select 1 from public.catalog_admins where user_id=(select auth.uid())));

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('property-media','property-media',false,3000000,array['image/webp']) on conflict(id) do nothing;
create policy "Published selected image objects are readable" on storage.objects for select to anon,authenticated using(bucket_id='property-media' and exists(select 1 from public.property_media m join public.properties p on p.id=m.property_id where m.path=name and p.published and m.id=any(p.media_order)));
create policy "Catalog admins read image objects" on storage.objects for select to authenticated using(bucket_id='property-media' and exists(select 1 from public.catalog_admins where user_id=(select auth.uid())));
create policy "Catalog admins upload image objects" on storage.objects for insert to authenticated with check(bucket_id='property-media' and exists(select 1 from public.catalog_admins where user_id=(select auth.uid())) and exists(select 1 from public.properties p where p.id::text=(storage.foldername(name))[1]));
create policy "Catalog admins clean failed uploads" on storage.objects for delete to authenticated using(bucket_id='property-media' and exists(select 1 from public.catalog_admins where user_id=(select auth.uid())));
commit;
