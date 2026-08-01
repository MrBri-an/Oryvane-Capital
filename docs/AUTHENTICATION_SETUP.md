# Oryvane Capital Authentication Setup

This document covers the external Supabase Auth settings required by the Phase 5 implementation. It does not create database tables, profiles, roles, account statuses, or administrator authorization.

## Environment variables

Set these values locally in `.env.local` and in the deployment environment:

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Use the deployed HTTPS origin for `NEXT_PUBLIC_SITE_URL` in production. Do not include a trailing path. Never expose the service-role key through a `NEXT_PUBLIC_*` variable.

## Supabase URL configuration

In Supabase Dashboard → Authentication → URL Configuration:

1. Set **Site URL** to the canonical production origin.
2. Add development and deployed callback URLs to **Redirect URLs**:
   - `http://localhost:3000/auth/confirm`
   - `https://YOUR_DEPLOYED_DOMAIN/auth/confirm`
3. Add preview deployment origins only when they are controlled and required. Avoid broad wildcard redirects in production.

The application constructs verification and recovery redirects from `NEXT_PUBLIC_SITE_URL`. Supabase should reject any origin not explicitly approved in the dashboard.

## Email and password provider

In Authentication → Providers → Email:

1. Enable email/password sign-up.
2. Enable email confirmations.
3. Keep secure email-change confirmation enabled.
4. Configure an approved SMTP provider before production use.
5. Review Supabase Auth rate limits for sign-up, resend, login, and recovery traffic.

Disable automatic email confirmation in production. If automatic confirmation is enabled for local testing, registration may immediately create a session and the normal verification-email experience will differ.

## Confirmation email template

The implementation supports both the PKCE `code` callback and a token-hash callback. For explicit server-side token verification, set the confirmation link to:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard">Verify email</a>
```

If the project uses Supabase's default `{{ .ConfirmationURL }}`, ensure its final redirect is an approved `/auth/confirm` URL. Test the chosen template in the actual project before release.

## Password recovery template

Password recovery is initiated with an approved redirect to:

```text
/auth/confirm?next=/reset-password
```

The confirmation route exchanges the Supabase code or verifies the token hash, establishes the recovery session in secure cookies, and redirects internally to `/reset-password`. External `next` destinations are rejected.

## Password policy

Application server validation currently requires:

- 12–72 characters
- at least one lower-case letter
- at least one upper-case letter
- at least one number
- at least one symbol

Configure the Supabase Auth password minimum to at least 12 characters so provider enforcement does not weaken the application rule. Supabase Auth remains the only password store and authority.

## User metadata boundary

Registration temporarily places `full_name`, `phone`, `country`, and policy acceptance timestamps in Supabase Auth user metadata. This metadata is user-controlled and must never grant:

- administrator status
- roles or permissions
- account status
- financial authorization
- payment, investment, or withdrawal approval

Phase 6 introduces protected profile/admin records and RLS. A later trusted onboarding operation must copy and validate permitted profile values; Auth metadata itself remains non-authoritative.

## Administrator boundary

`/admin/login` remains separate. A successful Supabase user login, a matching email domain, or user metadata is not sufficient for administrator access. Phase 6 provides approved admin records, active status, permission helpers, and database AAL2 checks; the admin login flow, shorter sessions, and reauthentication remain unavailable until explicitly implemented.

## Release checks

Before enabling production authentication:

1. Verify confirmation, resend, recovery, expiry, and logout behavior.
2. Confirm unauthenticated dashboard requests redirect to `/login`.
3. Confirm authenticated users are redirected away from `/login` and `/register`.
4. Confirm external and protocol-relative return URLs are rejected.
5. Confirm recovery responses never reveal whether an email exists.
6. Confirm no passwords, tokens, reset links, or secrets appear in logs.
7. Configure abuse protection and rate limits before public launch.
