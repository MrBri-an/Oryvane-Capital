-- Phase 6: authoritative schema, constraints, indexes, and immutable records.
create extension if not exists pgcrypto with schema extensions;

create type public.account_status as enum ('pending_verification', 'active', 'restricted', 'suspended', 'blocked', 'closed');
create type public.admin_status as enum ('invited', 'active', 'disabled');
create type public.payment_method as enum ('bank_transfer', 'bitcoin');
create type public.payment_status as enum ('draft', 'submitted', 'under_review', 'awaiting_confirmation', 'approved', 'rejected', 'credited', 'cancelled');
create type public.plan_status as enum ('draft', 'active', 'paused', 'closed', 'archived');
create type public.investment_status as enum ('pending', 'awaiting_funding', 'under_review', 'active', 'matured', 'completed', 'cancelled', 'rejected', 'suspended');
create type public.withdrawal_method as enum ('bank_transfer', 'bitcoin');
create type public.withdrawal_status as enum ('submitted', 'under_review', 'approved', 'processing', 'paid', 'rejected', 'cancelled', 'reversed');
create type public.transaction_type as enum ('bank_deposit', 'bitcoin_deposit', 'investment_allocation', 'investment_return', 'bonus', 'withdrawal', 'fee', 'refund', 'correction', 'reversal', 'promotional_credit', 'administrative_debit');
create type public.transaction_direction as enum ('credit', 'debit');
create type public.transaction_status as enum ('pending', 'completed', 'reversed', 'failed');
create type public.restriction_type as enum ('deposit', 'withdrawal', 'investment', 'login', 'account');
create type public.notification_type as enum ('general', 'financial', 'security', 'account');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text check (phone is null or char_length(phone) between 7 and 24),
  country text check (country is null or char_length(country) between 2 and 80),
  avatar_path text,
  status public.account_status not null default 'pending_verification',
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  risk_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 80),
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z][a-z0-9_.-]{2,100}$'),
  description text not null,
  sensitive boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.admin_role_permissions (
  role_id uuid not null references public.admin_roles(id) on delete cascade,
  permission_id uuid not null references public.admin_permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete restrict,
  role_id uuid not null references public.admin_roles(id) on delete restrict,
  status public.admin_status not null default 'invited',
  invited_by uuid references public.admin_users(id) on delete restrict,
  activated_at timestamptz,
  disabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'active' and activated_at is not null and disabled_at is null) or status <> 'active'),
  check ((status = 'disabled' and disabled_at is not null) or status <> 'disabled')
);

create table public.wallet_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  currency text not null check (currency ~ '^[A-Z0-9]{3,10}$'),
  total_balance numeric(38,18) not null default 0 check (total_balance >= 0),
  available_balance numeric(38,18) not null default 0 check (available_balance >= 0 and available_balance <= total_balance),
  invested_amount numeric(38,18) not null default 0 check (invested_amount >= 0),
  total_earnings numeric(38,18) not null default 0 check (total_earnings >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, currency)
);

create table public.payment_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  method public.payment_method not null,
  status public.payment_status not null default 'draft',
  submitted_amount numeric(38,18) not null check (submitted_amount > 0),
  confirmed_amount numeric(38,18) check (confirmed_amount is null or confirmed_amount > 0),
  currency text not null check (currency ~ '^[A-Z0-9]{3,10}$'),
  sender_name text check (sender_name is null or char_length(sender_name) <= 120),
  external_reference text check (external_reference is null or char_length(external_reference) <= 200),
  receipt_path text,
  rejection_reason text,
  reviewed_by uuid references public.admin_users(id) on delete restrict,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  credited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (method <> 'bitcoin' or external_reference is not null)
);

create table public.investment_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 120),
  short_description text not null,
  full_description text not null,
  minimum_amount numeric(38,18) not null check (minimum_amount > 0),
  maximum_amount numeric(38,18) check (maximum_amount is null or maximum_amount >= minimum_amount),
  currency text not null check (currency ~ '^[A-Z0-9]{3,10}$'),
  duration_days integer not null check (duration_days > 0),
  return_description text not null,
  risk_level text not null check (char_length(risk_level) between 2 and 50),
  image_path text,
  terms text not null,
  available_from timestamptz,
  available_until timestamptz,
  participant_limit integer check (participant_limit is null or participant_limit > 0),
  featured boolean not null default false,
  status public.plan_status not null default 'draft',
  created_by uuid references public.admin_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (available_until is null or available_from is null or available_until > available_from)
);

create table public.user_investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  plan_id uuid not null references public.investment_plans(id) on delete restrict,
  wallet_account_id uuid not null references public.wallet_accounts(id) on delete restrict,
  amount numeric(38,18) not null check (amount > 0),
  currency text not null check (currency ~ '^[A-Z0-9]{3,10}$'),
  status public.investment_status not null default 'pending',
  started_at timestamptz,
  matures_at timestamptz,
  completed_at timestamptz,
  reviewed_by uuid references public.admin_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (matures_at is null or started_at is null or matures_at > started_at)
);

create table public.investment_updates (
  id uuid primary key default gen_random_uuid(),
  investment_id uuid not null references public.user_investments(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  update_type text not null check (char_length(update_type) between 2 and 80),
  amount numeric(38,18) check (amount is null or amount > 0),
  currency text check (currency is null or currency ~ '^[A-Z0-9]{3,10}$'),
  period_start date,
  period_end date,
  description text not null,
  created_by uuid not null references public.admin_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (period_end is null or period_start is null or period_end >= period_start)
);

create table public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  wallet_account_id uuid not null references public.wallet_accounts(id) on delete restrict,
  method public.withdrawal_method not null,
  amount numeric(38,18) not null check (amount > 0),
  currency text not null check (currency ~ '^[A-Z0-9]{3,10}$'),
  destination jsonb not null check (jsonb_typeof(destination) = 'object'),
  status public.withdrawal_status not null default 'submitted',
  rejection_reason text,
  payment_reference text,
  reviewed_by uuid references public.admin_users(id) on delete restrict,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_account_id uuid not null references public.wallet_accounts(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  admin_id uuid references public.admin_users(id) on delete restrict,
  type public.transaction_type not null,
  direction public.transaction_direction not null,
  status public.transaction_status not null default 'completed',
  amount numeric(38,18) not null check (amount > 0),
  currency text not null check (currency ~ '^[A-Z0-9]{3,10}$'),
  previous_value numeric(38,18) not null check (previous_value >= 0),
  resulting_value numeric(38,18) not null check (resulting_value >= 0),
  reason text not null check (char_length(reason) between 3 and 1000),
  reference text not null unique check (char_length(reference) between 3 and 200),
  payment_submission_id uuid references public.payment_submissions(id) on delete restrict,
  user_investment_id uuid references public.user_investments(id) on delete restrict,
  withdrawal_request_id uuid references public.withdrawal_requests(id) on delete restrict,
  reversal_of uuid unique references public.wallet_transactions(id) on delete restrict,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  check ((direction = 'credit' and resulting_value = previous_value + amount) or (direction = 'debit' and resulting_value = previous_value - amount)),
  check ((type = 'reversal' and reversal_of is not null) or (type <> 'reversal' and reversal_of is null))
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  type public.notification_type not null default 'general',
  title text not null check (char_length(title) between 2 and 160),
  body text not null,
  related_resource_type text,
  related_resource_id uuid,
  read_at timestamptz,
  created_by uuid references public.admin_users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.account_restrictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  type public.restriction_type not null,
  reason text not null check (char_length(reason) between 3 and 1000),
  active boolean not null default true,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  removed_at timestamptz,
  created_by uuid not null references public.admin_users(id) on delete restrict,
  removed_by uuid references public.admin_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (expires_at is null or expires_at > starts_at),
  check ((active and removed_at is null and removed_by is null) or not active)
);

create table public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete restrict,
  event_type text not null check (char_length(event_type) between 2 and 100),
  severity text not null check (severity in ('info', 'warning', 'critical')),
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admin_users(id) on delete restrict,
  affected_user_id uuid references public.profiles(id) on delete restrict,
  action text not null check (char_length(action) between 2 and 120),
  resource_type text not null check (char_length(resource_type) between 2 and 100),
  resource_id uuid,
  previous_state jsonb,
  new_state jsonb,
  reason text not null check (char_length(reason) between 3 and 1000),
  amount numeric(38,18) check (amount is null or amount > 0),
  currency text check (currency is null or currency ~ '^[A-Z0-9]{3,10}$'),
  reference text,
  session_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(session_metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index profiles_status_idx on public.profiles(status);
create index admin_users_role_status_idx on public.admin_users(role_id, status);
create index admin_role_permissions_permission_idx on public.admin_role_permissions(permission_id);
create index wallet_accounts_user_idx on public.wallet_accounts(user_id);
create index wallet_transactions_user_created_idx on public.wallet_transactions(user_id, created_at desc);
create index wallet_transactions_account_created_idx on public.wallet_transactions(wallet_account_id, created_at desc);
create index payment_submissions_user_status_idx on public.payment_submissions(user_id, status);
create index payment_submissions_status_created_idx on public.payment_submissions(status, created_at);
create index investment_plans_status_idx on public.investment_plans(status);
create index user_investments_user_status_idx on public.user_investments(user_id, status);
create index investment_updates_investment_idx on public.investment_updates(investment_id, created_at desc);
create index withdrawal_requests_user_status_idx on public.withdrawal_requests(user_id, status);
create index withdrawal_requests_status_created_idx on public.withdrawal_requests(status, created_at);
create index notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index account_restrictions_user_active_idx on public.account_restrictions(user_id, active);
create index security_events_user_created_idx on public.security_events(user_id, created_at desc);
create index admin_audit_logs_admin_created_idx on public.admin_audit_logs(admin_id, created_at desc);
create index admin_audit_logs_resource_idx on public.admin_audit_logs(resource_type, resource_id);

create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger admin_roles_set_updated_at before update on public.admin_roles for each row execute function public.set_updated_at();
create trigger admin_users_set_updated_at before update on public.admin_users for each row execute function public.set_updated_at();
create trigger wallet_accounts_set_updated_at before update on public.wallet_accounts for each row execute function public.set_updated_at();
create trigger payment_submissions_set_updated_at before update on public.payment_submissions for each row execute function public.set_updated_at();
create trigger investment_plans_set_updated_at before update on public.investment_plans for each row execute function public.set_updated_at();
create trigger user_investments_set_updated_at before update on public.user_investments for each row execute function public.set_updated_at();
create trigger withdrawal_requests_set_updated_at before update on public.withdrawal_requests for each row execute function public.set_updated_at();

create function public.prevent_append_only_changes() returns trigger language plpgsql set search_path = '' as $$
begin raise exception '% is append-only; create a reversal or new record', tg_table_name using errcode = '42501'; end;
$$;

create trigger wallet_transactions_append_only before update or delete on public.wallet_transactions for each row execute function public.prevent_append_only_changes();
create trigger admin_audit_logs_append_only before update or delete on public.admin_audit_logs for each row execute function public.prevent_append_only_changes();

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, full_name, phone, country, terms_accepted_at, privacy_accepted_at, risk_accepted_at)
  values (
    new.id,
    case when char_length(trim(metadata ->> 'full_name')) between 2 and 120 then trim(metadata ->> 'full_name') else 'Account holder' end,
    case when char_length(trim(metadata ->> 'phone')) between 7 and 24 then trim(metadata ->> 'phone') end,
    case when char_length(trim(metadata ->> 'country')) between 2 and 80 then trim(metadata ->> 'country') end,
    case when metadata ? 'terms_accepted_at' then now() end,
    case when metadata ? 'privacy_accepted_at' then now() end,
    case when metadata ? 'risk_accepted_at' then now() end
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.prevent_append_only_changes() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
