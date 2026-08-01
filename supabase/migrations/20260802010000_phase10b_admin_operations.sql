-- Phase 10B: protected, audited admin operations. No real records are seeded.

insert into public.admin_permissions (id, key, description, sensitive) values
  ('b0000000-0000-0000-0000-000000000014', 'notifications.send', 'Send in-app user notifications.', true),
  ('b0000000-0000-0000-0000-000000000015', 'payments.manage', 'Start review and approve payment submissions.', true),
  ('b0000000-0000-0000-0000-000000000016', 'payments.reject', 'Reject reviewed payment submissions.', true),
  ('b0000000-0000-0000-0000-000000000017', 'restrictions.change', 'Apply and remove user restrictions and account controls.', true),
  ('b0000000-0000-0000-0000-000000000018', 'investments.manage', 'Change protected user investment statuses.', true)
on conflict (key) do update set description = excluded.description, sensitive = excluded.sensitive;

with mappings(role_name) as (values ('Super administrator'), ('Compliance administrator'), ('Support administrator'), ('Content administrator'))
insert into public.admin_role_permissions (role_id, permission_id)
select ar.id, ap.id from mappings m join public.admin_roles ar on ar.name=m.role_name
cross join public.admin_permissions ap where ap.key='notifications.send' on conflict do nothing;

with mappings(role_name,permission_key) as (values
 ('Super administrator','payments.manage'),('Super administrator','payments.reject'),('Super administrator','restrictions.change'),('Super administrator','investments.manage'),
 ('Finance administrator','payments.manage'),('Finance administrator','payments.reject'),('Finance administrator','restrictions.change'),('Finance administrator','investments.manage'),
 ('Compliance administrator','payments.reject'),('Compliance administrator','restrictions.change'))
insert into public.admin_role_permissions(role_id,permission_id)
select ar.id,ap.id from mappings m join public.admin_roles ar on ar.name=m.role_name join public.admin_permissions ap on ap.key=m.permission_key on conflict do nothing;

create unique index wallet_transactions_payment_credit_unique
  on public.wallet_transactions(payment_submission_id) where payment_submission_id is not null;

drop policy notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications for select to authenticated
  using (user_id=auth.uid() or public.has_admin_permission('notifications.send'));

create function public.admin_start_payment_review(p_payment_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare p public.payment_submissions%rowtype; a uuid;
begin
  if not public.has_admin_permission('payments.manage') then raise exception 'not authorized' using errcode='42501'; end if;
  select id into a from public.admin_users where user_id=auth.uid() and status='active';
  select * into p from public.payment_submissions where id=p_payment_id for update;
  if not found then raise exception 'payment not found' using errcode='P0002'; end if;
  if p.status <> 'submitted' then raise exception 'payment is not available for review' using errcode='22000'; end if;
  update public.payment_submissions set status='under_review', reviewed_by=a, reviewed_at=now() where id=p.id;
  insert into public.admin_audit_logs(admin_id,affected_user_id,action,resource_type,resource_id,previous_state,new_state,reason)
  values(a,p.user_id,'payment_review_started','payment_submission',p.id,jsonb_build_object('status',p.status),jsonb_build_object('status','under_review'),'Administrator started payment review');
end $$;

create function public.admin_reject_payment(p_payment_id uuid,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare p public.payment_submissions%rowtype; a uuid;
begin
  if not (public.has_admin_permission('payments.manage') or public.has_admin_permission('payments.reject')) then raise exception 'not authorized' using errcode='42501'; end if;
  if char_length(btrim(coalesce(p_reason,''))) < 3 or char_length(p_reason)>1000 then raise exception 'valid rejection reason is required' using errcode='22000'; end if;
  select id into a from public.admin_users where user_id=auth.uid() and status='active';
  select * into p from public.payment_submissions where id=p_payment_id for update;
  if not found then raise exception 'payment not found' using errcode='P0002'; end if;
  if p.status not in ('submitted','under_review','awaiting_confirmation') or p.credited_at is not null then raise exception 'payment cannot be rejected' using errcode='22000'; end if;
  update public.payment_submissions set status='rejected', rejection_reason=btrim(p_reason), reviewed_by=a, reviewed_at=now() where id=p.id;
  insert into public.admin_audit_logs(admin_id,affected_user_id,action,resource_type,resource_id,previous_state,new_state,reason)
  values(a,p.user_id,'payment_rejected','payment_submission',p.id,jsonb_build_object('status',p.status),jsonb_build_object('status','rejected'),btrim(p_reason));
end $$;

create function public.admin_approve_and_credit_payment(p_payment_id uuid,p_confirmed_amount numeric,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare p public.payment_submissions%rowtype; w public.wallet_accounts%rowtype; a uuid; tx uuid:=gen_random_uuid(); new_balance numeric(38,18);
begin
  if not public.has_admin_permission('payments.manage') or not public.has_admin_permission('finance.adjust') then raise exception 'not authorized' using errcode='42501'; end if;
  if p_confirmed_amount is null or p_confirmed_amount<=0 then raise exception 'confirmed amount must be positive' using errcode='22003'; end if;
  if char_length(btrim(coalesce(p_reason,'')))<3 or char_length(p_reason)>1000 then raise exception 'valid approval reason is required' using errcode='22000'; end if;
  select id into a from public.admin_users where user_id=auth.uid() and status='active';
  select * into p from public.payment_submissions where id=p_payment_id for update;
  if not found then raise exception 'payment not found' using errcode='P0002'; end if;
  if p.status not in ('under_review','awaiting_confirmation') or p.credited_at is not null then raise exception 'payment cannot be credited' using errcode='22000'; end if;
  if exists(select 1 from public.wallet_transactions where payment_submission_id=p.id) then raise exception 'payment has already been credited' using errcode='23505'; end if;
  insert into public.wallet_accounts(user_id,currency) values(p.user_id,p.currency) on conflict(user_id,currency) do nothing;
  select * into w from public.wallet_accounts where user_id=p.user_id and currency=p.currency for update;
  new_balance:=w.total_balance+p_confirmed_amount;
  update public.wallet_accounts set total_balance=new_balance,available_balance=available_balance+p_confirmed_amount where id=w.id;
  insert into public.wallet_transactions(id,wallet_account_id,user_id,admin_id,type,direction,status,amount,currency,previous_value,resulting_value,reason,reference,payment_submission_id,completed_at)
  values(tx,w.id,p.user_id,a,case when p.method='bitcoin' then 'bitcoin_deposit'::public.transaction_type else 'bank_deposit'::public.transaction_type end,'credit','completed',p_confirmed_amount,p.currency,w.total_balance,new_balance,btrim(p_reason),'ORY-PAY-CREDIT-'||p.id,p.id,now());
  update public.payment_submissions set status='credited',confirmed_amount=p_confirmed_amount,reviewed_by=a,reviewed_at=coalesce(reviewed_at,now()),credited_at=now(),rejection_reason=null where id=p.id;
  insert into public.admin_audit_logs(admin_id,affected_user_id,action,resource_type,resource_id,previous_state,new_state,reason,amount,currency,reference)
  values(a,p.user_id,'payment_approved_and_credited','payment_submission',p.id,jsonb_build_object('status',p.status,'balance',w.total_balance),jsonb_build_object('status','credited','balance',new_balance),btrim(p_reason),p_confirmed_amount,p.currency,p.internal_reference);
  return tx;
end $$;

create function public.admin_apply_restriction(p_user_id uuid,p_type public.restriction_type,p_reason text,p_expires_at timestamptz default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare a uuid; rid uuid:=gen_random_uuid();
begin
 if not public.has_admin_permission('restrictions.change') then raise exception 'not authorized' using errcode='42501'; end if;
 if char_length(btrim(coalesce(p_reason,'')))<3 or char_length(p_reason)>1000 then raise exception 'valid reason is required' using errcode='22000'; end if;
 if p_expires_at is not null and p_expires_at<=now() then raise exception 'expiry must be in the future' using errcode='22000'; end if;
 if not exists(select 1 from public.profiles where id=p_user_id) then raise exception 'user not found' using errcode='P0002'; end if;
 if exists(select 1 from public.account_restrictions where user_id=p_user_id and type=p_type and active and (expires_at is null or expires_at>now())) then raise exception 'restriction is already active' using errcode='23505'; end if;
 select id into a from public.admin_users where user_id=auth.uid() and status='active';
 insert into public.account_restrictions(id,user_id,type,reason,expires_at,created_by) values(rid,p_user_id,p_type,btrim(p_reason),p_expires_at,a);
 insert into public.admin_audit_logs(admin_id,affected_user_id,action,resource_type,resource_id,new_state,reason) values(a,p_user_id,'restriction_applied','account_restriction',rid,jsonb_build_object('type',p_type,'active',true,'expires_at',p_expires_at),btrim(p_reason));
 return rid;
end $$;

create function public.admin_remove_restriction(p_restriction_id uuid,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare r public.account_restrictions%rowtype; a uuid;
begin
 if not public.has_admin_permission('restrictions.change') then raise exception 'not authorized' using errcode='42501'; end if;
 if char_length(btrim(coalesce(p_reason,'')))<3 or char_length(p_reason)>1000 then raise exception 'valid reason is required' using errcode='22000'; end if;
 select * into r from public.account_restrictions where id=p_restriction_id for update;
 if not found or not r.active then raise exception 'active restriction not found' using errcode='P0002'; end if;
 select id into a from public.admin_users where user_id=auth.uid() and status='active';
 update public.account_restrictions set active=false,removed_at=now(),removed_by=a where id=r.id;
 insert into public.admin_audit_logs(admin_id,affected_user_id,action,resource_type,resource_id,previous_state,new_state,reason) values(a,r.user_id,'restriction_removed','account_restriction',r.id,jsonb_build_object('active',true,'type',r.type),jsonb_build_object('active',false,'type',r.type),btrim(p_reason));
end $$;

create function public.admin_set_account_status(p_user_id uuid,p_status public.account_status,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare old_status public.account_status; a uuid;
begin
 if not public.has_admin_permission('restrictions.change') then raise exception 'not authorized' using errcode='42501'; end if;
 if p_status not in ('active','suspended','blocked') then raise exception 'unsupported account status operation' using errcode='22000'; end if;
 if char_length(btrim(coalesce(p_reason,'')))<3 or char_length(p_reason)>1000 then raise exception 'valid reason is required' using errcode='22000'; end if;
 select status into old_status from public.profiles where id=p_user_id for update;
 if not found then raise exception 'user not found' using errcode='P0002'; end if;
 if old_status=p_status then raise exception 'account already has requested status' using errcode='22000'; end if;
 if p_status='active' and old_status not in ('restricted','suspended','blocked') then raise exception 'account cannot be restored from current status' using errcode='22000'; end if;
 select id into a from public.admin_users where user_id=auth.uid() and status='active';
 update public.profiles set status=p_status where id=p_user_id;
 insert into public.admin_audit_logs(admin_id,affected_user_id,action,resource_type,resource_id,previous_state,new_state,reason) values(a,p_user_id,case when p_status='active' then 'account_restored' else 'account_'||p_status::text end,'profile',p_user_id,jsonb_build_object('status',old_status),jsonb_build_object('status',p_status),btrim(p_reason));
end $$;

create function public.admin_send_notification(p_user_id uuid,p_type public.notification_type,p_title text,p_body text)
returns uuid language plpgsql security definer set search_path='' as $$
declare a uuid; nid uuid:=gen_random_uuid();
begin
 if not public.has_admin_permission('notifications.send') then raise exception 'not authorized' using errcode='42501'; end if;
 if char_length(btrim(coalesce(p_title,''))) not between 2 and 160 or char_length(btrim(coalesce(p_body,'')))<2 or char_length(p_body)>4000 then raise exception 'invalid notification content' using errcode='22000'; end if;
 if not exists(select 1 from public.profiles where id=p_user_id) then raise exception 'user not found' using errcode='P0002'; end if;
 select id into a from public.admin_users where user_id=auth.uid() and status='active';
 insert into public.notifications(id,user_id,type,title,body,created_by) values(nid,p_user_id,p_type,btrim(p_title),btrim(p_body),a);
 insert into public.admin_audit_logs(admin_id,affected_user_id,action,resource_type,resource_id,new_state,reason) values(a,p_user_id,'notification_sent','notification',nid,jsonb_build_object('type',p_type,'title',btrim(p_title)),'Administrator sent an in-app notification');
 return nid;
end $$;

create function public.admin_save_investment_plan(p_id uuid,p_slug text,p_name text,p_short_description text,p_full_description text,p_minimum numeric,p_maximum numeric,p_currency text,p_duration_days integer,p_return_description text,p_risk_level text,p_terms text,p_status public.plan_status)
returns uuid language plpgsql security definer set search_path='' as $$
declare a uuid; plan_id uuid:=coalesce(p_id,gen_random_uuid()); old public.investment_plans%rowtype;
begin
 if not public.has_admin_permission('plans.manage') then raise exception 'not authorized' using errcode='42501'; end if;
 if p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' or char_length(p_name) not between 2 and 120 or p_minimum<=0 or (p_maximum is not null and p_maximum<p_minimum) or p_currency !~ '^[A-Z0-9]{3,10}$' or p_duration_days<=0 then raise exception 'invalid investment plan' using errcode='22000'; end if;
 select id into a from public.admin_users where user_id=auth.uid() and status='active';
 if p_id is null then
   insert into public.investment_plans(id,slug,name,short_description,full_description,minimum_amount,maximum_amount,currency,duration_days,return_description,risk_level,terms,status,created_by) values(plan_id,p_slug,btrim(p_name),p_short_description,p_full_description,p_minimum,p_maximum,p_currency,p_duration_days,p_return_description,p_risk_level,p_terms,p_status,a);
   insert into public.admin_audit_logs(admin_id,action,resource_type,resource_id,new_state,reason) values(a,'investment_plan_created','investment_plan',plan_id,jsonb_build_object('status',p_status,'name',p_name),'Administrator created investment plan');
 else
   select * into old from public.investment_plans where id=p_id for update; if not found then raise exception 'plan not found' using errcode='P0002'; end if;
   if not ((old.status='draft' and p_status in ('draft','active','archived')) or (old.status='active' and p_status in ('active','paused','closed')) or (old.status='paused' and p_status in ('paused','active','closed')) or (old.status='closed' and p_status in ('closed','archived')) or (old.status='archived' and p_status='archived')) then raise exception 'invalid plan status transition' using errcode='22000'; end if;
   update public.investment_plans set slug=p_slug,name=btrim(p_name),short_description=p_short_description,full_description=p_full_description,minimum_amount=p_minimum,maximum_amount=p_maximum,currency=p_currency,duration_days=p_duration_days,return_description=p_return_description,risk_level=p_risk_level,terms=p_terms,status=p_status where id=p_id;
   insert into public.admin_audit_logs(admin_id,action,resource_type,resource_id,previous_state,new_state,reason) values(a,'investment_plan_updated','investment_plan',p_id,jsonb_build_object('status',old.status,'name',old.name),jsonb_build_object('status',p_status,'name',p_name),'Administrator updated investment plan');
 end if; return plan_id;
end $$;

create function public.admin_update_investment_status(p_investment_id uuid,p_status public.investment_status,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare i public.user_investments%rowtype; plan public.investment_plans%rowtype; a uuid;
begin
 if not public.has_admin_permission('investments.manage') then raise exception 'not authorized' using errcode='42501'; end if;
 if char_length(btrim(coalesce(p_reason,'')))<3 or char_length(p_reason)>1000 then raise exception 'valid reason is required' using errcode='22000'; end if;
 select * into i from public.user_investments where id=p_investment_id for update; if not found then raise exception 'investment not found' using errcode='P0002'; end if;
 if not ((i.status='pending' and p_status='under_review') or (i.status='under_review' and p_status='active') or (i.status='active' and p_status in ('suspended','matured')) or (i.status='suspended' and p_status='active') or (i.status='matured' and p_status='completed')) then raise exception 'unsupported investment status transition' using errcode='22000'; end if;
 select * into plan from public.investment_plans where id=i.plan_id;
 select id into a from public.admin_users where user_id=auth.uid() and status='active';
 update public.user_investments set status=p_status,reviewed_by=a,started_at=case when p_status='active' then coalesce(started_at,now()) else started_at end,matures_at=case when p_status='active' then coalesce(matures_at,now()+make_interval(days=>plan.duration_days)) else matures_at end,completed_at=case when p_status='completed' then now() else completed_at end where id=i.id;
 insert into public.investment_updates(investment_id,user_id,update_type,description,created_by) values(i.id,i.user_id,'status_change',btrim(p_reason),a);
 insert into public.admin_audit_logs(admin_id,affected_user_id,action,resource_type,resource_id,previous_state,new_state,reason) values(a,i.user_id,'investment_status_updated','user_investment',i.id,jsonb_build_object('status',i.status),jsonb_build_object('status',p_status),btrim(p_reason));
end $$;

revoke all on function public.admin_start_payment_review(uuid),public.admin_reject_payment(uuid,text),public.admin_approve_and_credit_payment(uuid,numeric,text),public.admin_apply_restriction(uuid,public.restriction_type,text,timestamptz),public.admin_remove_restriction(uuid,text),public.admin_set_account_status(uuid,public.account_status,text),public.admin_send_notification(uuid,public.notification_type,text,text),public.admin_save_investment_plan(uuid,text,text,text,text,numeric,numeric,text,integer,text,text,text,public.plan_status),public.admin_update_investment_status(uuid,public.investment_status,text) from public,anon;
grant execute on function public.admin_start_payment_review(uuid),public.admin_reject_payment(uuid,text),public.admin_approve_and_credit_payment(uuid,numeric,text),public.admin_apply_restriction(uuid,public.restriction_type,text,timestamptz),public.admin_remove_restriction(uuid,text),public.admin_set_account_status(uuid,public.account_status,text),public.admin_send_notification(uuid,public.notification_type,text,text),public.admin_save_investment_plan(uuid,text,text,text,text,numeric,numeric,text,integer,text,text,text,public.plan_status),public.admin_update_investment_status(uuid,public.investment_status,text) to authenticated;

grant execute on function public.perform_wallet_adjustment(uuid,uuid,public.transaction_type,public.transaction_direction,numeric,text,text,text,uuid) to authenticated;
