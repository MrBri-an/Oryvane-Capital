# Oryvane Capital Admin Bootstrap

The first administrator is created through the one-time `/admin/setup` web flow. Nothing runs automatically, and the route becomes unavailable as soon as any `admin_users` record exists.

## Server configuration

Configure these only in the trusted server secret store:

```text
INITIAL_SUPER_ADMIN_EMAIL=confirmed-existing-account@example.com
ADMIN_SETUP_TOKEN=at-least-32-random-characters
SUPABASE_SERVICE_ROLE_KEY=server-only-service-role-key
```

None may use a `NEXT_PUBLIC_` prefix. Generate the setup token with an approved cryptographically secure secret generator. Do not place it in URLs, source code, browser storage, analytics, screenshots, or logs. Remove `INITIAL_SUPER_ADMIN_EMAIL` and `ADMIN_SETUP_TOKEN` after successful bootstrap.

## Web setup process

1. Register the intended account through the normal user registration flow and confirm its email.
2. Sign in through `/login`. Do not use `/admin/login` before bootstrap, because that route correctly rejects users without an active admin record.
3. Open `/admin/setup` over the configured HTTPS application origin.
4. Enter the one-time setup code. The server compares it to `ADMIN_SETUP_TOKEN` and issues a 15-minute, HttpOnly, SameSite=Strict, user-bound setup grant.
5. Enrol a TOTP authenticator and verify a six-digit code. The resulting Supabase session must reach AAL2 and the Auth user must contain a verified TOTP factor.
6. Confirm administrator creation. The server rechecks authentication, confirmed email, exact configured email, setup grant, AAL2, verified factor, and that no administrator exists.
7. The existing service-role-only `bootstrap_first_admin` operation atomically creates an active administrator with the fixed **Super administrator** role and an append-only bootstrap audit record.

The database operation rejects a second bootstrap even if two requests race. After success, `/admin/setup` returns not found. Normal access then uses `/admin/login`, `/admin/mfa`, and `/admin`.

Setup-token and completion attempts use the durable database-backed rate limiter. Errors are deliberately generic, and structured logs exclude the setup token, passwords, TOTP codes, and service-role key.

## Emergency CLI fallback

Retain the CLI only for an approved recovery procedure when the web setup cannot operate. Run it from a trusted server shell after verifying the existing Auth user and TOTP factor:

```text
npm run admin:bootstrap -- --user-id=AUTH_USER_UUID --role="Super administrator" --confirm=BOOTSTRAP_FIRST_ADMIN
```

It requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, validates the fixed role and explicit confirmation, and calls the same one-time database operation. Never run it in CI, browser code, installation hooks, or deployment startup.
