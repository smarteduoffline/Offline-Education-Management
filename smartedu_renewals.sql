-- Smart Edu: Subscription renewal requests, Super Admin approval
-- এবং approval হলে স্বয়ংক্রিয় subscription expiry update
--
-- Supabase SQL Editor-এ পুরো ফাইলটি একবারে চালান।
-- এই স্ক্রিপ্টটি পুনরায় চালানো নিরাপদ রাখার চেষ্টা করা হয়েছে।
--
-- গুরুত্বপূর্ণ:
--   1) Approval হলে public.smartedu_subscriptions.expires_at আপডেট হবে।
--   2) আপনার অ্যাপের access-check অংশে এই টেবিলের expires_at ব্যবহার করুন।
--   3) Super Admin-এর email নিচের দুই জায়গায় একই রাখতে হবে।

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- 1) Subscription state table
-- -----------------------------------------------------------------------------
-- এই টেবিলটি renewal approval-এর ফলাফল সংরক্ষণ করে।
-- একজন user একই institution-এর জন্য একটি subscription row পাবে।
create table if not exists public.smartedu_subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  inst_id            text not null,
  inst_name          text,
  expires_at         timestamptz not null,
  last_renewal_id    uuid,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint smartedu_subscriptions_inst_id_nonblank
    check (length(trim(inst_id)) > 0)
);

create unique index if not exists smartedu_subscriptions_user_inst_uq
  on public.smartedu_subscriptions (user_id, inst_id);

create index if not exists smartedu_subscriptions_user_idx
  on public.smartedu_subscriptions (user_id);

-- -----------------------------------------------------------------------------
-- 2) Renewal request table
-- -----------------------------------------------------------------------------
create table if not exists public.smartedu_renewals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  user_email text,
  inst_id    text not null,
  inst_name  text,
  months     int not null check (months between 1 and 36),
  amount     numeric,
  paid       numeric,
  method     text,
  txn        text not null,
  note       text,
  status     text not null default 'pending'
             check (status in ('pending', 'approved', 'rejected')),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

-- পুরোনো/আগে তৈরি table-এও validation যোগ করা
-- (constraint আগে থেকে থাকলে আবার যোগ হবে না)।
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'smartedu_renewals_inst_id_nonblank'
      and conrelid = 'public.smartedu_renewals'::regclass
  ) then
    alter table public.smartedu_renewals
      add constraint smartedu_renewals_inst_id_nonblank
      check (length(trim(inst_id)) > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'smartedu_renewals_amount_nonnegative'
      and conrelid = 'public.smartedu_renewals'::regclass
  ) then
    alter table public.smartedu_renewals
      add constraint smartedu_renewals_amount_nonnegative
      check (amount is null or amount >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'smartedu_renewals_paid_nonnegative'
      and conrelid = 'public.smartedu_renewals'::regclass
  ) then
    alter table public.smartedu_renewals
      add constraint smartedu_renewals_paid_nonnegative
      check (paid is null or paid >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'smartedu_renewals_txn_nonblank'
      and conrelid = 'public.smartedu_renewals'::regclass
  ) then
    alter table public.smartedu_renewals
      add constraint smartedu_renewals_txn_nonblank
      check (length(trim(txn)) > 0);
  end if;
end $$;

-- rejected request-এর TXN পুনরায় ব্যবহার করা যাবে;
-- অন্য status-এর ক্ষেত্রে trim/lower করা TXN unique থাকবে।
drop index if exists public.smartedu_renewals_txn_uq;
create unique index if not exists smartedu_renewals_txn_uq
  on public.smartedu_renewals (lower(trim(txn)))
  where status <> 'rejected';

create index if not exists smartedu_renewals_user_idx
  on public.smartedu_renewals (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- 3) Direct table access বন্ধ
-- -----------------------------------------------------------------------------
alter table public.smartedu_renewals enable row level security;
alter table public.smartedu_subscriptions enable row level security;

revoke all on table public.smartedu_renewals from public, anon, authenticated;
revoke all on table public.smartedu_subscriptions from public, anon, authenticated;

-- আগে তৈরি policies থাকলে সরানো হচ্ছে। কোনো policy না থাকলে direct access বন্ধই থাকবে।
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('smartedu_renewals', 'smartedu_subscriptions')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      r.policyname, r.schemaname, r.tablename
    );
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- 4) Approval হলে subscription expiry update করার trigger
-- -----------------------------------------------------------------------------
create or replace function public.smartedu_apply_renewal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- শুধু pending থেকে approved হওয়ার সময় renewal apply হবে।
  if old.status = 'pending' and new.status = 'approved' then
    insert into public.smartedu_subscriptions
      (user_id, inst_id, inst_name, expires_at, last_renewal_id, updated_at)
    values
      (
        new.user_id,
        trim(new.inst_id),
        left(new.inst_name, 200),
        greatest(now(), now()) + make_interval(months => new.months),
        new.id,
        now()
      )
    on conflict (user_id, inst_id) do update
      set inst_name       = coalesce(excluded.inst_name,
                                     public.smartedu_subscriptions.inst_name),
          -- subscription এখনও active থাকলে তার বর্তমান expiry থেকে যোগ হবে;
          -- expired হলে আজ থেকে নতুন মেয়াদ শুরু হবে।
          expires_at      = greatest(
                              public.smartedu_subscriptions.expires_at,
                              now()
                            ) + make_interval(months => new.months),
          last_renewal_id = excluded.last_renewal_id,
          updated_at      = now();
  end if;

  return new;
end;
$$;

drop trigger if exists smartedu_apply_renewal_after_decision
  on public.smartedu_renewals;

create trigger smartedu_apply_renewal_after_decision
after update of status on public.smartedu_renewals
for each row
when (old.status is distinct from new.status)
execute function public.smartedu_apply_renewal();

-- -----------------------------------------------------------------------------
-- 5) Renewal request submit function
-- -----------------------------------------------------------------------------
drop function if exists public.smartedu_submit_renewal(
  text, text, int, numeric, numeric, text, text, text
);

create function public.smartedu_submit_renewal(
  p_inst_id   text,
  p_inst_name text,
  p_months    int,
  p_amount    numeric,
  p_paid      numeric,
  p_method    text,
  p_txn       text,
  p_note      text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  clean_inst_id text := trim(coalesce(p_inst_id, ''));
  clean_txn text := trim(coalesce(p_txn, ''));
begin
  if auth.uid() is null then
    raise exception 'login required';
  end if;

  if length(clean_inst_id) = 0 then
    raise exception 'institution ID is required';
  end if;

  if p_months is null or p_months not between 1 and 36 then
    raise exception 'months must be between 1 and 36';
  end if;

  if p_amount is null or p_amount < 0 then
    raise exception 'amount must be zero or greater';
  end if;

  if p_paid is null or p_paid < 0 then
    raise exception 'paid amount must be zero or greater';
  end if;

  if length(clean_txn) = 0 then
    raise exception 'transaction ID is required';
  end if;

  insert into public.smartedu_renewals
    (user_id, user_email, inst_id, inst_name, months, amount, paid,
     method, txn, note)
  values
    (
      auth.uid(),
      lower(auth.jwt() ->> 'email'),
      left(clean_inst_id, 200),
      left(nullif(trim(p_inst_name), ''), 200),
      p_months,
      p_amount,
      p_paid,
      left(nullif(trim(p_method), ''), 40),
      left(clean_txn, 60),
      left(nullif(trim(p_note), ''), 500)
    )
  returning id into new_id;

  return new_id;
exception
  when unique_violation then
    raise exception 'this transaction ID is already used by an active request';
end;
$$;

-- -----------------------------------------------------------------------------
-- 6) নিজের renewal request-এর status দেখা
-- -----------------------------------------------------------------------------
drop function if exists public.smartedu_renewal_status(uuid[]);

create function public.smartedu_renewal_status(ids uuid[])
returns table (id uuid, status text, months int, decided_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'login required';
  end if;

  return query
    select r.id, r.status, r.months, r.decided_at
    from public.smartedu_renewals r
    where r.id = any(coalesce(ids, '{}'::uuid[]))
      and r.user_id = auth.uid();
end;
$$;

-- -----------------------------------------------------------------------------
-- 7) Super Admin-এর জন্য renewal list
-- -----------------------------------------------------------------------------
drop function if exists public.smartedu_list_renewals();

create function public.smartedu_list_renewals()
returns table (
  id uuid, user_email text, inst_id text, inst_name text, months int,
  amount numeric, paid numeric, method text, txn text, note text,
  status text, created_at timestamptz, decided_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) not in
     ('tofsirahmedparvez@gmail.com', 'tofsirahmedparvez1@gmail.com') then
    raise exception 'not allowed';
  end if;

  return query
    select r.id, r.user_email, r.inst_id, r.inst_name, r.months,
           r.amount, r.paid, r.method, r.txn, r.note,
           r.status, r.created_at, r.decided_at
    from public.smartedu_renewals r
    order by (r.status = 'pending') desc, r.created_at desc
    limit 200;
end;
$$;

-- -----------------------------------------------------------------------------
-- 8) Super Admin approval/rejection
--    approved হলে trigger স্বয়ংক্রিয়ভাবে subscription update করবে।
-- -----------------------------------------------------------------------------
drop function if exists public.smartedu_decide_renewal(uuid, boolean);

create function public.smartedu_decide_renewal(
  rid uuid,
  approve boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) not in
     ('tofsirahmedparvez@gmail.com', 'tofsirahmedparvez1@gmail.com') then
    raise exception 'not allowed';
  end if;

  if approve is null then
    raise exception 'approval decision is required';
  end if;

  update public.smartedu_renewals
     set status = case when approve then 'approved' else 'rejected' end,
         decided_at = now()
   where id = rid
     and status = 'pending';

  return found;
end;
$$;

-- -----------------------------------------------------------------------------
-- 9) Function permissions
-- -----------------------------------------------------------------------------
revoke all on function public.smartedu_submit_renewal(
  text, text, int, numeric, numeric, text, text, text
) from public, anon;

revoke all on function public.smartedu_renewal_status(uuid[])
  from public, anon;

revoke all on function public.smartedu_list_renewals()
  from public, anon;

revoke all on function public.smartedu_decide_renewal(uuid, boolean)
  from public, anon;

grant execute on function public.smartedu_submit_renewal(
  text, text, int, numeric, numeric, text, text, text
) to authenticated;

grant execute on function public.smartedu_renewal_status(uuid[])
  to authenticated;

grant execute on function public.smartedu_list_renewals()
  to authenticated;

grant execute on function public.smartedu_decide_renewal(uuid, boolean)
  to authenticated;

-- Subscription-এর expiry frontend/backend থেকে পড়ার জন্য আলাদা নিরাপদ function
-- (শুধু বর্তমান user-এর নিজের subscription ফেরত দেয়)।
drop function if exists public.smartedu_my_subscriptions();

create function public.smartedu_my_subscriptions()
returns table (
  inst_id text,
  inst_name text,
  expires_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'login required';
  end if;

  return query
    select s.inst_id, s.inst_name, s.expires_at, s.updated_at
    from public.smartedu_subscriptions s
    where s.user_id = auth.uid()
    order by s.expires_at desc;
end;
$$;

revoke all on function public.smartedu_my_subscriptions()
  from public, anon;
grant execute on function public.smartedu_my_subscriptions()
  to authenticated;
