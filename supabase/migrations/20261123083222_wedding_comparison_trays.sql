create table public.wedding_comparison_trays (
  member_id uuid primary key references auth.users(id) on delete cascade,
  candidate_ids uuid[] not null check (cardinality(candidate_ids) <= 3),
  revision integer not null check (revision > 0)
);
alter table public.wedding_comparison_trays enable row level security;
revoke all on public.wedding_comparison_trays from public, anon, authenticated;
grant select, insert(member_id, candidate_ids, revision), update(candidate_ids, revision)
  on public.wedding_comparison_trays to authenticated;
create policy tray_read on public.wedding_comparison_trays for select to authenticated
  using (member_id = (select auth.uid()) and (select public.is_member()));
create policy tray_create on public.wedding_comparison_trays for insert to authenticated
  with check (member_id = (select auth.uid()) and (select public.is_member()));
create policy tray_edit on public.wedding_comparison_trays for update to authenticated
  using (member_id = (select auth.uid()) and (select public.is_member()))
  with check (member_id = (select auth.uid()) and (select public.is_member()));
