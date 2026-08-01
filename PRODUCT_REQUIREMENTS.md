# Oryvane Capital Product Requirements

## 1. Product Summary

Oryvane Capital is a premium investment platform where users can create accounts, submit payments through bank transfer or Bitcoin, monitor account funds, view active investments, track earnings, review transaction history and request withdrawals.

The platform uses a manually managed financial workflow. Users submit payment details and proof. An authorised administrator reviews the payment and credits the user account after confirmation.

## 2. Product Goals

1. Provide a premium, trustworthy and responsive investment experience.
2. Give users a clear view of their funds, investments and earnings.
3. Give authorised administrators controlled access to financial updates.
4. Record every financial action in permanent transaction and audit records.
5. Protect private and financial data with Supabase Auth, RLS and server-side authorisation.

## 3. User Roles

### Visitor

Can view public pages, investment plans, legal pages and authentication pages.

### Registered User

Can manage their profile, submit payments, view account figures, create investment requests, request withdrawals and read notifications.

### Administrator

Can perform approved operational tasks based on assigned permissions.

## 4. User Registration

Required fields:

1. Full name
2. Email address
3. Phone number
4. Country
5. Password
6. Password confirmation
7. Terms acceptance
8. Privacy policy acceptance
9. Risk disclosure acceptance

Email verification is required before financial actions are enabled.

## 5. Authentication

### User Sign In

Users sign in with email and password.

The system must support:

1. Email verification
2. Password reset
3. Remembered sessions
4. Session revocation
5. Account status checks
6. Optional user MFA

### Admin Sign In

Admin access uses a separate protected route.

Requirements:

1. Approved admin account
2. Email and password
3. Mandatory MFA
4. Active admin status
5. Shorter session lifetime
6. Reauthentication for sensitive actions

There must be no public admin registration page.

## 6. Account Statuses

### Active

Full access based on verification and platform rules.

### Pending Verification

Can sign in and complete onboarding, but cannot use financial features.

### Restricted

Can sign in and view allowed information, but selected actions are disabled.

### Suspended

Cannot perform financial actions. Dashboard access may be limited.

### Blocked

Cannot sign in or use the platform.

### Closed

Account is inactive. Financial records remain preserved.

## 7. Core User Features

1. Account creation and secure sign in
2. Profile management
3. Investment plan browsing
4. Bank payment submission
5. Bitcoin payment submission
6. Payment status tracking
7. Balance and earnings monitoring
8. Active and completed investment history
9. Withdrawal requests
10. Transaction history
11. Notifications
12. Security settings

## 8. Public Website

Required pages:

1. Home
2. About
3. Investment Plans
4. How It Works
5. Security
6. FAQ
7. Contact
8. Login
9. Register
10. Terms
11. Privacy Policy
12. Risk Disclosure

## 9. User Dashboard

The dashboard should display:

1. Total balance
2. Available balance
3. Invested amount
4. Total earnings
5. Pending deposits
6. Pending withdrawals
7. Active investments
8. Completed investments
9. Recent transactions
10. Portfolio performance
11. Notifications

Users must not be able to directly modify financial figures.

## 10. Payment Methods

### Bank Transfer

Users can view bank details, enter payment information, upload a receipt and submit the payment for review.

Statuses:

1. Draft
2. Submitted
3. Under Review
4. Approved
5. Rejected
6. Credited
7. Cancelled

### Bitcoin

Users can view and copy the Bitcoin address, scan a QR code, submit the amount and transaction hash, and upload proof where required.

Statuses:

1. Draft
2. Submitted
3. Under Review
4. Awaiting Confirmation
5. Approved
6. Rejected
7. Credited
8. Cancelled

## 11. Investment Plans

Each plan should support:

1. Name
2. Short description
3. Full description
4. Minimum amount
5. Maximum amount
6. Currency
7. Duration
8. Return rate or range
9. Risk level
10. Image
11. Terms
12. Availability dates
13. Participant limit
14. Featured status
15. Plan status

Plan statuses:

1. Draft
2. Active
3. Paused
4. Closed
5. Archived

## 12. Investment Statuses

1. Pending
2. Awaiting Funding
3. Under Review
4. Active
5. Matured
6. Completed
7. Cancelled
8. Rejected
9. Suspended

## 13. Withdrawals

Users can request withdrawals through bank transfer or Bitcoin.

Statuses:

1. Submitted
2. Under Review
3. Approved
4. Processing
5. Paid
6. Rejected
7. Cancelled
8. Reversed

Users cannot approve their own withdrawals or mark them as paid.

## 14. Admin Capabilities

Depending on role, administrators may:

1. View users
2. Review payments
3. Credit or debit accounts
4. Add earnings or bonuses
5. Correct financial figures through recorded adjustments
6. Approve or reject withdrawals
7. Manage investment plans
8. Restrict, suspend, block or restore accounts
9. Send notifications
10. View audit logs
11. Manage administrators and permissions

## 15. Financial Control Requirements

Every financial action must record:

1. Affected user
2. Administrator
3. Action type
4. Amount
5. Currency
6. Previous value
7. Resulting value
8. Reason
9. Transaction reference
10. Date and time
11. Optional internal note

Financial records must never be permanently deleted. Errors must be corrected through reversal transactions.

## 16. Non Functional Requirements

1. Fully responsive from 320px upward
2. Accessible keyboard and screen reader support
3. Reduced motion support
4. Secure server-side authorisation
5. RLS on exposed Supabase tables
6. Private storage for payment receipts
7. Clear error handling
8. Audit logging
9. Mobile friendly dashboard and admin views
10. Fast loading and controlled animation

## 17. Acceptance Criteria

Phase 1 is complete when:

1. Product rules are documented.
2. User and admin flows are defined.
3. Financial controls are documented.
4. RLS responsibilities are mapped.
5. The 12 build phases are defined.
6. Remaining client decisions are listed.
