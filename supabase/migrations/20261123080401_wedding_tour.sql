create table public.wedding_candidates (
  id uuid primary key,
  details jsonb not null check (jsonb_typeof(details) = 'object' and octet_length(details::text) <= 120000),
  photo text check (photo is null or (left(photo, 23) = 'data:image/jpeg;base64,' and octet_length(photo) <= 3000000)),
  has_photo boolean generated always as (photo is not null) stored,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now()
);
alter table public.wedding_candidates enable row level security;
revoke all on public.wedding_candidates from public, anon, authenticated;
grant select, insert(id, details, photo, version), update(details, photo, version) on public.wedding_candidates to authenticated;
create policy wedding_shared_read on public.wedding_candidates for select to authenticated using ((select public.is_member()));
create policy wedding_shared_add on public.wedding_candidates for insert to authenticated with check ((select public.is_member()));
create policy wedding_shared_edit on public.wedding_candidates for update to authenticated using ((select public.is_member())) with check ((select public.is_member()));
create table public.wedding_ai_daily (
  user_id uuid not null,
  day date not null,
  uses integer not null check (uses between 1 and 10),
  primary key (user_id, day)
);
alter table public.wedding_ai_daily enable row level security;
revoke all on public.wedding_ai_daily from public, anon, authenticated;
grant select, insert, update on public.wedding_ai_daily to service_role;
create function public.reserve_wedding_comparison(member_id uuid)
returns boolean language sql security invoker set search_path = '' as $$
  with reserved as (
    insert into public.wedding_ai_daily as usage (user_id, day, uses)
    select m.user_id, (now() at time zone 'Asia/Seoul')::date, 1 from public.members m where m.user_id = member_id
    on conflict (user_id, day) do update set uses = usage.uses + 1 where usage.uses < 10
    returning 1
  ) select exists (select 1 from reserved);
$$;
revoke all on function public.reserve_wedding_comparison(uuid) from public, anon, authenticated;
grant execute on function public.reserve_wedding_comparison(uuid) to service_role;
