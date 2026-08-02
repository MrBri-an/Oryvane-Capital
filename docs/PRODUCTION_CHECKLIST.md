# Production checklist

- [ ] `npm audit --json` is clean and dependency provenance is reviewed.
- [ ] Every local pgTAP suite passes in an isolated Supabase stack.
- [ ] Authenticated user/admin staging Playwright suites pass, including AAL2 and permission denial.
- [ ] Receipt scanner is configured, monitored, and clean scan is required before review.
- [ ] Exact HTTPS site, Host, Origin, Supabase callback, and CSP origins are confirmed.
- [ ] Monitoring, alerting, log retention, backups, and a restore drill are confirmed.
- [ ] Legal company identity, jurisdiction, terms, privacy, risk, and support contacts are approved.
- [ ] Bank/Bitcoin configuration has dual-control approval.
- [ ] Administrator bootstrap and least-privilege assignments are approved.
- [ ] Incident response, rollback owner, and launch authorization are signed.
