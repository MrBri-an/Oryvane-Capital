# AGENTS.md

## Project

**Name:** Oryvane Capital  
**Type:** Premium investment platform  
**Stack:** Next.js App Router, TypeScript, Tailwind CSS, Motion, Supabase and Vercel

Oryvane Capital allows users to create accounts, submit payments through bank transfer or Bitcoin, monitor account funds, view investments and earnings, and request withdrawals.

The platform uses a manually managed financial workflow. Administrators review submitted payments and update user account figures through protected server operations.

## Required Reading

Before making changes, read the files relevant to the requested phase, including:

- `PRODUCT_REQUIREMENTS.md`
- `USER_FLOWS.md`
- `ADMIN_SYSTEM.md`
- `FINANCIAL_RULES.md`
- `RLS_ACCESS_MATRIX.md`
- `BUILD_PHASES.md`
- `OPEN_QUESTIONS.md`

If any document conflicts with another, stop and report the conflict before implementation.

## Core Working Rules

1. Complete only the phase or task explicitly requested.
2. Do not continue into the next phase without approval.
3. Inspect the existing repository before editing.
4. Preserve existing working behaviour unless the task requires a change.
5. Keep changes focused, minimal and reversible.
6. Do not silently invent unresolved business rules.
7. Record assumptions and blockers in the final report.
8. Do not commit or push changes unless explicitly instructed.
9. Do not run `npm run build`.
10. Do not use another command that indirectly triggers `npm run build`.

## Architecture Rules

1. Keep the Next.js application at the repository root.
2. Use the App Router and strict TypeScript.
3. Keep public, authentication, user dashboard and admin routes separated.
4. Keep shared UI components separate from server-only logic.
5. Keep Supabase browser, server and privileged clients separated.
6. Use `@/*` imports where configured.
7. Avoid large files and mixed responsibilities.
8. Prefer small, typed and reusable modules.
9. Keep all financial and privileged business logic on the server.
10. Do not place secrets or privileged logic in client components.

## Route Boundaries

Use clear boundaries for:

- Public website
- User authentication
- User dashboard
- Admin portal

Admin and user protection must not rely only on hidden navigation or client-side checks.

## Supabase Rules

1. All database changes must be created through versioned migrations.
2. Do not make undocumented production database changes through the dashboard.
3. Do not run `supabase db push` without explicit permission.
4. Do not reset, seed, pull or modify the remote database unless requested.
5. Enable RLS on every exposed user-owned, financial, administrative or sensitive table.
6. Add explicit RLS policies before a protected table is considered complete.
7. Test ownership boundaries between different users.
8. Keep payment receipts and sensitive files in private storage buckets.
9. Add storage policies for upload, read and removal operations.
10. Never expose the Supabase service-role key to the browser.
11. Never place the service-role key in a `NEXT_PUBLIC_*` variable.
12. Use privileged Supabase access only inside protected server-only modules.

## Authentication Rules

1. Use Supabase Auth for user and administrator authentication.
2. Do not store passwords in application tables.
3. Require verified email where defined by the product requirements.
4. Keep normal user login and admin login separated.
5. Require MFA for administrators.
6. Validate account status after authentication.
7. Enforce restrictions on the server, not only in the interface.
8. Use secure cookie-based sessions.
9. Reauthenticate administrators before sensitive financial actions where required.
10. Do not create a public admin registration route.

## Financial Rules

The browser must never be trusted to set or approve financial values.

Users must not be able to directly change:

- Account balance
- Available balance
- Invested amount
- Earnings
- Payment approval status
- Investment status
- Withdrawal approval status

All financial mutations must use protected server operations.

Every credit, debit, bonus, earning, fee, refund, correction or reversal must create:

1. A financial transaction record
2. An admin audit record when performed by an administrator
3. The affected user ID
4. The administrator ID where applicable
5. The operation type
6. The amount and currency
7. The previous value
8. The resulting value
9. The reason
10. The reference where applicable
11. The date and time

Do not permanently delete financial history. Correct errors with a new reversal or correction transaction.

## Admin Rules

1. Apply role-based access control and least privilege.
2. Verify admin permissions on the server for every protected action.
3. Do not trust role values sent from the browser.
4. Do not treat hidden buttons as authorisation.
5. Audit all sensitive admin actions.
6. Require a reason for credits, debits, corrections, restrictions, rejections and reversals.
7. Use soft deletion or status changes for users where financial history must remain intact.
8. Prevent support or content roles from performing finance operations unless explicitly authorised.
9. Prevent administrators from editing or deleting existing audit records.
10. Keep privileged admin operations separate from normal user APIs.

## Validation Rules

1. Validate all external input with Zod or an approved equivalent.
2. Validate again on the server even when client validation exists.
3. Treat route parameters, form values, file metadata and webhook payloads as untrusted.
4. Use explicit schemas for money, currency, transaction references and statuses.
5. Do not use floating-point arithmetic for stored monetary values.
6. Use database-safe numeric precision or minor units where appropriate.
7. Reject unsupported status transitions.
8. Return safe error messages without exposing secrets or internal implementation details.

## File Upload Rules

1. Validate file type, size and extension.
2. Do not trust MIME type alone.
3. Use private storage for payment receipts and sensitive documents.
4. Generate safe object paths.
5. Prevent users from reading another user’s files.
6. Do not expose permanent public URLs for sensitive uploads.
7. Log important upload failures and access violations.

## Security Rules

1. Never hardcode secrets, credentials, bank details or wallet private keys.
2. Keep `.env.local` and all private environment files out of Git.
3. Use server-side authorisation for protected routes and actions.
4. Add rate limiting to authentication, payment submission and admin operations where required.
5. Protect against CSRF for state-changing requests.
6. Use secure headers and a Content Security Policy.
7. Avoid exposing stack traces or database errors to users.
8. Log security-relevant events without logging passwords, tokens or private secrets.
9. Do not weaken security controls to make tests pass.
10. Report any security concern before continuing.

## Design Rules

1. Follow the approved Oryvane Capital brand system.
2. Use bold, clean typography and restrained premium styling.
3. Avoid generic crypto templates, excessive glow and visual noise.
4. Use Motion for React as the primary animation library.
5. Prefer opacity and transform animations.
6. Respect `prefers-reduced-motion`.
7. Keep financial and admin interfaces clear and calm.
8. Do not delay important user actions with decorative animation.
9. Maintain strong colour contrast and visible focus states.
10. Keep all screens responsive from 320px mobile widths to large desktops.

## Accessibility Rules

1. Use semantic HTML.
2. Support keyboard navigation.
3. Provide visible focus states.
4. Label all form controls.
5. Associate validation errors with their fields.
6. Use accessible dialogs, menus and tables.
7. Provide meaningful button and link names.
8. Keep touch targets usable on mobile.
9. Support screen readers.
10. Test reduced-motion behaviour.

## Testing Rules

Run only checks relevant to the current phase.

Allowed when appropriate:

- Targeted ESLint checks
- TypeScript checks
- Unit tests
- Integration tests
- RLS tests
- Playwright tests

Do not run `npm run build`.

Do not claim a feature is complete when required tests were not run. Report any test that could not be performed.

## Package Rules

1. Install only packages required for the current phase.
2. Prefer existing dependencies before adding new ones.
3. Use official and actively maintained packages.
4. Do not install overlapping libraries without a clear reason.
5. Do not replace Motion with another animation system unless explicitly requested.
6. Do not add packages solely for a trivial helper that can be implemented safely in the project.
7. Report every installed, removed or upgraded package.

## Documentation Rules

1. Update documentation when architecture or business behaviour changes.
2. Keep documentation consistent with implemented behaviour.
3. Do not move or rename project documents unless requested.
4. Document security boundaries that are not obvious.
5. Keep final reports factual and concise.

## Restricted Actions

Do not perform any of the following without explicit permission:

- Run `npm run build`
- Run `supabase db push`
- Reset or delete the database
- Modify production data
- Create real admin credentials
- Add real bank details
- Add real Bitcoin wallet details
- Add private keys or secrets
- Commit changes
- Push changes
- Deploy to production
- Continue to another phase

## Required Final Report

After each task, report:

1. Repository state found
2. Files created
3. Files changed
4. Packages installed, removed or upgraded
5. Database or Supabase changes
6. Security controls added
7. Commands executed
8. Checks and tests completed
9. Issues, assumptions or blockers
10. Confirmation that `npm run build` was not run
11. Confirmation that no commit or push was performed unless explicitly requested
12. Confirmation that work stopped at the requested phase
