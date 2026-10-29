# Mac integration plan — tcgshopdb.com revival (2026-10-30)

Status: in progress. Written before the tree was merged so the steps below are the plan, not a retelling.
Source of truth: /Users/carl/dsh-handoff-incoming/tcg-mac.tar.gz, freshly extracted to /tmp/tcg_pkg
(the Lead's stale extract at /tmp/tcg_tar is ignored). Target: this repository (tcg-shop/).

## What the repository has, and what the package has

| | Repository at e691ace (before) | Handoff package (Oct-2 Windows) |
| --- | --- | --- |
| build | `node pipeline/site.mjs` → 257 pages / 13 indexable (measured; the old report claims 235/13) | 445 pages / 176 indexable (269 noindex) |
| content | none: 98 published entries, 63 guides and 260 decoded instances exist only in the package | content/published (98), content/articles (63), content/assets (272 files), data indexes |
| shell | Mac design 8c1312f + 6169d5e (teal player-guide shell, web/assets hero imagery) | Windows copy of the shared redesign shell (style.css hard-codes the sibling site's red accent; wrong for this domain) |
| pipeline | thin: inventory + values only | full two-layer build (player layer + /reference evidence layer), 63 site gates, preflight, image gates |
| workflow | e691ace fixes the Pages project name to tcgshopdb-com | publishes to `tcgshopdb` (does not exist) |
| project metadata | no package.json, no README | same (excluded from package on purpose: machine-local file) |

## Plan

1. Merge the package tree in (content, config, data, docs, pipeline, tools, tests, web assets, reports
   evidence). Keep this repository's git history and HARNESS-NEXT-ACTION.md; keep the design-owned shell
   and the e691ace workflow fix.
2. Reconcile the publish workflow with the real target: Cloudflare Pages project `tcgshopdb-com`
   (wrangler.toml already says so), keep the gate → deploy two-job structure, keep preflight + smoke in the
   deploy job.
3. Add `package.json` (npm scripts for build/test/typecheck/gates/preflight/smoke/status/verify) and
   `README.md`, modeled on the sibling site's conventions.
4. macOS cleanup: portable tsconfig typeRoots (the package carries `C:/Users/CHEN/...`), LF via
   .gitattributes, no Windows path read by build/test/gates (Windows paths in extraction scripts and in
   provenance reports are kept as history and are not read at build time).
5. Port the Mac design onto the package generator instead of letting the Windows shell overwrite it:
   - SITE block (name, tagline, palette, hero image) and the design-owned home hero;
   - `layout()` header/footer/section skeleton (sticky bar, brand mark, hero, task grid, split archive);
   - the emitted `style.css` / `brand.svg` and the design-owned `web/assets/` imagery;
   - adapt the package's page markup (cards, entity page, facts panel, guides) to that visual system so all
     445 pages render, not just the home page.
   The package's two content layers and every gate stay intact; the design port changes the shell, not the
   contract.
6. Run the full chain on macOS with no game files and no network, record exact commands and exit codes:
   build → tests → typecheck → verify-citations → content-gate → coverage → classify-urls →
   image-coverage → image-sanity → smoke → status → preflight → deploy-check.
7. Verify output quality: pages/indexable ≥ 445/176, sitemap = indexable set, spot-check ≥10 rendered
   pages for canonical/robots/title/description/source line/no placeholder or Windows path, no thin or
   duplicate indexable pages. Capture before/after home renders.
8. Refresh reports/status.json from a fresh build, add the Mac integration section to
   reports/local-complete.md and the new reports/revival-2026-10-30.md, re-mark the handoff as Mac-verified,
   update HARNESS-NEXT-ACTION.md.
9. Commit locally in focused commits; leave the tree clean. No push, no deploy.

## Outcome (2026-10-30)

All nine steps above were carried out. The integrated tree builds `pages=445 indexable=176` and the full
fourteen-command chain exits 0; no gate was weakened and no test was changed to fit the redirect. The Mac design
was ported onto the package generator (not the reverse), the Windows copy's wrong accent and unbounded meta
descriptions were fixed, and the publish workflow now targets the Pages project that exists. Before/after renders
and the full command transcript are in `reports/revival-2026-10-30.md`; the standing state is at the top of
`reports/local-complete.md`. Nothing was pushed or deployed from this machine — that leg belongs to the Lead.
