# Oryvane Capital design revision

## Direction

The animation revision establishes an energetic cosmic-financial world built from deep black and midnight surfaces, emerald market signals, electric-cyan telemetry, and controlled gold. Public and authentication pages use intense atmospheric depth; authenticated dashboards and administrative screens automatically use a quieter operational variant.

## Skills inspected and applied

The requested `SKILL.md` guidance was inspected for `frontend-design`, `modern-web-design`, `ui-ux-pro-max`, `framer-motion-ui`, `motion-framer`, `animated-component-libraries`, `scroll-reveal-libraries`, `lightweight-3d-effects`, `lottie-animations`, `react-spring-physics`, and `gsap-scrolltrigger`.

The implementation directly applies the frontend-design, modern-web-design, ui-ux-pro-max, framer-motion-ui, motion-framer, animated-component-libraries, scroll-reveal-libraries, and lightweight-3d-effects guidance. GSAP ScrollTrigger and React Spring were inspected but not added: Motion already provides the necessary scroll transforms and springs, so adding either would duplicate runtime responsibility. CSS/SVG provides the metallic and atmospheric effects without a WebGL dependency. The ui-ux-pro-max search script could not run because Python is not installed; its written accessibility, responsive, and visual-system guidance was applied.

## Typography

- Bricolage Grotesque: expressive editorial headlines and major headings.
- Manrope: navigation, body, and interface copy.
- IBM Plex Mono: prices, percentages, references, tickers, and financial telemetry.

All fonts load through `next/font` and expose stable CSS variables.

## Animation architecture

Motion remains the primary interaction system for page transitions, scroll reveals, financial-number transitions, pointer-responsive depth, and the scroll-linked moon and Bitcoin paths. CSS handles exactly three shooting stars, coin rotation, card suspension, particles, grid distortion, light fields, static-symbol pulses, candlesticks, and ticker movement. SVG draws charts without a canvas loop. Transform and opacity are preferred to layout animation.

The root layout owns one reusable background engine. Its moon travels quickly through multiple viewport corners as document scroll progresses, while the metallic Bitcoin coin follows a separate depth and scale path. Static currency symbols remain anchored to viewport positions. Mobile removes deeper symbols, particles, and ticker detail. Hidden tabs pause CSS motion. Dashboard and protected-admin paths use a low-intensity mode, and tables and dialogs remain stable.

## Market-data architecture

`src/server/market-data.ts` is server-only. It retrieves BTC, ETH, SOL, BNB, and XRP from CoinGecko, supports USD, EUR, GBP, and NGN quotation, and retrieves seven-day USD chart history. Next.js fetch caching revalidates every five minutes, provider requests have a timeout, and an optional `COINGECKO_API_KEY` remains server-side.

Provider failure produces a layout-stable unavailable state. No synthetic prices or unidentified stale values are displayed. Public market figures are explicitly separated from Oryvane account balances and investment earnings.

## Performance decisions

- No new animation or 3D dependencies; GSAP was unnecessary for the final scroll path.
- Bounded DOM symbol count with fewer mobile layers.
- No perpetual React state loop for ambient animation.
- Visibility-aware pause and reduced-motion fallbacks.
- SVG chart sampling limits point complexity.
- Server caching and request timeout protect route response time.
- Operational routes reuse the engine in quiet mode instead of mounting a second visual system.

## Accessibility decisions

- Strong contrast and visible focus indicators remain part of the global tokens.
- Interactive targets retain a minimum practical touch size.
- Charts include an accessible text summary.
- Market direction uses icons, signed values, and colour together.
- Failure and empty states use explicit copy and never fabricated data.
- Navigation, forms, tables, dialogs, and existing semantic landmarks are preserved.
- `prefers-reduced-motion` disables nonessential transitions and ambient motion.
- Reduced motion removes star travel, moon travel, coin rotation, tickers, and suspended-card movement.

## Security and behavior boundaries

The revision does not change authentication actions, Supabase clients, RLS, MFA/AAL2 checks, administrator permission resolution, financial mutations, audit behavior, routes, or migrations. Market data is informational and read-only.

## Market and account refinement

The hero retains the primary seven-day asset line chart. Market Intelligence now uses a separate capital-ranked heatmap with asset-specific sparklines, real 24-hour volume bars, movement colour, gainer/decliner panels, and four quotation currencies. It consumes the same server-only snapshot but does not reuse the hero chart component or presentation.

The public account preview is deliberately masked and uses neutral states instead of balances, earnings, allocations, or transactions. The authenticated overview adds a currency-specific allocation ring, animated real values, balance privacy control, security state, and notification access using the existing user-scoped dashboard query.

The repeated public risk strip is no longer rendered on general pages. The dedicated risk-disclosure route and footer link remain, while investment detail and request confirmation retain concise contextual disclosure.
