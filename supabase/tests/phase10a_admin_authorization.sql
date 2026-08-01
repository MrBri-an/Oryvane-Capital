begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(12);

select is((select count(*)::integer from public.admin_roles where name in ('Super administrator','Finance administrator','Compliance administrator','Support administrator','Content administrator','Read only auditor')), 6, 'fixed role catalogue exists');
select is((select count(*)::integer from public.admin_permissions where key in ('portal.access','users.view','finance.view','finance.adjust','payments.review','plans.view','plans.manage','investments.review','withdrawals.review','restrictions.manage','security.view','admins.view','audit.view')), 13, 'fixed permission catalogue exists');

insert into auth.users (id, email, raw_user_meta_data)
values ('10000000-0000-4000-8000-000000000010', 'phase10a@example.invalid', '{"full_name":"Phase 10A Admin"}');
insert into public.admin_users (user_id, role_id, status)
select '10000000-0000-4000-8000-000000000010', id, 'active' from public.admin_roles where name = 'Read only auditor';

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000010","role":"authenticated","aal":"aal1"}', true);

select ok(public.is_current_user_active_admin(), 'active admin identity is recognized before MFA');
select is(public.get_current_admin_context(), null::jsonb, 'context is withheld at aal1');
select isnt(public.has_admin_permission('portal.access'), true, 'permission helper rejects aal1');

select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000010","role":"authenticated","aal":"aal2"}', true);
select ok(public.has_admin_permission('portal.access'), 'portal permission is available at aal2');
select ok(public.has_admin_permission('audit.view'), 'auditor permission is available at aal2');
select isnt(public.has_admin_permission('finance.adjust'), true, 'unassigned permission is denied');
select ok((public.get_current_admin_context()->'permissions') ? 'audit.view', 'AAL2 context contains assigned permission');

select throws_ok($$ select public.bootstrap_first_admin('10000000-0000-4000-8000-000000000010', 'Super administrator') $$, '42501', 'permission denied for function bootstrap_first_admin', 'authenticated cannot execute bootstrap helper');

select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000099","role":"authenticated","aal":"aal2"}', true);
select isnt(public.is_current_user_active_admin(), true, 'normal user is not an administrator');
select is(public.get_current_admin_context(), null::jsonb, 'normal user receives no admin context');
select is((select count(*)::integer from public.admin_audit_logs), 0, 'normal user receives no audit rows');

select * from finish();
rollback;
