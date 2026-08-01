# Oryvane Capital Admin Bootstrap

No administrator, role, permission, credential, or Auth user is created automatically by Phase 6.

## Preconditions

Before bootstrap:

1. Select an existing, verified Supabase Auth user through an approved internal process.
2. Require that user to enrol an authenticator factor and reach `aal2`.
3. Approve the initial role and least-privilege permission set.
4. Use a trusted direct database session or reviewed operational script—not a browser client.
5. Record the approval outside the database before making the change.

## Permission keys referenced by current policies

- `users.view`
- `finance.view`
- `finance.adjust`
- `payments.review`
- `plans.manage`
- `investments.review`
- `withdrawals.review`
- `restrictions.manage`
- `security.view`
- `admins.view`
- `audit.view`

Creating a permission key does not grant it. A role receives authority only through `admin_role_permissions`, and a person receives that role only through an active `admin_users` record.

## Reviewed bootstrap outline

The following is an outline, not a migration and not executable with placeholders. Replace identifiers only inside a separately reviewed, transaction-wrapped local/operational script:

```sql
begin;

-- Create the approved permission definitions.
-- Create a least-privilege role.
-- Link only approved permissions to that role.
-- Insert one admin_users row referencing an existing verified Auth UUID.
-- Set status active only after MFA enrolment and approval are verified.
-- Insert an initial admin_audit_logs bootstrap record with the approval reason.

commit;
```

Do not infer administrator status from email, email domain, signup metadata, or successful authentication. Do not insert an admin from the new-user trigger. Do not place a real Auth UUID or credentials in a migration.

## Sensitive operation requirements

Admin access requires an active record, an assigned permission, and `aal2`. The future admin server must also enforce shorter sessions, reauthentication for sensitive operations, account status, and audit requirements. Database helper success does not replace route-level server authorization.

## Removal

Disable an administrator by changing the protected `admin_users.status` through a reviewed server-only operation and recording an audit event. Do not delete the Auth user or admin history to hide prior actions.
