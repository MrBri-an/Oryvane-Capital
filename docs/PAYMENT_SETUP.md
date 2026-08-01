# Oryvane Capital Payment Setup

## Scope

Phase 8A repairs the payment submission foundation. Phase 8B adds the authenticated bank-transfer and Bitcoin submission interface. Neither phase approves or rejects payments, credits wallets, or creates administrators.

## Environment configuration

Payment destinations are server-only. Configure complete groups in `.env.local` and the deployment environment:

```text
PAYMENT_BANK_NAME=
PAYMENT_BANK_ACCOUNT_NAME=
PAYMENT_BANK_ACCOUNT_NUMBER=
PAYMENT_BANK_CURRENCY=
PAYMENT_BITCOIN_ADDRESS=
PAYMENT_BITCOIN_NETWORK=
```

Do not prefix these values with `NEXT_PUBLIC_`. A method is displayed as unavailable when its group is incomplete or fails validation. Replace every placeholder before enabling real submissions; never commit actual destination details.

## Draft creation

Authenticated users may create their own draft records through the existing RLS policy. User-writable draft fields are limited to payment method, submitted amount, currency, sender name, external reference, receipt path, and optional user note.

The database generates `internal_reference` in the form `ORY-PAY-{UUID}`. Authenticated users receive no insert or update privilege on that column.

## Submission transition

Call `submit_payment_for_review(payment_id)` as the authenticated user after the draft and any receipt have been created. The function:

- locks and verifies the caller-owned draft;
- requires an active profile;
- validates the amount, currency, method-specific fields, and protected review fields;
- requires bank sender details, an external bank reference, and a receipt;
- requires a 64-character hexadecimal Bitcoin transaction hash;
- allows a Bitcoin submission without a receipt;
- verifies any receipt exists in `payment-receipts/{user-id}/{submission-id}/` and is owned by the caller;
- sets `status = submitted` and `submitted_at` atomically.

Only `authenticated` may execute this function. Payment approval, rejection, confirmed amounts, review identity, credit timestamps, wallet balances, and wallet transactions remain unavailable to normal users.

## Completed user workflow

The `/dashboard/deposits` server action performs the following sequence with the authenticated cookie session and anon key:

1. Revalidates the user and requires an active protected profile.
2. Validates form data with Zod and ignores any client attempt to provide identity, state, approval, or crediting fields.
3. Generates the submission UUID on the server and creates an owned draft.
4. Validates receipt size, MIME type, filename extension, and leading file signature.
5. Uploads accepted evidence to `{user-id}/{submission-id}/receipt.{extension}` inside the private `payment-receipts` bucket.
6. Attaches the validated path to the owned draft.
7. Calls `submit_payment_for_review(submission-id)` and returns the database-generated internal reference.
8. Revalidates deposit history without changing any wallet figure.

The browser never creates Supabase financial records directly. The form disables repeated submission while a request is pending; the server checks existing owned references, and the database uniquely enforces normalized Bitcoin hashes. If a failure occurs before review begins, newly uploaded evidence is removed when the existing storage policy permits it. A failed draft can remain for operational diagnosis because normal users have no payment-row delete privilege.

## Bitcoin duplicate protection

A partial unique index applies to normalized Bitcoin hashes only. Hash comparison is case-insensitive and trims surrounding whitespace. Bank transfer references are not globally unique.

## Private receipt storage

The existing `payment-receipts` bucket remains private. Its current limits are:

- Maximum file size: 10 MiB
- Accepted types: JPEG, PNG, WebP, and PDF
- Required object prefix: authenticated user UUID

Phase 8 application code must use the stricter object shape:

```text
payment-receipts/{user-id}/{submission-id}/{safe-file-name}
```

The database submission function verifies the stored object name and `owner_id`. The application must additionally validate MIME type, extension, and file signatures before upload.

## Future administration

The future payment review workflow must require an active administrator, the `payments.review` permission, AAL2, server-side authorization, and appropriate audit records. Approval and account crediting must remain separate protected operations. Crediting must atomically create the wallet transaction and administrative audit record; it must never be performed by `submit_payment_for_review`.
