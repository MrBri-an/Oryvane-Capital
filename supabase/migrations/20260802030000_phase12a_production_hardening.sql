-- Phase 12A: durable request throttling and payment-receipt quarantine state.

create type public.receipt_scan_status as enum ('quarantined','clean','infected','failed','unavailable');

alter table public.payment_submissions
  add column receipt_scan_status public.receipt_scan_status not null default 'quarantined',
  add column receipt_scanned_at timestamptz,
  add column receipt_scanner text,
  add constraint payment_receipt_scan_consistency check (
    (receipt_scan_status = 'quarantined' and receipt_scanned_at is null)
    or (receipt_scan_status <> 'quarantined' and receipt_scanned_at is not null)
  );

comment on column public.payment_submissions.receipt_scan_status is 'Server-controlled malware scan state. Admin review must require clean when a receipt exists.';

create table public.rate_limit_counters (
  scope text not null check (scope ~ '^[a-z][a-z0-9_.-]{2,63}$'),
  key_hash text not null check (key_hash ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  primary key (scope,key_hash)
);

alter table public.rate_limit_counters enable row level security;
revoke all on public.rate_limit_counters from public,anon,authenticated;

create function public.consume_rate_limit(p_scope text,p_key_hash text,p_limit integer,p_window_seconds integer)
returns boolean language plpgsql security definer set search_path='' as $$
declare current_count integer; started timestamptz; current_time timestamptz:=clock_timestamp();
begin
  if p_scope !~ '^[a-z][a-z0-9_.-]{2,63}$' or p_key_hash !~ '^[0-9a-f]{64}$' or p_limit not between 1 and 100 or p_window_seconds not between 60 and 86400 then
    raise exception 'invalid rate limit request' using errcode='22000';
  end if;
  insert into public.rate_limit_counters(scope,key_hash,window_started_at,request_count)
  values(p_scope,p_key_hash,current_time,1)
  on conflict(scope,key_hash) do update set
    window_started_at=case when public.rate_limit_counters.window_started_at + make_interval(secs=>p_window_seconds) <= current_time then current_time else public.rate_limit_counters.window_started_at end,
    request_count=case when public.rate_limit_counters.window_started_at + make_interval(secs=>p_window_seconds) <= current_time then 1 else public.rate_limit_counters.request_count+1 end
  returning request_count,window_started_at into current_count,started;
  return current_count <= p_limit;
end $$;

create function public.record_payment_receipt_scan(p_payment_id uuid,p_status public.receipt_scan_status,p_scanner text)
returns void language plpgsql security definer set search_path='' as $$
begin
  if auth.role() <> 'service_role' then raise exception 'not authorized' using errcode='42501'; end if;
  if p_status not in ('clean','infected','failed','unavailable') or char_length(btrim(coalesce(p_scanner,''))) not between 1 and 200 then raise exception 'invalid scan result' using errcode='22000'; end if;
  update public.payment_submissions set receipt_scan_status=p_status,receipt_scanned_at=clock_timestamp(),receipt_scanner=btrim(p_scanner)
  where id=p_payment_id and receipt_path is not null and status in ('draft','submitted');
  if not found then raise exception 'payment receipt not available for scanning' using errcode='P0002'; end if;
end $$;

create function public.enforce_clean_payment_receipt()
returns trigger language plpgsql set search_path='' as $$
begin
  if new.status in ('under_review','awaiting_confirmation','approved','credited') and new.receipt_path is not null and new.receipt_scan_status <> 'clean' then
    raise exception 'payment receipt has not passed malware scanning' using errcode='55000';
  end if;
  if new.status in ('under_review','awaiting_confirmation','approved','credited') and new.method='bank_transfer' and new.receipt_path is null then
    raise exception 'bank receipt is required' using errcode='22000';
  end if;
  return new;
end $$;

create trigger payment_receipt_scan_gate before update of status on public.payment_submissions
for each row execute function public.enforce_clean_payment_receipt();

revoke all on function public.consume_rate_limit(text,text,integer,integer),public.record_payment_receipt_scan(uuid,public.receipt_scan_status,text),public.enforce_clean_payment_receipt() from public,anon,authenticated;
grant execute on function public.consume_rate_limit(text,text,integer,integer) to anon,authenticated;
grant execute on function public.record_payment_receipt_scan(uuid,public.receipt_scan_status,text) to service_role;

