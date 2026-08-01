# Oryvane Capital Build Phases

The project is divided into 12 phases.

## Phase 1: Product Foundation

### Objective

Define the product, user flows, admin controls, financial rules, RLS responsibilities and unresolved decisions.

### Deliverables

1. Product requirements
2. User flows
3. Admin system
4. Financial rules
5. RLS access matrix
6. Build phases
7. Open questions

### Completion Criteria

All core business rules are documented and no production code has been created.

## Phase 2: Project Foundation

### Objective

Create the Next.js project architecture and development standards.

### Deliverables

1. Next.js App Router setup
2. Strict TypeScript
3. Tailwind CSS
4. Environment validation
5. Folder structure
6. Error and logging foundations
7. Core project instructions

### Security

No secrets in source control. No service role key in client code.

## Phase 3: Design and Animation System

### Objective

Build the shared design language before full pages.

### Deliverables

1. Colour tokens
2. Typography
3. Spacing and layout rules
4. Buttons, inputs, cards and dialogs
5. Motion patterns
6. Reduced motion support
7. Responsive component rules

### Completion Criteria

The design system works across mobile, tablet and desktop.

## Phase 4: Public Website

### Objective

Build the public marketing and legal experience.

### Deliverables

1. Homepage
2. About
3. Investment plans
4. How it works
5. Security
6. FAQ
7. Contact
8. Legal pages
9. Login and registration interfaces

## Phase 5: Authentication and Onboarding

### Objective

Implement secure user and admin authentication.

### Deliverables

1. Registration
2. Email verification
3. Login
4. Password reset
5. Session handling
6. Profile onboarding
7. Protected routes
8. Admin login
9. Admin MFA

## Phase 6: Database, Storage and RLS

### Objective

Create the authoritative data model and access policies.

### Deliverables

1. Database migrations
2. Table relationships
3. Indexes
4. RLS policies
5. Storage policies
6. Protected server functions
7. Audit infrastructure
8. RLS tests

### Completion Criteria

Users cannot access another user’s data or modify protected financial fields.

## Phase 7: User Dashboard

### Objective

Build the authenticated user experience.

### Deliverables

1. Account overview
2. Financial figures
3. Investment overview
4. Transaction history
5. Notifications
6. Profile settings
7. Security settings

## Phase 8: Payment Submission System

### Objective

Implement bank and Bitcoin payment submission and review.

### Deliverables

1. Payment methods
2. Bank instructions
3. Bitcoin address and QR code
4. Payment forms
5. Private receipt uploads
6. Status tracking
7. Admin review workflow
8. Account crediting operation

## Phase 9: Investment System

### Objective

Implement investment plans and user investments.

### Deliverables

1. Plan management
2. Investment request flow
3. Activation
4. Earnings updates
5. Maturity and completion
6. Investment history

## Phase 10: Admin Control Centre

### Objective

Build the role-based administration interface.

### Deliverables

1. User management
2. Payment review
3. Financial adjustments
4. Withdrawal review
5. Investment management
6. Account restrictions
7. Notifications
8. Admin role management
9. Audit log viewer

## Phase 11: Security and Testing

### Objective

Validate functionality, security and quality.

### Deliverables

1. Unit tests
2. Integration tests
3. RLS tests
4. End to end tests
5. Admin permission tests
6. File upload tests
7. Accessibility checks
8. Responsive checks
9. Abuse and rate limit checks
10. Security review

## Phase 12: Deployment and Handover

### Objective

Prepare and release the production platform.

### Deliverables

1. Production Supabase configuration
2. Production environment variables
3. Domain and email setup
4. Monitoring
5. Backups
6. Deployment
7. Final security review
8. Client training
9. Technical handover documentation

## Global Build Rules

1. Do not run `npm run build` unless the user explicitly authorises it.
2. Do not expose secrets in browser code.
3. Do not allow direct client financial writes.
4. Do not proceed to the next phase without reviewing the current phase report.
5. Every phase must end with a concise implementation report.
