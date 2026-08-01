-- Phase 9: atomic user investment requests and protected per-investment earnings.

alter table public.user_investments
  add column earnings_amount numeric(38,18) not null default 0
    check (earnings_amount >= 0);

drop policy investment_plans_authenticated_access on public.investment_plans;
create policy investment_plans_authenticated_access on public.investment_plans for select to authenticated
  using (
    status = 'active'
    or public.has_admin_permission('plans.manage')
    or exists (
      select 1 from public.user_investments ui
      where ui.plan_id = investment_plans.id
        and ui.user_id = auth.uid()
    )
  );

create function public.request_user_investment(
  p_plan_id uuid,
  p_amount numeric,
  p_currency text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  profile_status public.account_status;
  plan_record public.investment_plans%rowtype;
  wallet_record public.wallet_accounts%rowtype;
  investment_id uuid := gen_random_uuid();
  transaction_id uuid := gen_random_uuid();
  resulting_available numeric(38,18);
begin
  if caller_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select status into profile_status
  from public.profiles
  where id = caller_id;
  if profile_status is null or profile_status <> 'active' then
    raise exception 'account is not eligible to request investments' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.account_restrictions
    where user_id = caller_id and active
      and type in ('investment', 'account')
      and starts_at <= now()
      and (expires_at is null or expires_at > now())
  ) then
    raise exception 'investment actions are restricted' using errcode = '42501';
  end if;

  select * into plan_record
  from public.investment_plans
  where id = p_plan_id
  for update;
  if not found or plan_record.status <> 'active' then
    raise exception 'investment plan is unavailable' using errcode = '22000';
  end if;
  if plan_record.available_from is not null and plan_record.available_from > now() then
    raise exception 'investment plan is not yet available' using errcode = '22000';
  end if;
  if plan_record.available_until is not null and plan_record.available_until <= now() then
    raise exception 'investment plan is no longer available' using errcode = '22000';
  end if;
  if p_amount is null or p_amount <= 0
    or p_amount < plan_record.minimum_amount
    or (plan_record.maximum_amount is not null and p_amount > plan_record.maximum_amount) then
    raise exception 'investment amount is outside plan limits' using errcode = '22003';
  end if;
  if p_currency is null or p_currency <> plan_record.currency then
    raise exception 'investment currency does not match plan' using errcode = '22000';
  end if;
  if plan_record.participant_limit is not null and (
    select count(*) from public.user_investments
    where plan_id = plan_record.id
      and status not in ('cancelled', 'rejected')
  ) >= plan_record.participant_limit then
    raise exception 'investment plan participant limit has been reached' using errcode = '22000';
  end if;

  select * into wallet_record
  from public.wallet_accounts
  where user_id = caller_id and currency = plan_record.currency
  for update;
  if not found then
    raise exception 'matching wallet account not found' using errcode = 'P0002';
  end if;
  if wallet_record.available_balance < p_amount then
    raise exception 'insufficient available funds' using errcode = '22003';
  end if;
  if exists (
    select 1 from public.user_investments
    where user_id = caller_id
      and plan_id = plan_record.id
      and amount = p_amount
      and status in ('pending', 'awaiting_funding', 'under_review', 'active')
  ) then
    raise exception 'duplicate investment request' using errcode = '23505';
  end if;

  resulting_available := wallet_record.available_balance - p_amount;

  insert into public.user_investments (
    id, user_id, plan_id, wallet_account_id, amount, currency, status
  ) values (
    investment_id, caller_id, plan_record.id, wallet_record.id, p_amount, plan_record.currency, 'pending'
  );

  update public.wallet_accounts
  set available_balance = resulting_available,
      invested_amount = invested_amount + p_amount
  where id = wallet_record.id;

  insert into public.wallet_transactions (
    id, wallet_account_id, user_id, type, direction, status, amount, currency,
    previous_value, resulting_value, reason, reference, user_investment_id, completed_at
  ) values (
    transaction_id, wallet_record.id, caller_id, 'investment_allocation', 'debit', 'completed',
    p_amount, plan_record.currency, wallet_record.available_balance, resulting_available,
    'Funds reserved for investment request', 'ORY-INV-' || investment_id::text,
    investment_id, now()
  );

  return investment_id;
end;
$$;

revoke all on function public.request_user_investment(uuid, numeric, text) from public, anon;
grant execute on function public.request_user_investment(uuid, numeric, text) to authenticated;

comment on column public.user_investments.earnings_amount is
  'Protected authoritative earnings total for this investment. Normal users have no write privilege.';
comment on function public.request_user_investment(uuid, numeric, text) is
  'Atomically validates an active user request, reserves available funds, creates the investment, and records the immutable wallet transaction.';
