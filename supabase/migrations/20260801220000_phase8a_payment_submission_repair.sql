-- Phase 8A: repair the payment draft schema and add a protected submit transition.

alter table public.payment_submissions
  add column user_note text
    check (user_note is null or char_length(user_note) <= 1000),
  add column internal_reference text not null
    default ('ORY-PAY-' || gen_random_uuid()::text)
    check (internal_reference ~ '^ORY-PAY-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
  add constraint payment_submissions_internal_reference_key unique (internal_reference),
  add constraint payment_submissions_bitcoin_hash_format_check
    check (method <> 'bitcoin' or external_reference ~ '^[0-9A-Fa-f]{64}$') not valid;

create unique index payment_submissions_bitcoin_hash_unique
  on public.payment_submissions (lower(btrim(external_reference)))
  where method = 'bitcoin';

grant insert (user_note) on public.payment_submissions to authenticated;
grant update (user_note) on public.payment_submissions to authenticated;

create function public.submit_payment_for_review(p_payment_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  payment_record public.payment_submissions%rowtype;
  profile_status public.account_status;
begin
  if caller_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select status into profile_status
  from public.profiles
  where id = caller_id;

  if profile_status is null or profile_status <> 'active' then
    raise exception 'account is not eligible to submit payments' using errcode = '42501';
  end if;

  select * into payment_record
  from public.payment_submissions
  where id = p_payment_id and user_id = caller_id
  for update;

  if not found then
    raise exception 'payment submission not found' using errcode = 'P0002';
  end if;
  if payment_record.status <> 'draft' then
    raise exception 'only draft payments can be submitted' using errcode = '22000';
  end if;
  if payment_record.submitted_amount <= 0 then
    raise exception 'payment amount must be positive' using errcode = '22003';
  end if;
  if payment_record.currency !~ '^[A-Z0-9]{3,10}$' then
    raise exception 'payment currency is invalid' using errcode = '22000';
  end if;
  if payment_record.user_note is not null and char_length(payment_record.user_note) > 1000 then
    raise exception 'payment note is too long' using errcode = '22000';
  end if;
  if payment_record.confirmed_amount is not null
    or payment_record.rejection_reason is not null
    or payment_record.reviewed_by is not null
    or payment_record.reviewed_at is not null
    or payment_record.credited_at is not null then
    raise exception 'payment review fields must be empty' using errcode = '42501';
  end if;

  if payment_record.method = 'bank_transfer' then
    if nullif(btrim(payment_record.sender_name), '') is null then
      raise exception 'sender name is required for bank transfers' using errcode = '22000';
    end if;
    if nullif(btrim(payment_record.external_reference), '') is null then
      raise exception 'bank transaction reference is required' using errcode = '22000';
    end if;
    if payment_record.receipt_path is null then
      raise exception 'payment receipt is required for bank transfers' using errcode = '22000';
    end if;
  elsif payment_record.method = 'bitcoin' then
    if payment_record.external_reference is null
      or payment_record.external_reference !~ '^[0-9A-Fa-f]{64}$' then
      raise exception 'valid Bitcoin transaction hash is required' using errcode = '22000';
    end if;
  else
    raise exception 'payment method is invalid' using errcode = '22000';
  end if;

  if payment_record.receipt_path is not null then
    if (storage.foldername(payment_record.receipt_path))[1] <> caller_id::text
      or (storage.foldername(payment_record.receipt_path))[2] <> payment_record.id::text
      or not exists (
        select 1 from storage.objects
        where bucket_id = 'payment-receipts'
          and name = payment_record.receipt_path
          and owner_id = caller_id::text
      ) then
      raise exception 'payment receipt path is invalid' using errcode = '42501';
    end if;
  end if;

  update public.payment_submissions
  set status = 'submitted', submitted_at = now()
  where id = payment_record.id;

  return payment_record.internal_reference;
end;
$$;

revoke all on function public.submit_payment_for_review(uuid) from public, anon;
grant execute on function public.submit_payment_for_review(uuid) to authenticated;

comment on column public.payment_submissions.internal_reference is
  'Immutable server-generated reference. Authenticated users have no insert or update privilege on this column.';
comment on function public.submit_payment_for_review(uuid) is
  'Validates and atomically transitions the authenticated owner payment from draft to submitted.';
