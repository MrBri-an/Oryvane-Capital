-- Phase 10A: fixed admin catalogue and protected authentication helpers.

insert into public.admin_roles (id, name, description, is_system) values
  ('a0000000-0000-0000-0000-000000000001', 'Super administrator', 'Full platform administration.', true),
  ('a0000000-0000-0000-0000-000000000002', 'Finance administrator', 'Financial review and approved finance operations.', true),
  ('a0000000-0000-0000-0000-000000000003', 'Compliance administrator', 'User, restriction and security oversight.', true),
  ('a0000000-0000-0000-0000-000000000004', 'Support administrator', 'Read-only user support and approved communication access.', true),
  ('a0000000-0000-0000-0000-000000000005', 'Content administrator', 'Public plan and content administration.', true),
  ('a0000000-0000-0000-0000-000000000006', 'Read only auditor', 'Read-only operational and audit access.', true)
on conflict (name) do update set description = excluded.description, is_system = true;

insert into public.admin_permissions (id, key, description, sensitive) values
  ('b0000000-0000-0000-0000-000000000001', 'portal.access', 'Access the protected admin portal.', false),
  ('b0000000-0000-0000-0000-000000000002', 'users.view', 'View users and profiles.', false),
  ('b0000000-0000-0000-0000-000000000003', 'finance.view', 'View wallets and immutable transactions.', true),
  ('b0000000-0000-0000-0000-000000000004', 'finance.adjust', 'Perform protected wallet adjustments.', true),
  ('b0000000-0000-0000-0000-000000000005', 'payments.review', 'View and review payment submissions.', true),
  ('b0000000-0000-0000-0000-000000000006', 'plans.view', 'View all investment plans.', false),
  ('b0000000-0000-0000-0000-000000000007', 'plans.manage', 'Manage investment plans.', true),
  ('b0000000-0000-0000-0000-000000000008', 'investments.review', 'View and review user investments.', true),
  ('b0000000-0000-0000-0000-000000000009', 'withdrawals.review', 'View and review withdrawal requests.', true),
  ('b0000000-0000-0000-0000-000000000010', 'restrictions.manage', 'View and manage account restrictions.', true),
  ('b0000000-0000-0000-0000-000000000011', 'security.view', 'View security events.', true),
  ('b0000000-0000-0000-0000-000000000012', 'admins.view', 'View administrator records and catalogue.', true),
  ('b0000000-0000-0000-0000-000000000013', 'audit.view', 'View append-only administrator audit logs.', true)
on conflict (key) do update set description = excluded.description, sensitive = excluded.sensitive;

with mappings(role_name, permission_key) as (values
  ('Super administrator', 'portal.access'), ('Super administrator', 'users.view'), ('Super administrator', 'finance.view'), ('Super administrator', 'finance.adjust'), ('Super administrator', 'payments.review'), ('Super administrator', 'plans.view'), ('Super administrator', 'plans.manage'), ('Super administrator', 'investments.review'), ('Super administrator', 'withdrawals.review'), ('Super administrator', 'restrictions.manage'), ('Super administrator', 'security.view'), ('Super administrator', 'admins.view'), ('Super administrator', 'audit.view'),
  ('Finance administrator', 'portal.access'), ('Finance administrator', 'users.view'), ('Finance administrator', 'finance.view'), ('Finance administrator', 'finance.adjust'), ('Finance administrator', 'payments.review'), ('Finance administrator', 'plans.view'), ('Finance administrator', 'plans.manage'), ('Finance administrator', 'investments.review'), ('Finance administrator', 'withdrawals.review'), ('Finance administrator', 'restrictions.manage'), ('Finance administrator', 'audit.view'),
  ('Compliance administrator', 'portal.access'), ('Compliance administrator', 'users.view'), ('Compliance administrator', 'finance.view'), ('Compliance administrator', 'payments.review'), ('Compliance administrator', 'plans.view'), ('Compliance administrator', 'investments.review'), ('Compliance administrator', 'withdrawals.review'), ('Compliance administrator', 'restrictions.manage'), ('Compliance administrator', 'security.view'), ('Compliance administrator', 'audit.view'),
  ('Support administrator', 'portal.access'), ('Support administrator', 'users.view'), ('Support administrator', 'finance.view'), ('Support administrator', 'payments.review'), ('Support administrator', 'plans.view'), ('Support administrator', 'investments.review'), ('Support administrator', 'withdrawals.review'),
  ('Content administrator', 'portal.access'), ('Content administrator', 'plans.view'), ('Content administrator', 'plans.manage'),
  ('Read only auditor', 'portal.access'), ('Read only auditor', 'users.view'), ('Read only auditor', 'finance.view'), ('Read only auditor', 'payments.review'), ('Read only auditor', 'plans.view'), ('Read only auditor', 'investments.review'), ('Read only auditor', 'withdrawals.review'), ('Read only auditor', 'restrictions.manage'), ('Read only auditor', 'security.view'), ('Read only auditor', 'admins.view'), ('Read only auditor', 'audit.view')
)
insert into public.admin_role_permissions (role_id, permission_id)
select ar.id, ap.id from mappings m
join public.admin_roles ar on ar.name = m.role_name
join public.admin_permissions ap on ap.key = m.permission_key
on conflict do nothing;

drop policy investment_plans_authenticated_access on public.investment_plans;
create policy investment_plans_authenticated_access on public.investment_plans for select to authenticated
  using (
    status = 'active'
    or public.has_admin_permission('plans.view')
    or public.has_admin_permission('plans.manage')
    or exists (select 1 from public.user_investments ui where ui.plan_id = investment_plans.id and ui.user_id = auth.uid())
  );

create function public.is_current_user_active_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.admin_users where user_id = auth.uid() and status = 'active'
  );
$$;
revoke all on function public.is_current_user_active_admin() from public, anon;
grant execute on function public.is_current_user_active_admin() to authenticated;

create function public.get_current_admin_context()
returns jsonb language sql stable security definer set search_path = '' as $$
  select case when coalesce(auth.jwt() ->> 'aal', '') <> 'aal2' then null else (
    select jsonb_build_object(
      'admin_id', au.id, 'user_id', au.user_id, 'status', au.status,
      'role_id', ar.id, 'role_name', ar.name,
      'permissions', coalesce(jsonb_agg(ap.key order by ap.key) filter (where ap.key is not null), '[]'::jsonb),
      'aal', 'aal2'
    )
    from public.admin_users au
    join public.admin_roles ar on ar.id = au.role_id
    left join public.admin_role_permissions arp on arp.role_id = ar.id
    left join public.admin_permissions ap on ap.id = arp.permission_id
    where au.user_id = auth.uid() and au.status = 'active'
    group by au.id, au.user_id, au.status, ar.id, ar.name
  ) end;
$$;
revoke all on function public.get_current_admin_context() from public, anon;
grant execute on function public.get_current_admin_context() to authenticated;

create function public.record_admin_auth_event(p_event_type text, p_severity text default 'info')
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.is_current_user_active_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  if p_event_type not in ('admin_password_verified', 'admin_mfa_verified', 'admin_logout') then raise exception 'invalid event type' using errcode = '22000'; end if;
  if p_severity not in ('info', 'warning', 'critical') then raise exception 'invalid severity' using errcode = '22000'; end if;
  insert into public.security_events (user_id, event_type, severity, metadata)
  values (auth.uid(), p_event_type, p_severity, jsonb_build_object('aal', coalesce(auth.jwt() ->> 'aal', 'unknown')));
end;
$$;
revoke all on function public.record_admin_auth_event(text, text) from public, anon;
grant execute on function public.record_admin_auth_event(text, text) to authenticated;

create function public.bootstrap_first_admin(p_user_id uuid, p_role_name text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare role_record public.admin_roles%rowtype; new_admin_id uuid := gen_random_uuid();
begin
  if exists (select 1 from public.admin_users) then raise exception 'administrator bootstrap has already been completed' using errcode = '42501'; end if;
  if not exists (select 1 from auth.users where id = p_user_id) then raise exception 'authentication user not found' using errcode = 'P0002'; end if;
  select * into role_record from public.admin_roles where name = p_role_name and is_system;
  if not found then raise exception 'invalid system role' using errcode = '22000'; end if;
  insert into public.admin_users (id, user_id, role_id, status, activated_at) values (new_admin_id, p_user_id, role_record.id, 'active', now());
  insert into public.admin_audit_logs (admin_id, affected_user_id, action, resource_type, resource_id, reason, new_state)
  values (new_admin_id, p_user_id, 'bootstrap_first_admin', 'admin_user', new_admin_id, 'Explicit one-time administrator bootstrap', jsonb_build_object('role', role_record.name, 'user_id', p_user_id));
  return new_admin_id;
end;
$$;
revoke all on function public.bootstrap_first_admin(uuid, text) from public, anon, authenticated;
grant execute on function public.bootstrap_first_admin(uuid, text) to service_role;
