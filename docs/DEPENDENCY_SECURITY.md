# Oryvane Capital Dependency Security Review

Review date: 1 August 2026

## Outcome

The current dependency advisories cannot be safely eliminated with a compatible stable Next.js update. Next.js 16.2.12 is the latest stable registry release, but it declares PostCSS 8.4.31 and optional Sharp `^0.34.5`. The patched dependency lines are PostCSS 8.5.18 or newer and Sharp 0.35.0 or newer.

No forced audit fix, downgrade, or package override was applied. The npm recommendation to install Next.js 9.3.3 is an unsafe major downgrade and is not an acceptable remediation for this application.

## Advisories found

| Advisory | Severity | Affected path | Installed | Patched version | Provenance |
|---|---|---|---:|---:|---|
| `GHSA-qx2v-qp2m-jg93` | Moderate | `next > postcss` | 8.4.31 | 8.5.10+ | PostCSS bundled as a direct Next dependency |
| `GHSA-6g55-p6wh-862q` | High | `next > postcss` | 8.4.31 | 8.5.12+ | PostCSS bundled as a direct Next dependency |
| `GHSA-r28c-9q8g-f849` | High | `next > postcss` | 8.4.31 | 8.5.18+ | PostCSS bundled as a direct Next dependency |
| `GHSA-f88m-g3jw-g9cj` | High | `next > sharp > libvips` | Sharp 0.34.5 | Sharp 0.35.0+ | Optional/transitive Next image dependency |

`GHSA-f88m-g3jw-g9cj` covers inherited libvips issues `CVE-2026-33327`, `CVE-2026-33328`, `CVE-2026-35590`, and `CVE-2026-35591`.

Npm reports `next` as a direct high-severity finding because the vulnerable PostCSS and Sharp packages are reachable beneath it. The audit output does not identify a separate Next.js framework advisory ID. Next.js 16.2.12 is therefore current for Next-specific releases but is not dependency-audit clean.

## Dependency paths

```text
oryvane-capital
|-- @tailwindcss/postcss 4.3.3
|   `-- postcss 8.5.25 (patched)
`-- next 16.2.12
    |-- postcss 8.4.31 (affected)
    `-- sharp 0.34.5 (affected)
```

React 19.2.8 and React DOM 19.2.8 satisfy Next.js 16.2.12's declared peer ranges.

## Exposure assessment

### PostCSS

PostCSS is used only on repository-controlled application CSS during development and compilation. No route accepts CSS or source maps, and uploaded files are never written into application source directories or passed to PostCSS. The application must not compile administrator-, user-, or third-party-supplied CSS or honor uploaded `sourceMappingURL` comments.

### Sharp and libvips

The source tree does not import `next/image` or Sharp. Investment `image_path` values are not rendered, and profile images have no application upload or optimization flow. Payment receipts are uploaded directly to a private Supabase bucket after size, MIME, extension, and leading-signature validation; they are not passed to Next image optimization or Sharp.

The `/_next/image` runtime exists as part of Next.js and must not be exposed to arbitrary remote image sources. No `images.remotePatterns` or permissive image domains are configured.

## Packages changed

None. PostCSS 8.5.25 is already present on the Tailwind path, but it cannot replace Next's pinned copy without an override. Sharp 0.35.3 is available, but Next's declared `^0.34.5` range does not admit 0.35.x. Compatibility was therefore not assumed.

## Remaining risks and production controls

Before production deployment:

1. Upgrade Next.js as soon as a stable release declares patched PostCSS and Sharp ranges.
2. Re-run `npm audit --json`, `npm ls next postcss sharp`, lint, type checking, and application tests after that update.
3. Do not add overrides until Next maintainers document compatibility or the replacement is tested and reviewed against Next's compiler and image pipeline.
4. Keep all CSS and source maps repository-controlled; never compile uploaded content.
5. Keep payment receipts and profile images private and outside application source paths.
6. Continue validating upload size, MIME type, extension, and file signatures.
7. If Next image optimization is introduced, restrict sources explicitly, validate ownership before signed access, and test the then-patched Sharp/libvips path with malformed-image fixtures.
8. Treat the unresolved high advisories as a release blocker unless an explicit, time-bounded risk acceptance is approved after infrastructure-level mitigation review.
