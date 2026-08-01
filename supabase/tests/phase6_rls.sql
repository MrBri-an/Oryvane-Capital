-- Transaction-scoped Phase 6 database tests. All fixtures are rolled back.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(22);

-- Test-only identities. These are never persistent seeds.
insert into auth.users (id, email, raw_user_meta_data)
values
  ('10000000-0000-0000-0000-000000000001', 'user1@phase6.invalid', '{"full_name":"Test User One"}'),
  ('10000000-0000-0000-0000-000000000002', 'user2@phase6.invalid', '{"full_name":"Test User Two"}'),
  ('10000000-0000-0000-0000-000000000003', 'admin@phase6.invalid', '{"full_name":"Test Admin"}');

insert into public.wallet_accounts (id, user_id, currency, total_balance, available_balance)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'USD', 10, 10),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'USD', 20, 20);

insert into public.wallet_transactions (id, wallet_account_id, user_id, type, direction, amount, currency, previous_value, resulting_value, reason, reference, completed_at)
values ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'bank_deposit', 'credit', 10, 'USD', 0, 10, 'test fixture', 'phase6-test-transaction', now());

insert into public.admin_roles (id, name) values ('40000000-0000-0000-0000-000000000001', 'Phase 6 Test Role');
insert into public.admin_permissions (id, key, description) values
  ('50000000-0000-0000-0000-000000000001', 'admins.view', 'Test permission'),
  ('50000000-0000-0000-0000-000000000002', 'finance.adjust', 'Test permission');
insert into public.admin_role_permissions (role_id, permission_id) values
  ('40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002');
insert into public.admin_users (id, user_id, role_id, status, activated_at)
values ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 'active', now());
insert into public.admin_audit_logs (id, admin_id, action, resource_type, reason)
values ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'test', 'test_fixture', 'test fixture');

insert into storage.objects (id, bucket_id, name) values
  ('80000000-0000-0000-0000-000000000001', 'profile-images', '10000000-0000-0000-0000-000000000001/avatar.png'),
  ('80000000-0000-0000-0000-000000000002', 'profile-images', '10000000-0000-0000-0000-000000000002/avatar.png'),
  ('80000000-0000-0000-0000-000000000003', 'payment-receipts', '10000000-0000-0000-0000-000000000001/receipt.pdf'),
  ('80000000-0000-0000-0000-000000000004', 'payment-receipts', '10000000-0000-0000-0000-000000000002/receipt.pdf');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal1"}', true);

select is((select count(*) from public.profiles), 1::bigint, 'user sees one own profile');
select is((select count(*) from public.profiles where id = '10000000-0000-0000-0000-000000000002'), 0::bigint, 'other profile is isolated');
select is((select count(*) from public.wallet_accounts), 1::bigint, 'user sees one own wallet');
select is((select count(*) from public.wallet_accounts where user_id <> auth.uid()), 0::bigint, 'other wallet is isolated');
select throws_ok('update public.wallet_accounts set total_balance = 999 where user_id = auth.uid()', '42501', 'permission denied for table wallet_accounts', 'financial balance update is forbidden');
select throws_ok($$insert into public.wallet_transactions (wallet_account_id,user_id,type,direction,amount,currency,previous_value,resulting_value,reason,reference) values ('20000000-0000-0000-0000-000000000001',auth.uid(),'bonus','credit',1,'USD',10,11,'forbidden','forbidden')$$, '42501', 'permission denied for table wallet_transactions', 'browser financial insert is forbidden');
select is((select count(*) from public.admin_users), 0::bigint, 'normal user cannot access admin records');
select is((select count(*) from storage.objects where bucket_id = 'profile-images'), 1::bigint, 'user sees only own storage object');
select is((select count(*) from storage.objects where name like '10000000-0000-0000-0000-000000000002/%'), 0::bigint, 'other user storage is isolated');
select is((select count(*) from storage.objects where bucket_id = 'payment-receipts'), 1::bigint, 'user sees only own payment receipt');
select is((select count(*) from storage.objects where bucket_id = 'payment-receipts' and name like '10000000-0000-0000-0000-000000000002/%'), 0::bigint, 'other payment receipt is isolated');
select throws_ok($$insert into storage.objects (bucket_id,name) values ('profile-images','10000000-0000-0000-0000-000000000002/forbidden.png')$$, '42501', 'new row violates row-level security policy for table "objects"', 'upload to another user folder is forbidden');
select ok(not public.has_admin_permission('finance.adjust'), 'normal user has no admin permission');
select ok(not has_function_privilege('authenticated', 'public.perform_wallet_adjustment(uuid,uuid,public.transaction_type,public.transaction_direction,numeric,text,text,text,uuid)', 'EXECUTE'), 'authenticated cannot execute financial adjustment');

reset role;
select throws_ok($$update public.wallet_transactions set reason = 'changed' where id = '30000000-0000-0000-0000-000000000001'$$, '42501', 'wallet_transactions is append-only; create a reversal or new record', 'wallet transactions cannot be updated');
select throws_ok($$delete from public.wallet_transactions where id = '30000000-0000-0000-0000-000000000001'$$, '42501', 'wallet_transactions is append-only; create a reversal or new record', 'wallet transactions cannot be deleted');
select throws_ok($$update public.admin_audit_logs set reason = 'changed' where id = '70000000-0000-0000-0000-000000000001'$$, '42501', 'admin_audit_logs is append-only; create a reversal or new record', 'audit logs cannot be updated');
select throws_ok($$delete from public.admin_audit_logs where id = '70000000-0000-0000-0000-000000000001'$$, '42501', 'admin_audit_logs is append-only; create a reversal or new record', 'audit logs cannot be deleted');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated","aal":"aal1"}', true);
select ok(not public.has_admin_permission('admins.view'), 'admin permission requires aal2');
select is((select count(*) from public.admin_users), 0::bigint, 'aal1 admin cannot access admin tables');
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated","aal":"aal2"}', true);
select ok(public.has_admin_permission('admins.view'), 'active aal2 admin receives assigned permission');
select is((select count(*) from public.admin_users), 1::bigint, 'authorized aal2 admin can read admin records');

select * from finish();
rollback;
