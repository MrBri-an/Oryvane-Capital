# Oryvane Capital Database Schema

## Scope

Phase 6 defines the authoritative relational foundation only. It does not activate payments, investments, withdrawals, financial administration, or dashboard features. No fake business records or real administrator are seeded.

## Conventions

- Application primary keys are UUIDs generated with `gen_random_uuid()`.
- User-owned records reference `auth.users` through `profiles`.
- Financial records use `numeric(38,18)`; floating-point types are not used.
- Currency values are explicit uppercase codes of 3–10 characters.
- Operational timestamps use `timestamptz`.
- Financial history uses restrictive foreign keys and cannot cascade-delete.
- Wallet transactions and admin audit logs are append-only at trigger level.

## Tables

| Table | Purpose | Important controls |
|---|---|---|
| `profiles` | Normal user profile and account status | Created by Auth trigger; protected status and acceptance columns |
| `wallet_accounts` | Per-user, per-currency account aggregates | Unique user/currency; no browser writes |
| `wallet_transactions` | Authoritative credits, debits, corrections, and reversals | Immutable; linked reversal; fixed precision |
| `payment_submissions` | User-submitted bank or Bitcoin evidence | User draft fields separated from protected review fields |
| `investment_plans` | Publishable plan definitions | Only active plans publicly readable |
| `user_investments` | User allocation records | Status and financial values server-controlled |
| `investment_updates` | Approved investment and earnings updates | Server-created and user-readable |
| `withdrawal_requests` | Bank or Bitcoin withdrawal requests | Review and paid state server-controlled |
| `notifications` | User financial, security, and account notices | User can only set `read_at` |
| `account_restrictions` | Deposit, withdrawal, investment, login, or account restrictions | Admin-controlled |
| `security_events` | Security-relevant event history | Limited user columns; protected creation |
| `admin_users` | Approved admin identity linked to Auth | Active status and role required |
| `admin_roles` | Named administrative roles | No automatic roles |
| `admin_permissions` | Fine-grained permission keys | Sensitive by default |
| `admin_role_permissions` | Role-to-permission mapping | Composite primary key |
| `admin_audit_logs` | Permanent admin action history | Append-only |

## New-user trigger

`handle_new_user()` runs after insertion into `auth.users` and creates one profile. It has a fixed empty `search_path` and fully qualified references.

It may copy `full_name`, `phone`, `country`, and the presence of policy acceptance timestamps from temporary signup metadata. Metadata never controls profile status, admin membership, roles, permissions, wallet creation, balances, earnings, or financial authority. The profile status always uses the database default `pending_verification`.

## Atomic wallet adjustments

`perform_wallet_adjustment()` is a protected foundation for a later server workflow. In one database transaction it:

1. Requires forwarded `aal2` request claims.
2. Requires an active admin with `finance.adjust`.
3. Locks the wallet row.
4. Validates currency, amount, available funds, and reversal rules.
5. Updates the wallet aggregate.
6. Inserts an immutable wallet transaction with previous/resulting value.
7. Inserts an immutable admin audit record.

Its API execution privilege is granted only to `service_role`, not `anon` or `authenticated`. A future server operation must validate and forward the actual administrator session context; it must not synthesize MFA claims or trust an administrator ID supplied by a browser.

## Reversals

Existing financial transactions cannot be edited or deleted. A correction must insert a new `reversal` transaction that references exactly one completed, non-reversal original transaction. A unique constraint prevents reversing the same transaction twice.
