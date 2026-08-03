# Graph Report - .  (2026-08-03)

## Corpus Check
- 208 files · ~59,052 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 864 nodes · 1981 edges · 86 communities (57 shown, 29 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 38 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Admin Login
- About Module
- Admin Mfa
- Audit Module
- Deposits Module
- Admin Audit
- Package Module
- Phase 6 Schema Migration
- Dev Dependencies
- Tsconfig Module
- Operation Actions
- Authentication Setup
- Design System Preview
- Lenis Module
- Protected Module
- Portfolio Overview
- Admin Navigation
- App Layout
- Admin System
- Public Env
- Protected Admin Operations
- Production Hardening Migration
- Market Chart
- Phase 6 RLS Migration
- Admin Foundation Migration
- Security Verification Phase
- Wallet Accounting Invariants
- Protected Loading
- Route Audit Spec
- Staging Authenticated Spec
- Server Authoritative Security
- Bootstrap Admin
- Review Hardening Migration
- Investment Request Migration
- Health Route
- Route Placeholder
- Security Authorization
- Phase Gated Delivery
- Next Config
- Postcss Config
- Design Tokens
- Financial Operations
- Common Module
- Public Admin Audit Logs
- Public Admin Roles
- Public Investment Plans
- Public Investment Updates
- Public Notifications
- Public Security Events
- Public Wallet Accounts
- Public Wallet Transactions
- Release Readiness
- Route Stabilization Audit
- Security Audit
- Public Account Restrictions
- Public Payment Submissions
- Public Profiles
- Public User Investments
- Public Withdrawal Requests
- Payment Policies Group One
- Withdrawal Policies Group Two
- Payment Policies Group Three

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 61 edges
2. `cn()` - 36 edges
3. `Button()` - 26 edges
4. `getDashboardIdentity` - 23 edges
5. `enforceRateLimit()` - 21 edges
6. `Field()` - 20 edges
7. `Input` - 19 edges
8. `buttonVariants` - 18 edges
9. `reauthenticate()` - 18 edges
10. `Alert()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Append-Only Data Protection` --semantically_similar_to--> `Immutable Financial Ledger`  [INFERRED] [semantically similar]
  RLS_ACCESS_MATRIX.md → FINANCIAL_RULES.md
- `Automated Security Coverage` --semantically_similar_to--> `Verified Security Controls`  [INFERRED] [semantically similar]
  QA.md → SECURITY_AUDIT.md
- `Release Security Blockers` --semantically_similar_to--> `Production Blockers`  [INFERRED] [semantically similar]
  SECURITY_AUDIT.md → RELEASE_READINESS.md
- `Repository Governance` --references--> `Admin System`  [EXTRACTED]
  AGENTS.md → ADMIN_SYSTEM.md
- `Protected Admin Operations` --implements--> `Immutable Financial Ledger`  [INFERRED]
  ADMIN_SYSTEM.md → FINANCIAL_RULES.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **financial_integrity_controls** — financial_rules_immutable_financial_ledger, rls_access_matrix_append_only_data_protection, admin_system_protected_admin_operations, security_audit_verified_security_controls [INFERRED 0.95]
- **release_evidence_gaps** — qa_pending_authenticated_verification, route_audit_authenticated_fixture_gap, security_audit_release_security_blockers, release_readiness_production_blockers [INFERRED 0.95]
- **admin_assurance_chain** — admin_system_fresh_mfa_assurance, route_audit_layered_route_authorization, docs_admin_bootstrap_one_time_super_admin_setup [INFERRED 0.85]

## Communities (86 total, 29 thin omitted)

### Community 0 - "Admin Login"
Cohesion: 0.06
Nodes (51): metadata, metadata, AdminSetupPage(), dynamic, metadata, metadata, LoginPage(), metadata (+43 more)

### Community 1 - "About Module"
Cohesion: 0.06
Nodes (47): metadata, ContactPage(), metadata, metadata, metadata, InvestmentsPage(), metadata, availability() (+39 more)

### Community 2 - "Admin Mfa"
Cohesion: 0.08
Nodes (52): AdminMfaPage(), GET(), otpTypes, WithdrawalForm(), getServerEnvironment(), ServerEnvironment, serverEnvironmentSchema, createPrivilegedClient() (+44 more)

### Community 3 - "Audit Module"
Cohesion: 0.13
Nodes (36): metadata, metadata, Plan, transitions, metadata, metadata, metadata, metadata (+28 more)

### Community 4 - "Deposits Module"
Cohesion: 0.07
Nodes (41): DepositsPage(), InvestmentsPage(), NotificationsPage(), DashboardPage(), SettingsPage(), TransactionsPage(), WithdrawalsPage(), UserLayout() (+33 more)

### Community 5 - "Admin Audit"
Cohesion: 0.08
Nodes (37): AdminAuditPage(), AdminInvestmentsPage(), ProtectedAdminLayout(), AdminPage(), AdminPaymentsPage(), AdminUserPage(), AdminUsersPage(), AdminWithdrawalsPage() (+29 more)

### Community 6 - "Package Module"
Cohesion: 0.04
Nodes (44): class-variance-authority, clsx, @hookform/resolvers, lucide-react, motion, next, dependencies, class-variance-authority (+36 more)

### Community 7 - "Phase 6 Schema Migration"
Cohesion: 0.12
Nodes (33): auth, public, public.handle_new_user, public.prevent_append_only_changes, public.set_updated_at, admin_audit_logs_append_only, admin_roles_set_updated_at, admin_users_set_updated_at (+25 more)

### Community 8 - "Dev Dependencies"
Cohesion: 0.06
Nodes (33): axe-core, @axe-core/playwright, eslint, eslint-config-next, jsdom, devDependencies, axe-core, @axe-core/playwright (+25 more)

### Community 9 - "Tsconfig Module"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 10 - "Operation Actions"
Cohesion: 0.22
Nodes (25): adjustmentMap, adjustWalletAction(), applyRestrictionAction(), completeInvestmentAction(), creditPaymentAction(), currency, matureInvestmentAction(), money (+17 more)

### Community 11 - "Authentication Setup"
Cohesion: 0.16
Nodes (21): Authentication Setup, Non-authoritative Auth metadata, Backup and Recovery, Append-only financial history, Atomic wallet adjustment, Database Schema, Dependency Security Review, Deployment (+13 more)

### Community 12 - "Design System Preview"
Cohesion: 0.15
Nodes (15): DesignSystemPage(), metadata, DesignSystemPreview(), currencySymbols, MarketHeatmap(), sparkline(), MarketTicker(), assetDefinitions (+7 more)

### Community 13 - "Lenis Module"
Cohesion: 0.15
Nodes (10): lenis, lenis, PublicSmoothScroll(), groups, SiteFooter(), links, SiteHeader(), constructor() (+2 more)

### Community 14 - "Protected Module"
Cohesion: 0.18
Nodes (10): metadata, AccountFigure(), InvestmentPlanCard(), Plan, CopyBitcoinAddress(), PaymentMethods(), Card(), CardDescription() (+2 more)

### Community 15 - "Portfolio Overview"
Cohesion: 0.17
Nodes (10): PortfolioOverview(), Wallet, swatches, AnimatedFinancialFigure(), CardEntrance(), easing, PointerSurface(), ScrollReveal() (+2 more)

### Community 16 - "Admin Navigation"
Cohesion: 0.24
Nodes (9): AdminNavigation(), items, DashboardNavigation(), items, CurrencyValue(), PercentageValue(), TabItem, Tabs() (+1 more)

### Community 17 - "App Layout"
Cohesion: 0.22
Nodes (7): bricolage, manrope, metadata, plexMono, CosmicMarketBackground(), symbols, ToastViewport()

### Community 19 - "Admin System"
Cohesion: 0.25
Nodes (9): Admin System, Repository Governance, Build Phases, Admin Bootstrap, Financial Rules, Open Questions, Product Requirements, RLS Access Matrix (+1 more)

### Community 20 - "Public Env"
Cohesion: 0.33
Nodes (6): getPublicEnvironment(), PublicEnvironment, publicEnvironmentSchema, updateSession(), config, proxy()

### Community 21 - "Protected Admin Operations"
Cohesion: 0.25
Nodes (8): Fresh MFA Assurance, Protected Admin Operations, Immutable Audit Discipline, Bootstrap Race Prevention, One-Time Super Admin Setup, Immutable Financial Ledger, Append-Only Data Protection, Account Restriction Lifecycle

### Community 23 - "Production Hardening Migration"
Cohesion: 0.29
Nodes (3): public.enforce_clean_payment_receipt, payment_receipt_scan_gate, public.rate_limit_counters

### Community 24 - "Market Chart"
Cohesion: 0.43
Nodes (5): MarketChart(), points(), compact(), MarketTerminal(), symbols

### Community 25 - "Phase 6 RLS Migration"
Cohesion: 0.43
Nodes (5): public.admin_user_has_permission(), public.has_admin_permission(), public.admin_permissions, public.admin_role_permissions, public.admin_users

### Community 26 - "Admin Foundation Migration"
Cohesion: 0.29
Nodes (3): public.record_admin_auth_event(), auth.users, public.admin_users

### Community 27 - "Security Verification Phase"
Cohesion: 0.33
Nodes (6): Security Verification Phase, Pending Authenticated Verification, Not Ready Verdict, Production Blockers, Authenticated Fixture Gap, Release Security Blockers

### Community 28 - "Wallet Accounting Invariants"
Cohesion: 0.33
Nodes (6): Wallet Accounting Invariants, Client Decision Gates, Unresolved Business Rules, Account and Transaction Statuses, Manual Investment Platform, Financial Lifecycles

### Community 30 - "Route Audit Spec"
Cohesion: 0.33
Nodes (4): authRoutes, dashboardRoutes, protectedAdminRoutes, publicRoutes

### Community 31 - "Staging Authenticated Spec"
Cohesion: 0.33
Nodes (5): admin, hasAdmin, hasUser, registration, user

### Community 32 - "Server Authoritative Security"
Cohesion: 0.40
Nodes (5): Server-Authoritative Security, Automated Security Coverage, Ownership-Scoped Access, Layered Route Authorization, Verified Security Controls

### Community 33 - "Bootstrap Admin"
Cohesion: 0.40
Nodes (4): args, hasVerifiedTotp, roles, supabase

### Community 34 - "Review Hardening Migration"
Cohesion: 0.40
Nodes (4): public.has_admin_permission(), public.admin_permissions, public.admin_role_permissions, public.admin_users

### Community 35 - "Investment Request Migration"
Cohesion: 0.40
Nodes (4): public.request_user_investment(), public.account_restrictions, public.profiles, public.user_investments

## Knowledge Gaps
- **228 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+223 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Package Module` to `Lenis Module`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Why does `lenis` connect `Lenis Module` to `Package Module`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _228 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Login` be split into smaller, more focused modules?**
  _Cohesion score 0.05854049719326383 - nodes in this community are weakly interconnected._
- **Should `About Module` be split into smaller, more focused modules?**
  _Cohesion score 0.05707450444292549 - nodes in this community are weakly interconnected._
- **Should `Admin Mfa` be split into smaller, more focused modules?**
  _Cohesion score 0.07991718426501035 - nodes in this community are weakly interconnected._
- **Should `Audit Module` be split into smaller, more focused modules?**
  _Cohesion score 0.12507305669199298 - nodes in this community are weakly interconnected._