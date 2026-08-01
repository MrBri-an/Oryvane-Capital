# Oryvane Capital Security Audit

Audit date: 2 August 2026

## Executive result

No hardcoded secret, tracked environment secret, service-role browser exposure, raw browser balance update, open redirect, obvious SQL string interpolation, or public payment-receipt bucket was found. The application is nevertheless **not production-ready** because high-severity transitive dependency advisories remain, local financial/RLS tests could not be executed, production rate limiting is absent, and authenticated end-to-end security testing has not been completed.

## Controls verified

### Secrets and privileged credentials

- Git tracks no `.env`, `.env.local`, Supabase secret file, PEM, or key file.
- `SUPABASE_SERVICE_ROLE_KEY` appears only in the server-only environment schema and explicit bootstrap script.
- No client component imports or reads the service-role key.
- Public variables are limited to the Supabase URL, anon key, and site URL.

### Authorization and financial mutation

- Dashboard middleware redirects unauthenticated users and the user layout repeats identity/profile checks.
- Financial server actions require authenticated active profiles; database functions derive `auth.uid()`, lock authoritative rows, validate statuses and balances, and preserve transaction atomicity.
- Admin layouts and every admin data/action service repeat server authorization.
- Protected admin operations require active admin records, permission checks, AAL2, and fresh TOTP confirmation in the server action.
- Browser roles have no raw wallet, transaction, investment-status, withdrawal-status, or audit mutation grants. Narrow RPC functions independently enforce ownership/permissions.

### RLS and Storage

- RLS is enabled on all 16 exposed public tables.
- User policies scope profiles, wallets, transactions, payments, investments, withdrawals, notifications, restrictions, and events to `auth.uid()`.
- Admin reads use active-admin, permission, and AAL2 helpers.
- `payment-receipts` and `profile-images` are private, size/MIME constrained buckets with first-folder UUID ownership policies.
- Payment receipt server handling validates declared MIME, extension, leading signature, size, generated path, database ownership, and private upload location. No upload is sent to Sharp, `next/image`, PostCSS, or an application source directory.

### Injection, disclosure, and redirect controls

- Zod validates external form and privileged action input.
- Supabase query builders and typed RPC calls are used; no user-supplied SQL concatenation was found.
- No `dangerouslySetInnerHTML`, `eval`, `new Function`, or user HTML rendering was found.
- Redirects use a fixed local allowlist and reject external, protocol-relative, backslash, control-character, and unapproved paths.
- Authentication, recovery, and privileged errors are generic and do not expose account existence, tokens, SQL text, or secrets.

### Financial invariants

- Payment credit: status lock plus unique `payment_submission_id` transaction index.
- Investment allocation: plan/wallet locks and atomic reservation transaction.
- Investment release/maturity: original allocation reversal with unique `reversal_of`.
- Earnings: globally unique immutable transaction reference.
- Withdrawal replay: stable per-form request UUID plus unique `(user_id, client_request_id)`.
- Withdrawal rejection and paid reversal: status locks plus unique reversal linkage.
- Wallet transactions and admin audit logs have append-only database triggers.

## Headers added

All routes now receive:

- Content Security Policy
- `Referrer-Policy: strict-origin-when-cross-origin`
- restrictive Permissions Policy
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- one-year HSTS with subdomains

The CSP blocks objects and framing, restricts form/base origins, limits connections to same-origin and Supabase, and avoids production `unsafe-eval`. Next.js currently requires `unsafe-inline` for script/style compatibility in this implementation; nonce-based CSP is a production hardening action. HSTS is effective only when deployed exclusively over HTTPS. `allowedDevOrigins` and local WebSocket sources apply only to development behavior.

## Risks and required remediation

### Release blockers

1. `npm audit` reports three high findings through Next.js: affected PostCSS 8.4.31 and Sharp 0.34.5/libvips. No compatible stable patched Next.js release was available in the reviewed dependency state.
2. The complete pgTAP financial/RLS suite has not run because local Supabase is unavailable.
3. No authenticated browser run has validated real user sessions, TOTP enrollment/challenge, permission-specific admin screens, or financial dialogs with disposable test identities.
4. No application/infrastructure rate limiting exists for login, registration, recovery, payment submission, withdrawal submission, or admin mutations.

### High-priority hardening

- Replace wildcard Supabase CSP endpoints with the exact production project origin.
- Introduce nonce-based production CSP to remove `unsafe-inline` where supported.
- Add edge/API rate limits and alerting without weakening generic authentication responses.
- Add production malware scanning/content disarm for private receipts. Current magic-byte checks are not a malware detector and can be bypassed by polyglot content.
- Define retention, secure backup, incident response, monitoring, log redaction, and key-rotation procedures.
- Validate CSRF behavior at the deployed origin. Next Server Actions provide origin checks and Supabase cookies use browser protections, but deployment proxy/origin configuration must be tested.
- Configure exact Supabase redirect URLs, admin session lifetime, and inactivity logout in the hosted environment.

## Dependency finding

Current paths:

```text
next 16.2.12
├── postcss 8.4.31 (affected)
└── sharp 0.34.5 (affected)

@tailwindcss/postcss and Vitest/Vite
└── postcss 8.5.25 (patched path)
```

Advisories remain `GHSA-qx2v-qp2m-jg93`, `GHSA-6g55-p6wh-862q`, `GHSA-r28c-9q8g-f849`, and `GHSA-f88m-g3jw-g9cj`. No override, forced audit fix, downgrade, or image-security removal was used.
