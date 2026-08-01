# Oryvane Capital Investment System

## Phase 9 scope

Phase 9 exposes real active investment plans, allows eligible users to request an investment using available wallet funds, and displays protected investment history. It does not create plans, activate requests, add earnings, mature investments, or provide administrator tooling.

## Public plans

`/investments` and `/investments/[slug]` query `investment_plans` through the existing anonymous and authenticated active-plan policies. Pages display the authoritative description, amount limits, currency, duration, return description, risk, availability, status, and terms. No placeholder plan or return data is substituted when the database has no active plan.

Plan images are not processed in Phase 9. This avoids expanding the storage and image-processing security surface while the dependency advisories and plan image provenance remain under review.

## Protected request workflow

The application validates the amount with Zod and calls `request_user_investment(plan_id, amount, currency)` using the authenticated cookie session. The database function is authoritative and:

1. derives the user from `auth.uid()`;
2. requires an active profile and no active investment/account restriction;
3. locks and validates the active plan and its availability window;
4. validates its limits, currency, and participant capacity;
5. locks the user's matching wallet account;
6. rejects insufficient available funds and duplicate open requests;
7. creates a `pending` investment without start or maturity dates;
8. reduces `available_balance` and increases `invested_amount` while leaving `total_balance` unchanged;
9. creates a completed, immutable `investment_allocation` wallet transaction; and
10. commits all changes atomically or rolls all of them back.

Normal users cannot activate investments, edit earnings, change maturity information, modify wallets, or insert/update wallet transactions.

## Earnings and updates

`user_investments.earnings_amount` is the protected authoritative per-investment earnings total and begins at zero. Phase 9 does not provide any user or administrator operation that changes it. Future reviewed administrator operations must update earnings alongside an `investment_updates` record, wallet transaction, and audit record as appropriate.

The dashboard shows the latest real `investment_updates` entry when one exists. It does not infer earnings from free-form update types or fabricate performance data.

## Dependency advisory boundary

The Phase 9 audit reported high advisories in Next's bundled PostCSS and Sharp dependencies. Phase 9 does not process user-controlled CSS/source maps and does not invoke plan image optimization, so the affected paths are outside this workflow. The advisories remain unresolved and must be reviewed before production deployment.
