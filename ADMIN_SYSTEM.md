# Oryvane Capital Admin System

## 1. Admin Roles

### Super Administrator

Full platform administration. Can manage administrators and critical settings.

### Finance Administrator

Can review payments, update approved financial figures, process withdrawals and view financial reports.

### Compliance Administrator

Can review users, restrictions, identity information, suspicious activity and compliance notes.

### Support Administrator

Can view user accounts, respond to support issues and send approved notifications. Cannot alter financial figures.

### Content Administrator

Can manage public content, investment descriptions, FAQs and announcements. Cannot perform financial actions.

### Read Only Auditor

Can inspect approved records and audit history without making changes.

## 2. Permission Matrix

| Capability | Super Admin | Finance | Compliance | Support | Content | Auditor |
|---|---:|---:|---:|---:|---:|---:|
| View users | Yes | Yes | Yes | Yes | No | Yes |
| Edit permitted profile fields | Yes | Limited | Limited | Limited | No | No |
| Credit accounts | Yes | Yes | No | No | No | No |
| Debit accounts | Yes | Yes | No | No | No | No |
| Add earnings | Yes | Yes | No | No | No | No |
| Add bonuses | Yes | Yes | No | No | No | No |
| Approve bank payments | Yes | Yes | No | No | No | No |
| Approve Bitcoin payments | Yes | Yes | No | No | No | No |
| Reject payments | Yes | Yes | Limited | No | No | No |
| Approve withdrawals | Yes | Yes | No | No | No | No |
| Mark withdrawals paid | Yes | Yes | No | No | No | No |
| Create investment plans | Yes | Limited | No | No | Yes | No |
| Update investment plans | Yes | Limited | No | No | Yes | No |
| Suspend users | Yes | No | Yes | No | No | No |
| Block users | Yes | No | Yes | No | No | No |
| Restrict deposits | Yes | Yes | Yes | No | No | No |
| Restrict withdrawals | Yes | Yes | Yes | No | No | No |
| Restrict login | Yes | No | Yes | No | No | No |
| Send notifications | Yes | Limited | Limited | Yes | Yes | No |
| View audit logs | Yes | Limited | Limited | No | No | Yes |
| Create administrators | Yes | No | No | No | No | No |
| Edit admin permissions | Yes | No | No | No | No | No |
| Disable administrators | Yes | No | No | No | No | No |
| Export reports | Yes | Yes | Limited | No | No | Yes |

Exact permissions must be enforced by the server and database, not only by hidden interface elements.

## 3. Admin Authentication

1. Separate `/admin/login` route
2. Email and password
3. Mandatory authenticator MFA
4. Approved active admin account
5. Short session lifetime
6. Automatic logout after inactivity
7. Reauthentication before sensitive operations
8. Login attempt and security event logging

There must be no public admin registration route.

## 4. Sensitive Actions

Sensitive actions include:

1. Crediting funds
2. Debiting funds
3. Adding earnings or bonuses
4. Approving withdrawals
5. Marking withdrawals paid
6. Reversing transactions
7. Blocking users
8. Changing admin roles
9. Disabling administrators
10. Editing active payment destinations

Sensitive actions require:

1. Server-side permission validation
2. Current MFA assurance
3. Reauthentication when required
4. A reason
5. Confirmation screen
6. Audit logging

## 5. User Management

Authorised administrators can:

1. Search and filter users
2. View account status
3. View payment, investment and withdrawal history
4. View restrictions and internal notes
5. Apply or remove restrictions
6. Suspend, block or restore accounts
7. Send notifications
8. Review login and security activity

## 6. Financial Adjustments

The admin interface must never expose a raw editable balance field.

Financial changes must use a controlled adjustment form containing:

1. User
2. Adjustment type
3. Amount
4. Currency
5. Payment method where applicable
6. External reference
7. Reason
8. Internal note
9. User-visible note where applicable
10. Confirmation and reauthentication

The server must create the transaction and audit event atomically.

## 7. Payment Review

The payment review screen should display:

1. User details
2. Payment method
3. Submitted amount
4. Submitted reference or transaction hash
5. Receipt or proof
6. Submission time
7. Previous submissions
8. Existing user restrictions
9. Review notes
10. Approve, reject and request-more-information actions

## 8. Withdrawal Review

The withdrawal screen should display:

1. User details
2. Requested amount
3. Available balance
4. Destination details
5. Recent deposits and withdrawals
6. Account restrictions
7. Review notes
8. Approve, reject, processing and paid actions

## 9. Audit Logging

Every admin action must record:

1. Admin ID
2. Action
3. Resource type
4. Resource ID
5. Affected user
6. Previous state
7. New state
8. Reason
9. IP and session metadata where appropriate
10. Date and time

Existing audit records must not be editable or deletable through the application.

## 10. Prohibited Admin Actions

No administrator should be able to:

1. Permanently delete financial records
2. Remove audit history
3. Directly modify database balances from the client
4. Approve actions without permission
5. Expose private receipts to unauthorised roles
6. Bypass reauthentication for sensitive actions
7. Change their own role or permissions unless explicitly authorised through a controlled process
# Phase 10A implementation

The admin control centre is separate from the user dashboard and is read-only in Phase 10A. Every protected route performs server-side authorization in its layout and each data service repeats the required permission check. Access requires an authenticated Supabase user, an active `admin_users` record, an assigned fixed role, `portal.access`, and an `aal2` session obtained with Supabase TOTP MFA.

The fixed roles are Super administrator, Finance administrator, Compliance administrator, Support administrator, Content administrator, and Read only auditor. Their permission mappings are installed as catalogue data; no Auth user or administrator is created by the migration.

`/admin/login` accepts email and password but successful password authentication is not sufficient for protected access. `/admin/mfa` handles TOTP enrollment, challenge, and verification. `/admin` and its users, payments, investments, withdrawals, and audit sections use real records and permission-aware navigation. Mutation controls are deliberately absent.

The one-time first-admin process is documented in `docs/ADMIN_BOOTSTRAP.md`. It requires an existing Auth UUID, verified TOTP, an exact role, service-role server credentials, and explicit confirmation; it never runs automatically.
