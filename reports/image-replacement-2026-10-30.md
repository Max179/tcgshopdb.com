# Picture replacement — tcgshopdb.com — 2026-10-30

Status: **complete locally, revision 3 (wiki completeness pass) applied**. The 186 raw Unity texture exports are
gone; the site shows 89 sourced in-game pictures, one per pictured entry, plus two official-store homepage
screenshots. The latest pass swapped 86 of the 89 pictures for specific files from the TCG Card Shop Simulator Wiki
on wiki.gg. The build and every local gate pass on macOS, and the picture-sources page and disclaimer state where
the pictures came from. **Nothing was pushed or deployed from this pass** — the Lead owns the push and the deploy.

Commits: `195a3f6` revision-1 pictures/manifest/entries, `b9aa756` generated credits/wording,
`0e86f21` revision-2 picture swap, `9cde7f0` homepage credit to the official store page,
`0028520` revision-3 completeness pass (pictures, manifest, 86 entry files, reports), then the code/copy and docs
commits that carry the wiki.gg naming and this updated record, and a status commit.

## 0. Completeness pass (revision 3) — current state

Why: an audit found the TCG Card Shop Simulator wiki on wiki.gg has 530 files (303 usable), while this build was
still using only 43 Fandom files and had leaned on generic store screenshots. The completeness pack replaces 86 of
the 89 pictures with the specific wiki.gg asset for the subject.

- **Swapped 86 of 89 pictures** (same filenames; 86 entry files changed). The 3 unchanged are the Steam fallbacks
  `questions-players-ask`, `reading-the-price-board` and `what-a-review-record-keeps`.
- **Source breakdown now: 79 from the TCG Card Shop Simulator Wiki (wiki.gg) + 10 from the official Steam store
  page** (was 43 Fandom / 46 Steam). No Fandom file remains in this build.
- **79 unique pictures** (was 53), max repeat 3 (was 6), mapped bytes 4,835,632 (was 9,734,461), all 1200x750.
- 9 diagram-only entries untouched; nothing promoted from notes; nothing deleted; **pages=445 indexable=176
  unchanged**.
- Site copy now names the wiki.gg wiki on the sources page policy line, the disclaimer and the README; the
  generated source table renders 79 wiki.gg rows and 10 Steam rows.
- **Pack bookkeeping issues, reported not edited:** the 86 changed records have `originalUrl` null (only the 3
  kept records still carry it), 7 Steam-fallback records carry an `assetName` that is another mapped file's name,
  and `PATCH.json`'s `sourceBreakdown` is empty (measured here as 79/10). `sourceName`, `sourcePage` (absolute),
  licence, rights review, retrieval date, verdict and name-of-entry note are intact, so every picture is still
  traceable and the provenance gate passes.

## 1. What was wrong originally

The old pictures were raw exported Unity assets: 2048x2048 UI sprite atlases, white-on-black icon sheets, albedo
and ground textures, grey placeholder sheets and sprite-sheet fragments. They were legible as texture data but not
as pictures of the things the entries describe, and the site credited them as local exports with no external source.

## 2. Before and after (measured)

| Measure | Before | Revision 1 | Revision 2 | Revision 3 (current) |
| --- | --- | --- | --- | --- |
| mapped pictures | 186 raw textures | 89 in-game pictures | 89 (51 swapped) | **89 (86 swapped to specific wiki.gg files)** |
| picture records | 186 | 89 w/ full provenance | 89 | **89**, 79 wiki.gg + 10 Steam |
| entries with a picture | 89 | 89 | 89 | 89 (86 picture files changed) |
| diagram-only entries | 9 | 9 untouched | 9 untouched | 9 untouched |
| unique pictures | 186 textures | 61 | 53 | **79** |
| mapped bytes | 20,136,095 | 7,826,556 | 9,734,461 | **4,835,632** |
| image sanity | 186 records, 12 flagged | 89/0 | 89/0 | **89 records, 0 flagged** |
| site gates | 63 | 66 | 66 | **66** |
| build | pages=445 indexable=176 | same | same | **same (445/176)** |

## 3. Source history and current breakdown

- Revision 1: 60 Fandom + 29 Steam.
- Revision 2: 43 Fandom + 46 Steam.
- **Revision 3 (current): 79 TCG Card Shop Simulator Wiki (wiki.gg) + 10 official Steam store page.** The wiki.gg
  records carry the exact wiki file page (e.g. `https://tcgcardshopsimulator.wiki.gg/wiki/File:...`) and were
  retrieved 2026-10-30; the Steam records point at the store app page.
- Every mapped file was re-checked against its record: 89/89 exist at 1200x750, bytes and sha256 match. Rights
  review is recorded as `fair_use_review` (reviewer `lead`, 2026-10-30); verdicts are in
  `reports/image-reviews.md` (89 rows). `reports/image-sources.md` records 86 changed / 0 newly pictured.

## 4. What changed in the repo

Revision 1 (`195a3f6`, `b9aa756`): deleted the 186 raw files, added 89 in-game pictures + complete manifest + 89
entries, homepage files swapped; generated picture-sources section and provenance gate; honest sourcing copy.

Revision 2 (`0e86f21`, `9cde7f0`): 51 of 89 pictures + 51 entries replaced for better subject fits; Steam
`sourcePage` fixed to the store app page; homepage hero credit corrected to the official store page.

Revision 3 (`0028520` plus the code/copy commit): 86 of 89 pictures replaced with the specific wiki.gg asset for
the subject; complete replacement manifest (89 records), 86 published entries updated (diagrams kept); the
`image-reviews.md` ledger and `image-sources.md` replaced from the pack and `PATCH.json` archived as
`reports/image-pack-2026-10-30-completeness.json`; `image-coverage.md` regenerated. The sources-page policy
paragraph, disclaimer and README now name the wiki.gg wiki instead of Fandom.

## 5. Verification — exact commands and results (all exit 0, revision 3)

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

## 6. Visual review (all 89 pictures opened by eye, revision 3)

The completeness pass made the pictures specific: card frames and backs, booster packs and boxes, card displays,
shelves, checkout counter, play tables, figurines/plushies, wall display, tournament prize shelf, donation box,
cleanser, scanner, camera, ranking/booster/gallery icons, phone app icons, board games — each now pictures the thing
its entry describes. The sanity pass flags none.

**Remaining clearly wrong subject (3):**
- `the-plants-in-and-around-the-shop` — still the Steam shop-floor fallback (no plants). Its manifest record also
  has the broken `assetName` noted in section 0.
- `what-a-review-record-keeps` — the kept Steam picture of card packs on display; the entry is about the review
  record the game keeps.
- `the-currencies-the-game-tracks` — a card-back icon (`Icon CardIcon 2 Rare`), not the game's money/currency art.

Weaker but arguably acceptable (in-game icon/screen of the right family, not the exact subject): the
`the-search-that-picks-a-card` question-mark icon, `the-picture-the-game-draws-for-a-control` checkmark icon,
`the-trade-screen-and-what-it-shows` and `the-price-tags-for-every-context` phone price app, and
`the-shop-billboard-and-your-shop-name` phone renovation app. The 7 Steam fallbacks are all shop/customer scenes
(`customer-reviews`, `the-kinds-of-customers`, `the-profile-behind-each-customer`,
`why-every-customer-looks-different`, `what-a-customer-carries`, `the-clothes-a-shopkeeper-wears`,
`the-plants-in-and-around-the-shop`); the customer ones read acceptably as category-level pictures.

## 7. Pack bookkeeping notes (for the Lead; no provenance field edited)

- Revision 2's Steam `sourcePage` fix is intact; revision 3 keeps the store app page for all 10 Steam records.
- Revision 3 pack returns nil `originalUrl` for the 86 changed records and 7 Steam records with an `assetName`
  that is a mapped output filename (`customer-reviews`, `the-clothes-a-shopkeeper-wears`,
  `the-kinds-of-customers`, `the-plants-in-and-around-the-shop`, `the-profile-behind-each-customer`,
  `what-a-customer-carries`, `why-every-customer-looks-different`). These do not fail a gate — the gate requires
  source name, absolute source page, retrieval date and rights review, all present — but they are a provenance-
  detail regression against revision 2 and should be regenerated if the pack is rebuilt.
- `PATCH.json` `sourceBreakdown` is `{}`; measured from the manifest: 79 wiki.gg / 10 Steam. `changed` lists the
  86 entries and matches the 86 published files that differ; `promoted` and `skipped` are empty as stated.
- No missing file, unused record, ledger gap or entry/manifest mismatch: the integration needed no bookkeeping fix.

## 8. Residual items

- Swap or accept the 3 remaining clearly-wrong pictures (section 6); a swap needs the mapped file, manifest record,
  entry file, review-ledger row and regenerated image reports together.
- The 9 diagram-only entries still have no in-game picture by design.
- Lead actions: regenerate the pack's `originalUrl`/`assetName` fields if desired, push the local commits, and
  verify the live site with `node tools/smoke.mjs https://tcgshopdb.com`.
