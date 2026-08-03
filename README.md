# Oryvane Capital

A premium, security focused investment platform for reviewed bank and Bitcoin funding, portfolio monitoring, investment requests, withdrawals, and controlled financial administration.

**Live preview:** https://oryvane-capital.vercel.app

> **Project status:** Active development and pre production. The public preview is available, but the platform is not yet approved for live financial operations. See `RELEASE_READINESS.md` for the remaining launch requirements.

## Overview

Oryvane Capital gives users a clear interface for creating an account, submitting payments, monitoring funds, viewing investments and earnings, reviewing transaction history, and requesting withdrawals.

Financial changes are never made directly from the browser. Payments, wallet adjustments, investment settlements, restrictions, and withdrawals pass through protected server and database operations with administrator permissions, MFA, immutable financial records, and append only audit logs.

## Main capabilities

### Public experience

1. Responsive animated investment website
2. Live cryptocurrency and currency market context
3. Investment plan discovery
4. About, security, FAQ, contact, privacy, terms, and risk disclosure pages
5. Accessible layouts across mobile, tablet, and desktop

### User platform

1. Registration, email verification, login, logout, and password recovery
2. Protected dashboard with account figures and transaction history
3. Bank transfer payment submissions with private receipt uploads
4. Bitcoin payment submissions with transaction hash validation
5. Investment requests with atomic wallet reservation
6. Bank and Bitcoin withdrawal requests
7. Investment, deposit, withdrawal, and notification history
8. Profile and account status controls

### Administrator platform

1. Separate protected administrator portal
2. Mandatory Supabase TOTP MFA and AAL2 assurance
3. Role based permissions
4. Payment review, rejection, approval, and atomic wallet crediting
5. Controlled wallet adjustments, corrections, refunds, and reversals
6. Account restrictions, suspension, blocking, and restoration
7. Investment plan and investment lifecycle management
8. Withdrawal review, payment, rejection, and reversal controls
9. Append only administrator audit records

## Security and accounting model

Oryvane Capital is designed around server authoritative financial state.

1. Supabase Auth is the identity and session authority
2. Row Level Security protects all exposed application tables
3. Users cannot directly modify balances, earnings, transactions, roles, restrictions, approvals, or audit records
4. Financial operations use protected PostgreSQL functions, row locking, status validation, and idempotency controls
5. Wallet transactions and administrator audit records are append only
6. Administrator routes require an active administrator record, an assigned role, the required permission, and AAL2 MFA
7. Payment receipts and profile images use private Supabase Storage buckets
8. Receipt uploads enter quarantine and cannot be reviewed until the configured scanner records a clean result
9. Authentication and sensitive operations use durable database backed rate limiting
10. Production pages use a request specific nonce Content Security Policy with dynamic rendering
11. Service role credentials and payment destinations remain server only

## Technology stack

| Area | Technology |
| --- | --- |
| Application | Next.js App Router, React, TypeScript |
| Styling | Tailwind CSS, Motion, Lenis |
| Forms and validation | React Hook Form, Zod |
| Backend | Supabase Auth, PostgreSQL, Storage, RLS, RPC functions |
| Testing | Vitest, Testing Library, Playwright, axe core, pgTAP |
| Deployment | Vercel |
| Market information | Server fetched cryptocurrency and currency data |

## Project structure

```text
src/
  app/                 Next.js routes, layouts, loading and error boundaries
  components/          Public, dashboard, admin, financial and motion components
  config/              Public and server environment validation
  lib/                  Supabase clients and shared utilities
  security/             Request validation, logging and masking helpers
  server/               Server only data services and protected actions
  types/                Generated Supabase database types
  validation/           Zod validation schemas

supabase/
  migrations/           Reviewed database migrations
  tests/                Transaction scoped pgTAP security and accounting tests

tests/
  unit/                 Unit and component tests
  e2e/                  Playwright route, accessibility and workflow tests

docs/                   Architecture, deployment, security and operational documentation
```

## Local development

### Requirements

1. Node.js 20 or newer
2. npm
3. A Supabase project
4. Supabase CLI for database work
5. Docker only when running the local Supabase stack and pgTAP tests

### Installation

```powershell
git clone https://github.com/MrBri-an/Oryvane-Capital.git
cd Oryvane-Capital
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment variables

Copy `.env.example` to `.env.local` and provide the values required by the features you are using.

### Public variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Server only variables

```env
SUPABASE_SERVICE_ROLE_KEY=
INITIAL_SUPER_ADMIN_EMAIL=
ADMIN_SETUP_TOKEN=

PAYMENT_BANK_NAME=
PAYMENT_BANK_ACCOUNT_NAME=
PAYMENT_BANK_ACCOUNT_NUMBER=
PAYMENT_BANK_CURRENCY=
PAYMENT_BITCOIN_ADDRESS=
PAYMENT_BITCOIN_NETWORK=

RECEIPT_SCANNER_URL=
RECEIPT_SCANNER_API_KEY=
COINGECKO_API_KEY=
```

Never prefix server secrets with `NEXT_PUBLIC_`. Never commit `.env.local`.

## Supabase setup

Authenticate and link the repository to the intended Supabase project:

```powershell
npx supabase@latest login
npx supabase@latest link --project-ref YOUR_PROJECT_REF
npx supabase@latest migration list
npx supabase@latest db push --dry-run
```

Review the dry run before applying migrations:

```powershell
npx supabase@latest db push
npx supabase@latest gen types typescript --linked --schema public > src/types/database.ts
npx supabase@latest db lint --linked --level warning
```

Never run a linked database reset against an environment containing important data.

## First administrator setup

Before creating the first administrator, configure:

```env
INITIAL_SUPER_ADMIN_EMAIL=approved-admin@example.com
ADMIN_SETUP_TOKEN=a-random-secret-with-at-least-32-characters
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
```

Then:

1. Create and confirm the approved user through Supabase Auth
2. Sign in through `/login`
3. Open `/admin/setup`
4. Verify the setup token
5. Enrol and verify TOTP MFA
6. Complete the one time administrator creation

The setup route closes after the first administrator exists. Normal access continues through `/admin/login`.

## Supabase authentication URLs

For local development and the production preview, configure the Supabase Auth URL allowlist with the required callback routes:

```text
http://localhost:3000/**
https://oryvane-capital.vercel.app/**
https://oryvane-capital.vercel.app/auth/confirm
https://oryvane-capital.vercel.app/reset-password
```

Preview deployment URLs may be added with a carefully scoped Vercel wildcard.

## Available commands

```powershell
npm run dev
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run admin:bootstrap -- --user-id=AUTH_USER_UUID --role="Super administrator" --confirm=BOOTSTRAP_FIRST_ADMIN
```

`npm run build` is reserved for approved release verification and deployment workflows. Codex project instructions prohibit running it during ordinary implementation tasks.

## Testing

Run the standard checks:

```powershell
npm run lint
npm run typecheck
npm test
npm run test:e2e
```

Database security and accounting tests require a local Supabase stack:

```powershell
npx supabase@latest start
npx supabase@latest test db
```

Do not run mutation based test suites against the linked production database.

## Deployment

The application is configured for Vercel. Production and preview environments must provide their own environment variables because `.env.local` is never uploaded automatically.

Important deployment requirements include:

1. `NEXT_PUBLIC_SITE_URL` must match the deployed HTTPS origin
2. Supabase Site URL and Redirect URLs must match the deployment
3. CSP connection origins must remain narrowly configured
4. The receipt scanner, monitoring, backups, legal content, and support channels must be approved before live operation
5. `/api/health` returns only `{ "status": "ok" }`

## Current release status

The platform remains pre production until the remaining release blockers are closed, including:

1. Local pgTAP execution against an isolated Supabase stack
2. Authenticated staging coverage with disposable user and administrator accounts
3. Operational receipt scanner verification and failure drills
4. Monitoring, alerting, backup retention, and restoration testing
5. Final company identity, legal, support, and operational approvals
6. Independent security and accessibility testing

See `RELEASE_READINESS.md` and `docs/PRODUCTION_CHECKLIST.md` for the authoritative launch criteria.

## Documentation

Important project documents include:

1. `ARCHITECTURE.md`
2. `SECURITY.md`
3. `ADMIN_SYSTEM.md`
4. `FINANCIAL_RULES.md`
5. `PRODUCT_REQUIREMENTS.md`
6. `QA.md`
7. `SECURITY_AUDIT.md`
8. `ROUTE_AUDIT.md`
9. `RELEASE_READINESS.md`
10. `docs/DEPLOYMENT.md`
11. `docs/RLS_IMPLEMENTATION.md`
12. `docs/GRAPHIFY_ARCHITECTURE_REPORT.md`

## Author

**Brian Dara**

GitHub: https://github.com/MrBri-an

Portfolio: https://mrbrian.vercel.app

LinkedIn: https://linkedin.com/in/brian-dara-52493a222

## Licence

No open source licence is currently granted. All rights are reserved unless a licence is added to the repository.
