# Picture replacement — tcgshopdb.com — 2026-10-30

Status: **complete locally, revision 2 applied**. The 186 raw Unity texture exports are gone; the site shows 89
sourced in-game pictures, one per pictured entry, plus two official-store homepage screenshots. Revision 2 of the
Lead's picture pack swapped 51 of the 89 pictures for better-fitting subjects and fixed the Steam source-page
records. The build and every local gate pass on macOS, and the picture-sources page and disclaimer state where the
pictures came from. **Nothing was pushed or deployed from this pass** — the Lead owns the push and the deploy.

Commits: `195a3f6` revision-1 pictures/manifest/entries, `b9aa756` generated credits/wording,
`0e86f21` revision-2 picture swap, `9cde7f0` homepage credit to the official store page, then the docs commit
that carries this updated record and the status commit.

## 1. What was wrong

The old pictures were raw exported Unity assets: 2048x2048 UI sprite atlases, white-on-black icon sheets, albedo
and ground textures, grey placeholder sheets and sprite-sheet fragments. They were legible as texture data but not
as pictures of the things the entries describe, and the site credited them as local exports with no external source.

## 2. Before and after (measured)

| Measure | Before | Revision 1 | Revision 2 (current) |
| --- | --- | --- | --- |
| mapped pictures | 186 raw texture exports | 89 normalised in-game pictures | **89**, 51 of them swapped for better-fitting subjects |
| entries with a picture | 89 (186 game images) | 89 (one each) | 89 (one each; 51 picture files replaced) |
| diagram-only entries | 9 | 9 untouched | 9 untouched (no mapped record) |
| picture records in manifest | 186, local-export shape | 89 with full provenance | **89** (Steam sourcePage fixed to the store app page) |
| provenance per record | source bundle + asset name | sourceName, sourcePage, originalUrl, license, rightsReview, retrievedAt, verdict, reviewer, reviewDate | same, with Steam sourcePage = https://store.steampowered.com/app/3070070/ |
| mapped bytes | 20,136,095 | 7,826,556 | 9,734,461 |
| homepage hero/feature | 1024x1024 textures | 1600x900 store screenshots | same files, credit corrected to the official store page |
| image sanity | 186 records, 12 flagged | 89 records, 0 flagged | 89 records, 0 flagged |
| site gates | 63 | 66 | **66** |
| build | pages=445 indexable=176 | same | **pages=445 indexable=176** (unchanged) |

## 3. Source breakdown (revision 2)

- **43 pictures** from the TCG Card Shop Wiki (Fandom), each with its wiki source page, original image URL,
  licence note and retrieval date in the manifest.
- **46 pictures** from the official Steam store page. Every Steam record's `sourcePage` is now the store app page
  (`https://store.steampowered.com/app/3070070/`) while `originalUrl` keeps the Steam CDN asset URL.
- **53 unique pictures**; 46 records sit in 10 SHA groups sharing a file and their notes say
  "Shared with N other entrie(s) as a category-level in-game picture." 36 records are reused copies; the largest
  repeat is 6 entries.
- **Homepage**: the same two official Steam store screenshots (hero = shop floor with card display cases; feature =
  a card pull with the card value screen). Both are now credited to the official store page; the PACK provenance is
  kept verbatim in `reports/image-pack-2026-10-30.json`.
- Every mapped file was re-checked against its record: 89/89 exist at 1200x750, and bytes, sha256 and dimensions
  match. Rights review is recorded as `fair_use_review` (reviewer `lead`, 2026-10-30); the per-file verdicts are in
  `reports/image-reviews.md` (89 rows).

## 4. What changed in the repo

Revision 1 (`195a3f6`, `b9aa756`):
- deleted the 186 raw pieces, added 89 in-game pictures, complete manifest + 89 entries, homepage files swapped.
- generated picture-sources section on the sources page (every file, source name, source-page link, licence/rights
  review, retrieval date) + credited homepage rows; disclaimer, home provenance note, start page, game guide,
  footer, README and content model describe the same picture model; provenance gate added to the site tests.

Revision 2 (`0e86f21`, `9cde7f0`):
- replaced the whole `content/assets/mapped/` set: 89 files, **51 different** from revision 1 (38 identical); old
  mapped files not in the new manifest deleted.
- complete replacement manifest (89 records) and 51 swapped published entries (diagrams kept); the 38 unchanged
  entries and the 9 diagram-only entries are untouched.
- provenance fix: Steam records' `sourcePage` = the store app page, `originalUrl` keeps the CDN; shared-picture
  notes now read "Shared with N other entrie(s) as a category-level in-game picture."
- homepage credit: `SITE.heroSourcePage` / `SITE.featureSourcePage` now point at the recorded official store page
  (`https://store.steampowered.com/app/3070070/`), render on the sources page as recorded.
- `reports/image-sources.md` and the 89-row `reports/image-reviews.md` ledger regenerated for revision 2;
  `reports/image-sanity.md` and `reports/image-coverage.md` regenerated (89 records, 0 flagged, 0 unused).

## 5. Verification — exact commands and results (all exit 0, revision 2)

    python3 tools/image-sanity.py            -> [image-sanity] 89 records, 0 flagged
    node tools/image-coverage.mjs            -> entries=98 withGameImage=89 diagramOnly=9 manifestRecords=89 unusedRecords=0
    node pipeline/site.mjs                   -> [site] pages=445 indexable=176 schema(noindex)=263
    node tests/site.test.mjs                 -> [site-tests] 66 passed, 0 failed
    npx tsc --noEmit -p tsconfig.ci.json     -> no diagnostics
    node tools/content-gate.mjs              -> [content-gate] 98 entry file(s), 0 violation(s)
    node tools/verify-citations.mjs          -> entries=98 facts=855 distinctIdentifiers=1517 universe=7781 confirmedElsewhere=14 unmatched=0
    node tools/coverage.mjs                  -> columns=20 covered=20 published=98 draft=0 reference=0 absent=0 qualityFailures=0
    node tools/classify-urls.mjs             -> 176 keep, 263 noindex, 0 redirect(s) (no diff to config/urls.json)
    node tools/preflight.mjs                 -> [preflight] 11 ok, 0 failed
    node tools/smoke.mjs                     -> [smoke] the artefact passes
    node pipeline/status.mjs                 -> reports/status.json regenerated

`reports/status.json` was regenerated from a fresh build after the revision-2 commits.

## 6. Visual review (all 89 pictures opened by eye, revision 2)

All 89 files are readable in-game pictures; none is blank, corrupt or a texture sheet, and the sanity pass flags
none. Revision 2 remapped every entry from the revision-1 "clearly wrong" list. Of the 21 revision-1 clear
mismatches, 6 now fit (the money/payment/counter group, the till, and the shop-lists UI), and the generic fallbacks
are acceptable for many others because the subject is genuinely a shop scene. The following still show a different
object or a generic scene where the entry describes a specific screen/item — reported to the Lead to swap or accept:

Clearly wrong subject (13):
- `the-plants-in-and-around-the-shop` — shows an empty shop floor with shelves, no plants
- `the-box-your-stock-arrives-in` — shows an empty shop floor with shelves, no box
- `restocking-from-a-cart` — shows a card-table render, no cart
- `the-restocker-and-its-vehicles` — shows a small card display cabinet, no restocker or vehicle
- `the-search-that-picks-a-card` — shows a monster card illustration (Drilceros), not the search screen
- `the-key-binding-settings` — shows the product-list screen, not key bindings
- `what-the-pack-opener-shows-you` — shows a monster card illustration (Crobib), not the pack opener
- `the-figures-the-shop-sells` — shows a monster card illustration (Forush), not figures
- `the-finishes-you-can-buy` — shows a wall of card packs, not wall/floor finishes
- `licences-and-shop-level` — shows a wall of card packs, not the licence/shop-level screen
- `the-trade-screen-and-what-it-shows` — shows a wall of card packs, not the trade screen
- `the-services-the-game-offers` — shows an Auto Scent G500 item render, not the services screen
- `the-shop-billboard-and-your-shop-name` — shows a checkout screenshot, no billboard

Weaker fit, Lead to decide (10):
- `the-reveal-screen`, `the-review-screen`, `the-boards-interface` — the product-list screen
- `what-a-review-record-keeps`, `the-settings-you-can-change` — a wall of card packs
- `the-upgrades-you-can-buy` — an Auto Scent M100 item render
- `the-camera-and-the-photo-gallery` — a checkout screenshot
- `which-version-this-site-documents`, `moving-on-old-stock`, `the-doors-and-the-signs-that-point-the-way` —
  the shop-floor screenshot (a door and a CLOSED sign are visible in it)

The other 66 pictured entries now show a picture of the subject or an acceptable category-level picture.

## 7. Pack bookkeeping notes (for the Lead; no provenance field edited)

- Revision 2 fixed the Steam records: `sourcePage` is the store app page for all 46 Steam records, `originalUrl`
  keeps the CDN URL; Fandom source pages are unchanged.
- `PACK.json` sourceCounts (43 wiki / 46 store) and reusedPictures (36 reused copies) match the manifest; 46 records
  carry the "Shared with N other entrie(s)" note.
- `SWAP.md` says "60 entries changed"; measured against the integrated revision 1, 51 published files differ (51
  mapped files differ too). The 38 unchanged entry files are byte-identical, so copying all 89 was harmless.
- No missing file, unused record or ledger mismatch: the integration needed no bookkeeping fix.
- Homepage files are byte-identical to revision 1; only the recorded source page changed (gamedropdaily.com →
  store.steampowered.com/app/3070070), which the sources page now shows.

## 8. Residual items

- Swap or accept the fit issues in section 6; the manifest, entry file, review-ledger row and image reports must be
  replaced together for any swap.
- The 9 diagram-only entries still have no in-game picture by design.
- Lead actions: push the local commits and verify the live site with `node tools/smoke.mjs https://tcgshopdb.com`.
