-- Transaction-scoped Phase 9 investment request tests. All fixtures are rolled back.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(11);

insert into auth.users (id, email, raw_user_meta_data) values
  ('91000000-0000-0000-0000-000000000001', 'active@phase9.invalid', '{"full_name":"Active Investor"}'),
  ('91000000-0000-0000-0000-000000000002', 'other@phase9.invalid', '{"full_name":"Other Investor"}'),
  ('91000000-0000-0000-0000-000000000003', 'restricted@phase9.invalid', '{"full_name":"Restricted Investor"}');
update public.profiles set status = 'active' where id in ('91000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000002');
update public.profiles set status = 'restricted' where id = '91000000-0000-0000-0000-000000000003';

insert into public.wallet_accounts (id, user_id, currency, total_balance, available_balance) values
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', 'USD', 1000, 1000),
  ('92000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000002', 'USD', 1000, 1000),
  ('92000000-0000-0000-0000-000000000003', '91000000-0000-0000-0000-000000000003', 'USD', 1000, 1000);
insert into public.investment_plans (id, slug, name, short_description, full_description, minimum_amount, maximum_amount, currency, duration_days, return_description, risk_level, terms, status)
values ('93000000-0000-0000-0000-000000000001', 'phase9-test-plan', 'Phase 9 Test Plan', 'Test only', 'Test only', 100, 500, 'USD', 90, 'No guaranteed return', 'High', 'Test terms', 'active');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"91000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal1"}', true);
select lives_ok($$select public.request_user_investment('93000000-0000-0000-0000-000000000001', 250, 'USD')$$, 'active user can request an eligible investment');
select is((select available_balance from public.wallet_accounts where id = '92000000-0000-0000-0000-000000000001'), 750::numeric, 'available funds are reserved');
select is((select invested_amount from public.wallet_accounts where id = '92000000-0000-0000-0000-000000000001'), 250::numeric, 'invested amount increases atomically');
select is((select count(*) from public.wallet_transactions where user_id = auth.uid() and type = 'investment_allocation'), 1::bigint, 'allocation creates one immutable wallet transaction');
select is((select earnings_amount from public.user_investments where user_id = auth.uid()), 0::numeric, 'new investment earnings are server controlled at zero');
select throws_ok($$select public.request_user_investment('93000000-0000-0000-0000-000000000001', 250, 'USD')$$, '23505', 'duplicate investment request', 'duplicate request is rejected');
select throws_ok($$select public.request_user_investment('93000000-0000-0000-0000-000000000001', 600, 'USD')$$, '22003', 'investment amount is outside plan limits', 'amount above maximum is rejected');
select throws_ok($$select public.request_user_investment('93000000-0000-0000-0000-000000000001', 100, 'EUR')$$, '22000', 'investment currency does not match plan', 'currency mismatch is rejected');
select throws_ok($$update public.wallet_accounts set available_balance = 999 where user_id = auth.uid()$$, '42501', 'permission denied for table wallet_accounts', 'user cannot change wallet balances');
select throws_ok($$update public.user_investments set status = 'active' where user_id = auth.uid()$$, '42501', 'permission denied for table user_investments', 'user cannot activate investments');

select set_config('request.jwt.claims', '{"sub":"91000000-0000-0000-0000-000000000003","role":"authenticated","aal":"aal1"}', true);
select throws_ok($$select public.request_user_investment('93000000-0000-0000-0000-000000000001', 100, 'USD')$$, '42501', 'account is not eligible to request investments', 'restricted account cannot request investments');

select * from finish();
rollback;
