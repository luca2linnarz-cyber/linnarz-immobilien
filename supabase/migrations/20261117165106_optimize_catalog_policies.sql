alter policy "Published properties are readable" on public.properties to anon;
alter policy "Catalog admins read drafts" on public.properties using(published or exists(select 1 from public.catalog_admins where user_id=(select auth.uid())));
alter policy "Only published selected media are readable" on public.property_media to anon;
alter policy "Catalog admins read all media" on public.property_media using(exists(select 1 from public.catalog_admins where user_id=(select auth.uid())) or exists(select 1 from public.properties p where p.id=property_id and p.published and property_media.id=any(p.media_order)));
