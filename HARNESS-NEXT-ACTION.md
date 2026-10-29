# Harness next action — TCG Shop (tcgshopdb.com)

Updated: 2026-10-30, after the Mac handoff integration.

## State: local-complete

The Oct-2-2026 Windows handoff package is integrated and the Mac design is ported onto its generator.
`node pipeline/site.mjs` prints `pages=445 indexable=176` (263 noindex), the 63 site gates, typecheck,
content/coverage/image/citation gates, smoke, status and preflight (11/11) all pass on macOS with no game files and
no network. `reports/status.json`, `reports/local-complete.md` and `reports/revival-2026-10-30.md` are current.
Commits: `85d80e5` (import), `c59da87` (macOS-clean tooling), `1f91ddb` (CI project name), `2d6d42c` (design),
plus the docs commit that carries the updated reports. Working tree clean.

## Next, in order

1. Push these commits (Lead) and let `.github/workflows/publish.yml` deploy `web/dist` to the existing Cloudflare
   Pages project `tcgshopdb-com`. The workflow gate job runs build -> tests -> typecheck; the deploy job runs
   build -> preflight -> smoke -> wrangler deploy.
2. After the deploy completes, verify the live domain the same way a reader arrives:
   `node tools/smoke.mjs https://tcgshopdb.com` (all 176 kept URLs, titles and canonicals on the real domain).
   Record the result in `reports/local-complete.md`.
3. Bind/verify `tcgshopdb.com` in the Cloudflare dashboard if it is not already attached (account owner action).
4. Optional site improvement round: add JSON-LD (VideoGame / Article / BreadcrumbList / FAQPage), `lastmod` in the
   sitemap, then consider the AdSense application (policy pages, original content and image attribution are ready).
5. New facts/values need a Windows extraction host: never invent game data, keep unknown explicit, keep
   parser/extraction blockers from blocking the build or the gates.

## Rules

- Never invent game data; a value the build cannot verify stays `unknown` with a source note.
- Parser/extraction blockers must not stop the site build, gates, reports or commits.
- Commit each meaningful milestone locally with a `type(scope): subject` message; deploy only after local gates pass.
