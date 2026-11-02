# SEO audit — tcgshopdb.com — 2026-11-02

Status: **complete locally**. The site now emits one consistent clean-URL scheme, managed titles and descriptions,
JSON-LD, full social metadata, a sitemap with truthful `<lastmod>` dates, a served IndexNow key and a manual
submission tool. Page count, indexable count and the emitted file set are unchanged (445 build outputs / 440 HTML
files / 176 sitemap URLs / 439 classified pages). Every local gate passes, including 14 new SEO gates.
**Nothing was pushed or deployed from this pass** — the Lead owns the push and the deploy, then the live check.

Commit: `5c8d573` (generator, tools, tests, `config/urls.json`, README, IndexNow key/tool), then the docs commit
that carries this record and the status commit.

## 1. Method

Before/after numbers below were measured from the built artefact itself, with the same script, before and after
the change: every sitemap `<loc>` was resolved to the file that serves it and the head of each indexable page was
parsed (title, description, canonical, og/twitter, JSON-LD); the whole dist was scanned for internal `.html`
links; the sitemap was parsed. The measurement script is not committed (it is a one-off audit tool); the same
checks now live in `tests/site.test.mjs`.

The task brief cited 105 indexable titles over 60 characters. Measured on the built artefact before this pass the
number is **44 of 176** (longest 74, average 52.8). The 105 figure did not reproduce against this build, so the
audit records the measured number.

## 2. Before and after (measured)

| Measure | Before | After |
| --- | --- | --- |
| build outputs / HTML files / indexable | 445 / 440 / 176 | **445 / 440 / 176 (unchanged)** |
| classified pages (`config/urls.json`) | 439 (176 keep / 263 noindex) | **439 (176 keep / 263 noindex, clean URLs)** |
| titles over 60 chars | **44** (max 74, avg 52.8) | **0** (max 60, avg 47.5, min 26) |
| titles 45-60 chars (target band) | 104 | **119** |
| duplicate titles | 0 | **0** (all 176 unique) |
| descriptions under 70 chars | **8** (min 17) | **0** (min 70) |
| descriptions over 160 chars | 0 (clamped with "…") | **0** (clamped on a word boundary, no ellipsis) |
| description 70-160 range | 168 | **176** (avg 149.2) |
| duplicate descriptions | 0 | **0** (all 176 unique) |
| sitemap `<loc>` count | 176 | **176** |
| sitemap `<loc>` in `.html` form | **176** | **0** |
| sitemap `<lastmod>` count | **0** | **99** |
| canonical in `.html` form | **176** | **0** |
| canonical == sitemap `<loc>` | 176 (both `.html`) | **176 (both clean)** |
| canonical == og:url | 0 | **176** |
| internal `.html` links in the dist | **4014** | **0** |
| og:url / og:image present | 0 / 0 | **176 / 176** |
| twitter:card / title / description / image | 0 / 0 / 0 / 0 | **176 / 176 / 176 / 176** |
| JSON-LD scripts (valid JSON) | **0** | **176, 0 invalid** |
| robots.txt | `User-agent: *` / `Allow: /` / sitemap line | same, now gated (no `Disallow`) |
| IndexNow key served at `/<key>.txt` | no | **yes (`/d3ad5d6eccb8896afad82b32eb7798f6.txt`)** |
| site gates | 66 | **80** (+14 SEO) |

## 3. Clean URL scheme

The host serves the `.html` files at clean URLs and 308-redirects the `.html` forms. The whole scheme now uses
the clean form for every URL a crawler reads:

- `/index.html` → `/`, `/entries/x.html` → `/entries/x`, `/entities/index.html` → `/entities/`.
- canonical, `og:url`, both hreflang alternates, sitemap `<loc>` and every JSON-LD `url`/breadcrumb item use
  the same clean URL (verified equal for 176/176 pages).
- every internal `href`, form `action` and the legacy noindex stubs' `meta refresh` target is rewritten to the
  clean form at build time; the dist now contains 0 internal `.html` links (was 4014).
- the emitted file set is unchanged: 440 `.html` files, 445 build outputs (440 pages + sitemap/robots/favicon/
  brand/style), 176 indexable, `config/urls.json` 439 rows. Cloudflare continues to serve each clean URL from the
  matching `.html` file.
- `tools/classify-urls.mjs` and `tools/smoke.mjs` now resolve the clean form, and `config/urls.json` was
  regenerated in the new form (same keep/noindex split).

## 4. Titles (176 indexable pages)

Rule, generated per page: `<page subject> | TCG Card Shop Wiki`, and the brand suffix is dropped rather than
letting the title exceed 60 characters. Category pages use `<category> in TCG Card Shop Simulator`; the home page
is `TCG Card Shop Simulator guide and reference`; entry pages and guides use their own (already unique) titles,
with the suffix where it fits. The longest base title is 53 characters, so no page title had to be truncated or
shortened mid-word. Result: 176/176 unique, 26-60 characters, no mid-word endings. 119 sit in the 45-60 target
band; the 25 shorter ones are the legal/static pages and short entry titles where only the brand suffix fits.

## 5. Descriptions (176 indexable pages)

Unique, 70-160 characters, generated from the page's own summary/description text and cut on a word boundary (the
previous clamp added a "…" and could read mid-word; that clamp is gone). All 176 now pass; the eight pages that
were under 70 characters (entries hub, tools, updates, search, about, contact, privacy, terms) got a truthful
descriptive extension of the same text.

## 6. Sitemap

- Exactly the 176 indexable pages, each once, in clean URL form; the 404 and the whole noindex evidence layer stay
  out. Parsed with a real XML parser in the test suite (well-formedness, `urlset` namespace, one `<loc>` and at
  most one date-shaped `<lastmod>` per `<url>`).
- `<lastmod>` appears on **99 pages** and only where a truthful content date exists:
  - 89 pictured entry pages: the picture record's `retrievedAt` (2026-10-30 — the last time the page's picture,
    which is part of the page, was replaced);
  - 9 guide pages: their `updates.json` date (2026-10-01);
  - the updates page: the latest recorded update date (2026-10-01).
  - the other 77 pages (categories, hubs, home, tools, search, legal) carry **no** `lastmod` rather than the
    build date. The test re-derives this expected map from `updates.json` and the image manifest and fails on any
    missing, extra or wrong date.

## 7. JSON-LD (176 scripts, one per indexable page, all parse)

- Home page: `WebSite` (`@id`, url, name, description, inLanguage, publisher) + `SearchAction` whose
  `target.urlTemplate` is `https://tcgshopdb.com/search?q={search_term_string}`, plus a `WebPage`.
- 152 leaf pages (89 entries + 63 guides): `Article` with headline, name, description, url, image (entries),
  and `BreadcrumbList`.
- 23 category/hub/static pages: `WebPage` with name/description/url plus `BreadcrumbList`.
- Every `@context` is `https://schema.org`; every page `url` equals the canonical; every breadcrumb item is
  an absolute clean URL and the last item is the page itself; `datePublished` is only present on the 14 pages
  whose addition date is recorded in `updates.json`; `dateModified` only where the sitemap has a date and always
  agrees with it (gated).

## 8. Social metadata

Every indexable page now carries `og:site_name`, `og:title`, `og:type` (`article` for entries/guides,
`website` otherwise), `og:description`, `og:url`, `og:image`, and `twitter:card` (`summary_large_image`),
`twitter:title`, `twitter:description`, `twitter:image`. The twitter image is the same absolute https URL as the
og image (hero picture for pages without their own picture, the entry's picture for pictured entries).

## 9. robots.txt and IndexNow

- `robots.txt`: `User-agent: *` / `Allow: /` / `Sitemap: https://tcgshopdb.com/sitemap.xml`, no `Disallow`.
  The reference/evidence pages keep their `noindex, follow` policy; they simply are not in the sitemap.
- IndexNow: `web/indexnow-key.txt` holds a random 32-hex key (`d3ad5d6eccb8896afad82b32eb7798f6`); the build
  emits `/<key>.txt` at the dist root with exactly the key as content. `tools/indexnow.mjs` (`npm run indexnow`)
  reads the built sitemap and submits it to `api.indexnow.org`; it is manual-only and is not referenced by the
  build, the tests or the deploy workflow (gated).

## 10. Gate and mutation check

`tests/site.test.mjs` grew from 66 to **80** gates. The existing gates were kept and updated to the clean URL form;
the new SEO block asserts: the sitemap is well-formed XML and lists exactly the indexable set in clean form; the
`lastmod` map is truthful and complete; every indexable page has a unique 25-60 character title and a unique
70-160 character description without truncated words; canonical, `og:url`, both hreflang links and the sitemap
`<loc>` are the same clean URL; og/twitter metadata is complete and cross-wired; exactly one valid JSON-LD script
with the right types, URLs and dates; no internal `.html` links or refresh targets; robots policy; and the served
IndexNow key plus manual-only tool.

Mutation check (required, recorded here): on a scratch copy of the tree, the title rule was temporarily changed to
always append the brand suffix (forcing long titles). `node tests/site.test.mjs` then failed exactly as expected —
`FAIL every indexable page has a unique 25-60 character title that does not end mid-word :: https://tcgshopdb.com/ (64), …`
with `79 passed, 1 failed`, exit 1. The pipeline file was restored from the committed copy and the suite went back
to `80 passed, 0 failed`.

## 11. Verification — commands and results (all exit 0)

    python3 tools/image-sanity.py            -> [image-sanity] 89 records, 0 flagged
    node tools/image-coverage.mjs            -> entries=98 withGameImage=89 diagramOnly=9 manifestRecords=89 unusedRecords=0
    node pipeline/site.mjs                   -> [site] pages=445 indexable=176 schema(noindex)=263
    node tools/classify-urls.mjs             -> 176 keep, 263 noindex, 0 redirect(s)
    node tools/smoke.mjs                     -> the artefact passes
    node tests/site.test.mjs                 -> [site-tests] 80 passed, 0 failed
    npx tsc --noEmit -p tsconfig.ci.json     -> no diagnostics
    node tools/content-gate.mjs              -> [content-gate] 98 entry file(s), 0 violation(s)
    node tools/verify-citations.mjs          -> entries=98 facts=855 distinctIdentifiers=1517 universe=7781 confirmedElsewhere=14 unmatched=0
    node tools/coverage.mjs                  -> columns=20 covered=20 published=98 draft=0 reference=0 absent=0 qualityFailures=0
    node tools/preflight.mjs                 -> [preflight] 11 ok, 0 failed (run on the committed tree)

## 12. Remaining items

- **Live verification is the Lead's step**: push, deploy, then `node tools/smoke.mjs https://tcgshopdb.com`
  (checks every kept URL responds, is titled and carries its own clean canonical) and optionally
  `npm run indexnow` once the sitemap is live.
- 77 pages carry no `lastmod` by design because no truthful content date exists for them; if content metadata
  gains dates later, the generator and the test already pick them up from `updates.json` / the image manifest.
- No `priority`/`changefreq` in the sitemap (search engines ignore them; not added rather than faked).
- Titles are generated from the page subject; if a future entry title is longer than 53 characters the generator
  drops the brand suffix, and the 25-60 gate would flag anything that still breaks the range.
