# Oryvane Capital RLS Access Matrix

Supabase Row Level Security must be enabled on every exposed table.

The service role must never be exposed to browser code.

| Resource | User Select | User Insert | User Update | User Delete | Admin Access | Server Only Operations | Audit Required |
|---|---|---|---|---|---|---|---|
| `profiles` | Own profile | Profile created through trusted flow | Approved personal fields only | No | Permission based | Role, status and protected field changes | Protected field changes |
| `wallet_accounts` | Own account | No | No | No | Permission based read | Create account, credit, debit and recalculate | Yes |
| `wallet_transactions` | Own transactions | No direct client insert | No | No | Permission based read | All authoritative financial writes | Yes |
| `payment_submissions` | Own submissions | Own pending submission | Limited fields before review | Cancel where allowed, otherwise no | Permission based review | Approval, rejection and crediting | Yes |
| `payment_receipts` | Own authorised receipt access | Upload to own protected path | Replace only before review if allowed | Limited before review | Permission based signed access | Secure path generation and moderation | Yes |
| `investment_plans` | Active public plans | No | No | No | Permission based management | Publish, pause and archive operations | Yes for admin changes |
| `user_investments` | Own investments | Own request through protected flow | No financial or status fields | No | Permission based management | Activation, earnings, maturity and completion | Yes |
| `investment_updates` | Own related updates | No | No | No | Permission based read | Create approved updates | Yes |
| `withdrawal_requests` | Own requests | Own request | Limited fields before review | Cancel while eligible | Permission based review | Approval, processing, paid and reversal | Yes |
| `notifications` | Own notifications | No | Mark own notification read | No | Limited permission based access | Create financial and security notifications | For admin-generated notices |
| `admin_users` | No | No | No | No | Limited by admin role | Create, invite, disable and role assignment | Yes |
| `admin_roles` | No | No | No | No | Super admin or authorised read | Create or update role definitions | Yes |
| `admin_permissions` | No | No | No | No | Super admin or authorised read | Permission assignment | Yes |
| `account_restrictions` | Own active restrictions where appropriate | No | No | No | Compliance or authorised admin | Apply, update and remove restrictions | Yes |
| `security_events` | Own selected events if exposed | No direct client insert | No | No | Permission based read | Create security events | Yes |
| `admin_audit_logs` | No | No | No | No | Approved read only access | Insert only through trusted operations | Always |

## Policy Principles

1. Users can only access records linked to their authenticated user ID.
2. Users cannot modify balances, earnings or approval statuses.
3. Users cannot approve payments or withdrawals.
4. Users cannot access administrator tables.
5. Admin access is not granted only because an admin page is hidden.
6. Admin permissions must be checked on the server.
7. Sensitive actions should use protected database functions or trusted server routes.
8. Receipt storage must remain private.
9. Audit records must be append only.
10. Every RLS policy requires dedicated tests before release.
