-- Transaction-scoped Phase 10B tests. Run only against a disposable local database.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select plan(13);

insert into auth.users(id,email,raw_user_meta_data) values
 ('a1000000-0000-4000-8000-000000000001','admin10b@example.invalid','{"full_name":"Phase 10B Admin"}'),
 ('a1000000-0000-4000-8000-000000000002','user10b@example.invalid','{"full_name":"Phase 10B User"}'),
 ('a1000000-0000-4000-8000-000000000003','normal10b@example.invalid','{"full_name":"Phase 10B Normal"}');
update public.profiles set status='active' where id in ('a1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000003');
insert into public.admin_users(id,user_id,role_id,status,activated_at) select 'a2000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001',id,'active',now() from public.admin_roles where name='Finance administrator';
insert into public.payment_submissions(id,user_id,method,status,submitted_amount,currency,sender_name,external_reference,submitted_at) values('a3000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000002','bank_transfer','submitted',125,'USD','Test Sender','TEST-REFERENCE',now());

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a1000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}',true);
select lives_ok($$select public.admin_start_payment_review('a3000000-0000-4000-8000-000000000001')$$,'authorized admin starts payment review');
select lives_ok($$select public.admin_approve_and_credit_payment('a3000000-0000-4000-8000-000000000001',125,'Independently confirmed payment')$$,'payment is atomically credited');
select is((select total_balance from public.wallet_accounts where user_id='a1000000-0000-4000-8000-000000000002' and currency='USD'),125::numeric,'wallet balance is credited');
select is((select count(*) from public.wallet_transactions where payment_submission_id='a3000000-0000-4000-8000-000000000001'),1::bigint,'exactly one immutable credit transaction exists');
select is((select count(*) from public.admin_audit_logs where resource_id='a3000000-0000-4000-8000-000000000001' and action='payment_approved_and_credited'),1::bigint,'payment credit is audited');
select throws_ok($$select public.admin_approve_and_credit_payment('a3000000-0000-4000-8000-000000000001',125,'Duplicate attempt')$$,'22000','payment cannot be credited','duplicate payment credit is rejected');

select lives_ok($$select public.perform_wallet_adjustment((select id from public.wallet_accounts where user_id='a1000000-0000-4000-8000-000000000002' and currency='USD'),'a1000000-0000-4000-8000-000000000001','bonus','credit',10,'USD','Approved test bonus','TEST-BONUS-10B',null)$$,'authorized account adjustment succeeds');
select is((select count(*) from public.admin_audit_logs where reference='TEST-BONUS-10B'),1::bigint,'account adjustment is audited');
select lives_ok($$select public.perform_wallet_adjustment((select wallet_account_id from public.wallet_transactions where reference='TEST-BONUS-10B'),'a1000000-0000-4000-8000-000000000001','reversal','debit',10,'USD','Reverse approved test bonus','TEST-REVERSAL-10B',(select id from public.wallet_transactions where reference='TEST-BONUS-10B'))$$,'valid reversal succeeds');
select throws_ok($$select public.perform_wallet_adjustment((select wallet_account_id from public.wallet_transactions where reference='TEST-BONUS-10B'),'a1000000-0000-4000-8000-000000000001','reversal','debit',10,'USD','Duplicate reversal','TEST-REVERSAL-DUP-10B',(select id from public.wallet_transactions where reference='TEST-BONUS-10B'))$$,'23505','transaction already reversed','second reversal is rejected');
select lives_ok($$select public.admin_apply_restriction('a1000000-0000-4000-8000-000000000002','deposit','Compliance test restriction',null)$$,'authorized restriction is applied');
select ok((select active from public.account_restrictions where user_id='a1000000-0000-4000-8000-000000000002' and type='deposit'),'restriction is active and enforced');

select set_config('request.jwt.claims','{"sub":"a1000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}',true);
select throws_ok($$select public.admin_apply_restriction('a1000000-0000-4000-8000-000000000003','withdrawal','AAL test restriction',null)$$,'42501','not authorized','AAL1 cannot mutate');
select set_config('request.jwt.claims','{"sub":"a1000000-0000-4000-8000-000000000003","role":"authenticated","aal":"aal2"}',true);
select throws_ok($$select public.admin_apply_restriction('a1000000-0000-4000-8000-000000000002','login','Forbidden normal-user restriction',null)$$,'42501','not authorized','normal user cannot invoke admin operation');

select * from finish();
rollback;
