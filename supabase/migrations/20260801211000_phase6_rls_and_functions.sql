-- Phase 6: least-privilege grants, RLS, admin permission checks, and atomic adjustments.

create function public.has_admin_permission(permission_key text, require_aal2 boolean default true)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (not require_aal2 or coalesce(auth.jwt() ->> 'aal', '') = 'aal2')
    and exists (
      select 1
      from public.admin_users au
      join public.admin_role_permissions arp on arp.role_id = au.role_id
      join public.admin_permissions ap on ap.id = arp.permission_id
      where au.user_id = auth.uid()
        and au.status = 'active'
        and ap.key = permission_key
    );
$$;

create function public.admin_user_has_permission(admin_auth_user_id uuid, permission_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users au
    join public.admin_role_permissions arp on arp.role_id = au.role_id
    join public.admin_permissions ap on ap.id = arp.permission_id
    where au.user_id = admin_auth_user_id
      and au.status = 'active'
      and ap.key = permission_key
  );
$$;

revoke all on function public.has_admin_permission(text, boolean) from public, anon;
grant execute on function public.has_admin_permission(text, boolean) to authenticated, service_role;
revoke all on function public.admin_user_has_permission(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_user_has_permission(uuid, text) to service_role;

alter table public.profiles enable row level security;
alter table public.wallet_accounts enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.payment_submissions enable row level security;
alter table public.investment_plans enable row level security;
alter table public.user_investments enable row level security;
alter table public.investment_updates enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.account_restrictions enable row level security;
alter table public.security_events enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_roles enable row level security;
alter table public.admin_permissions enable row level security;
alter table public.admin_role_permissions enable row level security;
alter table public.admin_audit_logs enable row level security;

revoke all on table public.profiles, public.wallet_accounts, public.wallet_transactions,
  public.payment_submissions, public.investment_plans, public.user_investments,
  public.investment_updates, public.withdrawal_requests, public.notifications,
  public.account_restrictions, public.security_events, public.admin_users,
  public.admin_roles, public.admin_permissions, public.admin_role_permissions,
  public.admin_audit_logs from anon, authenticated;

grant select on public.profiles, public.wallet_accounts, public.wallet_transactions,
  public.payment_submissions, public.investment_plans, public.user_investments,
  public.investment_updates, public.withdrawal_requests, public.notifications,
  public.account_restrictions to authenticated;
grant select (id, user_id, event_type, severity, created_at) on public.security_events to authenticated;
grant select on public.admin_users, public.admin_roles, public.admin_permissions,
  public.admin_role_permissions, public.admin_audit_logs to authenticated;

grant update (full_name, phone, country, avatar_path) on public.profiles to authenticated;
grant insert (user_id, method, submitted_amount, currency, sender_name, external_reference, receipt_path)
  on public.payment_submissions to authenticated;
grant update (submitted_amount, sender_name, external_reference, receipt_path)
  on public.payment_submissions to authenticated;
grant update (read_at) on public.notifications to authenticated;

create policy profiles_select_own on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_admin_permission('users.view'));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy wallet_accounts_select_own on public.wallet_accounts for select to authenticated
  using (user_id = auth.uid() or public.has_admin_permission('finance.view'));
create policy wallet_transactions_select_own on public.wallet_transactions for select to authenticated
  using (user_id = auth.uid() or public.has_admin_permission('finance.view'));

create policy payment_submissions_select_own on public.payment_submissions for select to authenticated
  using (user_id = auth.uid() or public.has_admin_permission('payments.review'));
create policy payment_submissions_insert_own on public.payment_submissions for insert to authenticated
  with check (user_id = auth.uid() and status = 'draft');
create policy payment_submissions_update_own_draft on public.payment_submissions for update to authenticated
  using (user_id = auth.uid() and status = 'draft')
  with check (user_id = auth.uid() and status = 'draft');

create policy investment_plans_public_active on public.investment_plans for select to anon, authenticated
  using (status = 'active' or public.has_admin_permission('plans.manage'));
grant select on public.investment_plans to anon;

create policy user_investments_select_own on public.user_investments for select to authenticated
  using (user_id = auth.uid() or public.has_admin_permission('investments.review'));
create policy investment_updates_select_own on public.investment_updates for select to authenticated
  using (user_id = auth.uid() or public.has_admin_permission('investments.review'));
create policy withdrawal_requests_select_own on public.withdrawal_requests for select to authenticated
  using (user_id = auth.uid() or public.has_admin_permission('withdrawals.review'));

create policy notifications_select_own on public.notifications for select to authenticated
  using (user_id = auth.uid());
create policy notifications_mark_read_own on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy account_restrictions_select_own_active on public.account_restrictions for select to authenticated
  using ((user_id = auth.uid() and active) or public.has_admin_permission('restrictions.manage'));
create policy security_events_select_own on public.security_events for select to authenticated
  using (user_id = auth.uid() or public.has_admin_permission('security.view'));

create policy admin_users_authorized_select on public.admin_users for select to authenticated
  using (public.has_admin_permission('admins.view'));
create policy admin_roles_authorized_select on public.admin_roles for select to authenticated
  using (public.has_admin_permission('admins.view'));
create policy admin_permissions_authorized_select on public.admin_permissions for select to authenticated
  using (public.has_admin_permission('admins.view'));
create policy admin_role_permissions_authorized_select on public.admin_role_permissions for select to authenticated
  using (public.has_admin_permission('admins.view'));
create policy admin_audit_logs_authorized_select on public.admin_audit_logs for select to authenticated
  using (public.has_admin_permission('audit.view'));

create function public.perform_wallet_adjustment(
  p_wallet_account_id uuid,
  p_admin_auth_user_id uuid,
  p_adjustment_type public.transaction_type,
  p_adjustment_direction public.transaction_direction,
  p_adjustment_amount numeric,
  p_adjustment_currency text,
  p_adjustment_reason text,
  p_adjustment_reference text,
  p_original_transaction_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_record public.wallet_accounts%rowtype;
  admin_record_id uuid;
  previous_balance numeric(38,18);
  resulting_balance numeric(38,18);
  transaction_id uuid := gen_random_uuid();
  original_record public.wallet_transactions%rowtype;
begin
  if coalesce(auth.jwt() ->> 'aal', '') <> 'aal2' then
    raise exception 'MFA assurance level aal2 is required' using errcode = '42501';
  end if;
  if auth.uid() is null or auth.uid() <> p_admin_auth_user_id then
    raise exception 'administrator session identity mismatch' using errcode = '42501';
  end if;
  if not public.admin_user_has_permission(p_admin_auth_user_id, 'finance.adjust') then
    raise exception 'active administrator permission is required' using errcode = '42501';
  end if;

  select id into admin_record_id from public.admin_users
    where user_id = p_admin_auth_user_id and status = 'active';
  select * into account_record from public.wallet_accounts where id = p_wallet_account_id for update;
  if not found then raise exception 'wallet account not found' using errcode = 'P0002'; end if;
  if p_adjustment_amount <= 0 then raise exception 'amount must be positive' using errcode = '22003'; end if;
  if p_adjustment_currency <> account_record.currency then raise exception 'currency mismatch' using errcode = '22000'; end if;
  if char_length(p_adjustment_reason) < 3 then raise exception 'reason is required' using errcode = '22000'; end if;

  if p_adjustment_type = 'reversal' then
    if p_original_transaction_id is null then raise exception 'reversal requires original transaction' using errcode = '22000'; end if;
    select * into original_record from public.wallet_transactions where id = p_original_transaction_id for update;
    if not found or original_record.wallet_account_id <> p_wallet_account_id then raise exception 'invalid original transaction' using errcode = '22000'; end if;
    if original_record.status <> 'completed' or original_record.type = 'reversal' then raise exception 'transaction cannot be reversed' using errcode = '22000'; end if;
    if exists (select 1 from public.wallet_transactions where reversal_of = p_original_transaction_id) then raise exception 'transaction already reversed' using errcode = '23505'; end if;
    if p_adjustment_amount <> original_record.amount or p_adjustment_direction = original_record.direction then raise exception 'reversal amount or direction is invalid' using errcode = '22000'; end if;
  elsif p_original_transaction_id is not null then
    raise exception 'original transaction is valid only for reversals' using errcode = '22000';
  end if;

  previous_balance := account_record.total_balance;
  resulting_balance := case when p_adjustment_direction = 'credit' then previous_balance + p_adjustment_amount else previous_balance - p_adjustment_amount end;
  if resulting_balance < 0 then raise exception 'insufficient balance' using errcode = '22003'; end if;
  if p_adjustment_direction = 'debit' and account_record.available_balance < p_adjustment_amount then raise exception 'insufficient available balance' using errcode = '22003'; end if;

  update public.wallet_accounts set
    total_balance = resulting_balance,
    available_balance = case when p_adjustment_direction = 'credit' then available_balance + p_adjustment_amount else available_balance - p_adjustment_amount end
  where id = p_wallet_account_id;

  insert into public.wallet_transactions (id, wallet_account_id, user_id, admin_id, type, direction, status, amount, currency, previous_value, resulting_value, reason, reference, reversal_of, completed_at)
  values (transaction_id, p_wallet_account_id, account_record.user_id, admin_record_id, p_adjustment_type, p_adjustment_direction, 'completed', p_adjustment_amount, p_adjustment_currency, previous_balance, resulting_balance, p_adjustment_reason, p_adjustment_reference, p_original_transaction_id, now());

  insert into public.admin_audit_logs (admin_id, affected_user_id, action, resource_type, resource_id, previous_state, new_state, reason, amount, currency, reference)
  values (admin_record_id, account_record.user_id, 'wallet_adjustment', 'wallet_account', p_wallet_account_id,
    jsonb_build_object('balance', previous_balance), jsonb_build_object('balance', resulting_balance),
    p_adjustment_reason, p_adjustment_amount, p_adjustment_currency, p_adjustment_reference);

  return transaction_id;
end;
$$;

revoke all on function public.perform_wallet_adjustment(uuid, uuid, public.transaction_type, public.transaction_direction, numeric, text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.perform_wallet_adjustment(uuid, uuid, public.transaction_type, public.transaction_direction, numeric, text, text, text, uuid) to service_role;
