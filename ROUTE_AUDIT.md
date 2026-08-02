# Oryvane Capital route stabilization audit

Audit date: 2 August 2026

This audit used a clean Next.js development cache, a localhost Playwright crawl at 320px and 1440px, static App Router inspection, generated Supabase types, all existing tests, and read-only linked Supabase relationship checks. No linked data was changed.

| Route | Access level | Expected result | Actual result | Issue found | Fix applied | Final status |
|---|---|---|---|---|---|---|
| `/` | Public | Home page | Loaded | None | None | Pass |
| `/about` | Public | About page | Loaded | None | None | Pass |
| `/investments` | Public | Active plans or empty state | Loaded empty state | No active linked plan exists | Existing empty state verified | Pass |
| `/investments/[valid-slug]` | Public | Active plan detail | Route/query contract validated; no active linked slug was available | Live valid record unavailable | No data inserted; relationship and page contract verified | Blocked by data fixture |
| `/investments/invalid-slug` | Public | Intentional not found | Not-found UI rendered | None | Test now verifies streamed not-found UI | Pass |
| `/how-it-works` | Public | Informational page | Loaded | None | None | Pass |
| `/security` | Public | Security page | Loaded | None | None | Pass |
| `/faq` | Public | FAQ page | Loaded | None | None | Pass |
| `/contact` | Public | Contact state | Loaded intentional status state | None | None | Pass |
| `/terms` | Public | Terms page | Loaded | None | None | Pass |
| `/privacy` | Public | Privacy page | Loaded | None | None | Pass |
| `/risk-disclosure` | Public | Risk disclosure | Loaded | None | None | Pass |
| `/_design-system` | Public, unlinked/no-index | Component preview | Loaded after repair | `_design-system` was treated as a private App Router folder and excluded from routing | Moved to public `%5Fdesign-system` route segment | Pass |
| `/api/health` | Public API | `200 {"status":"ok"}` | Returned expected JSON | None | None | Pass |
| `/login` | Public authentication | Login form | Loaded | None | None | Pass |
| `/register` | Public authentication | Registration form | Loaded | None | None | Pass |
| `/verify-email` | Public authentication | Verification notice | Loaded | None | None | Pass |
| `/forgot-password` | Public authentication | Recovery form | Loaded | None | None | Pass |
| `/reset-password` | Recovery session optional | Reset form/intentional provider state | Loaded | None | None | Pass |
| `/auth/confirm` | Public callback | Invalid callback redirects safely | Redirected to `/login?error=...` | None | None | Pass |
| `/dashboard` | Authenticated user | Unauthenticated redirect | Redirected to `/login?redirectTo=/dashboard` | None | None | Pass |
| `/dashboard/investments` | Authenticated user | Unauthenticated redirect | Redirected with preserved path | None | Empty-state implementation verified statically | Pass |
| `/dashboard/transactions` | Authenticated user | Unauthenticated redirect | Redirected with preserved path | None | Empty-state implementation verified statically | Pass |
| `/dashboard/deposits` | Authenticated user | Unauthenticated redirect | Redirected with preserved path | None | Empty-state implementation verified statically | Pass |
| `/dashboard/withdrawals` | Authenticated user | Unauthenticated redirect | Redirected with preserved path | None | Empty-state implementation verified statically | Pass |
| `/dashboard/notifications` | Authenticated user | Unauthenticated redirect | Redirected with preserved path | None | Empty-state implementation verified statically | Pass |
| `/dashboard/settings` | Authenticated user | Unauthenticated redirect | Redirected with preserved path | None | Restricted-account rendering contract verified statically | Pass |
| `/admin/login` | Public admin authentication | Admin login form | Loaded | None | None | Pass |
| `/admin/mfa` | Authenticated active admin | Unauthenticated redirect | Redirected to `/admin/login` | None | AAL2 server-action regression coverage retained | Pass |
| `/admin/setup` | One-time setup | Closed after bootstrap | Intentional not-found UI | Streamed development response retains HTTP 200 | Verify semantic not-found state | Pass |
| `/admin` | Active AAL2 admin with `portal.access` | Protected overview | Unauthenticated request redirected to admin login | Initial parallel cold crawl timed out during compilation | Sequential crawl and clean server verification | Pass for auth boundary; authenticated browser fixture unavailable |
| `/admin/users` | AAL2 + `users.view` | Users or empty state | Unauthenticated redirect; query relationship validated read-only | No authenticated test fixture | Existing empty state and permission service verified | Pass for auth boundary; authenticated browser fixture unavailable |
| `/admin/users/[valid-user-id]` | AAL2 + `users.view` | User detail | Query contract validated read-only | No authenticated browser fixture | UUID validation and missing-user not-found contract verified statically | Pass for contract; authenticated browser fixture unavailable |
| `/admin/payments` | AAL2 + `payments.review` | Payments or empty state | Unauthenticated redirect; relationship query validated | No authenticated browser fixture | Existing permission and empty state verified | Pass for auth boundary; authenticated browser fixture unavailable |
| `/admin/investments` | AAL2 + `investments.review` and plan read | Investments/plans or empty states | Unauthenticated redirect; both relationships validated | No authenticated browser fixture | Existing permissions and both empty states verified | Pass for auth boundary; authenticated browser fixture unavailable |
| `/admin/withdrawals` | AAL2 + `withdrawals.review` | Withdrawals or empty state | Unauthenticated redirect; relationship query validated | No authenticated browser fixture | Existing permission and empty state verified | Pass for auth boundary; authenticated browser fixture unavailable |
| `/admin/audit` | AAL2 + `audit.view` | Audit records or empty state | Unauthenticated redirect; query validated | No authenticated browser fixture | Existing permission and empty state verified | Pass for auth boundary; authenticated browser fixture unavailable |
| `/admin/users/not-a-uuid` | Protected dynamic admin route | Auth first; safe invalid value handling after auth | Unauthenticated redirect to admin login | No AAL2 fixture to reach parameter branch | Strict UUID `notFound()` branch verified statically | Pass for auth boundary; authenticated branch fixture unavailable |

## Findings and controls

- The route tree has distinct public, authentication, user-dashboard, and admin boundaries. The design preview now belongs to the public group and is not wrapped by user or admin authorization.
- Dashboard middleware redirects unauthenticated requests and the user layout independently checks the protected profile and denied account statuses.
- The protected admin layout independently requires an authenticated user, active administrator, AAL2, assigned role context, and `portal.access`. Each page data service repeats its specific permission requirement.
- Admin authorization uses `admin_users.role_id`, `admin_roles.id`, `admin_role_permissions.role_id`, `admin_role_permissions.permission_id`, `admin_permissions.id`, and `admin_permissions.key`. No `admin_user_roles` or `admin_permissions.code` usage exists.
- Linked read-only selections confirmed the relationship names used by payments, investments, withdrawals, roles, and permission keys.
- Existing dashboard and admin list pages render explicit empty states. No fake records were inserted to exercise them.
- Public desktop and mobile navigation targets resolved without a failing response or uncaught browser console error.

## Verification limitation

The environment contains no disposable `STAGING_USER_*` or `STAGING_ADMIN_*` credentials and no ephemeral administrator TOTP code. Consequently, the authenticated staging Playwright tests safely skip. Actual AAL2 admin page rendering and a valid active-plan detail remain pending approved non-production fixtures; this audit did not bypass authentication, create an administrator, insert an investment plan, or modify linked data.
