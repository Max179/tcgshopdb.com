# Harness next action — TCG Shop (tcgshopdb.com)

Updated: 2026-10-30, after the Mac handoff integration and the picture replacement.

## State: local-complete

The Oct-2-2026 Windows handoff package is integrated, the Mac design is ported onto its generator, and the raw
Unity texture exports were replaced with sourced in-game pictures.
`node pipeline/site.mjs` prints `pages=445 indexable=176` (263 noindex) and every local gate passes on macOS with
no game files, no network and no credentials:

- 66 site gates, typecheck, content/coverage/image/citation gates, preflight 11/11, smoke, status.
- 98 published entries (89 with a sourced in-game picture, 9 diagram-only notes), 63 guides, 855 facts,
  89 picture records (60 from the TCG Card Shop Wiki on Fandom, 29 from the official Steam store page; 0 unused).
- The `/reference/sources.html` picture-sources table is generated from `content/images-manifest.json`; every
  record carries a source name, source page, original URL, licence, rights review and retrieval date, and the site
  tests refuse a record without them.

`reports/status.json`, `reports/local-complete.md`, `reports/image-replacement-2026-10-30.md` and the image
reports are current. Commits: `85d80e5` (import), `c59da87` (macOS-clean tooling), `1f91ddb` (CI project name),
`2d6d42c` (design), the docs commit after that (handoff reports), `4d4f2d4` (picture-provenance page/gate),
`50b5de4` (image-gate records), `195a3f6` (89 sourced pictures + manifest + entries), `b9aa756` (generated
credits + wording), then the replacement-report and status commits. Working tree clean.

## Next, in order

1. Push these commits (Lead) and let `.github/workflows/publish.yml` deploy `web/dist` to the existing Cloudflare
   Pages project `tcgshopdb-com` (gate job: build -> tests -> typecheck; deploy job: build -> preflight -> smoke ->
   wrangler deploy).
2. After the deploy completes, verify the live domain the same way a reader arrives:
   `node tools/smoke.mjs https://tcgshopdb.com` (all 176 kept URLs, titles and canonicals on the real domain).
   Record the result in `reports/local-complete.md`.
3. Replace the pictures whose subject is clearly not what the entry describes: the list is in
   `reports/image-replacement-2026-10-30.md` §6 (22 clearly-wrong ids and 17 weaker reused category-level ones,
   also reported to the Lead). A swapped picture needs the same copy-in treatment: mapped file, manifest record,
   entry file, review-ledger row, regenerated image reports.
4. Bind/verify `tcgshopdb.com` in the Cloudflare dashboard if it is not already attached (account owner action).
5. Optional site improvement round: add JSON-LD (VideoGame / Article / BreadcrumbList / FAQPage), `lastmod` in
   the sitemap, then consider the AdSense application (policy pages, original content and image attribution are
   ready).
6. New facts/values need a Windows extraction host: never invent game data, keep unknown explicit, keep
   parser/extraction blockers from blocking the build or the gates.

## Rules

- Never invent game data or picture provenance; a value or source the build cannot verify stays `unknown` with a
  note.
- Do not edit provenance fields in `content/images-manifest.json` by hand; replace the record and its ledger row
  together.
- Parser/extraction blockers must not stop the site build, gates, reports or commits.
- Commit each meaningful milestone locally with a `type(scope): subject` message; deploy only after local gates pass.
