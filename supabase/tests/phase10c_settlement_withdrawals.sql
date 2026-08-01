-- Transaction-scoped Phase 10C tests. Local disposable database only.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select plan(15);
insert into auth.users(id,email,raw_user_meta_data) values
 ('c1000000-0000-4000-8000-000000000001','admin10c@example.invalid','{"full_name":"Phase 10C Admin"}'),
 ('c1000000-0000-4000-8000-000000000002','user10c@example.invalid','{"full_name":"Phase 10C User"}'),
 ('c1000000-0000-4000-8000-000000000003','other10c@example.invalid','{"full_name":"Phase 10C Other"}');
update public.profiles set status='active' where id in('c1000000-0000-4000-8000-000000000002','c1000000-0000-4000-8000-000000000003');
insert into public.admin_users(id,user_id,role_id,status,activated_at) select 'c2000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',id,'active',now() from public.admin_roles where name='Finance administrator';
insert into public.wallet_accounts(id,user_id,currency,total_balance,available_balance,invested_amount) values('c3000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000002','USD',1000,500,500);
insert into public.investment_plans(id,slug,name,short_description,full_description,minimum_amount,currency,duration_days,return_description,risk_level,terms,status) values('c4000000-0000-4000-8000-000000000001','phase-10c-plan','Phase 10C Plan','Test','Test',10,'USD',30,'No guaranteed return','High','Test','active');
insert into public.user_investments(id,user_id,plan_id,wallet_account_id,amount,currency,status,started_at,matures_at) values
 ('c5000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000002','c4000000-0000-4000-8000-000000000001','c3000000-0000-4000-8000-000000000001',200,'USD','pending',null,null),
 ('c5000000-0000-4000-8000-000000000002','c1000000-0000-4000-8000-000000000002','c4000000-0000-4000-8000-000000000001','c3000000-0000-4000-8000-000000000001',300,'USD','active',now()-interval '60 days',now()-interval '30 days');
insert into public.wallet_transactions(id,wallet_account_id,user_id,type,direction,status,amount,currency,previous_value,resulting_value,reason,reference,user_investment_id,completed_at) values
 ('c6000000-0000-4000-8000-000000000001','c3000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000002','investment_allocation','debit','completed',200,'USD',1000,800,'Test allocation','10C-ALLOC-1','c5000000-0000-4000-8000-000000000001',now()),
 ('c6000000-0000-4000-8000-000000000002','c3000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000002','investment_allocation','debit','completed',300,'USD',800,500,'Test allocation','10C-ALLOC-2','c5000000-0000-4000-8000-000000000002',now());

set local role authenticated;select set_config('request.jwt.claims','{"sub":"c1000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}',true);
select lives_ok($$select public.admin_release_investment('c5000000-0000-4000-8000-000000000001','rejected','Rejected after review')$$,'rejection releases principal');
select is((select available_balance from public.wallet_accounts where id='c3000000-0000-4000-8000-000000000001'),700::numeric,'released principal returns to available balance');
select throws_ok($$select public.admin_release_investment('c5000000-0000-4000-8000-000000000001','rejected','Duplicate release')$$,'22000','investment cannot be released','duplicate release is rejected');
select lives_ok($$select public.admin_mature_investment('c5000000-0000-4000-8000-000000000002','Contractual maturity')$$,'maturity settles principal');
select is((select invested_amount from public.wallet_accounts where id='c3000000-0000-4000-8000-000000000001'),0::numeric,'maturity reduces invested amount');
select lives_ok($$select public.admin_post_investment_earnings('c5000000-0000-4000-8000-000000000002',50,'10C-EARN-1','Realised maturity earnings',null,null)$$,'realised earnings post atomically');
select is((select row(total_balance,available_balance,total_earnings) from public.wallet_accounts where id='c3000000-0000-4000-8000-000000000001'),row(1050::numeric,1050::numeric,50::numeric),'earnings update all wallet figures');
select throws_ok($$select public.admin_post_investment_earnings('c5000000-0000-4000-8000-000000000002',50,'10C-EARN-1','Duplicate earnings',null,null)$$,'23505','earnings reference already exists','duplicate earnings reference is rejected');
select set_config('request.jwt.claims','{"sub":"c1000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}',true);
select throws_ok($$select public.admin_complete_investment('c5000000-0000-4000-8000-000000000002','AAL enforcement test')$$,'42501','not authorized','AAL1 administrator cannot settle investments');
select set_config('request.jwt.claims','{"sub":"c1000000-0000-4000-8000-000000000003","role":"authenticated","aal":"aal2"}',true);
select throws_ok($$select public.admin_complete_investment('c5000000-0000-4000-8000-000000000002','Permission enforcement test')$$,'42501','not authorized','normal user lacks settlement permission');

select set_config('request.jwt.claims','{"sub":"c1000000-0000-4000-8000-000000000002","role":"authenticated","aal":"aal1"}',true);
select lives_ok($$select public.submit_withdrawal_request('c7000000-0000-4000-8000-000000000001','bank_transfer',100,'USD','{"account_name":"Test User","bank_name":"Test Bank","account_number":"00001111"}',null)$$,'user reserves a withdrawal');
select is((select available_balance from public.wallet_accounts where id='c3000000-0000-4000-8000-000000000001'),950::numeric,'withdrawal atomically reserves available funds');
select throws_ok($$select public.submit_withdrawal_request('c7000000-0000-4000-8000-000000000002','bank_transfer',9999,'USD','{"account_name":"Test User","bank_name":"Test Bank","account_number":"00001111"}',null)$$,'22003','insufficient available balance','insufficient withdrawal is rejected');
select set_config('request.jwt.claims','{"sub":"c1000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}',true);
select lives_ok($$select public.admin_transition_withdrawal((select id from public.withdrawal_requests where client_request_id='c7000000-0000-4000-8000-000000000001'),'reject','Rejected test withdrawal')$$,'withdrawal rejection releases reservation');
select throws_ok($$select public.admin_transition_withdrawal((select id from public.withdrawal_requests where client_request_id='c7000000-0000-4000-8000-000000000001'),'reject','Duplicate rejection')$$,'22000','invalid withdrawal status transition','duplicate withdrawal processing is rejected');
select set_config('request.jwt.claims','{"sub":"c1000000-0000-4000-8000-000000000003","role":"authenticated","aal":"aal2"}',true);
select is((select count(*) from public.withdrawal_requests),0::bigint,'normal user cannot read another user withdrawal');
select * from finish();rollback;
