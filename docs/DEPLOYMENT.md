# Deployment

Phase 12A prepares staging but does not authorize production deployment. Use an HTTPS-only staging origin matching `NEXT_PUBLIC_SITE_URL`, exact Supabase redirect URLs, and exact CSP origins. Run migrations through reviewed dry runs, then lint the linked schema. Never deploy with a missing scanner, unresolved legal identity, unexecuted local pgTAP tests, or absent monitoring/backups. Health probes may call `/api/health`; it returns only `{ "status": "ok" }` and is not a dependency diagnostic.

Production promotion requires the signed checklist in `PRODUCTION_CHECKLIST.md`, a clean dependency audit, authenticated staging evidence, and rollback ownership. Do not expose service-role or scanner credentials to browser variables or logs.
