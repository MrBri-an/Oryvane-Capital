# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage-refinement.spec.ts >> homepage refinements remain compact and overflow-free across target widths
- Location: tests\e2e\homepage-refinement.spec.ts:11:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:3000/", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - generic:
    - generic: ₿
    - generic: $
    - generic: €
    - generic: £
    - generic: ¥
    - generic: ₦
    - generic: ₿
    - generic: Ξ
    - generic: BTC
    - generic: ETH
    - generic: SOL
    - generic: BNB
    - generic: XRP
    - generic: USDT
    - generic: BTC/USD · MARKET CAP · VOLUME 24H · ETH/EUR · SOL/GBP · RISK CONTROL · AAL2 · IMMUTABLE LEDGER ·
  - generic [ref=f2e2]:
    - banner [ref=f2e3]:
      - navigation "Primary navigation" [ref=f2e4]:
        - link "Oryvane Capital" [ref=f2e5] [cursor=pointer]:
          - /url: /
          - generic [ref=f2e6]: O
          - text: Oryvane Capital
        - generic [ref=f2e7]:
          - link "Log in" [ref=f2e8] [cursor=pointer]:
            - /url: /login
          - link "Create account" [ref=f2e9] [cursor=pointer]:
            - /url: /register
        - button "Open navigation" [ref=f2e10]
    - main [ref=f2e13]:
      - generic [ref=f2e15]:
        - generic [ref=f2e16]:
          - paragraph [ref=f2e17]: Oryvane market observatory / 01
          - heading "Capital, in focus." [level=1] [ref=f2e18]: Capital,in focus.
          - paragraph [ref=f2e19]: A high-clarity investment experience where market context meets protected financial operations—and every important action leaves a record.
          - generic [ref=f2e20]:
            - link "Enter the platform" [ref=f2e21] [cursor=pointer]:
              - /url: /register
            - link "Explore investments" [ref=f2e24] [cursor=pointer]:
              - /url: /investments
          - paragraph [ref=f2e25]: MARKET DATA IS INFORMATIONAL · RETURNS ARE NOT GUARANTEED · NOT FINANCIAL ADVICE
        - generic [ref=f2e28]:
          - generic [ref=f2e29]:
            - generic [ref=f2e30]: MARKET FEED · 5M CACHE
            - generic "Quotation currency" [ref=f2e43]:
              - button "usd" [pressed] [ref=f2e44]
              - button "eur" [ref=f2e45]
              - button "gbp" [ref=f2e46]
              - button "ngn" [ref=f2e47]
          - generic [ref=f2e48]:
            - generic [ref=f2e49]:
              - generic [ref=f2e50]:
                - generic [ref=f2e51]:
                  - paragraph [ref=f2e52]: BTC / USD
                  - paragraph [ref=f2e53]: $62,519
                - paragraph [ref=f2e54]: "-0.80%"
              - figure "Bitcoin seven-day price chart in US dollars. The seven-day direction is downward." [ref=f2e58]:
                - img "Bitcoin seven-day price chart in US dollars" [ref=f2e59]
              - generic [ref=f2e63]:
                - generic [ref=f2e64]: MCAP $1.25T
                - generic [ref=f2e65]: VOL 24H $17.57B
            - generic [ref=f2e66]:
              - button "BTCBitcoin $62,519-0.80%" [ref=f2e67]:
                - generic [ref=f2e68]:
                  - strong [ref=f2e69]: BTC
                  - text: Bitcoin
                - generic [ref=f2e70]:
                  - text: $62,519
                  - generic [ref=f2e71]: "-0.80%"
              - button "ETHEthereum $1,838.28-0.76%" [ref=f2e72]:
                - generic [ref=f2e73]:
                  - strong [ref=f2e74]: ETH
                  - text: Ethereum
                - generic [ref=f2e75]:
                  - text: $1,838.28
                  - generic [ref=f2e76]: "-0.76%"
              - button "SOLSolana $72.39-0.81%" [ref=f2e77]:
                - generic [ref=f2e78]:
                  - strong [ref=f2e79]: SOL
                  - text: Solana
                - generic [ref=f2e80]:
                  - text: $72.39
                  - generic [ref=f2e81]: "-0.81%"
              - button "BNBBNB $585.280.60%" [ref=f2e82]:
                - generic [ref=f2e83]:
                  - strong [ref=f2e84]: BNB
                  - text: BNB
                - generic [ref=f2e85]:
                  - text: $585.28
                  - generic [ref=f2e86]: 0.60%
              - button "XRPXRP $1.06-1.40%" [ref=f2e87]:
                - generic [ref=f2e88]:
                  - strong [ref=f2e89]: XRP
                  - text: XRP
                - generic [ref=f2e90]:
                  - text: $1.06
                  - generic [ref=f2e91]: "-1.40%"
          - generic [ref=f2e92]: Informational third-party data · Updated 12:03 UTC · Not Oryvane investment earnings.
      - generic "Live cryptocurrency market ticker" [ref=f2e93]:
        - generic [ref=f2e94]:
          - generic [ref=f2e95]:
            - strong [ref=f2e96]: BTC
            - generic [ref=f2e97]: $62,519
            - generic [ref=f2e98]: "-0.80%"
          - generic [ref=f2e99]:
            - strong [ref=f2e100]: ETH
            - generic [ref=f2e101]: $1,838.28
            - generic [ref=f2e102]: "-0.76%"
          - generic [ref=f2e103]:
            - strong [ref=f2e104]: SOL
            - generic [ref=f2e105]: $72.39
            - generic [ref=f2e106]: "-0.81%"
          - generic [ref=f2e107]:
            - strong [ref=f2e108]: BNB
            - generic [ref=f2e109]: $585.28
            - generic [ref=f2e110]: 0.60%
          - generic [ref=f2e111]:
            - strong [ref=f2e112]: XRP
            - generic [ref=f2e113]: $1.06
            - generic [ref=f2e114]: "-1.40%"
          - generic [ref=f2e115]:
            - strong [ref=f2e116]: BTC
            - generic [ref=f2e117]: $62,519
            - generic [ref=f2e118]: "-0.80%"
          - generic [ref=f2e119]:
            - strong [ref=f2e120]: ETH
            - generic [ref=f2e121]: $1,838.28
            - generic [ref=f2e122]: "-0.76%"
          - generic [ref=f2e123]:
            - strong [ref=f2e124]: SOL
            - generic [ref=f2e125]: $72.39
            - generic [ref=f2e126]: "-0.81%"
          - generic [ref=f2e127]:
            - strong [ref=f2e128]: BNB
            - generic [ref=f2e129]: $585.28
            - generic [ref=f2e130]: 0.60%
          - generic [ref=f2e131]:
            - strong [ref=f2e132]: XRP
            - generic [ref=f2e133]: $1.06
            - generic [ref=f2e134]: "-1.40%"
      - generic [ref=f2e136]:
        - generic [ref=f2e137]:
          - paragraph [ref=f2e138]: Market intelligence
          - heading "Breadth, momentum, and liquidity at a glance." [level=2] [ref=f2e139]
          - paragraph [ref=f2e140]: A capital-weighted heatmap compares five major assets through real prices, 24-hour movement, volume, and individual sparkline signatures.
        - generic [ref=f2e142]:
          - generic [ref=f2e143]:
            - generic [ref=f2e144]:
              - paragraph [ref=f2e145]: Market breadth / live cache
              - heading "Capital-weighted movement map" [level=3] [ref=f2e146]
            - generic "Heatmap quotation currency" [ref=f2e147]:
              - button "usd" [pressed] [ref=f2e148]
              - button "eur" [ref=f2e149]
              - button "gbp" [ref=f2e150]
              - button "ngn" [ref=f2e151]
          - generic [ref=f2e152]:
            - article [ref=f2e153]:
              - generic [ref=f2e154]:
                - generic [ref=f2e155]:
                  - paragraph [ref=f2e156]: BTC
                  - heading "Bitcoin" [level=4] [ref=f2e157]
                - generic [ref=f2e158]: "-0.80%"
              - paragraph [ref=f2e162]: $62,519
              - img "Bitcoin individual seven-day sparkline" [ref=f2e163]
              - generic [ref=f2e166]:
                - generic [ref=f2e167]: 24h vol
                - generic [ref=f2e168]: $17.6B
            - article [ref=f2e170]:
              - generic [ref=f2e171]:
                - generic [ref=f2e172]:
                  - paragraph [ref=f2e173]: ETH
                  - heading "Ethereum" [level=4] [ref=f2e174]
                - generic [ref=f2e175]: "-0.76%"
              - paragraph [ref=f2e179]: $1,838.28
              - img "Ethereum individual seven-day sparkline" [ref=f2e180]
              - generic [ref=f2e183]:
                - generic [ref=f2e184]: 24h vol
                - generic [ref=f2e185]: $5.5B
            - article [ref=f2e187]:
              - generic [ref=f2e188]:
                - generic [ref=f2e189]:
                  - paragraph [ref=f2e190]: BNB
                  - heading "BNB" [level=4] [ref=f2e191]
                - generic [ref=f2e192]: 0.60%
              - paragraph [ref=f2e196]: $585.28
              - img "BNB individual seven-day sparkline" [ref=f2e197]
              - generic [ref=f2e200]:
                - generic [ref=f2e201]: 24h vol
                - generic [ref=f2e202]: $463.2M
            - article [ref=f2e204]:
              - generic [ref=f2e205]:
                - generic [ref=f2e206]:
                  - paragraph [ref=f2e207]: XRP
                  - heading "XRP" [level=4] [ref=f2e208]
                - generic [ref=f2e209]: "-1.40%"
              - paragraph [ref=f2e213]: $1.06
              - img "XRP individual seven-day sparkline" [ref=f2e214]
              - generic [ref=f2e217]:
                - generic [ref=f2e218]: 24h vol
                - generic [ref=f2e219]: $809.4M
            - article [ref=f2e221]:
              - generic [ref=f2e222]:
                - generic [ref=f2e223]:
                  - paragraph [ref=f2e224]: SOL
                  - heading "Solana" [level=4] [ref=f2e225]
                - generic [ref=f2e226]: "-0.81%"
              - paragraph [ref=f2e230]: $72.39
              - img "Solana individual seven-day sparkline" [ref=f2e231]
              - generic [ref=f2e234]:
                - generic [ref=f2e235]: 24h vol
                - generic [ref=f2e236]: $1B
          - generic [ref=f2e238]:
            - generic [ref=f2e239]:
              - paragraph [ref=f2e240]: Top gainer
              - generic [ref=f2e241]:
                - strong [ref=f2e242]: BNB
                - generic [ref=f2e243]: 0.60%
            - generic [ref=f2e244]:
              - paragraph [ref=f2e245]: Top decliner
              - generic [ref=f2e246]:
                - strong [ref=f2e247]: XRP
                - generic [ref=f2e248]: "-1.40%"
          - paragraph [ref=f2e249]: Ranked by available market cap; volume bars use real 24-hour USD volume. Informational data only.
      - generic [ref=f2e253]:
        - generic [ref=f2e254]:
          - paragraph [ref=f2e255]: The Oryvane layer
          - heading "Structure turns information into confidence." [level=2] [ref=f2e256]
          - paragraph [ref=f2e257]: A composed financial interface with a hard boundary between what users can see and what authorised operations may change.
        - generic [ref=f2e259]:
          - generic [ref=f2e261]:
            - heading "One financial field of view" [level=3] [ref=f2e266]
            - paragraph [ref=f2e267]: Balances, investments, requests, and immutable activity form one legible operating picture.
          - generic [ref=f2e269]:
            - heading "Permanent operational memory" [level=3] [ref=f2e275]
            - paragraph [ref=f2e276]: Important changes preserve their references and history instead of rewriting the past.
          - generic [ref=f2e278]:
            - heading "Human judgment, explicit status" [level=3] [ref=f2e287]
            - paragraph [ref=f2e288]: Sensitive reviews remain controlled, attributable, and visible through deliberate states.
      - generic [ref=f2e290]:
        - generic [ref=f2e291]:
          - paragraph [ref=f2e292]: Currency intelligence
          - heading "Reference rates, without the noise." [level=2] [ref=f2e293]
          - paragraph [ref=f2e294]: Foreign-exchange reference rates and central-bank policy rates are independently sourced, server-cached, and never presented as portfolio performance.
        - generic [ref=f2e296]:
          - generic [ref=f2e298]:
            - paragraph [ref=f2e299]: Live currency rates
            - paragraph [ref=f2e300]: Central-bank FX reference data
          - generic [ref=f2e308]:
            - paragraph [ref=f2e309]: Central bank rates
            - paragraph [ref=f2e310]: Policy rates · separately sourced
          - generic [ref=f2e313]:
            - generic [ref=f2e314]:
              - generic [ref=f2e315]:
                - text: EUR / USD
                - generic [ref=f2e316]: 2026-07-31
              - generic [ref=f2e317]: "1.1485"
              - generic [ref=f2e318]: +0.95%
            - generic [ref=f2e323]:
              - generic [ref=f2e324]:
                - text: GBP / USD
                - generic [ref=f2e325]: 2026-07-31
              - generic [ref=f2e326]: "1.3421"
              - generic [ref=f2e327]: +0.73%
            - generic [ref=f2e332]:
              - generic [ref=f2e333]:
                - text: USD / JPY
                - generic [ref=f2e334]: 2026-07-31
              - generic [ref=f2e335]: "160.24"
              - generic [ref=f2e336]: "-2.19%"
            - generic [ref=f2e341]:
              - generic [ref=f2e342]:
                - text: USD / CHF
                - generic [ref=f2e343]: 2026-07-31
              - generic [ref=f2e344]: "0.8101"
              - generic [ref=f2e345]: "-0.92%"
            - generic [ref=f2e350]:
              - generic [ref=f2e351]:
                - text: USD / CAD
                - generic [ref=f2e352]: 2026-07-31
              - generic [ref=f2e353]: "1.4041"
              - generic [ref=f2e354]: "-0.32%"
            - generic [ref=f2e359]:
              - generic [ref=f2e360]:
                - text: AUD / USD
                - generic [ref=f2e361]: 2026-07-31
              - generic [ref=f2e362]: "0.7018"
              - generic [ref=f2e363]: +0.43%
            - generic [ref=f2e368]:
              - generic [ref=f2e369]:
                - text: EUR / JPY
                - generic [ref=f2e370]: 2026-07-31
              - generic [ref=f2e371]: "184.03"
              - generic [ref=f2e372]: "-1.26%"
            - generic [ref=f2e377]:
              - generic [ref=f2e378]:
                - text: GBP / EUR
                - generic [ref=f2e379]: 2026-07-31
              - generic [ref=f2e380]: "1.1686"
              - generic [ref=f2e381]: "-0.22%"
          - generic [ref=f2e386]:
            - generic [ref=f2e387]:
              - generic [ref=f2e388]: USD
              - generic [ref=f2e389]:
                - generic [ref=f2e390]: Federal Reserve
                - generic [ref=f2e391]: Provider data unavailable
              - generic [ref=f2e392]: —
            - generic [ref=f2e393]:
              - generic [ref=f2e394]: EUR
              - generic [ref=f2e395]:
                - generic [ref=f2e396]: European Central Bank
                - generic [ref=f2e397]: Provider data unavailable
              - generic [ref=f2e398]: —
            - generic [ref=f2e399]:
              - generic [ref=f2e400]: GBP
              - generic [ref=f2e401]:
                - generic [ref=f2e402]: Bank of England
                - generic [ref=f2e403]: Provider data unavailable
              - generic [ref=f2e404]: —
            - generic [ref=f2e405]:
              - generic [ref=f2e406]: JPY
              - generic [ref=f2e407]:
                - generic [ref=f2e408]: Bank of Japan
                - generic [ref=f2e409]: Provider data unavailable
              - generic [ref=f2e410]: —
            - generic [ref=f2e411]:
              - generic [ref=f2e412]: CHF
              - generic [ref=f2e413]:
                - generic [ref=f2e414]: Swiss National Bank
                - generic [ref=f2e415]: Provider data unavailable
              - generic [ref=f2e416]: —
            - generic [ref=f2e417]:
              - generic [ref=f2e418]: CAD
              - generic [ref=f2e419]:
                - generic [ref=f2e420]: Bank of Canada
                - generic [ref=f2e421]: Provider data unavailable
              - generic [ref=f2e422]: —
            - generic [ref=f2e423]:
              - generic [ref=f2e424]: AUD
              - generic [ref=f2e425]:
                - generic [ref=f2e426]: Reserve Bank of Australia
                - generic [ref=f2e427]: Provider data unavailable
              - generic [ref=f2e428]: —
            - generic [ref=f2e429]:
              - generic [ref=f2e430]: NZD
              - generic [ref=f2e431]:
                - generic [ref=f2e432]: Reserve Bank of New Zealand
                - generic [ref=f2e433]: Provider data unavailable
              - generic [ref=f2e434]: —
          - generic [ref=f2e435]: "FX reference data is informational, not account performance. Policy-rate gaps remain unavailable. Cache: 15m / 4h."
      - generic [ref=f2e437]:
        - generic [ref=f2e438]:
          - paragraph [ref=f2e439]: Operating sequence
          - heading "Understand. Submit. Verify. Track." [level=2] [ref=f2e440]
        - list [ref=f2e445]:
          - listitem [ref=f2e446]:
            - generic [ref=f2e447]: "01"
            - heading "Understand" [level=3] [ref=f2e452]
            - paragraph [ref=f2e453]: Review the opportunity, its limits, duration, terms, and risk.
          - listitem [ref=f2e454]:
            - generic [ref=f2e455]: "02"
            - heading "Submit" [level=3] [ref=f2e461]
            - paragraph [ref=f2e462]: Send a validated request through a controlled workflow.
          - listitem [ref=f2e463]:
            - generic [ref=f2e464]: "03"
            - heading "Verify" [level=3] [ref=f2e469]
            - paragraph [ref=f2e470]: Authorised review protects consequential financial transitions.
          - listitem [ref=f2e471]:
            - generic [ref=f2e472]: "04"
            - heading "Track" [level=3] [ref=f2e478]
            - paragraph [ref=f2e479]: Follow status and permanent records through one calm interface.
      - generic [ref=f2e481]:
        - generic [ref=f2e482]:
          - paragraph [ref=f2e483]: Investment frameworks
          - heading "Read the architecture before the opportunity." [level=2] [ref=f2e484]
          - paragraph [ref=f2e485]: Framework previews explain interface structure only. Live plans appear exclusively from approved database records.
        - generic [ref=f2e488]:
          - generic [ref=f2e492]:
            - generic [ref=f2e493]: Framework preview
            - paragraph [ref=f2e499]: Stability-oriented framework
            - heading "Capital Preservation" [level=3] [ref=f2e500]
            - paragraph [ref=f2e501]: A review framework focused on capital resilience, liquidity considerations, and clearly documented risk boundaries.
            - generic [ref=f2e502]:
              - generic [ref=f2e503]: Risk boundary first
              - generic [ref=f2e507]: Terms set per plan
            - link "View active plans" [ref=f2e511] [cursor=pointer]:
              - /url: /investments
          - generic [ref=f2e518]:
            - generic [ref=f2e519]: Framework preview
            - paragraph [ref=f2e526]: Balanced framework
            - heading "Diversified Growth" [level=3] [ref=f2e527]
            - paragraph [ref=f2e528]: A structured approach to evaluating diversified opportunities without relying on a single market outcome.
            - generic [ref=f2e529]:
              - generic [ref=f2e530]: Balanced review
              - generic [ref=f2e534]: Terms set per plan
            - link "View active plans" [ref=f2e538] [cursor=pointer]:
              - /url: /investments
          - generic [ref=f2e545]:
            - generic [ref=f2e546]: Framework preview
            - paragraph [ref=f2e556]: Higher-complexity framework
            - heading "Strategic Opportunities" [level=3] [ref=f2e557]
            - paragraph [ref=f2e558]: A selective framework for opportunities requiring deeper review, stronger suitability checks, and explicit risk communication.
            - generic [ref=f2e559]:
              - generic [ref=f2e560]: Enhanced diligence
              - generic [ref=f2e564]: Terms set per plan
            - link "View active plans" [ref=f2e568] [cursor=pointer]:
              - /url: /investments
      - generic [ref=f2e573]:
        - generic [ref=f2e574]:
          - paragraph [ref=f2e575]: Security architecture
          - heading "Designed so trust is never a visual effect." [level=2] [ref=f2e576]
          - paragraph [ref=f2e577]: Authentication, data ownership, administrator assurance, and financial mutation remain separate layers with independent controls.
        - generic [ref=f2e578]:
          - generic [ref=f2e580]:
            - article [ref=f2e581]:
              - generic [ref=f2e585]:
                - paragraph [ref=f2e586]: Layered control plane
                - heading "Verification crosses every boundary." [level=3] [ref=f2e587]
                - paragraph [ref=f2e588]: No interface element represents authority on its own.
            - generic [ref=f2e589]:
              - article [ref=f2e591]:
                - heading "Server authority" [level=3] [ref=f2e597]
                - paragraph [ref=f2e598]: Privileged and financial mutations remain server-held.
              - article [ref=f2e599]:
                - heading "Identity + MFA" [level=3] [ref=f2e611]
                - paragraph [ref=f2e612]: Approved identity, status, permissions, and AAL2 protect admin entry.
              - article [ref=f2e613]:
                - heading "Permission + RLS" [level=3] [ref=f2e620]
                - paragraph [ref=f2e621]: Server checks and row ownership remain separate enforcement layers.
              - article [ref=f2e622]:
                - heading "Ledger + audit" [level=3] [ref=f2e628]
                - paragraph [ref=f2e629]: Corrections add linked records; original history remains intact.
          - link "Explore security" [ref=f2e631] [cursor=pointer]:
            - /url: /security
      - generic [ref=f2e636]:
        - generic [ref=f2e637]:
          - paragraph [ref=f2e638]: Signal, not spectacle
          - heading "Market-aware without becoming a crypto template." [level=2] [ref=f2e639]
          - paragraph [ref=f2e640]: Real market direction and provider health remain explicitly separate from user account performance.
        - generic [ref=f2e644]:
          - generic [ref=f2e645]:
            - generic [ref=f2e646]:
              - heading "Crypto pulse" [level=3] [ref=f2e647]
              - generic [ref=f2e648]:
                - generic [ref=f2e649]: BTC / USD
                - generic [ref=f2e650]: "-0.80%"
              - generic [ref=f2e651]:
                - generic [ref=f2e652]: ETH / USD
                - generic [ref=f2e653]: "-0.76%"
              - generic [ref=f2e654]:
                - generic [ref=f2e655]: SOL / USD
                - generic [ref=f2e656]: "-0.81%"
            - generic [ref=f2e657]:
              - heading "Currency direction" [level=3] [ref=f2e658]
              - generic [ref=f2e659]:
                - generic [ref=f2e660]: EUR / USD
                - generic [ref=f2e661]: UP
              - generic [ref=f2e662]:
                - generic [ref=f2e663]: GBP / USD
                - generic [ref=f2e664]: UP
              - generic [ref=f2e665]:
                - generic [ref=f2e666]: USD / JPY
                - generic [ref=f2e667]: DOWN
            - img "Normalized market signal" [ref=f2e668]
          - complementary [ref=f2e670]:
            - generic [ref=f2e671]:
              - paragraph [ref=f2e674]: Provider status
              - paragraph [ref=f2e675]: Feeds available
            - generic [ref=f2e676]:
              - paragraph [ref=f2e679]: Cache status
              - paragraph [ref=f2e680]: Crypto 5m · FX 15m · Policy 4h
            - generic [ref=f2e681]:
              - paragraph [ref=f2e684]: Data boundary
              - paragraph [ref=f2e685]: Market context ≠ account performance
      - generic [ref=f2e689]:
        - generic [ref=f2e690]:
          - generic [ref=f2e691]: MARKET CONTEXT ONLINE
          - heading "See the field. Move with control." [level=2] [ref=f2e698]
          - paragraph [ref=f2e699]: Legible market context, protected actions, and accountable records.
        - generic [ref=f2e700]:
          - link "Create account" [ref=f2e701] [cursor=pointer]:
            - /url: /register
          - link "Log in" [ref=f2e704] [cursor=pointer]:
            - /url: /login
    - contentinfo [ref=f2e709]:
      - generic [ref=f2e710]:
        - generic [ref=f2e711]:
          - generic [ref=f2e712]:
            - link "Oryvane Capital" [ref=f2e713] [cursor=pointer]:
              - /url: /
            - paragraph [ref=f2e714]: A planned investment platform built around clear information, controlled operations, and accountable records.
            - paragraph [ref=f2e715]: Investment values can rise or fall. Returns are not guaranteed.
          - generic [ref=f2e716]:
            - generic [ref=f2e717]:
              - heading "Explore" [level=2] [ref=f2e718]
              - list [ref=f2e719]:
                - listitem [ref=f2e720]:
                  - link "About" [ref=f2e721] [cursor=pointer]:
                    - /url: /about
                - listitem [ref=f2e722]:
                  - link "Investment frameworks" [ref=f2e723] [cursor=pointer]:
                    - /url: /investments
                - listitem [ref=f2e724]:
                  - link "How it works" [ref=f2e725] [cursor=pointer]:
                    - /url: /how-it-works
                - listitem [ref=f2e726]:
                  - link "Security" [ref=f2e727] [cursor=pointer]:
                    - /url: /security
            - generic [ref=f2e728]:
              - heading "Support" [level=2] [ref=f2e729]
              - list [ref=f2e730]:
                - listitem [ref=f2e731]:
                  - link "FAQ" [ref=f2e732] [cursor=pointer]:
                    - /url: /faq
                - listitem [ref=f2e733]:
                  - link "Contact" [ref=f2e734] [cursor=pointer]:
                    - /url: /contact
                - listitem [ref=f2e735]:
                  - link "Log in" [ref=f2e736] [cursor=pointer]:
                    - /url: /login
                - listitem [ref=f2e737]:
                  - link "Register" [ref=f2e738] [cursor=pointer]:
                    - /url: /register
            - generic [ref=f2e739]:
              - heading "Legal" [level=2] [ref=f2e740]
              - list [ref=f2e741]:
                - listitem [ref=f2e742]:
                  - link "Terms" [ref=f2e743] [cursor=pointer]:
                    - /url: /terms
                - listitem [ref=f2e744]:
                  - link "Privacy" [ref=f2e745] [cursor=pointer]:
                    - /url: /privacy
                - listitem [ref=f2e746]:
                  - link "Risk disclosure" [ref=f2e747] [cursor=pointer]:
                    - /url: /risk-disclosure
        - generic [ref=f2e748]:
          - paragraph [ref=f2e749]: Public information only. Nothing on this website is financial advice, a recommendation, or an offer to invest.
          - paragraph [ref=f2e750]: © 2026 Oryvane Capital. Brand and legal details remain subject to final approval.
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | const viewports = [
  4  |   { width: 320, height: 800 },
  5  |   { width: 390, height: 844 },
  6  |   { width: 768, height: 1024 },
  7  |   { width: 1024, height: 900 },
  8  |   { width: 1440, height: 900 },
  9  | ];
  10 | 
  11 | test("homepage refinements remain compact and overflow-free across target widths", async ({ page }) => {
  12 |   for (const viewport of viewports) {
  13 |     await page.setViewportSize(viewport);
> 14 |     await page.goto("/");
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  15 |     await expect(page.getByTestId("currency-intelligence")).toBeVisible();
  16 |     await expect(page.getByTestId("security-architecture")).toBeVisible();
  17 |     await expect(page.getByTestId("market-awareness")).toBeVisible();
  18 |     await expect(page.getByTestId("market-cta")).toBeVisible();
  19 |     await expect(page.getByText("Your financial position")).toHaveCount(0);
  20 |     await expect(page.getByTestId("operating-sequence")).toBeVisible();
  21 |     await expect(page.getByTestId("framework-card")).toHaveCount(3);
  22 |     await expect(page.locator(".shooting-star")).toHaveCount(3);
  23 | 
  24 |     const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  25 |     expect(overflow, `${viewport.width}px viewport overflow`).toBeLessThanOrEqual(1);
  26 | 
  27 |     const intelligence = await page.getByTestId("currency-intelligence").boundingBox();
  28 |     expect(intelligence?.width).toBeLessThanOrEqual(viewport.width);
  29 | 
  30 |     const heatmap = page.getByTestId("market-heatmap");
  31 |     if (await heatmap.count()) {
  32 |       const cards = heatmap.locator("[data-market-card]");
  33 |       await expect(cards).toHaveCount(5);
  34 |       const first = await cards.nth(0).boundingBox();
  35 |       const second = await cards.nth(1).boundingBox();
  36 |       if (viewport.width === 320) expect(Math.abs((first?.x ?? 0) - (second?.x ?? 0))).toBeLessThan(2);
  37 |       if (viewport.width === 390) expect(Math.abs((first?.x ?? 0) - (second?.x ?? 0))).toBeGreaterThan(20);
  38 |       const currencyButton = heatmap.getByRole("button", { name: "usd" });
  39 |       const currencyBox = await currencyButton.boundingBox();
  40 |       expect(currencyBox?.height).toBeGreaterThanOrEqual(viewport.width < 640 ? 43 : 35);
  41 |     }
  42 |   }
  43 | });
  44 | 
  45 | test("shooting stars are non-interactive and disabled for reduced motion", async ({ page }) => {
  46 |   await page.goto("/");
  47 |   await expect(page.locator(".shooting-star")).toHaveCount(3);
  48 |   await expect(page.locator(".shooting-star-field")).toHaveCSS("pointer-events", "none");
  49 |   await page.emulateMedia({ reducedMotion: "reduce" });
  50 |   await expect(page.locator(".shooting-star").first()).toHaveCSS("display", "none");
  51 | });
  52 | 
```