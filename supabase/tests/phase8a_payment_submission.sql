-- Transaction-scoped Phase 8A payment tests. All fixtures are rolled back.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(17);

insert into auth.users (id, email, raw_user_meta_data) values
  ('81000000-0000-0000-0000-000000000001', 'active1@phase8a.invalid', '{"full_name":"Active One"}'),
  ('81000000-0000-0000-0000-000000000002', 'active2@phase8a.invalid', '{"full_name":"Active Two"}'),
  ('81000000-0000-0000-0000-000000000003', 'restricted@phase8a.invalid', '{"full_name":"Restricted"}');
update public.profiles set status = 'active' where id in ('81000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000002');
update public.profiles set status = 'restricted' where id = '81000000-0000-0000-0000-000000000003';

insert into public.payment_submissions (id, user_id, method, submitted_amount, currency, sender_name, external_reference, receipt_path) values
  ('82000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000001', 'bank_transfer', 100, 'USD', 'Active One', 'BANK-001', '81000000-0000-0000-0000-000000000001/82000000-0000-0000-0000-000000000001/receipt.pdf'),
  ('82000000-0000-0000-0000-000000000002', '81000000-0000-0000-0000-000000000002', 'bank_transfer', 100, 'USD', 'Active Two', 'BANK-002', null),
  ('82000000-0000-0000-0000-000000000003', '81000000-0000-0000-0000-000000000001', 'bitcoin', 1, 'BTC', null, repeat('a', 64), null),
  ('82000000-0000-0000-0000-000000000004', '81000000-0000-0000-0000-000000000003', 'bitcoin', 1, 'BTC', null, repeat('b', 64), null);

insert into storage.objects (id, bucket_id, name, owner_id) values
  ('83000000-0000-0000-0000-000000000001', 'payment-receipts', '81000000-0000-0000-0000-000000000001/82000000-0000-0000-0000-000000000001/receipt.pdf', '81000000-0000-0000-0000-000000000001');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"81000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal1"}', true);

select matches(public.submit_payment_for_review('82000000-0000-0000-0000-000000000001'), '^ORY-PAY-[0-9a-f-]{36}$', 'bank draft receives a server reference and is submitted');
select is((select status::text from public.payment_submissions where id = '82000000-0000-0000-0000-000000000001'), 'submitted', 'draft status transitions to submitted');
select ok((select submitted_at is not null from public.payment_submissions where id = '82000000-0000-0000-0000-000000000001'), 'submitted timestamp is server controlled');
select throws_ok($$select public.submit_payment_for_review('82000000-0000-0000-0000-000000000002')$$, 'P0002', 'payment submission not found', 'another user cannot submit a payment');
select lives_ok($$select public.submit_payment_for_review('82000000-0000-0000-0000-000000000003')$$, 'Bitcoin receipt is optional');
select throws_ok($$insert into public.payment_submissions (user_id, method, submitted_amount, currency, external_reference) values (auth.uid(), 'bitcoin', 1, 'BTC', repeat('A', 64))$$, '23505', null, 'Bitcoin hashes are unique case-insensitively');
select throws_ok($$update public.payment_submissions set internal_reference = 'ORY-PAY-00000000-0000-0000-0000-000000000000' where id = '82000000-0000-0000-0000-000000000003'$$, '42501', 'permission denied for table payment_submissions', 'user cannot modify internal references');
select throws_ok($$update public.payment_submissions set confirmed_amount = 1 where id = '82000000-0000-0000-0000-000000000003'$$, '42501', 'permission denied for table payment_submissions', 'user cannot set confirmed amount');
select throws_ok($$update public.payment_submissions set status = 'approved' where id = '82000000-0000-0000-0000-000000000003'$$, '42501', 'permission denied for table payment_submissions', 'user cannot approve a payment');

select set_config('request.jwt.claims', '{"sub":"81000000-0000-0000-0000-000000000002","role":"authenticated","aal":"aal1"}', true);
select throws_ok($$select public.submit_payment_for_review('82000000-0000-0000-0000-000000000002')$$, '22000', 'payment receipt is required for bank transfers', 'bank receipt is mandatory');

select set_config('request.jwt.claims', '{"sub":"81000000-0000-0000-0000-000000000003","role":"authenticated","aal":"aal1"}', true);
select throws_ok($$select public.submit_payment_for_review('82000000-0000-0000-0000-000000000004')$$, '42501', 'account is not eligible to submit payments', 'restricted account cannot submit');

reset role;
update public.profiles set status = 'suspended' where id = '81000000-0000-0000-0000-000000000003';
set local role authenticated;
select throws_ok($$select public.submit_payment_for_review('82000000-0000-0000-0000-000000000004')$$, '42501', 'account is not eligible to submit payments', 'suspended account cannot submit');
reset role;
update public.profiles set status = 'blocked' where id = '81000000-0000-0000-0000-000000000003';
set local role authenticated;
select throws_ok($$select public.submit_payment_for_review('82000000-0000-0000-0000-000000000004')$$, '42501', 'account is not eligible to submit payments', 'blocked account cannot submit');
reset role;
update public.profiles set status = 'closed' where id = '81000000-0000-0000-0000-000000000003';
set local role authenticated;
select throws_ok($$select public.submit_payment_for_review('82000000-0000-0000-0000-000000000004')$$, '42501', 'account is not eligible to submit payments', 'closed account cannot submit');
reset role;
update public.profiles set status = 'pending_verification' where id = '81000000-0000-0000-0000-000000000003';
set local role authenticated;
select throws_ok($$select public.submit_payment_for_review('82000000-0000-0000-0000-000000000004')$$, '42501', 'account is not eligible to submit payments', 'pending-verification account cannot submit');

reset role;
select ok((select internal_reference ~ '^ORY-PAY-[0-9a-f-]{36}$' from public.payment_submissions where id = '82000000-0000-0000-0000-000000000002'), 'internal reference is generated for every draft');
select throws_ok($$insert into public.payment_submissions (user_id, method, submitted_amount, currency, external_reference, user_note) values ('81000000-0000-0000-0000-000000000001', 'bitcoin', 1, 'BTC', repeat('c', 64), repeat('n', 1001))$$, '23514', null, 'user note is limited to 1000 characters');

select * from finish();
rollback;
