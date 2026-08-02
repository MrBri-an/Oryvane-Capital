-- Phase 12A follow-up: repair reserved identifier interpretation found by linked plpgsql_check.
create or replace function public.consume_rate_limit(p_scope text,p_key_hash text,p_limit integer,p_window_seconds integer)
returns boolean language plpgsql security definer set search_path='' as $$
declare current_count integer; window_start timestamptz; observed_at timestamptz:=clock_timestamp();
begin
  if p_scope !~ '^[a-z][a-z0-9_.-]{2,63}$' or p_key_hash !~ '^[0-9a-f]{64}$' or p_limit not between 1 and 100 or p_window_seconds not between 60 and 86400 then
    raise exception 'invalid rate limit request' using errcode='22000';
  end if;
  insert into public.rate_limit_counters(scope,key_hash,window_started_at,request_count)
  values(p_scope,p_key_hash,observed_at,1)
  on conflict(scope,key_hash) do update set
    window_started_at=case when public.rate_limit_counters.window_started_at + make_interval(secs=>p_window_seconds) <= observed_at then observed_at else public.rate_limit_counters.window_started_at end,
    request_count=case when public.rate_limit_counters.window_started_at + make_interval(secs=>p_window_seconds) <= observed_at then 1 else public.rate_limit_counters.request_count+1 end
  returning request_count,window_started_at into current_count,window_start;
  return current_count <= p_limit;
end $$;

revoke all on function public.consume_rate_limit(text,text,integer,integer) from public;
grant execute on function public.consume_rate_limit(text,text,integer,integer) to anon,authenticated;
