# Picture replacement — tcgshopdb.com — 2026-10-30

Status: **complete locally**. The 186 raw Unity texture exports are gone; the site now shows 89 sourced in-game
pictures, one per pictured entry, plus two new homepage screenshots. The build and every local gate pass on macOS,
and the picture-sources page and disclaimer state where the pictures came from. **Nothing was pushed or deployed
from this pass** — the Lead owns the push and the Cloudflare Pages deploy.

Content commit: `195a3f6` (pictures, manifest, entries, homepage files, pack reports).
Code commit: `b9aa756` (generated credits, homepage provenance, gate/generator copy).

## 1. What was wrong

The old pictures were raw exported Unity assets: 2048x2048 UI sprite atlases, white-on-black icon sheets, albedo
and ground textures, grey placeholder sheets and sprite-sheet fragments. They were legible as texture data but not
as pictures of the things the entries describe, and the site credited them as local exports with no external source.

## 2. Before and after (measured)

| Measure | Before | After |
| --- | --- | --- |
| mapped pictures | 186 raw texture exports | **89 normalised in-game pictures** (1200x750 JPEG) |
| entries with a picture | 89 (186 game images across them) | 89 (one in-game picture each) |
| diagram-only entries | 9 | 9, untouched (diagrams only, no mapped record) |
| picture records in `content/images-manifest.json` | 186, local-export shape | **89**, full source provenance |
| provenance per record | source bundle + asset name | sourceName, sourcePage, originalUrl, license, rightsReview, retrievedAt, verdict, reviewer, reviewDate (+ hash/bytes/dimensions) |
| mapped bytes | 20,136,095 | 7,826,556 |
| homepage hero/feature | 1024x1024 furniture texture + card front | 1600x900 official store screenshots |
| `/sources` picture credits | none | generated per-file table + homepage credits |
| image sanity | 186 records, 12 flagged | **89 records, 0 flagged** |
| site gates | 63 | **66** (picture-provenance gate added) |
| build | pages=445 indexable=176 | **pages=445 indexable=176** (unchanged) |

## 3. Source breakdown

- **60 pictures** from the TCG Card Shop Wiki (Fandom), with a per-file source page, original image URL, licence
  note and retrieval date in the manifest.
- **29 pictures** from the official Steam store page.
- **61 unique pictures**; 44 records sit in 16 SHA groups that share a file. 27 records carry the manifest note
  "Reused as a category-level in-game picture."; the largest repeat is 4 entries.
- **Homepage**: 2 official Steam store screenshots (hero = the shop floor with card display cases; feature = a card
  pull with the card value screen). PACK provenance is kept verbatim in `reports/image-pack-2026-10-30.json` and
  rendered in the picture-sources section.
- Every mapped file was re-checked against its record: 89/89 exist, and bytes, sha256 and dimensions match.
- Rights review is recorded per file as `fair_use_review` with reviewer `lead` and review date 2026-10-30; the
  per-file verdicts are in `reports/image-reviews.md` (one row per mapped file).

## 4. What changed in the repo

- `content/assets/mapped/*.jpg`: the 186 old files were deleted and the 89 pack files copied in.
- `content/images-manifest.json`: complete replacement (89 records, 22 fields each); no provenance field edited.
- `content/published/*.json`: 89 replacement entries (new picture first, original diagrams kept); the 9
  `diagram-only` entries are byte-identical to before.
- `web/assets/hero-shop.jpg` and `web/assets/featured-card.jpg`: replaced with the pack's 1600x900 screenshots.
- `pipeline/site.mjs`: SITE hero/feature alt and caption text from `PACK.json`; the picture-sources section on
  `/reference/sources.html` (linked from the footer technical reference and the disclaimer) is generated from the
  manifest — every record's file, source name, source-page link (absolute URL), licence/rights-review status and
  retrieval date — plus credited rows for the two homepage pictures. The disclaimer, home-page provenance note,
  start page, game guide and footer wording now describe in-game pictures from the official store page and the
  community wiki, credited to their source and never relicensed.
- `tests/site.test.mjs`: the picture-provenance gate arms against the new manifest — every record must carry
  sourceName, sourcePage, retrievedAt and rightsReview/license; every sourcePage must be an absolute `http(s)` URL;
  every record must be listed on the generated sources page with its source linked; the page must state the
  fair-use policy and that diagrams are original. The gate was mutation-tested on a scratch copy (missing field,
  relative URL, half-migrated manifest all fail).
- `reports/image-sources.md` (new), `reports/image-reviews.md` (replaced ledger), `reports/image-sanity.md` and
  `reports/image-coverage.md` (regenerated), `reports/image-pack-2026-10-30.json` (the frozen `PACK.json`).
- `content/README.md`, `README.md` and the generated footer now describe one picture model: an in-game picture is
  a store screenshot or a community-wiki file, used to identify the subject, credited on the sources page.

## 5. Verification — exact commands and results (all exit 0)

    python3 tools/image-sanity.py            -> [image-sanity] 89 records, 0 flagged
    node tools/image-coverage.mjs            -> entries=98 withGameImage=89 diagramOnly=9 manifestRecords=89 unusedRecords=0
    node pipeline/site.mjs                   -> [site] pages=445 indexable=176 schema(noindex)=263
    node tests/site.test.mjs                 -> [site-tests] 66 passed, 0 failed
    npx tsc --noEmit -p tsconfig.ci.json     -> no diagnostics
    node tools/content-gate.mjs              -> [content-gate] 98 entry file(s), 0 violation(s)
    node tools/verify-citations.mjs          -> entries=98 facts=855 distinctIdentifiers=1517 universe=7781 confirmedElsewhere=14 unmatched=0
    node tools/coverage.mjs                  -> columns=20 covered=20 published=98 draft=0 reference=0 absent=0 qualityFailures=0
    node tools/classify-urls.mjs             -> 176 keep, 263 noindex, 0 redirect(s) (no diff to config/urls.json)
    node tools/preflight.mjs                 -> see reports/local-complete.md
    node tools/smoke.mjs                     -> see reports/local-complete.md

`reports/status.json` was regenerated from a fresh build after the content and code commits.

## 6. Visual review (89 pictures opened by eye)

All 89 files were viewed on labelled contact sheets. None is blank, corrupt or a masked/placeholder sheet, and the
sanity pass flags none. Pictures are credited with their real source, so the following are fit issues, not
provenance failures; they are reported to the Lead for swapping:

- Clearly the wrong subject (unique pictures): `the-plants-in-and-around-the-shop` (a trash bin),
  `the-doors-and-the-signs-that-point-the-way` (a small metal rack), `the-restocker-and-its-vehicles` (a wide
  shelf), `the-figures-the-shop-sells` (a play table), `the-finishes-you-can-buy` (a single-sided shelf),
  `posters-and-wall-displays` (Auto Scent G500 air freshener), `scanner-restocking-workflow` (Auto Scent M100),
  `setting-what-your-workers-do` (Auto Scent T1000), `the-money-the-counter-handles` (a small cabinet),
  `the-payment-a-customer-hands-over` (a small personal shelf), `the-counter-and-money` (a huge personal shelf),
  `what-the-till-shows-you` (a card table), `where-the-shops-lists-live` (a big card display),
  `which-version-this-site-documents` (a small card display), `how-the-restock-manager-packs-stock` (a small
  card display), `the-box-your-stock-arrives-in` (a double-sided shelf), `moving-on-old-stock` (a vintage card
  table), `the-search-that-picks-a-card` (a monster card illustration), `the-key-binding-settings` (a checkout
  screenshot), `what-the-pack-opener-shows-you` (a card display table), `licences-and-shop-level` (a card display
  table). 21 entries in total.
- Weaker fit from a reused category-level picture: `the-setting-screens-for-your-fixtures`,
  `the-currencies-the-game-tracks`, `the-trade-screen-and-what-it-shows`, `tournaments-and-events`,
  `the-clothes-a-shopkeeper-wears`, `what-a-customer-carries`, `the-services-the-game-offers`,
  `keeping-the-shop-clean`, `the-shop-billboard-and-your-shop-name`, `the-upgrades-you-can-buy`,
  `the-reveal-screen`, `the-review-screen`, `the-screens-you-will-use-most`, `what-a-review-record-keeps`,
  `the-boards-interface`, `machines-that-work-on-their-own`, `restocking-from-a-cart`,
  `the-picture-the-game-draws-for-a-control`.

## 7. Pack bookkeeping notes (for the Lead; no provenance edited)

- `PACK.json` and `reports/image-sources.md` say 27 reused pictures; that matches the 27 records whose manifest
  notes say "Reused as a category-level in-game picture." 16 SHA groups are shared by 44 records, one group
  (`expanding-and-decorating-the-shop` / `the-screens-you-buy-from`) has no reuse note on either record.
- `PACK.json` sourceCounts wiki 60 / steam 29 / screen 0 matches the manifest exactly.
- The hero picture's recorded source page is `gamedropdaily.com` while its original image URL is an official
  Steam store asset; both are shown on the sources page as recorded, not rewritten.
- Missing-file / unused-record / ledger-mismatch checks: none. No gate failed; no pack fix was needed beyond the
  frozen integration steps.

## 8. Residual items

- Swap the fit issues listed in section 6 once the Lead has replacements; the manifest and ledger then need the
  same copy-in treatment.
- The 9 diagram-only entries still have no in-game picture by design.
- Lead actions: push the local commits and verify the live site with `node tools/smoke.mjs https://tcgshopdb.com`.
