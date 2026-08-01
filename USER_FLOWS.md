# Oryvane Capital User Flows

## 1. Registration

1. User opens the registration page.
2. User enters full name, email, phone, country and password.
3. User accepts required policies.
4. Client and server validation run.
5. Supabase Auth creates the account.
6. A profile record is created.
7. Verification email is sent.
8. User is redirected to the verification notice page.
9. Financial actions remain disabled until verification succeeds.

## 2. Email Verification

1. User opens the verification link.
2. Supabase validates the token.
3. The account is marked verified.
4. The user returns to the application.
5. The platform checks profile completion.
6. User is redirected to onboarding or dashboard.

## 3. Sign In

1. User enters email and password.
2. Supabase Auth validates the credentials.
3. The server validates the session.
4. The account status is checked.
5. Active users enter the dashboard.
6. Restricted users see permitted features only.
7. Suspended or blocked users see the correct restriction message.

## 4. Password Reset

1. User selects Forgot Password.
2. User enters email.
3. A generic success message is displayed.
4. Supabase sends a reset link when the account exists.
5. User opens the secure link.
6. User creates a new password.
7. Existing sessions may be revoked.
8. A password change notification is sent.

## 5. Profile Completion

1. User signs in after verification.
2. Missing profile fields are displayed.
3. User completes the required information.
4. The server validates the submitted fields.
5. Only permitted profile fields are updated.
6. User is redirected to the dashboard.

## 6. Bank Payment Submission

1. User selects Deposit.
2. User chooses Bank Transfer.
3. The platform displays active bank details.
4. User completes the transfer externally.
5. User enters amount, sender name and reference.
6. User uploads a receipt.
7. The server validates the file and form.
8. A submitted payment record is created.
9. The user sees a pending review status.
10. Admin receives a review notification.

## 7. Bitcoin Payment Submission

1. User selects Deposit.
2. User chooses Bitcoin.
3. The platform displays the active wallet address and QR code.
4. User sends Bitcoin externally.
5. User enters amount and transaction hash.
6. User uploads proof when required.
7. The server validates the submission.
8. A submitted payment record is created.
9. The user sees the current verification status.
10. Admin receives a review notification.

## 8. Payment Approval and Account Credit

1. Authorised admin opens a payment submission.
2. Admin reviews the details and proof.
3. Admin verifies the payment externally.
4. Admin enters the confirmed amount and reason.
5. The system requests reauthentication when required.
6. A protected server operation creates the financial transaction.
7. The user account is credited.
8. The payment is marked credited.
9. An immutable audit record is created.
10. The user dashboard reflects the new figure.
11. The user receives a notification.

## 9. Payment Rejection

1. Admin reviews the payment.
2. Admin selects Reject.
3. Admin enters a required rejection reason.
4. The payment status becomes rejected.
5. No account credit occurs.
6. An audit record is created.
7. The user sees the reason and receives a notification.

## 10. Investment Request

1. User opens an active investment plan.
2. User reviews the amount, duration, risk and terms.
3. User enters an amount within allowed limits.
4. The platform checks available balance.
5. User confirms the request.
6. A pending investment record is created.
7. The amount is reserved or remains awaiting admin review based on the approved business rule.
8. Admin receives a review notification when manual activation is required.

## 11. Investment Activation

1. Authorised admin reviews the investment request.
2. Admin confirms funding and plan eligibility.
3. Admin activates the investment.
4. The system records the start date and maturity date.
5. The invested amount is reflected in dashboard figures.
6. A transaction and audit record are created.
7. The user receives a notification.

## 12. Earnings Update

1. Authorised admin opens the user investment.
2. Admin enters the earnings adjustment.
3. Admin provides a reason and period.
4. The system validates permissions.
5. A protected server operation records the earnings.
6. A financial transaction and audit record are created.
7. Dashboard earnings are recalculated.
8. The user receives a notification.

## 13. Bank Withdrawal Request

1. User selects Withdraw.
2. User chooses Bank Account.
3. User enters the amount and approved bank information.
4. The platform checks restrictions and available balance.
5. User confirms the request.
6. A submitted withdrawal record is created.
7. The amount may be reserved according to the final financial rule.
8. Admin receives a review notification.

## 14. Bitcoin Withdrawal Request

1. User selects Withdraw.
2. User chooses Bitcoin.
3. User enters the amount and wallet address.
4. The platform validates the address format.
5. The platform checks restrictions and available balance.
6. User confirms the request.
7. A submitted withdrawal record is created.
8. Admin receives a review notification.

## 15. Withdrawal Approval and Payment

1. Authorised admin reviews the request.
2. Admin verifies the user, amount and destination.
3. Admin approves the request.
4. Status changes to approved or processing.
5. Payment is completed externally.
6. Admin records the payment reference.
7. A protected server operation debits the user account.
8. Status changes to paid.
9. Transaction and audit records are created.
10. The user receives a notification.

## 16. Account Restriction

1. Authorised admin opens the user account.
2. Admin selects the restriction type.
3. Admin enters the reason and optional expiry.
4. Reauthentication is required for sensitive restrictions.
5. The restriction is recorded.
6. An audit event is created.
7. The user sees the resulting limitation.
8. The user receives a notification when appropriate.

## 17. Account Restoration

1. Authorised admin reviews the restriction.
2. Admin selects Restore or Remove Restriction.
3. Admin provides a reason.
4. The system records the change.
5. An audit event is created.
6. Allowed access is restored.
7. The user receives a notification.
