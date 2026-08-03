# Oryvane Capital Graphify Architecture and Change-Impact Report

## 1. System overview

Oryvane Capital is a Next.js App Router application split into four route and trust domains: public pages, user authentication, the authenticated user dashboard, and a separately protected administrator portal. Supabase provides cookie-backed authentication, PostgreSQL data, RLS, private Storage, and narrow protected database functions. The browser renders forms and submits server actions, but PostgreSQL functions remain authoritative for financial state transitions.

The generated Graphify graph contains 864 nodes, 1,981 edges, and 86 communities. Its main implementation hubs are `createClient()` (61 edges), `cn()` (36), `Button()` (26), `getDashboardIdentity` (23), and `enforceRateLimit()` (21). The first three are expected shared infrastructure, not evidence of improper coupling:

- `createClient` deliberately has separate browser and server implementations in `src/lib/supabase/client.ts:L8` and `src/lib/supabase/server.ts:L9`. The identical label masks an important trust-boundary distinction.
- `cn` in `src/lib/utils.ts:L4` is a leaf class-name utility used by presentation components.
- `Button` and `buttonVariants` in `src/components/ui/button.tsx:L6-L21` are design-system primitives with many legitimate consumers.
- `getDashboardIdentity` is a higher-risk hub because it combines session identity, profile status, denial decisions, and the base for all user dashboard reads.
- `enforceRateLimit` is expected cross-cutting security infrastructure, but changing its failure or identifier semantics affects authentication, payment, investment, withdrawal, and admin-operation flows.

Graphify reports no import cycles. This is a strong architectural property: coupling is primarily hub-and-spoke rather than cyclic.

## 2. Subsystem map

| Subsystem | Entry points | Core services/components | Authority and persistence |
|---|---|---|---|
| Public site | `src/app/(public)/*`, including `/`, `/about`, `/investments`, `/security`, and legal routes | `src/components/public/*`, `src/components/market/*`, public layout | Anonymous reads of active investment plans; server-only market provider |
| User authentication | `src/app/(auth)/*`, `src/app/auth/confirm/route.ts` | `src/server/auth/actions.ts`, `src/server/auth/guards.ts`, Supabase server client | Supabase Auth, profile bootstrap trigger, login restrictions |
| User dashboard | `src/app/(user)/layout.tsx`, `src/app/(user)/dashboard/*` | `src/server/dashboard/data.ts`, dashboard components | User-owned RLS reads from profiles, wallets, transactions, payments, investments, withdrawals, notifications |
| Admin portal | `/admin/login`, `/admin/mfa`, `/admin/setup`, `/admin/(protected)/*` | admin authorization, access context, admin data and operation actions | AAL2, active admin record, fixed roles, permissions, protected RPCs, audit log |
| Payments | `/dashboard/deposits`, admin payment review | payment form, `src/server/payments/actions.ts`, scanning service | Private receipt Storage, `payment_submissions`, `submit_payment_for_review`, admin credit/reject functions |
| Investments | public plan pages, dashboard investments, admin investments | investment cards/forms and server actions | `investment_plans`, `user_investments`, `investment_updates`, allocation/settlement RPCs |
| Withdrawals | `/dashboard/withdrawals`, admin withdrawal queue | withdrawal form and actions | `withdrawal_requests`, wallet reservation, protected transition RPC |
| Visual system | root layout, public/auth/dashboard/admin shells | `globals.css`, motion system, cosmic background, design tokens, UI primitives | No financial authority; may consume read-only market data or already-authorized page data |

Route groups preserve URL-space separation without adding URL segments. `src/app/layout.tsx:L21` mounts the global background and toast viewport. `src/app/(public)/layout.tsx` supplies the public shell. `src/app/(user)/layout.tsx:L6` gates the dashboard with `getDashboardIdentity`. `src/app/(admin)/admin/(protected)/layout.tsx:L4` gates every protected admin page with `requireAdmin`.

## 3. Authentication path

Graphify BFS started at `Authentication Setup`, `updateSession()`, `authRoutes`, `dashboard/data.ts`, and the protected layouts. The source-verified path is:

1. `src/proxy.ts:L5` applies CSP headers and calls `updateSession` for all matched application requests.
2. `src/lib/supabase/middleware.ts:L6` creates an SSR Supabase client, refreshes cookie state, calls `auth.getUser()`, redirects anonymous `/dashboard*` requests to `/login`, and redirects authenticated `/login` or `/register` requests to `/dashboard`.
3. `src/server/auth/actions.ts` rate-limits and validates registration, login, recovery, reset, logout, and verification-resend actions. Redirect targets pass through `safeRedirectPath`.
4. The email callback at `src/app/auth/confirm/route.ts` exchanges the verification/recovery token and returns the user to an allowed application route.
5. `src/server/auth/guards.ts:L6` repeats server-side identity enforcement for protected server-rendered flows.
6. `src/app/(user)/layout.tsx:L6` calls `getDashboardIdentity`; denied or missing profiles render `AccountUnavailable` instead of the dashboard shell.

The middleware is an early navigation gate, not the sole authorization layer. Financial eligibility and ownership are checked again in server actions and RLS/database functions. Auth metadata is intentionally non-authoritative; `profiles`, restrictions, and protected database state make access decisions.

Graph limitation: `graphify path "Authentication Setup" "updateSession"` returned no path. The conceptual documentation and middleware code are present in separate graph components, so this relationship is source-verified rather than a claimed Graphify edge.

## 4. Admin authorization path

The administrator path is deliberately separate from normal user login:

1. `src/server/admin/auth-actions.ts:L15` rate-limits `/admin/login`, signs in with password, calls `is_current_user_active_admin`, records `admin_password_verified`, and routes non-AAL2 sessions to `/admin/mfa`.
2. `verifyAdminMfaAction` challenges and verifies a TOTP factor, re-reads the rotated cookie session, requires `aal2`, rechecks the active administrator, loads `get_current_admin_context`, requires `portal.access`, records `admin_mfa_verified`, and redirects to `/admin`.
3. `src/app/(admin)/admin/(protected)/layout.tsx:L4` calls `requireAdmin` for every protected admin route.
4. `src/server/admin/authorization.ts:L36` requires an authenticated user, active admin RPC, AAL2, valid typed context, and `portal.access`.
5. Each admin page/data service calls `requireAdminPermission(permission)` for its specific read capability.
6. `src/server/admin/operation-actions.ts:L17` reauthenticates sensitive mutations with a new TOTP challenge after checking the operation-specific permission.
7. Narrow database functions repeat active-admin, permission, AAL2, record-state, locking, and audit requirements.

Graphify found a three-hop path from `verifyAdminMfaAction()` to `requireAdminPermission()` through the shared server `createClient()` and `admin/authorization.ts`. The path is structurally real but should not be read as a direct call: both security operations depend on the same server client, while the protected layout and operation actions invoke authorization explicitly.

Roles and permissions originate in `admin_roles`, `admin_permissions`, `admin_role_permissions`, and `admin_users` (`supabase/migrations/20260801210000_phase6_schema.sql:L32-L69`). `has_admin_permission` is hardened in `20260801213000_phase6_review_hardening.sql:L4`; `get_current_admin_context`, auth-event recording, and service-role-only first-admin bootstrap are defined in `20260802000000_phase10a_admin_foundation.sql:L51-L108`.

## 5. Financial operation paths

### Payment submission and credit

User submission path:

`/dashboard/deposits` -> `PaymentForm` -> `submitPaymentAction` (`src/server/payments/actions.ts:L40`) -> active dashboard identity -> Zod/file signature validation -> owned `payment_submissions` draft -> private `payment-receipts` upload/quarantine -> scan -> `submit_payment_for_review` (`20260801220000_phase8a_payment_submission_repair.sql:L20`) -> submitted status and internal reference.

Admin credit path:

admin payment page -> `creditPaymentAction` -> rate limit -> `reauthenticate("payments.manage")` -> protected credit RPC -> locked payment/wallet rows -> immutable wallet credit -> credited payment -> admin audit record -> page revalidation.

Submission does not credit funds. This separation is a critical boundary.

### Investment request and settlement

`InvestmentRequestForm` -> `requestInvestmentAction` (`src/server/investments/actions.ts:L13`) -> active dashboard identity -> Zod validation -> `request_user_investment` (`20260801230000_phase9_atomic_investment_requests.sql:L19`) -> lock plan and wallet -> validate availability, limits, capacity, restrictions, currency, and funds -> create pending investment -> reserve available funds/increase invested amount -> immutable `investment_allocation` transaction.

Admin settlement actions in `src/server/admin/operation-actions.ts:L72-L79` reauthenticate and call protected status, release, maturity, completion, and earnings RPCs. Release and earnings functions are in `20260802020000_phase10c_settlement_withdrawals.sql:L18-L99` and preserve idempotency and immutable transaction history.

### Withdrawal request and settlement

`WithdrawalForm` -> `submitWithdrawalAction` (`src/server/withdrawals/actions.ts:L10`) -> active dashboard identity -> validation and server-built destination object -> `submit_withdrawal_request` (`20260802020000_phase10c_settlement_withdrawals.sql:L100`) -> ownership/restriction checks -> wallet lock -> available-fund reservation -> withdrawal record and reference.

Admin transition path:

admin withdrawal page -> `transitionWithdrawalAction` (`operation-actions.ts:L80`) -> `withdrawals.manage` plus fresh TOTP -> `admin_transition_withdrawal` (`phase10c_settlement_withdrawals.sql:L123`) -> validated transition -> debit/release/reversal as appropriate -> wallet transaction and audit record.

Graphify did not find direct paths from the TypeScript payment, investment, withdrawal, or wallet actions to their SQL nodes. The source references above are therefore verified continuations across a known AST/SQL graph gap, not invented edges.

## 6. Database and RLS relationships

The Phase 6 schema migration defines the core tables:

- Identity/admin: `profiles`, `admin_roles`, `admin_permissions`, `admin_role_permissions`, `admin_users`.
- Financial: `wallet_accounts`, `wallet_transactions`, `payment_submissions`, `investment_plans`, `user_investments`, `investment_updates`, `withdrawal_requests`.
- Operations/security: `notifications`, `account_restrictions`, `security_events`, `admin_audit_logs`.

`20260801211000_phase6_rls_and_functions.sql:L85-L132` adds user ownership policies and permission-aware admin reads. Normal users can read their rows, create/edit only allowed payment drafts, mark their notifications read, and view active plans. They cannot directly mutate wallets, transactions, investment state, withdrawal state, or audit records.

Private Storage is defined in `20260801212000_phase6_private_storage.sql:L2-L28`:

- `payment-receipts`: private, 10 MiB, JPEG/PNG/WebP/PDF; user UUID folder ownership; permitted AAL2 payment reviewers may read.
- `profile-images`: private, 5 MiB, image types; user UUID folder ownership.

Protected functions use fixed empty `search_path`, revoke broad execution, derive user identity from `auth.uid()`, validate state, and lock affected records. User transition functions are granted only to `authenticated`; bootstrap is service-role only. Admin operation functions additionally require permission and AAL2. RLS and RPC checks are defense in depth, not interchangeable layers.

## 7. Wallet transactions and audit logging

`wallet_accounts` stores current figures; `wallet_transactions` is the immutable ledger explaining every change. `perform_wallet_adjustment` is defined in `20260801211000_phase6_rls_and_functions.sql:L135-L211` and later granted narrowly to authenticated administrators after database-side permission enforcement. Reversals are opposite-direction, exact-amount, single-use records linked to the original transaction rather than edits.

Admin financial functions atomically write the business mutation and `admin_audit_logs`. Audit rows are append-only; the base schema trigger `admin_audit_logs_append_only` is visible in Graphify at `20260801210000_phase6_schema.sql:L298`. Authentication events additionally enter `security_events` through `record_admin_auth_event`.

The graph's inferred hyperedge `financial_integrity_controls` correctly groups the immutable ledger, append-only data protection, protected admin operations, and verified controls. This is architecture-level evidence, while exact atomicity is source-verified in the migrations.

## 8. Design and animation relationships

`src/app/layout.tsx:L21` is the global visual composition root. It loads Bricolage Grotesque, Manrope, and IBM Plex Mono; mounts `CosmicMarketBackground`; wraps route content in `app-world`; and mounts `ToastViewport`.

`src/components/motion/cosmic-market-background.tsx:L9` owns the scroll-linked moon/coin environment and automatically enters quiet mode on dashboard and protected-admin paths. It pauses when the document is hidden and respects reduced motion.

`src/components/motion/motion-system.tsx` centralizes `PageTransition`, `ScrollReveal`, `CardEntrance`, `NavigationTransition`, `AnimatedFinancialFigure`, and `PointerSurface`. Graphify shows direct import relationships from:

- `src/app/(user)/dashboard/page.tsx:L8`
- `src/components/admin/section.tsx:L2`
- `src/components/auth/auth-shell.tsx:L3`
- `src/components/dashboard/portfolio-overview.tsx:L7`
- `src/components/dashboard/section.tsx:L2`
- `src/components/design-system/design-system-preview.tsx:L9`
- `src/components/investments/investment-plan-card.tsx:L4`
- `src/components/public/feature-grid.tsx:L2`
- `src/components/public/investment-card.tsx:L3`
- `src/components/public/page-shell.tsx:L2`

Graphify also gives a direct one-hop path: `dashboard/page.tsx --imports_from--> motion-system.tsx`.

`src/server/market-data.ts:L19` is server-only. It fetches BTC, ETH, SOL, BNB, and XRP from CoinGecko, supports USD/EUR/GBP/NGN, caches for five minutes, times out after six seconds, and returns an explicit unavailable state. Graph importers include the home page, design-system page/preview, heatmap, terminal, and ticker. Market data is informational and must never be mixed with wallet balances or investment earnings.

Likely files affected by a broad visual/animation revision are:

- Global foundation: `src/app/globals.css`, `src/app/layout.tsx`, and `src/config/design-tokens.ts`.
- Motion: `src/components/motion/motion-system.tsx`, `src/components/motion/cosmic-market-background.tsx`.
- Shared visual primitives: `src/components/ui/*`, especially button, card, form controls, table, states, modal, tabs, tooltip, skeleton, alert, badge, and toast.
- Shells/navigation: `src/components/public/*`, `src/components/auth/auth-shell.tsx`, `src/components/dashboard/dashboard-shell.tsx`, dashboard navigation/section, `src/components/admin/admin-shell.tsx`, admin navigation/section.
- Financial presentation: `src/components/dashboard/format.tsx`, `src/components/financial/*`, portfolio overview.
- Market presentation: `src/components/market/*`, design-system preview, and public home page.

## 9. Shared components and duplicated implementations

Expected duplication or repeated labels:

- Browser/server `createClient` implementations are intentionally separate trust-boundary adapters.
- Public and dashboard functions both named `InvestmentsPage` are route-local page names, not shared business logic.
- `Plan`, `Props`, `items`, and `symbols` are local types/data with coincidental labels.
- Repeated SQL function labels such as `has_admin_permission`, admin status functions, and rate-limit repairs represent forward migration history. Applied migrations must not be consolidated or rewritten for cosmetic deduplication.

Potential drift points worth consolidating only in a dedicated non-visual refactor:

- Small `value(formData, key)` helpers are repeated in user auth, admin auth, and withdrawal actions.
- `developmentDiagnostic` is repeated between admin authentication and authorization.
- `src/components/admin/mfa-setup.tsx` and `src/components/admin/setup-mfa.tsx` model related TOTP interfaces for normal admin MFA and first-admin setup. Their security workflows differ, but visual and accessibility behavior can drift.
- Admin and dashboard navigation intentionally differ in permissions and destinations, but share formatting primitives; do not merge authorization-aware navigation data merely to remove visual repetition.

## 10. High-risk areas and dependency paths

The highest cross-file coupling is concentrated in shared clients and UI primitives. Degree alone does not indicate architectural harm.

| Node/module | Assessment | Change impact |
|---|---|---|
| Supabase server `createClient` | Expected high coupling, critical trust boundary | All server auth, dashboard reads, actions, and admin authorization |
| `Button`, form controls, table, card, `cn` | Expected design-system coupling | Wide visual/accessibility regression surface; low financial authority |
| `getDashboardIdentity` / dashboard data | Genuine operational coupling | All dashboard pages, status denial, ownership-scoped reads, financial displays |
| Admin authorization/access context | Genuine security coupling | Every admin page and protected operation; MFA, roles, permissions, failure behavior |
| Admin operation actions | Concentrated mutation dispatcher | Payments, wallets, restrictions, plans, investments, withdrawals, audit revalidation |
| `enforceRateLimit` | Expected but security-sensitive cross-cutting hub | Authentication and all high-value mutations |
| Root layout/global background | Intentional visual hub | Every route, hydration/performance, reduced motion, CSP-compatible rendering |
| Market-data service | Bounded server hub | Public market components only; must remain isolated from account data |

Risky paths include:

- `ProtectedAdminLayout -> requireAdmin -> createClient -> Supabase Auth/RPC -> get_current_admin_context -> role/permission tables`.
- `admin operation UI -> operation-actions -> reauthenticate -> requireAdminPermission -> protected RPC -> wallet/business row locks -> wallet_transactions + admin_audit_logs`.
- `UserLayout -> getDashboardIdentity -> profiles/account restrictions -> dashboard data readers -> financial presentation components`.
- `RootLayout -> CosmicMarketBackground -> route-sensitive quiet mode`, which means a route/path change can alter global animation intensity.
- `globals.css` and UI primitives fan out more broadly than individual page components; changes need representative public, auth, dashboard, and admin checks.

## 11. Safe visual-change boundaries

### Safe to change for presentation, with focused regression checks

- JSX structure, classes, and accessible presentation inside `src/components/public`, `src/components/market`, `src/components/motion`, and presentational parts of `src/components/dashboard`, `src/components/admin`, and `src/components/financial`.
- UI primitives in `src/components/ui`, provided semantic behavior, keyboard support, visible focus, dialog behavior, form associations, and reduced-motion fallbacks are preserved.
- Route page composition and metadata where data fetching, server actions, authorization calls, and submitted field names remain unchanged.
- `src/app/globals.css`, token definitions, typography, and transform/opacity animation.

### Must not be touched during visual work

- `src/lib/supabase/*`, `src/proxy.ts`, `src/config/env.ts`, `src/config/public-env.ts`, and privileged client configuration.
- `src/server/auth/*`, `src/server/admin/*`, `src/server/dashboard/data.ts`, `src/server/payments/*`, `src/server/investments/*`, `src/server/withdrawals/*`, and `src/server/services/*`.
- `src/security/*`, validation schemas, generated database types, and payment destination configuration.
- Any `supabase/migrations/*`, `supabase/tests/*`, RLS policy, Storage policy, database grant, protected function, trigger, or index.
- Server-action bindings, action signatures, RPC names/arguments, hidden IDs, form field names, receipt paths, permission keys, status values, and revalidation paths.
- Admin layout authorization calls and user layout identity/status gates.
- `src/server/market-data.ts` during a purely visual task; components may change presentation, but provider, caching, timeout, API-key, and unavailable-state behavior should remain intact.

Visual work must not convert server components to client components merely for animation if that would pull server-only data or privileged modules across the client boundary.

## 12. Recommended implementation order

1. Define the visual scope against the design-system preview and tokens; explicitly exclude security and financial behavior.
2. Update tokens, typography, shared surfaces, focus states, and reduced-motion rules.
3. Update motion primitives and global background with a stable non-animated fallback.
4. Update public shells/pages and market presentation; verify unavailable market data remains layout-stable.
5. Update authentication shells without changing server actions, form names, redirects, or validation/error semantics.
6. Update dashboard shell and financial presentation using existing authorized data props.
7. Update admin shell and tables last, preserving permission-aware navigation, operation dialogs, reauthentication inputs, and audit-facing states.
8. Run focused type checking, linting, reduced-motion/accessibility checks, and representative route tests. Add financial/security tests only if behavior was intentionally changed under a separately approved task.

## 13. Graphify queries used

Query expansion was constrained to terms in `graphify-out/.vocab.txt`.

- BFS: `graphify query "public routes layout authentication auth session protected dashboard" --budget 4000`
- DFS: `graphify query "admin mfa roles permissions authorization reauthenticate audit" --dfs --budget 4000`
- DFS: `graphify query "payment investment withdrawal wallet transaction supabase rls storage" --dfs --budget 5000`
- BFS: `graphify query "design motion market layout client component" --budget 4000`
- Path: `Authentication Setup` -> `updateSession` (no path)
- Path: `verifyAdminMfaAction` -> `requireAdminPermission` (three hops through shared server client/authorization file)
- Path: `submitPaymentAction` -> `public.payment_submissions` (no path)
- Path: `requestInvestmentAction` -> `public.request_user_investment` (no path)
- Path: `submitWithdrawalAction` -> `public.withdrawal_requests` (no path)
- Path: `adjustWalletAction` -> `public.wallet_transactions` (no path)
- Path: `creditPaymentAction` -> `public.admin_audit_logs` (no path)
- Path: `motion-system.tsx` -> `dashboard/page.tsx` (one import hop)

Additional graph analysis ranked cross-file coupling, duplicate labels, and incoming imports for motion, market data, UI primitives, and shared utilities. Exact source files were then opened to verify every reported trust boundary and the SQL continuations missing from graph paths.

## 14. Graph limitations and unresolved relationships

- The graph is undirected at build level. Printed arrows retain extracted relation direction, but shortest-path interpretation must account for reversed display such as `createClient <--imports-- authorization`.
- Graph health reports 269 dangling-endpoint edges, 2 self-loops, 8 directed endpoint collapses, and 12 undirected endpoint collapses. Some dependencies are therefore missing or merged.
- The graph has 228 isolated/near-isolated nodes and 29 thin communities. Configuration fields and some SQL symbols are under-connected.
- TypeScript `supabase.rpc("name")` calls are not linked to the matching SQL function nodes. Financial paths across this boundary required source verification.
- TypeScript `.from("table")` calls are not reliably linked to SQL table nodes. Absence of a Graphify path is not evidence that a data dependency is absent.
- Concept/document nodes are only partially linked to implementation nodes. `Authentication Setup` and `updateSession` coexist without a path.
- Duplicate labels can be misleading: browser/server `createClient`, forward-migration replacements, local `Plan`/`Props`, and route-local page function names are distinct nodes.
- The report records zero semantic-extraction tokens because host-agent token usage was unavailable; this is a cost-accounting limitation, not evidence that semantic extraction was free.
- Inferred edges and hyperedges are architecture clues, not proof of runtime calls. All security and financial conclusions in this report were checked against source and migrations.

Unresolved business decisions in `OPEN_QUESTIONS.md` remain authoritative blockers where applicable. This report does not resolve or silently invent financial rules.
