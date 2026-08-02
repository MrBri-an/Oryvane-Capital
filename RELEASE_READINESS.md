# Oryvane Capital Release Readiness

Assessment date: 2 August 2026 — Phase 12A update

## Verdict: Not ready

The application has strong database authorization, atomic accounting foundations, private Storage, MFA-protected admin operations, responsive public/auth surfaces, and passing unit/browser tests for unauthenticated behavior. It must not launch to production until the blockers below are closed and re-verified.

## Production blockers

1. **Dependency provenance requires monitoring.** The current npm advisory database reports zero vulnerabilities, while the installed Next transitive versions remain unchanged from the prior findings. Any renewed high-severity advisory blocks launch.
2. **Database security tests pending.** Start a disposable local Supabase stack and run every pgTAP suite. Do not substitute linked-project mutation tests.
3. **Authenticated end-to-end coverage missing.** Create approved disposable non-production users/admins and verify registration confirmation, login/logout, account states, deposits, investment reservation/settlement, withdrawals, TOTP MFA, permission boundaries, and audited admin operations.
4. **Receipt scanner not operationally confirmed.** Uploads now enter private quarantine and database gates prevent review before a clean scan, but production scanner credentials, monitoring, and failure drills are not confirmed.
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

Phase 12A adds durable database-backed throttling, Host/Origin checks, nonce CSP, receipt quarantine/scan gates, structured redacted security logging, a minimal health endpoint, and safely skipped authenticated staging suites. The verdict remains **Not ready** until local database tests, operational malware scanning, authenticated staging runs, monitoring/backups, and legal/company information are confirmed.
