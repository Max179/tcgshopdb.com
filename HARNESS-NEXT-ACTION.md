# NOTE 2026-11-02 21:02 — sitemap P0 无需动作
Live https://tcgshopdb.com/sitemap.xml = 176×`<url><loc>clean</loc></url>`（工具 curl 实测）。生成器已正确。继续下方原 Next 队列（图片/部署后验），勿重做 sitemap。

---
# Harness next action — TCG Shop (tcgshopdb.com)

Updated: 2026-11-02, after the Mac handoff integration, picture replacement revision 3 and the SEO pass.

## State: local-complete

The Oct-2-2026 Windows handoff package is integrated, the Mac design is ported onto its generator, and the raw
Unity texture exports were replaced with sourced in-game pictures.
`node pipeline/site.mjs` prints `pages=445 indexable=176` (263 noindex) and every local gate passes on macOS with
no game files, no network and no credentials:

- 80 site gates (14 of them SEO), typecheck, content/coverage/image/citation gates, preflight 11/11, smoke, status.
- Clean-URL scheme throughout: canonical/og:url/hreflang/sitemap/JSON-LD/internal links all use the clean URLs the
  host serves; titles 25-60 and unique, descriptions 70-160 and unique, JSON-LD (WebSite/SearchAction, Article/
  WebPage, BreadcrumbList) on every indexable page, og/twitter metadata complete, sitemap 176 clean locs with 99
  truthful `<lastmod>` dates, robots gated, IndexNow key served at `/<key>.txt` with a manual
  `npm run indexnow` tool. Measured before/after: `reports/seo-audit.md`.
- 98 published entries (89 with a sourced in-game picture, 9 diagram-only notes), 63 guides, 855 facts,
  89 picture records (**79 from the TCG Card Shop Simulator Wiki on wiki.gg, 10 from the official Steam store
  page**; 79 unique, max 3 repeats; 0 unused). Revision 3 swapped 86 of the 89 pictures for the specific wiki.gg
  file for each subject.
- The `/reference/sources.html` picture-sources table is generated from `content/images-manifest.json`; every
  record carries a source name, source page (absolute URL), licence, rights review and retrieval date, and the
  site tests refuse a record without them. (Revision 3's pack returned `originalUrl` null for the 86 changed
  records; recorded in the report, no provenance field edited.)

`reports/status.json`, `reports/local-complete.md`, `reports/image-replacement-2026-10-30.md` and the image
reports are current. Commits: `85d80e5` (import), `c59da87` (macOS-clean tooling), `1f91ddb` (CI project name),
`2d6d42c` (design), the docs commit after that (handoff reports), `4d4f2d4` (picture-provenance page/gate),
`50b5de4` (image-gate records), `195a3f6` (89 sourced pictures + manifest + entries), `b9aa756` (generated
credits + wording), `0e86f21` (revision-2 swap of 51 pictures), `9cde7f0` (homepage credit to the official
store page), `0028520` (revision-3 wiki completeness pass: 86 picture swaps), then the wiki.gg copy, replacement-
report and status commits, and `5c8d573` (SEO pass: clean URLs, titles/descriptions, JSON-LD, sitemap lastmod,
social metadata, IndexNow key/tool, 14 SEO gates), then the SEO-report and status commits. Working tree clean.

## Next, in order

1. Push these commits (Lead) and let `.github/workflows/publish.yml` deploy `web/dist` to the existing Cloudflare
   Pages project `tcgshopdb-com` (gate job: build -> tests -> typecheck; deploy job: build -> preflight -> smoke ->
   wrangler deploy).
2. After the deploy completes, verify the live domain the same way a reader arrives:
   `node tools/smoke.mjs https://tcgshopdb.com` (all 176 kept URLs, titles and canonicals on the real domain).
   Record the result in `reports/local-complete.md`.
3. Decide on the last pictures whose subject is not what the entry describes: revision 3's wiki.gg pass fixed
   almost all of them, and `reports/image-replacement-2026-10-30.md` §6 now lists 3 still-clearly-wrong ids
   (`the-plants-in-and-around-the-shop`, `what-a-review-record-keeps`, `the-currencies-the-game-tracks`) plus a
   few weaker phone/icon fallbacks (also reported to the Lead). A swapped picture needs the same copy-in treatment:
   mapped file, manifest record, entry file, review-ledger row, regenerated image reports.
4. Bind/verify `tcgshopdb.com` in the Cloudflare dashboard if it is not already attached (account owner action).
5. After the deploy, run `npm run indexnow` once to submit the live sitemap (manual only; not run in CI).
6. Optional later round: VideoGame/FAQPage structured data beyond the site/article/breadcrumb set now emitted, then
   consider the AdSense application (policy pages, original content and image attribution are ready).
6. New facts/values need a Windows extraction host: never invent game data, keep unknown explicit, keep
   parser/extraction blockers from blocking the build or the gates.

## Rules

- Never invent game data or picture provenance; a value or source the build cannot verify stays `unknown` with a
  note.
- Do not edit provenance fields in `content/images-manifest.json` by hand; replace the record and its ledger row
  together.
- Parser/extraction blockers must not stop the site build, gates, reports or commits.
- Commit each meaningful milestone locally with a `type(scope): subject` message; deploy only after local gates pass.
