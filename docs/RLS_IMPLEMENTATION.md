# Oryvane Capital RLS Implementation

## Baseline

RLS is enabled on every public application table. Default table privileges for `anon` and `authenticated` are revoked, then only the minimum required operations and columns are granted.

RLS and grants work together:

- RLS limits which rows a request can access.
- Column grants prevent protected profile, notification, and submission fields from being changed even on an owned row.
- Append-only triggers protect financial transactions and audit logs even from privileged accidental updates.
- Protected financial writes use a controlled atomic function rather than table policies.

## User access

Authenticated users can read their own profile, wallets, transactions, payment submissions, investments, investment updates, withdrawals, notifications, and active restrictions. They cannot read another user's rows.

Direct user writes are limited to:

- approved personal profile columns;
- creating and editing their own draft payment-submission fields;
- marking their own notifications as read;
- objects inside their own private storage folder.

Users have no direct insert, update, or delete privilege for wallet accounts, wallet transactions, earnings, investment status, withdrawal approval, restrictions, admin tables, or audit logs.

## Public access

Anonymous users can only select investment plans whose status is `active`. No anonymous mutation grants are provided.

## Admin access

`has_admin_permission(key, require_aal2)` is a `SECURITY DEFINER` helper with an empty fixed `search_path`. It returns true only when:

1. `auth.uid()` matches an `admin_users` record;
2. that record is `active`;
3. its assigned role contains the requested permission; and
4. the JWT assurance level is `aal2` when required (the default).

Admin RLS policies use this helper for read access. No admin table mutation policies are exposed to browser roles. The internal explicit-user helper is revoked from `anon` and `authenticated`.

Phase 10A adds the fixed system role and permission catalogue plus three narrowly scoped helpers. `is_current_user_active_admin()` is an AAL1-safe identity check used only to decide whether an authenticated user may proceed to MFA. `get_current_admin_context()` returns the caller's role and permissions only at AAL2. `record_admin_auth_event()` accepts only an allowlist of authentication event types and requires an active admin. All are `SECURITY DEFINER` only where required, use an empty fixed `search_path`, and have execution revoked from `public` and `anon`.

The service-role-only `bootstrap_first_admin(uuid, text)` is not executable by browser roles. It accepts an exact fixed role, requires an existing Auth user and profile, refuses to run after any admin record exists, and writes the admin record and append-only audit event in one transaction. TOTP enrollment is additionally verified by the server-only bootstrap script before calling it.

Admin page services require AAL2 and a specific permission before querying. RLS independently repeats the active-admin, assigned-permission, and AAL2 requirements. The Phase 10A application exposes no admin insert, update, delete, approval, crediting, restriction, or status operation.

Phase 10B preserves direct table-write denial and adds narrow `SECURITY DEFINER` operation functions. Each function has an empty fixed `search_path`, requires an active AAL2 administrator through `has_admin_permission`, validates the current record state, and writes the business record and append-only audit log atomically. Execution is revoked from `public` and `anon`; authenticated callers still receive no raw financial or audit table mutation privilege.

Mutation permissions are distinct from read permissions: `payments.manage`, `payments.reject`, `restrictions.change`, `investments.manage`, and `notifications.send`. This prevents the Read only auditor and support roles from gaining mutation authority merely because they can read related records. Payment crediting additionally requires `finance.adjust`.

`wallet_transactions_payment_credit_unique` permits at most one wallet transaction for a payment submission. Payment and wallet row locks provide further concurrency protection. Adjustments use `perform_wallet_adjustment`, including opposite-direction, exact-amount, single-use reversal validation.

Notifications remain user-owned for normal-user reads; administrators with `notifications.send` may read notification history. No Phase 10B function permanently deletes notifications, transactions, payments, investments, users, or audit events.

Phase 10C adds user-owned `submit_withdrawal_request` and AAL2 admin settlement functions. The withdrawal function derives ownership from `auth.uid()`, requires an active profile, checks active withdrawal or account restrictions, locks the matching wallet, validates the method-specific destination, and reserves funds atomically. Users retain no direct withdrawal, wallet, or transaction table write privilege.

Investment principal release and maturity lock the investment, wallet, and original allocation transaction. An immutable reversal linked through the unique `reversal_of` column returns principal once. Realised earnings require `investments.manage` and `finance.adjust`, are allowed only after maturity, and use the globally unique transaction reference for idempotency.

`withdrawals.manage` is assigned only to Super administrator and Finance administrator. Administrative withdrawal transitions require an active AAL2 administrator and preserve all request, transaction, and audit history. Bank account numbers and Bitcoin addresses are stored in the protected destination object and masked in user and administrator tables.

## Storage

Both buckets are private:

- `payment-receipts`: 10 MiB, JPEG/PNG/WebP/PDF
- `profile-images`: 5 MiB, JPEG/PNG/WebP

Object names must begin with the authenticated user's UUID as the first folder segment, for example:

```text
USER_UUID/random-object-name.webp
```

Users can only insert, select, update, and delete objects under their own folder. A permitted AAL2 administrator may read payment receipts for review. Payment receipts are never public.

Database policies cannot safely validate file signatures or extensions. Future upload server operations must validate content type, extension, signature, size, and generated object names before upload.

## Payment submission transition

Phase 8A keeps draft editing under the existing ownership policy and adds `submit_payment_for_review(uuid)` for the protected status transition. The `SECURITY DEFINER` function has an empty fixed `search_path`, verifies `auth.uid()`, requires an active profile, locks the caller-owned draft, validates method-specific evidence and storage ownership, and changes only `status` and `submitted_at`.

Execution is revoked from `public` and `anon` and granted only to `authenticated`. Authenticated table privileges still exclude `internal_reference`, `status`, `submitted_at`, approval, review, confirmed amount, and crediting columns. Bitcoin hashes are protected by a case-insensitive partial unique index; bank references remain non-unique.

## Investment request transition

Phase 9 adds `request_user_investment(uuid, numeric, text)`. This `SECURITY DEFINER` function uses an empty fixed `search_path`, derives ownership from `auth.uid()`, requires an active account, checks active restrictions, locks the plan and wallet, validates plan limits and availability, prevents duplicate open requests, and atomically reserves available funds with an immutable allocation transaction.

Execution is revoked from `public` and `anon` and granted only to `authenticated`. Users retain no table insert/update privilege on investments, wallets, transactions, earnings, status, start dates, or maturity dates. Authenticated plan reads now also permit a user to read plans referenced by their own investments so historical plan names remain available after a plan is paused, closed, or archived; this does not make those plans public.

## Tests

`supabase/tests/phase6_rls.sql` uses transaction-scoped identities and records and ends with `rollback`. It covers:

- user row isolation;
- forbidden financial writes;
- forbidden normal-user admin access;
- append-only wallet transactions;
- append-only audit logs;
- storage folder ownership;
- active admin permission assignment; and
- the AAL2 requirement.

Run only against a local disposable Supabase database:

```text
supabase start
supabase db reset --local
supabase test db
```

Never run this test file against a linked remote project.

`supabase/tests/phase8a_payment_submission.sql` is also transaction-scoped and covers draft submission, ownership, evidence requirements, duplicate Bitcoin hashes, account status, server-generated references, and protected review fields. Run it only against a local disposable database.

`supabase/tests/phase9_investment_requests.sql` covers atomic fund reservation, invested totals, immutable allocation records, duplicate requests, limits, currency, account status, and forbidden direct writes. It is transaction-scoped and must only run against a local disposable database.
