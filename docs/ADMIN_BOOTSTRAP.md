# Oryvane Capital Admin Bootstrap

Phase 10A installs a fixed role and permission catalogue, but never creates an administrator automatically. The first administrator is a controlled, one-time operational action.

## Preconditions

1. Create or select an existing, email-verified Supabase Auth user through an approved internal process.
2. Have that user enroll and verify a Supabase TOTP factor.
3. Approve one of the exact fixed roles documented in `ADMIN_SYSTEM.md`.
4. Load `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only in the trusted server shell running the command.
5. Confirm that no `admin_users` record exists. The database function rejects bootstrap after the first record.

## One-time command

The script is never imported by the application and never runs during install, development, deployment, or migration. From a trusted server shell, use:

```text
npm run admin:bootstrap -- --user-id=AUTH_USER_UUID --role="Super administrator" --confirm=BOOTSTRAP_FIRST_ADMIN
```

The script validates the UUID, exact role name, explicit confirmation token, existing Auth user, and verified TOTP factor. It then invokes the service-role-only `bootstrap_first_admin` database function. The function atomically creates the first active admin record and an append-only `admin.bootstrap` audit event. It refuses to run when any administrator record already exists.

Never expose the service-role key through a `NEXT_PUBLIC_` variable, browser bundle, CI log, command history, or client application. Never place an Auth UUID, email, password, TOTP secret, or service-role key in a migration.

## Subsequent administrators

The bootstrap mechanism is intentionally first-admin only. Subsequent administrator creation requires a future reviewed server-only workflow with explicit authorization, AAL2, least-privilege role selection, and append-only auditing. Phase 10A provides no administrator creation UI.

Admin status is never inferred from email, domain, Auth metadata, normal profile fields, or authentication alone. Disable an administrator only through a future audited server operation; do not delete audit history.
