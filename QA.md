# Oryvane Capital Phase 11 QA

Audit date: 2 August 2026

## Scope and outcome

The public site, authentication forms and guards, user dashboard boundaries, deposits, investments, withdrawals, admin authentication/MFA, admin operations, database migrations, RLS, Storage policies, and existing SQL tests were reviewed. No production records or linked financial data were mutated.

Automated unit/component result: **16 passed**. The final browser result is **19 passed and 2 expected skips**; the mobile-navigation case is intentionally skipped in the tablet and desktop projects. The suite covers 320px mobile, 768px tablet, and 1440px desktop Chromium projects. Authenticated browser workflows remain pending because this audit did not create test users or an administrator.

## Automated coverage

- Registration, password, acceptance, and login validation
- Safe redirect allowlist and external/protocol-relative redirect rejection
- Dashboard middleware and server-layout authorization contracts
- Admin route isolation, active-admin context, and mandatory AAL2 checks
- Account-status gates on payment, investment, and withdrawal actions
- Bank and Bitcoin payment validation
- Receipt requirement, MIME allowlist, and 10 MiB limit
- Investment identifier, currency, and fixed-precision amount validation
- Bank and Bitcoin withdrawal destination validation
- Permission-aware admin navigation and server reauthentication contracts
- Sensitive destination masking
- Reduced-motion Lenis suppression and cleanup
- Native dialog semantics, labels, cancellation, and close action
- Public navigation, mobile navigation, auth forms, unauthenticated dashboard redirect
- Security response headers, visible keyboard focus, not-found/status states
- Critical-impact axe checks on home, login, registration, and FAQ pages

## Existing database test review

The six transaction-scoped pgTAP suites were reviewed:

- `phase6_rls.sql`
- `phase8a_payment_submission.sql`
- `phase9_investment_requests.sql`
- `phase10a_admin_authorization.sql`
- `phase10b_admin_operations.sql`
- `phase10c_settlement_withdrawals.sql`

Together they cover user isolation, forbidden direct financial writes, private Storage ownership, append-only transactions/audits, AAL2 and permissions, payment idempotency, atomic investment reservation, principal release, realised earnings, withdrawal reservation/release, and reversal rules. TCP port 54322 was unavailable, so these suites were not executed. They remain pending; none were weakened or run against the linked project.

## Manual/static observations

- Public layouts use semantic `header`, `nav`, `main`, sections, headings, and footer landmarks.
- Public Lenis is isolated to the public layout and disabled for reduced motion.
- Dashboard/admin navigation provides 44px minimum targets, skip links, active-page state, and mobile controls.
- Tables use semantic table/head/cell elements and horizontal overflow containers for narrow screens.
- Forms have programmatic labels. Server responses remain generic for authentication and privileged failures.
- Native `<dialog>` supplies focus containment and Escape behavior; automated component coverage verifies labelling and cancellation. A signed-in browser pass is still required for real admin operation dialogs.
- User and admin withdrawal tables mask destinations. Complete destinations are read only inside authorized server components.

## Pending QA

1. Run all pgTAP suites after starting a disposable local Supabase stack.
2. Add isolated non-production user/admin fixtures and run authenticated browser workflows, including MFA and financial-operation confirmation dialogs.
3. Perform manual screen-reader and contrast measurement on representative public, dashboard, and admin screens.
4. Test receipt malware scanning once a production scanning service is selected.
5. Re-run the complete suite after the unresolved Next.js dependency chain is patched.
