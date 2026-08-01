-- Phase 10C: investment settlement and user withdrawal workflows.

alter table public.withdrawal_requests
  add column user_note text check(user_note is null or char_length(user_note)<=1000),
  add column internal_reference text not null default('ORY-WDR-'||gen_random_uuid()::text) unique
    check(internal_reference ~ '^ORY-WDR-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
  add column client_request_id uuid not null default gen_random_uuid();
create unique index withdrawal_user_client_request_unique on public.withdrawal_requests(user_id,client_request_id);
create index wallet_transactions_withdrawal_request_idx on public.wallet_transactions(withdrawal_request_id) where withdrawal_request_id is not null;

insert into public.admin_permissions(id,key,description,sensitive) values
 ('b0000000-0000-0000-0000-000000000019','withdrawals.manage','Review and settle withdrawal requests.',true)
on conflict(key) do update set description=excluded.description,sensitive=excluded.sensitive;
with roles(name) as (values('Super administrator'),('Finance administrator'))
insert into public.admin_role_permissions(role_id,permission_id)
select ar.id,ap.id from roles r join public.admin_roles ar on ar.name=r.name cross join public.admin_permissions ap where ap.key='withdrawals.manage' on conflict do nothing;

create function public.admin_release_investment(p_investment_id uuid,p_target_status public.investment_status,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare i public.user_investments%rowtype; w public.wallet_accounts%rowtype; allocation public.wallet_transactions%rowtype; a uuid; tx uuid:=gen_random_uuid(); resulting_available numeric(38,18);
begin
 if not public.has_admin_permission('investments.manage') or not public.has_admin_permission('finance.adjust') then raise exception 'not authorized' using errcode='42501'; end if;
 if p_target_status not in ('rejected','cancelled') then raise exception 'invalid release status' using errcode='22000'; end if;
 if char_length(btrim(coalesce(p_reason,'')))<3 or char_length(p_reason)>1000 then raise exception 'valid reason is required' using errcode='22000'; end if;
 select * into i from public.user_investments where id=p_investment_id for update; if not found then raise exception 'investment not found' using errcode='P0002'; end if;
 if i.status not in ('pending','awaiting_funding','under_review') then raise exception 'investment cannot be released' using errcode='22000'; end if;
 select * into w from public.wallet_accounts where id=i.wallet_account_id for update;
 select * into allocation from public.wallet_transactions where user_investment_id=i.id and type='investment_allocation' order by created_at limit 1 for update;
 if not found then raise exception 'investment allocation transaction not found' using errcode='P0002'; end if;
 if exists(select 1 from public.wallet_transactions where reversal_of=allocation.id) then raise exception 'investment principal already released' using errcode='23505'; end if;
 if w.invested_amount<i.amount then raise exception 'invested balance invariant failed' using errcode='22003'; end if;
 resulting_available:=w.available_balance+i.amount;
 select id into a from public.admin_users where user_id=auth.uid() and status='active';
 update public.wallet_accounts set available_balance=resulting_available,invested_amount=invested_amount-i.amount where id=w.id;
 update public.user_investments set status=p_target_status,reviewed_by=a,completed_at=now() where id=i.id;
 insert into public.wallet_transactions(id,wallet_account_id,user_id,admin_id,type,direction,status,amount,currency,previous_value,resulting_value,reason,reference,user_investment_id,reversal_of,completed_at)
 values(tx,w.id,i.user_id,a,'reversal','credit','completed',i.amount,i.currency,w.available_balance,resulting_available,btrim(p_reason),'ORY-INV-RELEASE-'||i.id,i.id,allocation.id,now());
 insert into public.investment_updates(investment_id,user_id,update_type,amount,currency,description,created_by) values(i.id,i.user_id,'principal_released',i.amount,i.currency,btrim(p_reason),a);
 insert into public.admin_audit_logs(admin_id,affected_user_id,action,resource_type,resource_id,previous_state,new_state,reason,amount,currency,reference) values(a,i.user_id,'investment_principal_released','user_investment',i.id,jsonb_build_object('status',i.status,'available_balance',w.available_balance,'invested_amount',w.invested_amount),jsonb_build_object('status',p_target_status,'available_balance',resulting_available,'invested_amount',w.invested_amount-i.amount),btrim(p_reason),i.amount,i.currency,'ORY-INV-RELEASE-'||i.id);
 return tx;
end $$;

create function public.admin_mature_investment(p_investment_id uuid,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare i public.user_investments%rowtype; w public.wallet_accounts%rowtype; allocation public.wallet_transactions%rowtype; a uuid; tx uuid:=gen_random_uuid(); resulting_available numeric(38,18);
begin
 if not public.has_admin_permission('investments.manage') or not public.has_admin_permission('finance.adjust') then raise exception 'not authorized' using errcode='42501'; end if;
 if char_length(btrim(coalesce(p_reason,'')))<3 or char_length(p_reason)>1000 then raise exception 'valid reason is required' using errcode='22000'; end if;
 select * into i from public.user_investments where id=p_investment_id for update; if not found then raise exception 'investment not found' using errcode='P0002'; end if;
 if i.status<>'active' or i.matures_at is null or i.matures_at>now() then raise exception 'investment is not eligible for maturity' using errcode='22000'; end if;
 select * into w from public.wallet_accounts where id=i.wallet_account_id for update;
 select * into allocation from public.wallet_transactions where user_investment_id=i.id and type='investment_allocation' order by created_at limit 1 for update;
 if not found then raise exception 'investment allocation transaction not found' using errcode='P0002'; end if;
 if exists(select 1 from public.wallet_transactions where reversal_of=allocation.id) then raise exception 'investment principal already released' using errcode='23505'; end if;
 if w.invested_amount<i.amount then raise exception 'invested balance invariant failed' using errcode='22003'; end if;
 resulting_available:=w.available_balance+i.amount; select id into a from public.admin_users where user_id=auth.uid() and status='active';
 update public.wallet_accounts set available_balance=resulting_available,invested_amount=invested_amount-i.amount where id=w.id;
 update public.user_investments set status='matured',reviewed_by=a where id=i.id;
 insert into public.wallet_transactions(id,wallet_account_id,user_id,admin_id,type,direction,status,amount,currency,previous_value,resulting_value,reason,reference,user_investment_id,reversal_of,completed_at) values(tx,w.id,i.user_id,a,'reversal','credit','completed',i.amount,i.currency,w.available_balance,resulting_available,btrim(p_reason),'ORY-INV-MATURITY-'||i.id,i.id,allocation.id,now());
 insert into public.investment_updates(investment_id,user_id,update_type,amount,currency,description,created_by) values(i.id,i.user_id,'principal_matured',i.amount,i.currency,btrim(p_reason),a);
 insert into public.admin_audit_logs(admin_id,affected_user_id,action,resource_type,resource_id,previous_state,new_state,reason,amount,currency,reference) values(a,i.user_id,'investment_matured','user_investment',i.id,jsonb_build_object('status',i.status,'available_balance',w.available_balance,'invested_amount',w.invested_amount),jsonb_build_object('status','matured','available_balance',resulting_available,'invested_amount',w.invested_amount-i.amount),btrim(p_reason),i.amount,i.currency,'ORY-INV-MATURITY-'||i.id);
 return tx;
end $$;

create function public.admin_post_investment_earnings(p_investment_id uuid,p_amount numeric,p_reference text,p_reason text,p_period_start date default null,p_period_end date default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare i public.user_investments%rowtype; w public.wallet_accounts%rowtype; a uuid; tx uuid:=gen_random_uuid(); resulting_total numeric(38,18);
begin
 if not public.has_admin_permission('investments.manage') or not public.has_admin_permission('finance.adjust') then raise exception 'not authorized' using errcode='42501'; end if;
 if p_amount is null or p_amount<=0 then raise exception 'earnings amount must be positive' using errcode='22003'; end if;
 if char_length(btrim(coalesce(p_reference,'')))<3 or char_length(p_reference)>200 then raise exception 'valid unique reference is required' using errcode='22000'; end if;
 if char_length(btrim(coalesce(p_reason,'')))<3 or char_length(p_reason)>1000 then raise exception 'valid reason is required' using errcode='22000'; end if;
 if p_period_start is not null and p_period_end is not null and p_period_end<p_period_start then raise exception 'invalid earnings period' using errcode='22000'; end if;
 select * into i from public.user_investments where id=p_investment_id for update; if not found then raise exception 'investment not found' using errcode='P0002'; end if;
 if i.status<>'matured' then raise exception 'earnings can be realised only after maturity' using errcode='22000'; end if;
 if exists(select 1 from public.wallet_transactions where reference=btrim(p_reference)) then raise exception 'earnings reference already exists' using errcode='23505'; end if;
 select * into w from public.wallet_accounts where id=i.wallet_account_id for update; resulting_total:=w.total_balance+p_amount;
 select id into a from public.admin_users where user_id=auth.uid() and status='active';
 update public.wallet_accounts set total_balance=resulting_total,available_balance=available_balance+p_amount,total_earnings=total_earnings+p_amount where id=w.id;
 update public.user_investments set earnings_amount=earnings_amount+p_amount,reviewed_by=a where id=i.id;
 insert into public.wallet_transactions(id,wallet_account_id,user_id,admin_id,type,direction,status,amount,currency,previous_value,resulting_value,reason,reference,user_investment_id,completed_at) values(tx,w.id,i.user_id,a,'investment_return','credit','completed',p_amount,i.currency,w.total_balance,resulting_total,btrim(p_reason),btrim(p_reference),i.id,now());
 insert into public.investment_updates(investment_id,user_id,update_type,amount,currency,period_start,period_end,description,created_by) values(i.id,i.user_id,'realised_earnings',p_amount,i.currency,p_period_start,p_period_end,btrim(p_reason),a);
 insert into public.admin_audit_logs(admin_id,affected_user_id,action,resource_type,resource_id,previous_state,new_state,reason,amount,currency,reference) values(a,i.user_id,'investment_earnings_posted','user_investment',i.id,jsonb_build_object('earnings',i.earnings_amount,'total_balance',w.total_balance,'available_balance',w.available_balance,'total_earnings',w.total_earnings),jsonb_build_object('earnings',i.earnings_amount+p_amount,'total_balance',resulting_total,'available_balance',w.available_balance+p_amount,'total_earnings',w.total_earnings+p_amount),btrim(p_reason),p_amount,i.currency,btrim(p_reference));
 return tx;
end $$;

create function public.admin_complete_investment(p_investment_id uuid,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare i public.user_investments%rowtype; a uuid;
begin
 if not public.has_admin_permission('investments.manage') then raise exception 'not authorized' using errcode='42501'; end if;
 if char_length(btrim(coalesce(p_reason,'')))<3 or char_length(p_reason)>1000 then raise exception 'valid reason is required' using errcode='22000'; end if;
 select * into i from public.user_investments where id=p_investment_id for update; if not found or i.status<>'matured' then raise exception 'matured investment not found' using errcode='P0002'; end if;
 if not exists(select 1 from public.wallet_transactions where user_investment_id=i.id and type='reversal') then raise exception 'principal has not been settled' using errcode='22000'; end if;
 select id into a from public.admin_users where user_id=auth.uid() and status='active'; update public.user_investments set status='completed',completed_at=now(),reviewed_by=a where id=i.id;
 insert into public.investment_updates(investment_id,user_id,update_type,description,created_by) values(i.id,i.user_id,'completed',btrim(p_reason),a);
 insert into public.admin_audit_logs(admin_id,affected_user_id,action,resource_type,resource_id,previous_state,new_state,reason) values(a,i.user_id,'investment_completed','user_investment',i.id,jsonb_build_object('status',i.status),jsonb_build_object('status','completed'),btrim(p_reason));
end $$;

create function public.submit_withdrawal_request(p_request_id uuid,p_method public.withdrawal_method,p_amount numeric,p_currency text,p_destination jsonb,p_user_note text default null)
returns text language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); w public.wallet_accounts%rowtype; wid uuid:=gen_random_uuid(); resulting_available numeric(38,18); internal_ref text;
begin
 if u is null then raise exception 'authentication required' using errcode='42501'; end if;
 if p_request_id is null then raise exception 'request identifier required' using errcode='22000'; end if;
 if not exists(select 1 from public.profiles where id=u and status='active') then raise exception 'account is not eligible for withdrawals' using errcode='42501'; end if;
 if exists(select 1 from public.account_restrictions where user_id=u and active and type in('withdrawal','account') and starts_at<=now() and(expires_at is null or expires_at>now())) then raise exception 'withdrawals are restricted' using errcode='42501'; end if;
 if p_amount is null or p_amount<=0 or p_currency !~ '^[A-Z0-9]{3,10}$' then raise exception 'invalid withdrawal amount or currency' using errcode='22003'; end if;
 if p_user_note is not null and char_length(p_user_note)>1000 then raise exception 'note is too long' using errcode='22000'; end if;
 if jsonb_typeof(p_destination)<>'object' then raise exception 'invalid destination' using errcode='22000'; end if;
 if p_method='bank_transfer' and (char_length(btrim(coalesce(p_destination->>'account_name',''))) not between 2 and 120 or char_length(btrim(coalesce(p_destination->>'bank_name',''))) not between 2 and 120 or (p_destination->>'account_number') !~ '^[A-Za-z0-9 -]{4,40}$') then raise exception 'invalid bank destination' using errcode='22000'; end if;
 if p_method='bitcoin' and (char_length(btrim(coalesce(p_destination->>'bitcoin_address',''))) not between 14 and 120 or char_length(btrim(coalesce(p_destination->>'bitcoin_network',''))) not between 2 and 40) then raise exception 'invalid bitcoin destination' using errcode='22000'; end if;
 if exists(select 1 from public.withdrawal_requests where user_id=u and client_request_id=p_request_id) then return(select internal_reference from public.withdrawal_requests where user_id=u and client_request_id=p_request_id); end if;
 select * into w from public.wallet_accounts where user_id=u and currency=p_currency for update; if not found then raise exception 'wallet not found' using errcode='P0002'; end if;
 if w.available_balance<p_amount then raise exception 'insufficient available balance' using errcode='22003'; end if;
 resulting_available:=w.available_balance-p_amount;
 insert into public.withdrawal_requests(id,user_id,wallet_account_id,method,amount,currency,destination,user_note,status,client_request_id) values(wid,u,w.id,p_method,p_amount,p_currency,p_destination,p_user_note,'submitted',p_request_id) returning internal_reference into internal_ref;
 update public.wallet_accounts set available_balance=resulting_available where id=w.id;
 insert into public.wallet_transactions(wallet_account_id,user_id,type,direction,status,amount,currency,previous_value,resulting_value,reason,reference,withdrawal_request_id,completed_at) values(w.id,u,'withdrawal','debit','completed',p_amount,p_currency,w.available_balance,resulting_available,'Funds reserved for withdrawal request','ORY-WDR-RESERVE-'||wid,wid,now());
 return internal_ref;
end $$;

create function public.admin_transition_withdrawal(p_withdrawal_id uuid,p_action text,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare r public.withdrawal_requests%rowtype; w public.wallet_accounts%rowtype; reserve public.wallet_transactions%rowtype; paid_tx public.wallet_transactions%rowtype; a uuid; tx uuid:=gen_random_uuid(); new_available numeric(38,18); new_total numeric(38,18); new_status public.withdrawal_status;
begin
 if not public.has_admin_permission('withdrawals.manage') then raise exception 'not authorized' using errcode='42501'; end if;
 if p_action not in('start_review','approve','reject','processing','paid','reverse') then raise exception 'invalid withdrawal action' using errcode='22000'; end if;
 if p_action in('reject','reverse') and char_length(btrim(coalesce(p_reason,'')))<3 then raise exception 'valid reason is required' using errcode='22000'; end if;
 select * into r from public.withdrawal_requests where id=p_withdrawal_id for update; if not found then raise exception 'withdrawal not found' using errcode='P0002'; end if;
 select * into w from public.wallet_accounts where id=r.wallet_account_id for update;
 select * into reserve from public.wallet_transactions where withdrawal_request_id=r.id and reference='ORY-WDR-RESERVE-'||r.id for update;
 if not found then raise exception 'withdrawal reservation not found' using errcode='P0002'; end if;
 select id into a from public.admin_users where user_id=auth.uid() and status='active';
 if p_action='start_review' and r.status='submitted' then new_status:='under_review';
 elsif p_action='approve' and r.status='under_review' then new_status:='approved';
 elsif p_action='processing' and r.status='approved' then new_status:='processing';
 elsif p_action='reject' and r.status in('submitted','under_review','approved') then
   if exists(select 1 from public.wallet_transactions where reversal_of=reserve.id) then raise exception 'withdrawal reservation already released' using errcode='23505'; end if;
   new_available:=w.available_balance+r.amount; update public.wallet_accounts set available_balance=new_available where id=w.id;
   insert into public.wallet_transactions(id,wallet_account_id,user_id,admin_id,type,direction,status,amount,currency,previous_value,resulting_value,reason,reference,withdrawal_request_id,reversal_of,completed_at) values(tx,w.id,r.user_id,a,'reversal','credit','completed',r.amount,r.currency,w.available_balance,new_available,btrim(p_reason),'ORY-WDR-REJECT-'||r.id,r.id,reserve.id,now()); new_status:='rejected';
 elsif p_action='paid' and r.status='processing' then
   new_total:=w.total_balance-r.amount; if new_total<0 then raise exception 'wallet balance invariant failed' using errcode='22003'; end if;
   update public.wallet_accounts set total_balance=new_total where id=w.id;
   insert into public.wallet_transactions(id,wallet_account_id,user_id,admin_id,type,direction,status,amount,currency,previous_value,resulting_value,reason,reference,withdrawal_request_id,completed_at) values(tx,w.id,r.user_id,a,'withdrawal','debit','completed',r.amount,r.currency,w.total_balance,new_total,coalesce(nullif(btrim(p_reason),''),'Withdrawal paid'),'ORY-WDR-PAID-'||r.id,r.id,now()); new_status:='paid';
 elsif p_action='reverse' and r.status='paid' then
   select * into paid_tx from public.wallet_transactions where withdrawal_request_id=r.id and reference='ORY-WDR-PAID-'||r.id for update; if not found then raise exception 'paid transaction not found' using errcode='P0002'; end if;
   if exists(select 1 from public.wallet_transactions where reversal_of=paid_tx.id) then raise exception 'paid withdrawal already reversed' using errcode='23505'; end if;
   new_total:=w.total_balance+r.amount; new_available:=w.available_balance+r.amount; update public.wallet_accounts set total_balance=new_total,available_balance=new_available where id=w.id;
   insert into public.wallet_transactions(id,wallet_account_id,user_id,admin_id,type,direction,status,amount,currency,previous_value,resulting_value,reason,reference,withdrawal_request_id,reversal_of,completed_at) values(tx,w.id,r.user_id,a,'reversal','credit','completed',r.amount,r.currency,w.total_balance,new_total,btrim(p_reason),'ORY-WDR-REVERSE-'||r.id,r.id,paid_tx.id,now()); new_status:='reversed';
 else raise exception 'invalid withdrawal status transition' using errcode='22000'; end if;
 update public.withdrawal_requests set status=new_status,reviewed_by=a,reviewed_at=case when p_action in('start_review','approve','reject') then coalesce(reviewed_at,now()) else reviewed_at end,rejection_reason=case when p_action='reject' then btrim(p_reason) else rejection_reason end,paid_at=case when p_action='paid' then now() else paid_at end where id=r.id;
 insert into public.admin_audit_logs(admin_id,affected_user_id,action,resource_type,resource_id,previous_state,new_state,reason,amount,currency,reference) values(a,r.user_id,'withdrawal_'||p_action,'withdrawal_request',r.id,jsonb_build_object('status',r.status,'total_balance',w.total_balance,'available_balance',w.available_balance),jsonb_build_object('status',new_status,'total_balance',coalesce(new_total,w.total_balance),'available_balance',coalesce(new_available,w.available_balance)),coalesce(nullif(btrim(p_reason),''),'Administrator advanced withdrawal workflow'),r.amount,r.currency,r.internal_reference);
end $$;

create or replace function public.admin_update_investment_status(p_investment_id uuid,p_status public.investment_status,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare i public.user_investments%rowtype; plan public.investment_plans%rowtype; a uuid;
begin
 if not public.has_admin_permission('investments.manage') then raise exception 'not authorized' using errcode='42501'; end if;
 if char_length(btrim(coalesce(p_reason,'')))<3 or char_length(p_reason)>1000 then raise exception 'valid reason is required' using errcode='22000'; end if;
 select * into i from public.user_investments where id=p_investment_id for update; if not found then raise exception 'investment not found' using errcode='P0002'; end if;
 if not((i.status='pending' and p_status='under_review') or(i.status='under_review' and p_status='active') or(i.status='active' and p_status='suspended') or(i.status='suspended' and p_status='active')) then raise exception 'use a settlement function for financial status transitions' using errcode='22000'; end if;
 select * into plan from public.investment_plans where id=i.plan_id; select id into a from public.admin_users where user_id=auth.uid() and status='active';
 update public.user_investments set status=p_status,reviewed_by=a,started_at=case when p_status='active' then coalesce(started_at,now()) else started_at end,matures_at=case when p_status='active' then coalesce(matures_at,now()+make_interval(days=>plan.duration_days)) else matures_at end where id=i.id;
 insert into public.investment_updates(investment_id,user_id,update_type,description,created_by) values(i.id,i.user_id,'status_change',btrim(p_reason),a);
 insert into public.admin_audit_logs(admin_id,affected_user_id,action,resource_type,resource_id,previous_state,new_state,reason) values(a,i.user_id,'investment_status_updated','user_investment',i.id,jsonb_build_object('status',i.status),jsonb_build_object('status',p_status),btrim(p_reason));
end $$;

revoke all on function public.admin_release_investment(uuid,public.investment_status,text),public.admin_mature_investment(uuid,text),public.admin_post_investment_earnings(uuid,numeric,text,text,date,date),public.admin_complete_investment(uuid,text),public.submit_withdrawal_request(uuid,public.withdrawal_method,numeric,text,jsonb,text),public.admin_transition_withdrawal(uuid,text,text) from public,anon;
grant execute on function public.admin_release_investment(uuid,public.investment_status,text),public.admin_mature_investment(uuid,text),public.admin_post_investment_earnings(uuid,numeric,text,text,date,date),public.admin_complete_investment(uuid,text),public.submit_withdrawal_request(uuid,public.withdrawal_method,numeric,text,jsonb,text),public.admin_transition_withdrawal(uuid,text,text) to authenticated;
