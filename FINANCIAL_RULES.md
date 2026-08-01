# Oryvane Capital Financial Rules

## 1. Source of Truth

Financial figures must be generated from trusted database records and protected server operations.

The browser is never the source of truth for balances, earnings, deposits, investments or withdrawals.

## 2. Dashboard Figures

### Total Balance

The total value currently attributed to the user according to approved financial records.

### Available Balance

Funds available for new investments or eligible withdrawals after reservations, restrictions and pending operations.

### Invested Amount

The sum of principal assigned to active investments.

### Total Earnings

The sum of approved investment return transactions.

### Pending Deposits

Submitted deposits not yet credited.

### Pending Withdrawals

Withdrawal requests that are submitted, under review, approved or processing.

### Total Deposits

The total of credited deposit transactions.

### Total Withdrawals

The total of completed withdrawal transactions.

## 3. Adjustment Types

1. Bank deposit
2. Bitcoin deposit
3. Investment allocation
4. Investment return
5. Bonus
6. Withdrawal
7. Fee
8. Refund
9. Correction
10. Reversal
11. Promotional credit
12. Administrative debit

## 4. Required Transaction Data

Every transaction must contain:

1. Unique ID
2. User ID
3. Type
4. Amount
5. Currency
6. Direction
7. Status
8. External reference where applicable
9. Related payment, investment or withdrawal ID
10. Reason
11. Created by
12. Created date
13. Completed date where applicable
14. Reversal reference where applicable

## 5. Admin Financial Updates

Admin updates must:

1. Use a protected server operation
2. Verify the admin session and permission
3. Require a reason
4. Record previous and resulting values
5. Create a financial transaction
6. Create an audit event
7. Complete atomically
8. Notify the user where appropriate

## 6. Payment Approval

A payment can be credited only after:

1. The user submitted a valid payment record.
2. An authorised admin reviewed the submission.
3. The payment was independently confirmed.
4. The confirmed amount and currency were recorded.
5. The approval operation completed successfully.

Approval and crediting should not create duplicate transactions. Idempotency protection is required.

## 7. Payment Rejection

Rejected payments require a reason.

A rejected payment must not affect the user balance.

The original submission and review history must remain available.

## 8. Investment Allocation

An investment can become active only when:

1. The plan is active.
2. The amount is within allowed limits.
3. The user has enough available funds.
4. The user is not restricted from investing.
5. The required review is complete.

The platform must prevent the same available funds from being allocated twice.

## 9. Investment Earnings

Earnings must be recorded as separate approved transactions.

Each earnings update should include:

1. Investment ID
2. Period or date range
3. Amount
4. Currency
5. Reason or description
6. Administrator
7. Timestamp

Existing earnings records must not be silently overwritten.

## 10. Withdrawals

A withdrawal request must:

1. Belong to the signed-in user
2. Use an approved method
3. Respect minimum and maximum rules
4. Not exceed available balance
5. Respect account restrictions
6. Remain pending until admin review

Only an authorised admin can approve or mark a withdrawal paid.

The final account debit must occur through a protected server operation.

## 11. Corrections and Reversals

Financial records must not be edited or deleted to hide mistakes.

An incorrect transaction must be corrected by creating a reversal transaction linked to the original record.

The reversal must include:

1. Original transaction ID
2. Reason
3. Admin identity
4. Amount
5. Date and time

## 12. Currency Rules

1. Every financial record must include a currency.
2. Different currencies must not be combined without an explicit conversion rule.
3. Money must be stored using fixed precision numeric types.
4. Floating point values must not be used for authoritative financial calculations.
5. Bitcoin values must use appropriate decimal precision.

## 13. Deletion Rules

1. Financial transactions cannot be hard deleted.
2. Payment, investment and withdrawal history must be preserved.
3. User account closure must not remove required financial records.
4. Soft deletion may be used for non-financial display content.

## 14. Audit Requirements

Financial audit records must identify:

1. The administrator
2. The user
3. The operation
4. The reason
5. The amount and currency
6. Previous and resulting values
7. Related resource IDs
8. Date and time
9. Session metadata where appropriate

## 15. Phase 10B implementation boundary

Payment approval and wallet adjustments are implemented as atomic, audited database operations. Payment crediting can occur only once and always creates an immutable transaction. Corrections use new correction or reversal records rather than editing financial history.

Investment earnings posting remains blocked because the product decisions about immediate withdrawability and wallet-total treatment are unresolved in `OPEN_QUESTIONS.md`. Existing earnings can be viewed, but no Phase 10B control invents an accounting rule for posting them.

## 16. Phase 10C approved settlement rules

Pending investment principal is reserved by reducing available balance and increasing invested amount. Rejection or cancellation releases that principal back to available balance, reduces invested amount, and leaves total balance unchanged. Maturity performs the same principal release. Each release is an immutable reversal linked to the original allocation, so it can occur only once.

Active investment earnings remain informational and unavailable. After maturity, authorised administrators may post realised earnings. Realised earnings atomically increase the investment earnings figure, wallet total balance, available balance, and total earnings, while creating an immutable transaction, investment update, and audit record. The unique transaction reference prevents duplicate posting.

Withdrawal submission reserves available funds without immediately reducing total balance. Rejection releases the reservation. Marking a processing withdrawal paid reduces total balance; reversing a paid withdrawal restores total and available balance through a new immutable reversal.
