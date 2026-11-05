# Growth note — 2026-11-05 (second pass: pricing)

Site: https://tcgshopdb.com · documented build: no version stated by this build · local commit only (not pushed).

## This pass

**Cluster: shelf restocking and pricing (货架补货与标价).** One new indexable guide:

- `/articles/repricing-a-shelf-that-stopped-selling` — "Repricing stock that has stopped selling". 9 steps,
  6 common mistakes. Every step is grounded in facts already published on the entry pages and in the existing
  guides; no new numbers and no invented mechanics.

**Why this is the gap.** The site already had a guide for each side of a price: reading why a price moved
(`reading-why-a-price-moved`), reading the history (`reading-a-price-graph-without-guessing`), setting the first
price (`pricing-a-card-from-what-you-can-see`), labelling the shelf (`labelling-the-shelves-so-prices-read-right`),
and clearing what will not sell (`clearing-old-stock-in-bulk`). What it did not have was the **action between
them**: reopening the price at the fixture after the first tag, checking which tag context is being changed,
clearing a zero before the shelf goes back out, and deciding when a reprice has become a stock decision. The new
guide is that connective route. It does not re-teach the diagnosis screens, the tag atlas or the bulk-clear
screens; it points at those guides and answers what to do after the diagnosis.

## Internal links

**Inbound (visible, contextual):**

| From | To | Where |
| --- | --- | --- |
| `/articles/reading-why-a-price-moved` | new guide | Related guides section |
| `/articles/pricing-a-card-from-what-you-can-see` | new guide | Related guides section |
| `/articles/labelling-the-shelves-so-prices-read-right` | new guide | Related guides section |
| home page | new guide | "Latest updates" row (automatic from `content/updates.json`) |
| `/articles/` | new guide | full guide index (automatic) |
| `/updates` | new guide | newest update row (automatic) |

The three related-guide links above are the 2-3 visible contextual links this pass adds; the home page and the two
index pages also list the guide automatically.

**Outbound (the connection path):**

- Guides: `reading-why-a-price-moved`, `reading-a-price-graph-without-guessing`,
  `pricing-a-card-from-what-you-can-see`, `labelling-the-shelves-so-prices-read-right`,
  `clearing-old-stock-in-bulk`, `keeping-the-shelves-selling`.
- Entries: `prices-and-price-tags`, `price-tags-for-every-context`, `price-changes-and-cash`,
  `reading-the-price-board`, `the-setting-screens-for-your-fixtures`, `how-a-shelf-holds-its-stock`.

## Noindex audit — 0 promoted

The nine player-facing noindex notes were reviewed again. All nine are `imageTier: "diagram-only"`, and the
manifest still has **89 records / 89 mapped files / 0 unused**, so no unused in-game picture shows any of these
subjects. The 240 `/entity/*` pages and the reference pages are technical or duplicate pages by design, not
candidates.

| Note | Facts | Body words | Picture tier | Decision |
| --- | ---: | ---: | --- | --- |
| `glossary-of-terms` | 8 | 333 | diagram-only | keep noindex |
| `how-a-card-search-is-described` | 8 | 322 | diagram-only | keep noindex |
| `how-a-crowd-is-animated-from-a-baked-set` | 7 | 298 | diagram-only | keep noindex |
| `how-many-customers-your-shop-holds` | 7 | 335 | diagram-only | keep noindex |
| `price-history-and-graphs` | 5 | 147 | diagram-only | keep noindex |
| `the-manager-behind-the-card-game` | 5 | 236 | diagram-only | keep noindex |
| `trading-with-customers` | 6 | 180 | diagram-only | keep noindex |
| `what-the-game-records-about-a-deck` | 8 | 357 | diagram-only | keep noindex |
| `what-the-game-writes-down` | 6 | 305 | diagram-only | keep noindex |

The rule is unchanged: a subject without a confirmed in-game picture stays a note (content/README.md rules 4, 6
and 7). Reusing another subject's picture would be padding, so this pass promotes **0**, which is inside the
allowed 0-2 range. If a picture pack arrives, the three deepest candidates are
`what-the-game-records-about-a-deck`, `glossary-of-terms` and `how-many-customers-your-shop-holds` — one at a
time, each with its own confirmed picture.

## Counts (measured)

- build: **pages=448 indexable=179**; `config/urls.json`: **442 rows, 179 keep / 263 noindex** (the 404 and the five
  non-HTML build outputs are not URL rows; `reports/status.json` records 269 noindex against the 448 build outputs).
- sitemap: **179 clean `<loc>`s**, **102 truthful `<lastmod>`** dates. The new guide and the updates page carry
  2026-11-05; the earlier worker guide keeps its 2026-11-05 date.
- guides: **66** (was 65); published entries: **98** (89 game-image, 9 diagram-only); facts: **855**.
- new page: title 40 chars (25-60, unique), description 153 chars (70-160, unique), clean canonical, Article +
  BreadcrumbList JSON-LD with datePublished/dateModified 2026-11-05 matching the sitemap, og/twitter complete,
  hreflang en + x-default, 0 internal `.html` links.
- gates: **80 passed, 0 failed**; typecheck; content-gate 98 entries + 66 articles / 0 violations; citations
  unmatched=0; coverage 20/20; image gates 89 records / 0 flagged / 0 unused; classify 179 keep / 263 noindex;
  preflight 11/11 on the committed tree; smoke 179 kept.

## Next

1. **Push + deploy are Lead actions.** If approved: push, let the gate/deploy workflow run, then
   `node tools/smoke.mjs https://tcgshopdb.com`.
2. After deploy: `npm run indexnow` once (manual, never in CI) for the 179 URLs.
3. Watch the reprice query shape. If it earns impressions but no clicks, the next link to add is from
   `keeping-the-shelves-selling` or `clearing-old-stock-in-bulk`, not another new guide.
4. Do not promote diagram-only notes without a confirmed picture; a picture pack is the blocker, not the prose.
