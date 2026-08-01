-- Phase 6 review hardening. No data is deleted or rewritten.

-- AAL2 is mandatory for every permission check, regardless of caller arguments.
create or replace function public.has_admin_permission(permission_key text, require_aal2 boolean default true)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    and exists (
      select 1
      from public.admin_users au
      join public.admin_role_permissions arp on arp.role_id = au.role_id
      join public.admin_permissions ap on ap.id = arp.permission_id
      where au.user_id = auth.uid()
        and au.status = 'active'
        and ap.key = permission_key
    );
$$;

-- Keep anonymous plan reads independent from an authenticated-only helper.
drop policy investment_plans_public_active on public.investment_plans;
create policy investment_plans_anon_active on public.investment_plans for select to anon
  using (status = 'active');
create policy investment_plans_authenticated_access on public.investment_plans for select to authenticated
  using (status = 'active' or public.has_admin_permission('plans.manage'));

-- Owned database paths must point to the caller's private storage folder.
drop policy profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and (avatar_path is null or (storage.foldername(avatar_path))[1] = auth.uid()::text)
  );

drop policy payment_submissions_insert_own on public.payment_submissions;
drop policy payment_submissions_update_own_draft on public.payment_submissions;
create policy payment_submissions_insert_own on public.payment_submissions for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'draft'
    and (receipt_path is null or (storage.foldername(receipt_path))[1] = auth.uid()::text)
  );
create policy payment_submissions_update_own_draft on public.payment_submissions for update to authenticated
  using (user_id = auth.uid() and status = 'draft')
  with check (
    user_id = auth.uid()
    and status = 'draft'
    and (receipt_path is null or (storage.foldername(receipt_path))[1] = auth.uid()::text)
  );

-- A receipt becomes immutable to its owner once administrative review begins.
drop policy payment_receipts_update_own_folder on storage.objects;
drop policy payment_receipts_delete_own_folder on storage.objects;
create policy payment_receipts_update_own_folder on storage.objects for update to authenticated
  using (
    bucket_id = 'payment-receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
    and not exists (
      select 1 from public.payment_submissions ps
      where ps.user_id = auth.uid()
        and ps.receipt_path = name
        and ps.status not in ('draft', 'submitted')
    )
  )
  with check (bucket_id = 'payment-receipts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy payment_receipts_delete_own_folder on storage.objects for delete to authenticated
  using (
    bucket_id = 'payment-receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
    and not exists (
      select 1 from public.payment_submissions ps
      where ps.user_id = auth.uid()
        and ps.receipt_path = name
        and ps.status not in ('draft', 'submitted')
    )
  );
