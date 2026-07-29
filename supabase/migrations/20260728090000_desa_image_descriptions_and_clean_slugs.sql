-- Run once in the Supabase SQL Editor if this migration has not been applied.

-- Descriptions for gallery images belong to desa_images, one row per image.
alter table public.desa_images
  add column if not exists deskripsi text;

-- First use a guaranteed-unique temporary slug. This avoids unique-key conflicts
-- while several existing rows are being renamed.
update public.umkm
set slug = 'temporary-slug-' || id::text;

-- New format: nama-umkm; if another UMKM has the same normalized name,
-- append the UMKM id, for example nama-umkm-12.
with normalized as (
  select
    id,
    coalesce(
      nullif(
        trim(both '-' from regexp_replace(lower(nama), '[^a-z0-9]+', '-', 'g')),
        ''
      ),
      'umkm'
    ) as base_slug
  from public.umkm
), ranked as (
  select
    id,
    base_slug,
    count(*) over (partition by base_slug) as duplicate_count
  from normalized
)
update public.umkm as target
set slug = case
  when ranked.duplicate_count > 1 then ranked.base_slug || '-' || ranked.id::text
  else ranked.base_slug
end
from ranked
where target.id = ranked.id;
