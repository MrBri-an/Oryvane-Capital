# Environment variables

Public variables are `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Production values must use exact HTTPS origins.

Server-only values are `SUPABASE_SERVICE_ROLE_KEY`, payment destination variables, `RECEIPT_SCANNER_URL`, and `RECEIPT_SCANNER_API_KEY`. Scanner and service-role values must be stored in the deployment secret manager and rotated after suspected disclosure.

Disposable staging browser tests use `STAGING_USER_EMAIL`, `STAGING_USER_PASSWORD`, `STAGING_ADMIN_EMAIL`, `STAGING_ADMIN_PASSWORD`, an ephemeral `STAGING_ADMIN_TOTP_CODE`, and one-time `STAGING_REGISTRATION_EMAIL` / `STAGING_REGISTRATION_PASSWORD` values. They must never target production or be committed. Missing values safely skip authenticated suites.
