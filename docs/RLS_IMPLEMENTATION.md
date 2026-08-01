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
