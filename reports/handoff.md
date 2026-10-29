# Mac handoff — tcgshopdb.com

Source-only handoff. This file is the checklist for the Mac side; everything in it was produced and verified on the
Windows machine that read the game files. Raw game packages are **not** included and are not needed.

## What to clone

Two ways to move this tree to the Mac side:

1. **The lightweight package** (recommended). `node tools/mac-package.mjs . <outDir>` writes the whole site — source,
   content, images, the data indexes the build reads and the live reports — with **no git history**, no `web/dist`,
   no payload dumps, no extracted locale tables and no report history. Its receipt is
   `reports/mac-handoff-manifest.json`: every kept file with its byte size and sha256, every excluded path with its
   size and the reason it was excluded, and the totals.
2. The repository as committed, if a full clone with history is wanted. The payload and locale dumps are tracked there
   and are not needed to build.

## The package, measured

492 files, 22,826,141 bytes (21.8 MiB) when this file was last built. Rebuilding the package after any edit to this
file moves the total by the size of that edit, so `reports/mac-handoff-manifest.json` inside the package is the
authoritative list; the summary below is the measurement.

| Group | Files | Bytes | What it is |
| --- | --- | --- | --- |
| images | 272 | 20,301,698 | 186 mapped game images (20,136,095 B) + 86 per-entry diagrams in `content/assets/*.svg` (165,603 B) |
| data | 5 | 1,266,932 | `p0-inventory.json` 1,003,097, `p0-instances.json` 135,003, `tcg-object-names.json` 120,338, `guide-questions.json` 5,562, `v22-header-samples.json` 2,932 |
| published | 98 | 495,698 | the entry JSON, one file per published subject |
| articles | 63 | 175,675 | the structured guide JSON, one file per guide |
| source | 38 | 391,034 | `pipeline/`, `tools/`, `tests/`, `config/`, `docs/`, `.github/` |
| reports | 7 | 97,360 | `handoff.md` (this file), `status.json`, `coverage-report.md`, `image-coverage.md`, `image-sanity.md`, `image-reviews.md`, and the compact `local-complete.md` |
| content root | 3 | 93,366 | `content/images-manifest.json` 87,797, `content/updates.json` 2,490, `content/README.md` |
| shell | 5 | 1,014 | the five root config files (`.gitattributes`, `.gitignore`, `tsconfig.json`, `tsconfig.ci.json`, `wrangler.toml`) |

The files that move most often, with the hash that identifies them:

| File | Bytes | sha256 |
| --- | --- | --- |
| `content/images-manifest.json` | 87,797 | `29ca497ade3abb2874f6fa49f441262e4c2130848603485f66feffdd4a6075b5` |
| `config/urls.json` | 73,536 | `94beba72b35914f6d890b914c9583953acd0041e9c0b086e7454aecc37318d79` |
| `content/updates.json` | 2,490 | `e5ab0050e511c290def3ee05f38dce69677f25028c9aa8b19d4d5423ffb4673f` |
| `data/guide-questions.json` | 5,562 | `49eb3d9b7d62eef83056316cc1aa23e0e1e97770ab9cfb6c27cbd648ea4307a8` |
| `data/normalized/p0-instances.json` | 135,003 | `8a92af89c3f766b21d74f4410d52d1574102f196c8a3cfecc16fe30797d9dfbe` |
| `data/normalized/p0-inventory.json` | 1,003,097 | `9d2616a8c47192cf6541c10ee3ccace8870a217e6eccbf328a670ceb08d39479` |
| `data/normalized/tcg-object-names.json` | 120,338 | `bf0e59560b530e3881a638e60924715b8ee6a3c9dc1c1c2c88b5a8a80c2b9357` |

Whole-group digests, each a sha256 over the sorted lines `path TAB bytes TAB sha256`:

- mapped game images and entry diagrams (272): `d0b8bc21b1afa29019293737e68e01cd528f3e7bb7e1f562f97ce84ee5bb6b69`
- published entries (98): `dd35a17b30754775a3741815f03604b050a9ffce1cc9676e7eee70ccca9d12d0`
- guide JSON (63): `10ce8365ad06f24a57643f6cf68fae418ca24d76fec125b9a5d97f0235b03576`
- data indexes (4): `52210941780e561a6da001dc372112d7274969e0e84afb987e99d0b6a52c1d9b`

## What stays on the extraction host, and what replaces it

| Stays on Windows | Size | Why it does not travel |
| --- | --- | --- |
| `.git` | 32,629,596 | the package ships without history |
| `web/dist/` | 22,972,646 (717 files) | rebuilt by `node pipeline/site.mjs` after unpacking |
| 10 `data/normalized/localization-*.json` tables | 1,688,912 | extraction output; no build step, gate or test reads them |
| `data/normalized/tcg-mb-payloads.json` (payload dump) | 1,247,575 | extraction input for the decoder scripts, read by no build step, gate or test |
| `reports/redesign-p0/*.png` screenshots | 657,814 | the site rebuilds them |
| extraction-side working reports | 47,144 | the live report set listed above is kept |
| `HARNESS-NEXT-ACTION.md` (process note) | 1,429 | not site content |

There is no `data/raw` directory in this tree. Nothing has to be replaced for this title: the decoded value layer,
`data/normalized/p0-instances.json` (135,003 B, 260 decoded objects), is read by the build itself for the
`/reference/values.html` table, so it travels; the citation universe is built from `tcg-object-names.json` and
`p0-inventory.json`, which travel as well. No derived value or citation index is needed and none is claimed.

One check used to read real level files by absolute path, which meant it passed on the extraction host by reading files
outside the tree and failed on any other machine. It now uses the tree's own file when it has one and the committed byte
record `data/normalized/v22-header-samples.json` (2,932 B: both files' real length, their sha256 and their first 512
bytes) when it does not, and reports the check as unreadable rather than passing it when neither is present. That is
what the independent run on the Mac side found and why the record is in the package.

## Design-owned files: merge, do not overwrite

The Mac design integration (commit `efb7b6b`) owns the page shell. In the package that shell is the Windows copy and a
blind `rsync` would take the design back:

- `pipeline/site.mjs` — the whole layout and style: the `SITE` block at line 14, `layout()` at line 93, the emitted
  `brand.svg` at line 402 and the emitted `style.css` from line 404.

This tree has no `web/assets/` files, so `pipeline/site.mjs` is the only design-owned path. Content-owned and safe to
take as-is: `content/published/*.json`, `content/articles/*.json`, `content/images-manifest.json`,
`content/updates.json`, `content/assets/*`, `data/*`, `config/urls.json`, `tools/*`, `tests/*`,
`pipeline/*` other than `site.mjs`.

### Mac integration outcome (2026-10-30)

The Mac side merged this tree into the tcg-shop repository and ported the Mac design onto the package generator
(the reverse would have taken the design back): the Mac palette, letter mark, hero/feature imagery from
`web/assets/` and the page shell are emitted by `pipeline/site.mjs` around the package's two content layers.
Two bugs in the Windows copy are fixed on the way: `style.css` hard-coded the sibling site's `#ff5c5c` accent
instead of `SITE.accent`, and meta descriptions were unbounded (one category page emitted 694 characters).
The workflow now targets the Cloudflare Pages project that exists (`tcgshopdb-com`; the package said
`tcgshopdb`). The full Mac record is `reports/revival-2026-10-30.md`.

## What the Mac side needs from this tree

- `config/urls.json` — the keep/noindex split the classifier writes;
- `content/images-manifest.json` — every mapped game image with its source bundle, size and hash;
- `content/updates.json` — the rows behind `/updates.html`;
- `data/guide-questions.json` — the player questions that pair one-to-one with the guides;
- `data/normalized/p0-instances.json`, `p0-inventory.json` and `tcg-object-names.json` — the value layer the build reads and the two indexes the citation check reads;
- `reports/status.json` — the machine-readable counts the preflight checks;
- `reports/coverage-report.md`, `reports/image-coverage.md`, `reports/image-sanity.md`, `reports/image-reviews.md` — the gates' own output, including the verdict on every image;
- `reports/handoff.md` (this file) and `reports/local-complete.md` (the compact copy; the full round-by-round log stays on the extraction host);
- `reports/mac-handoff-manifest.json` — the package receipt (per-file size and sha256, exclusions, totals).

Nothing in the tree is generated at publish time that is not committed or in the package.

## How to build and verify

On the Mac side, from the package root (no game package needed):

    node pipeline/site.mjs                                   # production build into web/dist
    node tests/site.test.mjs                                 # 63 gates
    node tools/verify-citations.mjs                          # every cited identifier exists in the build
    node <22>/node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
    node tools/content-gate.mjs                               # content model: entries and articles
    node tools/classify-urls.mjs                              # refresh config/urls.json
    node tools/preflight.mjs                                  # clean tree, status consistency, deploy gating
    node tools/smoke.mjs                                      # the built artefact, the way a reader arrives at it
    node tools/smoke.mjs https://<domain>                      # after publishing: every kept URL, live
    node tools/deploy-check.mjs                               # local readiness vs external blockers

Extraction host only, never needed on the Mac:

    the decoder scripts and tools/extract-localization.py      # rebuild p0-instances.json and the locale tables
    node tools/mac-package.mjs . <outDir>                      # rebuild this package

Re-verified on 2026-10-01 (round 574): the package was unpacked outside the repositories, committed in a scratch git
repository and put through the full thirteen-step runner. All thirteen exited 0 — preflight 11/11, site pages=445
indexable=176 (269 noindex), classify 176 keep / 263 noindex, verify entries=98 facts=855 universe=7,781
confirmedElsewhere=14 unmatched=0, gate 98 entries 0 violations, coverage 20/20, image coverage 98 entries / 89 with a
game image / 9 notes / 186 records / 0 unused, image sanity 186 records (2 raised the low-variation hint and both
already carry a verdict), status recorded from `p0-instances.json`, tests 63 passing, typecheck exit 0, smoke passed,
deploy-check 7 ready / 0 local failures / 3 external blockers (a package carries no remote, so it adds the git-remote
blocker to the two Cloudflare secrets). The same build, gates, typecheck and preflight results reproduce without any
game package, without the payload dump, without the locale tables and without `web/dist`.

Re-verified on macOS on 2026-10-30 (integration pass): the tree was merged into the repository, LF-normalized and
put through the full runner without game files, network or credentials. All fourteen commands exited 0 — build
`pages=445 indexable=176` (263 schema-noindex), tests 63 passed / 0 failed, typecheck exit 0 with both
`tsconfig.ci.json` and `tsconfig.json`, citations entries=98 facts=855 universe=7,781 confirmedElsewhere=14
unmatched=0, content gate 98 entries / 0 violations, coverage 20/20 / qualityFailures=0, classify 176 keep / 263
noindex (no diff), image coverage 89 game images / 9 notes / 186 records / 0 unused, image sanity 186 records
(12 flagged on this Pillow version, all 12 already carry a review verdict), smoke passed, status regenerated,
preflight 11/11, deploy-check 8 ready / 0 local failures / 2 external blockers (the two Cloudflare variables are
not present in a plain local shell; the repository secrets are configured). The Mac design was ported before
verifying, so the counts and gates above describe the integrated build, not this package as shipped.

## What the site contains

- Published subjects: 98 — 89 entities with a confirmed game picture under `/entries/`, 9 picture-less subjects kept as noindex notes under `/reference/notes/`; structured guides: 63.
- Real images extracted from the game with a recorded mapping: 186 records. 89 entities carry one; the other 9 subjects are notes and are labelled "no confirmed picture from the game yet". A diagram is never passed off as a screenshot. Per-entry origin is in reports/image-coverage.md.
- Build: `pages=445 indexable=176` (269 noindex). URL classification in `config/urls.json`: 176 keep, 263 noindex (the remaining noindex pages are the evidence layer's own tables, which the classifier does not track). The evidence layer lives under `/reference/`; the old top-level addresses are noindex stubs that point there. Player layer: home, game guide, `/entities/` and 10 category pages, 89 entity pages, 63 guides, `/tools/`, `/updates.html`; evidence layer: `/reference/`, `/entity/` and the tables.
- Gates: 63 passing, 0 failing. Content gate: 98 entries and 63 articles, 0 violations. Typecheck: exit 0. Preflight: 11/11 on a clean tree.
- Coverage matrix: 20 target columns, all 20 holding at least one published entry, with no draft folder content.
- Every image record has been opened by eye and carries a verdict in `reports/image-reviews.md`; `tests/site.test.mjs` fails the build if a record is ever added without one.
- Technical reference is reachable from every page but marked `noindex` and excluded from `sitemap.xml`.

## Publishing (not done, and why)

`publish.yml` runs the build, the gates, the typecheck and the preflight, then a `needs: gate` job uploads `web/dist`
to Cloudflare Pages with `secrets.CLOUDFLARE_API_TOKEN` / `secrets.CLOUDFLARE_ACCOUNT_ID`. Publishing needs:
1. a git remote and push credentials (none is configured on the Windows machine);
2. the two Cloudflare secrets;
3. binding tcgshopdb.com to the Pages project in the Cloudflare dashboard (deliberately not encoded in the repository).

`node tools/deploy-check.mjs` prints exactly these as external blockers and reports 0 local failures.

Every entry and guide carries facts with grounding, a real game image or a labelled original diagram, related links and
sources; the counts above are the current state.
