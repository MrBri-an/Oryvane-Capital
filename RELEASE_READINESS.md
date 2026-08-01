# Oryvane Capital Release Readiness

Assessment date: 2 August 2026

## Verdict: Not ready

The application has strong database authorization, atomic accounting foundations, private Storage, MFA-protected admin operations, responsive public/auth surfaces, and passing unit/browser tests for unauthenticated behavior. It must not launch to production until the blockers below are closed and re-verified.

## Production blockers

1. **Unresolved high dependency advisories.** Next.js 16.2.12 carries affected PostCSS and Sharp/libvips versions. Upgrade to a compatible stable patched Next.js release and rerun all checks.
2. **Database security tests pending.** Start a disposable local Supabase stack and run every pgTAP suite. Do not substitute linked-project mutation tests.
3. **Authenticated end-to-end coverage missing.** Create approved disposable non-production users/admins and verify registration confirmation, login/logout, account states, deposits, investment reservation/settlement, withdrawals, TOTP MFA, permission boundaries, and audited admin operations.
4. **Rate limiting absent.** Add deployment-level limits for authentication, recovery, payment, investment, withdrawal, and administrator mutation endpoints.
5. **Receipt malware controls incomplete.** Select and integrate production malware scanning/quarantine before accepting external files.
6. **Operational configuration incomplete.** Confirm exact production origins, Supabase redirect URLs, email delivery, bank/Bitcoin configuration, monitoring, alerting, backups, retention, incident response, legal content, support channels, and administrator bootstrap approvals.

## Required verification before launch

- Resolve or formally reject all open product/legal questions that affect launch behavior.
- Replace broad CSP Supabase sources with the exact project host and evaluate nonce CSP.
- Verify HTTPS-only delivery and HSTS behavior at the edge.
- Run manual assistive-technology and measured contrast testing.
- Run responsive authenticated workflows from 320px through large desktop.
- Conduct an independent penetration test focused on Supabase RLS/RPC, MFA session assurance, signed Storage access, replay/idempotency, CSRF, and authorization bypass.
- Re-run `npm audit`, lint, typecheck, Vitest, Playwright, linked DB lint, and local pgTAP tests from a clean release candidate.

## Evidence currently passing

- 16 unit/component tests
- Public/auth Playwright coverage across mobile, tablet, and desktop: 19 passed and 2 expected viewport-specific skips
- Critical-impact axe checks on representative public/auth routes
- ESLint and strict TypeScript
- Linked read-only database lint with no schema warnings
- Static review confirms RLS on all exposed public tables and private Storage policies
- No tracked secrets, no real administrator creation, and no linked financial mutation during QA

This verdict can move to **Conditionally ready** only after dependency, local database-test, rate-limit, malware-control, and authenticated-browser blockers are closed. **Ready** additionally requires completed operational/legal configuration and independent security sign-off.
