# Local completion record - compact copy

The full round-by-round log (577 lines, 377999 bytes, 446 recorded rounds)
is the working record of the extraction host and stays there. This copy carries the standing state at the handoff commit plus the
most recent recorded rounds verbatim, so the Mac side has the facts without the history. Nothing here is generated at publish time.

## SEO pass (2026-11-02) — current standing state

The site now uses one clean-URL scheme and a complete search contract: clean canonical/og:url/hreflang/sitemap/
JSON-LD/internal links, managed 25-60 character titles, unique 70-160 character descriptions, JSON-LD on every
indexable page, og/twitter metadata, truthful sitemap `<lastmod>`, gated robots.txt and a served IndexNow key with
a manual submission tool. Full record with before/after measurements: `reports/seo-audit.md`.

- Commit: `5c8d573` (clean URLs, titles/descriptions, JSON-LD, sitemap lastmod, social metadata, IndexNow key and
  tool, classifier/smoke updates, regenerated `config/urls.json`, 14 new SEO gates), then the docs commit that
  carries this section and the status commit. Working tree clean at handoff.
- Measured on the built artefact: titles over 60 chars **44 → 0** (all 176 unique, 26-60, average 47.5);
  descriptions under 70 chars **8 → 0** (all unique, 70-160, word-boundary cut, no ellipsis); sitemap **176 locs**
  in clean form (was 176 `.html` locs) with **99 truthful `<lastmod>`** (was 0; 89 pictured entries use the
  picture record date 2026-10-30, 9 guides an updates.json date, the updates page the latest update date);
  canonical == og:url == hreflang == sitemap for 176/176; internal `.html` links **4014 → 0**; JSON-LD **0 → 176
  valid scripts** (home WebSite+SearchAction, 152 Article+BreadcrumbList, 23 WebPage+BreadcrumbList); og:url/og:image
  and all four twitter tags **0 → 176**; robots unchanged and now gated; IndexNow key served at
  `/d3ad5d6eccb8896afad82b32eb7798f6.txt`.
- File set unchanged: **440 HTML files / 445 build outputs / 176 indexable / 439 classified rows** (176 keep, 263
  noindex); Cloudflare serves each clean URL from the matching `.html` file.
- Gates: the site tests grew **66 → 80** (14 SEO gates: title/description ranges and uniqueness, canonical=og:url=
  hreflang=sitemap, sitemap parsed as XML with the lastmod map re-derived from content metadata, JSON-LD types/URLs/
  dates, og/twitter coverage, no `.html` links, robots, IndexNow key/tool). Mutation check recorded in the audit:
  forcing long titles failed the gate (79 passed, 1 failed, exit 1) and restoring passed 80/80.
- Verbatim commands and exits — all exit 0:

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
      node tools/preflight.mjs                 -> [preflight] 11 ok, 0 failed (on the committed tree)

- Residual: live verification after the Lead's push/deploy; 77 pages omit `lastmod` by design because no truthful
  content date exists; `npm run indexnow` is a manual step to run once the sitemap is live; no
  `priority`/`changefreq` was added to the sitemap.
- Publishing: **not done from this machine**. The Lead owns the push and the Cloudflare Pages deploy; verify the
  live domain with `node tools/smoke.mjs https://tcgshopdb.com` after the deploy.

## Picture replacement (2026-10-30) — earlier standing state

The 186 raw Unity texture exports (UI atlases, white-on-black icon sheets, albedo/ground/furniture textures, grey
placeholders) were replaced with **89 sourced in-game pictures**, one per pictured entry, and the two homepage
pictures were replaced with official store screenshots. Revision 2 of the pack then swapped **51 of the 89**
pictures for better-fitting subjects and fixed the Steam source-page records. Revision 3 (the wiki completeness
pass) then swapped **86 of the 89** pictures for the specific TCG Card Shop Simulator Wiki on wiki.gg files. Full
record: `reports/image-replacement-2026-10-30.md`.

- Commits: `195a3f6` (89 pictures + manifest + 89 entry files + homepage + pack reports, 186 old mapped files
  deleted), `b9aa756` (generated credits, homepage provenance, wording), `0e86f21` (revision-2 swap: 51
  pictures/manifest entries replaced, Steam sourcePage fixed), `9cde7f0` (homepage credit to the official store
  page), `0028520` (revision-3 completeness pass: 86 pictures/manifest entries replaced, reports replaced), then
  the code/copy commit for the wiki.gg naming, the docs commit that carries this section and the status commit.
  Working tree clean at handoff.
- Sources: **79** pictures from the TCG Card Shop Simulator Wiki (wiki.gg), **10** from the official Steam store
  page (was 43 Fandom / 46 Steam); 79 unique pictures, max 3 repeats, 4,835,632 mapped bytes, all 1200x750. Every
  manifest record carries sourceName, sourcePage (absolute http(s)), license, rightsReview (`fair_use_review`),
  retrievedAt, verdict, reviewer and reviewDate; every file was re-checked against its sha256/bytes/dimensions.
  The 3 unchanged Steam pictures keep their `originalUrl`; the 86 changed records came back with `originalUrl`
  null and 7 Steam fallbacks with a mapped-file `assetName` (pack bookkeeping regression recorded in the report,
  no provenance field edited; the gate does not require originalUrl). The 9 `diagram-only` entries are untouched.
- Build: **pages=445 indexable=176** (263 noindex, unchanged); 98 published entries (89 with an in-game picture,
  9 diagram-only notes), 63 guides, 855 facts, 89 picture records (unused 0). The sources page now renders a
  generated per-file credit table plus credited homepage rows; the disclaimer, home page, start page, game guide,
  footer, README and content model describe the same picture model.
- Gate: the site tests carry a picture-provenance gate (source fields, absolute source page, every record listed on
  the sources page), so the previous 63 gates are now **66**; all 66 pass.
- Verbatim commands and exits — all exit 0:

      python3 tools/image-sanity.py            -> [image-sanity] 89 records, 0 flagged (was 186 / 12)
      node tools/image-coverage.mjs            -> entries=98 withGameImage=89 diagramOnly=9 manifestRecords=89 unusedRecords=0
      node pipeline/site.mjs                   -> [site] pages=445 indexable=176 schema(noindex)=263
      node tests/site.test.mjs                 -> [site-tests] 66 passed, 0 failed
      npx tsc --noEmit -p tsconfig.ci.json     -> no diagnostics
      node tools/content-gate.mjs              -> [content-gate] 98 entry file(s), 0 violation(s)
      node tools/verify-citations.mjs          -> entries=98 facts=855 distinctIdentifiers=1517 universe=7781 confirmedElsewhere=14 unmatched=0
      node tools/coverage.mjs                  -> columns=20 covered=20 published=98 draft=0 reference=0 absent=0 qualityFailures=0
      node tools/classify-urls.mjs             -> 176 keep, 263 noindex, 0 redirect(s) (no diff to config/urls.json)
      node tools/preflight.mjs                 -> [preflight] 11 ok, 0 failed
      node tools/smoke.mjs                     -> [smoke] tcgshopdb.com: 176 kept, 263 noindex; the artefact passes
      node pipeline/status.mjs                 -> reports/status.json regenerated after the content and code commits

- Picture fit, not provenance, is the residual: revision 3's wiki.gg pass made almost every picture specific to
  its entry; 3 entries still show a clearly different object (`the-plants-in-and-around-the-shop`,
  `what-a-review-record-keeps`, `the-currencies-the-game-tracks`) and a few phone/icon fallbacks are weaker
  (ids with the current "shows" in `reports/image-replacement-2026-10-30.md` §6, reported to the Lead).
- Publishing: **not done from this machine**. The Lead owns the push and the Cloudflare Pages deploy; verify the
  live domain with `node tools/smoke.mjs https://tcgshopdb.com` after the deploy.

## Mac integration (2026-10-30) — earlier standing state

The Oct-2-2026 Windows handoff package was merged into this repository on macOS and the Mac design
(8c1312f / 6169d5e) was ported onto the package generator. Full record: `reports/revival-2026-10-30.md`;
plan: `reports/mac-integration-plan.md`.

- Commits: `85d80e5` import, `c59da87` tooling, `1f91ddb` ci, `2d6d42c` design, then the docs commit that adds
  this section and the regenerated `reports/status.json`. Working tree clean at handoff.
- Build (macOS, no game files, no network, no credentials): `pages=445 indexable=176` (269 derived noindex);
  98 published entries (89 with a confirmed game image, 9 noindex notes), 63 structured guides, 855 facts,
  186 registered game images, coverage matrix 20/20, citations `unmatched=0`.
  The 445 build outputs are 440 HTML pages plus sitemap.xml, robots.txt, favicon.svg, brand.svg and style.css;
  `config/urls.json` classifies the 439 non-404 pages as 176 keep / 263 noindex, and the 404 is noindex.
- Verbatim commands and exits — all exit 0:

      node pipeline/site.mjs                    -> [site] pages=445 indexable=176 schema(noindex)=263
      node tests/site.test.mjs                  -> [site-tests] 63 passed, 0 failed
      npm i --no-save --no-package-lock typescript@5 @types/node@22
      npx tsc --noEmit -p tsconfig.ci.json      -> no diagnostics
      node tools/verify-citations.mjs           -> entries=98 facts=855 universe=7781 confirmedElsewhere=14 unmatched=0
      node tools/content-gate.mjs               -> 98 entry file(s), 0 violation(s)
      node tools/coverage.mjs                   -> columns=20 covered=20 published=98 qualityFailures=0
      node tools/classify-urls.mjs              -> 176 keep, 263 noindex (no diff to config/urls.json)
      node tools/image-coverage.mjs             -> entries=98 withGameImage=89 diagramOnly=9 records=186 unused=0
      python3 tools/image-sanity.py             -> 186 records, 12 flagged (all 12 already have review verdicts)
      node tools/smoke.mjs                      -> 176 kept, 263 noindex; the artefact passes
      node pipeline/status.mjs                  -> reports/status.json regenerated from a fresh build
      node tools/preflight.mjs                  -> [preflight] 11 ok, 0 failed
      node tools/deploy-check.mjs               -> 8 ready, 0 local failure(s), 2 external blocker(s)

- Design: the Windows copy of the shell is not kept — it hard-coded the sibling site's red accent in `style.css` and
  the handoff marks the shell as design-owned. The Mac palette, letter mark, hero/feature imagery
  (`web/assets/`), page shell and the packaged player/evidence markup are emitted from one `SITE.accent` value.
  Before/after renders: `reports/redesign-p0/mac-integration-{before-home,after-home,after-entry,after-home-mobile}.png`.
- Publishing: **not done from this machine**. The Lead owns the push and the Cloudflare Pages deploy; after the
  deploy, verify the domain with `node tools/smoke.mjs https://tcgshopdb.com`.
- Residual items (recorded, not blockers): no JSON-LD structured data yet; sitemap has no `lastmod`; AdSense not
  enabled; new game values still need a Windows extraction host. See `reports/revival-2026-10-30.md` §7.

## Standing state at the handoff commit
- Build: pages=445 indexable=176 noindex=269; documented version no version stated by this build.
- Documented identifiers: 240 types and 9593 field rows; the rows themselves are carried by
  data/normalized/value-index.json (checksum and counts) and data/normalized/citation-index.json (the names they contribute).
- This package ships without git history: the tree counts in reports/status.json describe the extraction host tree, not the package.

## Most recent recorded rounds (verbatim, oldest first)
- 干净克隆复验（第 557 轮，本作，内容不增）：工区外 git clone（gc22-tcg，HEAD 24693e1 / 570 次提交），13 步全部 exit 0——preflight 11/11、site pages=445 indexable=176、classify 176 keep / 263 noindex、verify entries=98 facts=854 unmatched=0、gate 98 词条 0 违规、coverage 20/20、imgcov 89 实图/9 注释（manifest 186）unusedRecords=0、imgsanity 186 条、tests 63 全过（# pass 1 / # fail 0）、tsc exit 0、smoke 通过、deploy-check 8 ready / 0 local failures / 2 external blockers。reports/handoff.md 的「Re-verified on」由第 553 轮更新为第 557 轮。
- 词条加深 ×1（第 558 轮，本作，词条 98、指南 63、页面、图片与 manifest 均不变；facts 854→**855**）：the-counter-and-money 再补一条——顾客购买、支付被拒与卡牌受损各有音效（SFX_CustomerBuy、SFX_Declined、SFX_Damaged）。三个名字按整名搜索确认此前无引用，token 检查 666 个令牌 risky 0。整链复跑：site pages=445 indexable=176、classify 176/263、verify entries=98 facts=855 unmatched=0、gate 98 词条 0 违规、coverage 20/20、imgcov 89/9（manifest 186）、imgsanity 186 条、tests 63 全过、tsc exit 0。
- 阶段收尾（第 559 轮，本作，内容不增）：**最终状态**：HEAD 117c80c / 571 次提交，工作树干净；98 条已发布词条（89 条带真图、9 条无图注释）、63 篇结构化指南、855 条事实、186 条已登记游戏图；`pages=445 indexable=176`（263 noindex）；coverage 20/20 栏、qualityFailures=0；tests 63 全过、tsc exit 0。**三件套**：preflight 11/11、smoke 通过、`deploy-check` **7 ready / 0 local failures / 3 external blockers**。**最近一次干净克隆复验**：第 557 轮（gc22-tcg，HEAD 24693e1），13 步全 exit 0。**发布腿**：缺 GitHub remote 与两个 Cloudflare 密钥；`publish.yml` 与 Pages 配置就绪，凭据到位即可 push → Actions → Pages → 线上 `tools/smoke.mjs https://tcgshopdb.com`。按既定方针只记外部阻塞。
- 轻量交接包就绪（第 574 轮，本作，tcg）：新增 `tools/mac-package.mjs`（与 repo 站同一份文件，sha256 ae4de243…，按本站 keep 表调整——`data/normalized` 只带 p0-inventory.json、p0-instances.json、tcg-object-names.json、data/guide-questions.json）。留 Windows：payload 转储 `tcg-mb-payloads.json` 1,247,575 B、10 个语言表合计 1,688,912 B、`web/dist` 22,972,646 B（717 文件）、`.git` 32,629,596 B、redesign 截图 657,814 B、提取侧工作记录 47,144 B、HARNESS 便条 1,429 B（本树无 `data/raw`），合计排除 59,242,068 B。与 repo 相同：本站「值层」`p0-instances.json`（135,003 B，count=260）是构建 `/reference/values.html` 的输入，必须随包，因此不需要派生 value/citation 索引——引用全集由 `tcg-object-names.json`（120,338 B）与 `p0-inventory.json`（1,003,097 B）构成，二者均随包，universe=7,781 与 Windows 一致。包分组字节：source 38/391,034、published 98/495,698、articles 63/175,675、images 272/20,301,698（mapped 186/20,136,095、条目图 86/165,603）、data 4/1,264,000、content root 3/93,366、shell 5/1,014、reports 7/88,591（总大小与逐文件 sha256 以包内 `reports/mac-handoff-manifest.json` 为准）。实测（包副本 scratch + git init/commit，13 步）：preflight 11/11 exit 0、site pages=445 indexable=176（noindex 269）、classify 176 keep / 263 noindex、verify entries=98 facts=855 universe=7,781 confirmedElsewhere=14 unmatched=0、gate 98 词条 0 违规、coverage 20/20 qualityFailures=0、imgcov 98 词条 89 实图 9 注释 manifest 186 unusedRecords=0、imgsanity 186 条（2 张仅提示 stddev 低，均已有判决）、status 记 p0-instances 值层、tests 63 过、tsc exit 0、smoke 通过、deploy-check 7 ready / 0 local failures / 3 external（包内无 remote，多出 git remote 一项）。设计面不覆盖：`pipeline/site.mjs`（SITE 第 14 行、layout 第 93 行、brand.svg 第 402 行、style.css 第 404 行）属 Mac efb7b6b 设计整合范围。
- 平台性假通过修复：v22 头检查改为可移植（第 575 轮，本作，tcg）。与 repo 同一缺陷：`tests/site.test.mjs` 的 v22 头检查用写死的绝对路径读真实 level 文件，macOS 上 0 of 2 FAIL（Windows 上传到的是原始工作树里的文件，属假通过）。修复与 repo 完全一致：`pipeline/v22_sample_record.mjs` 生成 `data/normalized/v22-header-samples.json`（2,932 B，同一对真实样本：level1 1,814,108 B sha256 631475ae…、level0 530,084 B sha256 b25af2ec…），测试按「树内相对路径 → 源路径 → 记录字节」取值，缺则 unreadable。Windows 整链复跑 exit 0（tests 63 passed 0 failed、tsc exit 0）；包内保留记录文件；Mac 复验通过后另记。

The five entries above are the last recorded rounds. The complete list - every rejected picture, every gate run - lives in
reports/local-complete.md on the extraction host.
