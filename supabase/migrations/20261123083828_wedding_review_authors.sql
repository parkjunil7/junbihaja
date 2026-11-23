-- review1 belongs to member slot 1 (준일), review2 to slot 2 (지영).
create function public.check_wedding_review_author()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare
  previous_details jsonb := '{}'::jsonb;
  other_review text;
begin
  if auth.uid() is null then return new; end if;
  if tg_op = 'UPDATE' then previous_details := old.details; end if;
  if coalesce(new.details->>'review1','') = coalesce(previous_details->>'review1','')
    and coalesce(new.details->>'review2','') = coalesce(previous_details->>'review2','') then
    return new;
  end if;
  select case m.slot when 1 then 'review2' when 2 then 'review1' end
    into other_review from public.members m where m.user_id = auth.uid();
  if other_review is null or coalesce(new.details->>other_review,'') <> coalesce(previous_details->>other_review,'') then
    raise exception '본인 후기만 수정할 수 있어요.' using errcode = '42501';
  end if;
  return new;
end $$;
revoke all on function public.check_wedding_review_author() from public, anon, authenticated;
create trigger wedding_review_author before insert or update of details on public.wedding_candidates
for each row execute function public.check_wedding_review_author();
