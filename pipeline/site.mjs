#!/usr/bin/env node
/**
 * Static site generator for tcgshopdb.com (Windows-side build).
 *
 * Two layers, kept apart on purpose:
 *   - Player layer: home, game guide, entity hub + player category pages, entity pages, guides, tools, updates.
 *   - Evidence layer: class/field/enum/value tables and provenance, under /reference/ and /entity/, marked noindex.
 * A subject with no confirmed game picture is not published as an entity page: it becomes a noindex note under
 * /reference/notes/ and is listed on its category page as a note.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const SITE = {
  name: 'TCG Card Shop Wiki',
  gameName: 'TCG Card Shop Simulator',
  domain: 'tcgshopdb.com',
  url: 'https://tcgshopdb.com',
  // The Mac design commits (8c1312f, 6169d5e) own the shell: this palette, the mark, the hero layout and the
  // homepage imagery come from them. The Windows copy hard-coded the sibling site's red accent, so the accent is
  // read from here and written into style.css instead of being repeated as a literal.
  accent: '#8fe3cf',
  accentInk: '#0e2925',
  tagline: 'Build a card shop: open packs, price singles, stock shelves and make the next sale',
  searchPlaceholder: 'Search cards, packs, customers or guides',
  versionBadge: 'TCG Card Shop Simulator · read from a local copy',
  // Design-owned homepage imagery, added by the Mac design commit 6169d5e and kept out of the package on purpose.
  heroImage: 'assets/hero-shop.jpg',
  heroAlt: 'The shop furniture textures the game ships for its fixtures.',
  heroCaption: 'In-game shop furniture · verified game asset',
  featureImage: 'assets/featured-card.jpg',
  featureAlt: 'The fire card front the game ships for one of its card sets.',
  featureCaption: 'In-game card front · verified game asset',
  featured: ['cards-and-rarity', 'packs-and-opening', 'the-counter-and-money', 'storage-shelves-and-restocking',
    'sending-cards-to-be-graded', 'the-card-game-you-can-play', 'playmats-deck-boxes-and-sleeves', 'the-box-your-stock-arrives-in'],
};

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Keep meta/OG descriptions inside the useful search-snippet range (the sibling site's convention). */
export const metaDescription = (s) => {
  const text = String(s ?? '').replace(/\s+/g, ' ').trim();
  if (text.length <= 160) return text;
  const cut = text.slice(0, 157);
  const at = cut.lastIndexOf(' ');
  return (at > 120 ? cut.slice(0, at) : cut).replace(/[.,;:!?—-]+$/, '') + '…';
};

/** Pure, fixture-tested: field search across the inventory. */
export function lookupFields(inventory, query, limit = 50) {
  if (typeof query !== 'string') throw new TypeError('query must be a string');
  const q = query.trim().toLowerCase().slice(0, 64);
  const cap = Number.isFinite(limit) ? Math.max(1, Math.min(200, Math.floor(limit))) : 50;
  const out = [];
  for (const c of inventory.classes ?? []) {
    for (const f of c.fields ?? []) {
      if (!q || f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q)) {
        out.push({ class: c.name, field: f.name, type: f.type, kind: f.kind });
        if (out.length >= cap) return out;
      }
    }
  }
  return out;
}

/** The five player-facing sections. */
export const NAV = [
  ['/guide.html', 'Game guide'],
  ['/entities/', 'Entities'],
  ['/articles/', 'Guides'],
  ['/tools/', 'Tools'],
  ['/updates.html', 'Updates'],
];

/** Evidence layer: reachable from the footer and /reference/ only, never indexed. */
export const REFERENCE_PATHS = new Set(['/collection.html', '/cards.html', '/enums.html', '/values.html', '/tool.html', '/sources.html', '/reference/']);
export function isSchemaPage(path) {
  const p = String(path);
  return p.startsWith('/entity/') || p.startsWith('/reference/') || REFERENCE_PATHS.has(p);
}
export function isNoindexPage(path) { return isSchemaPage(path) || path === '/tool.html'; }

/** Player categories: what someone is dealing with in a run. */
export const CATEGORIES = [
  { key: 'cards', name: 'Cards and rarity', src: ['Cards', 'Rarity'], blurb: 'What a card is, how rarity is decided, and what a card can carry.' },
  { key: 'packs', name: 'Packs and opening', src: ['Packs'], blurb: 'Sealed product, opening it by hand or by machine, and what comes out.' },
  { key: 'decks', name: 'Decks and the card game', src: ['Decks'], blurb: 'Building a deck and playing the game the shop sells cards for.' },
  { key: 'customers', name: 'Customers and trading', src: ['Customers'], blurb: 'Who comes in, what they want, and how a trade works.' },
  { key: 'shop', name: 'Shop, shelves and fixtures', src: ['Shop'], blurb: 'Fittings, displays, decorations and what the shop itself can do.' },
  { key: 'storage', name: 'Storage and stock', src: ['Storage'], blurb: 'The back room, boxes, shelves and keeping stock moving.' },
  { key: 'pricing', name: 'Pricing and the market', src: ['Pricing'], blurb: 'Price tags, price changes and what the market does to a card.' },
  { key: 'interface', name: 'Interface and screens', src: ['Interface'], blurb: 'The screens, panels and readouts you work with.' },
  { key: 'upgrades', name: 'Upgrades and licences', src: ['Upgrades'], blurb: 'Shop levels, licences and what they unlock.' },
  { key: 'events', name: 'Events and tournaments', src: ['Events'], blurb: 'Events, tournaments and the prizes that come with them.' },
  { key: 'basics', name: 'Basics and answers', src: ['FAQ', 'Glossary', 'Versions'], blurb: 'Common questions, the words this site uses, and which build it documents.' },
];

const groupOf = (category) => (CATEGORIES.find((c) => c.src.includes(category)) ?? CATEGORIES[CATEGORIES.length - 1]);

export function build(inventoryPath, outDir) {
  const inv = JSON.parse(readFileSync(inventoryPath, 'utf8'));
  const srcLine = 'Source: read from a local copy of the game · version ' + (inv.version ?? 'unknown') + ' · nothing invented';
  let manifest = { records: [] };
  try { manifest = JSON.parse(readFileSync(join(process.cwd(), 'content', 'images-manifest.json'), 'utf8')); } catch { /* none yet */ }

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const pages = new Map();
  const urls = [];
  // The page shell is the Mac design integration (8c1312f, 6169d5e): sticky bar with a letter mark, the
  // five-section player nav, the wide player column and the dark teal palette. Page bodies keep the package's
  // two-layer content contract; only the shell and its stylesheet belong to the design port.
  const layout = (title, description, path, body) => '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>' + esc(title.includes(SITE.name) ? title : title + ' · ' + SITE.name) + '</title>\n' +
    '<meta name="description" content="' + esc(metaDescription(description)) + '">\n<meta name="robots" content="' + (isNoindexPage(path) ? 'noindex, follow' : 'index, follow') + '">\n' +
    '<link rel="canonical" href="' + SITE.url + path + '">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n' +
    '<link rel="alternate" hreflang="en" href="' + SITE.url + path + '">' +
    '<link rel="alternate" hreflang="x-default" href="' + SITE.url + path + '">' +
    '<meta property="og:title" content="' + esc(title) + '"><meta property="og:type" content="website">\n' +
    '<meta property="og:description" content="' + esc(metaDescription(description)) + '">\n' +
    '<link rel="stylesheet" href="/style.css">\n</head>\n<body>\n' +
    '<a class="skip" href="#main">Skip to content</a>\n' +
    '<header class="top">\n<div class="bar">\n' +
    '<a class="brand" href="/"><span class="mark">TCG</span><span>' + esc(SITE.name) + '</span></a>\n' +
    '<nav class="main" aria-label="Sections">' + NAV.map(([h, t]) =>
      '<a href="' + h + '"' + (path === h || (h !== '/' && path.startsWith(h.replace(/\.html$/, '').replace(/index\.html$/, ''))) ? ' class="on"' : '') + '>' + esc(t) + '</a>').join('') + '</nav>\n' +
    '<form class="hsearch" action="/search.html" method="get" role="search"><input type="search" name="q" placeholder="' + esc(SITE.searchPlaceholder) + '" aria-label="Search this site"><button type="submit">Search</button></form>\n' +
    '</div>\n</header>\n<main id="main">\n' + body + '\n</main>\n' +
    '<footer class="foot"><div class="wrap">\n<p class="dim">' + esc(srcLine) + '</p>\n' +
    '<p class="dim">A diagram is always labelled as a diagram. A number we could not verify is not printed.</p>\n' +
    '<p class="dim"><a href="/about.html">About</a> · <a href="/contact.html">Contact</a> · <a href="/privacy.html">Privacy</a> · ' +
    '<a href="/terms.html">Terms</a> · <a href="/disclaimer.html">Disclaimer</a> · <a href="/reference/">Technical reference</a></p>\n' +
    '</div></footer>\n</body>\n</html>\n';
  const write = (rel, html) => { const f = join(outDir, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, html, 'utf8'); pages.set('/' + rel, html); };
  const indexable = (rel, title, desc, body) => { write(rel, layout(title, desc, '/' + rel, body)); urls.push(SITE.url + '/' + rel); };
  const reference = (rel, title, desc, body) => { write(rel, layout(title, desc, '/' + rel, body)); };

  // ---- content --------------------------------------------------------------------------------
  const entriesDir = join(process.cwd(), 'content', 'published');
  const entries = existsSync(entriesDir)
    ? readdirSync(entriesDir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(entriesDir, f), 'utf8'))).sort((a, b) => a.title.localeCompare(b.title))
    : [];
  const entities = entries.filter((e) => e.imageTier === 'game-image');
  const notes = entries.filter((e) => e.imageTier !== 'game-image');
  const byId = new Map(entries.map((e) => [e.id, e]));
  const imgOf = (e) => (e.images ?? []).find((i) => i.kind === 'game') ?? (e.images ?? [])[0];
  const entryHref = (id) => (byId.get(id)?.imageTier === 'game-image' ? '/entries/' + id + '.html' : '/reference/notes/' + id + '.html');
  const oneLine = (e) => ((e.facts ?? [])[0]?.claim ?? e.summary ?? '');
  const whyOf = (because) => String(because ?? '').replace(/\s*\([^()]*\)\s*$/, '').trim();
  const card = (e) => {
    const img = imgOf(e);
    return '<a class="card" href="' + entryHref(e.id) + '">' +
      (img ? '<img loading="lazy" src="/' + esc(img.file) + '" alt="' + esc(img.alt?.en ?? '') + '" width="480" height="300">' : '') +
      '<span class="chip">' + esc(groupOf(e.category).name) + '</span>' +
      '<strong>' + esc(e.title) + '</strong><span class="dim">' + esc(oneLine(e)) + '</span></a>';
  };
  const noteRow = (e) => '<li><a href="/reference/notes/' + esc(e.id) + '.html">' + esc(e.title) + '</a> <span class="dim small">— note, no confirmed game picture yet</span></li>';

  let articles = [];
  try { articles = readdirSync(join(process.cwd(), 'content', 'articles')).filter((x) => x.endsWith('.json')).map((x) => JSON.parse(readFileSync(join(process.cwd(), 'content', 'articles', x), 'utf8'))).sort((a, b) => a.title.localeCompare(b.title)); } catch { /* none yet */ }
  let updates = [];
  try { updates = JSON.parse(readFileSync(join(process.cwd(), 'content', 'updates.json'), 'utf8')); } catch { /* none yet */ }
  let questions = {};
  try { questions = JSON.parse(readFileSync(join(process.cwd(), 'data', 'guide-questions.json'), 'utf8')); } catch { /* none yet */ }
  const playerUpdates = updates.filter((u) => !String(u.url ?? '').startsWith('/reference/'));

  // ---- home ------------------------------------------------------------------------------------
  const featured = (SITE.featured ?? []).map((id) => byId.get(id)).filter((e) => e && e.imageTier === 'game-image');
  const featuredList = (featured.length ? featured : entities).slice(0, 8);
  const questionCards = articles.filter((a) => questions[a.id]).slice(0, 6);
  indexable('index.html', SITE.gameName + ' guide and reference', SITE.tagline + ' — a player-written reference built from what the game itself establishes.',
    '<section class="hero">\n<div>\n' +
    '<p class="eyebrow">' + esc(SITE.versionBadge) + '</p>\n' +
    '<h1>' + esc(SITE.gameName) + '</h1>\n' +
    '<p class="lead">' + esc(SITE.tagline) + '. Every entry says what the game itself establishes, and nothing here is estimated.</p>\n' +
    '<form class="hero-search" action="/search.html" method="get" role="search"><input type="search" name="q" placeholder="' + esc(SITE.searchPlaceholder) + '" aria-label="Search this site"><button type="submit">Search</button></form>\n' +
    '<p class="actions"><a class="button primary" href="/entries/">Start here</a><a class="button" href="/entities/">Browse entities</a><a class="button" href="/articles/">Read the guides</a></p>\n' +
    '</div>\n<figure class="hero-media"><img src="/' + esc(SITE.heroImage) + '" alt="' + esc(SITE.heroAlt) + '" width="1024" height="1024"><figcaption>' + esc(SITE.heroCaption) + '</figcaption></figure>\n</section>\n' +
    '<section class="section split">\n<div>\n<h2>What this game is</h2>\n<p>' + esc(SITE.gameName) + ' is a shop sim with a trading card game inside it: you order sealed product, open it, price what you pull, stock the shelves, serve customers and build a collection — and you can play the card game yourself at a table.</p>\n' +
    '<p class="dim small">Documented build: ' + esc(inv.version ?? 'unknown') + '. Where the game changes between builds, the entry says which one it was checked against.</p>\n</div>\n<figure class="feature-card"><img src="/' + esc(SITE.featureImage) + '" alt="' + esc(SITE.featureAlt) + '" width="1024" height="1024" loading="lazy"><figcaption>' + esc(SITE.featureCaption) + '</figcaption></figure>\n</section>\n' +
    '<section class="section">\n<h2>Popular entities</h2>\n<p class="dim">A curated starting set, each with a picture taken from the game.</p>\n<div class="grid">' + featuredList.map(card).join('') + '</div>\n<p><a href="/entities/">All entities by part of the run &rarr;</a></p>\n</section>\n' +
    '<section class="section">\n<h2>The question you probably have</h2>\n<div class="qgrid">' + questionCards.map((a) =>
      '<a class="qcard" href="/articles/' + esc(a.id) + '.html"><strong>' + esc(questions[a.id]) + '</strong><span class="dim">' + esc(a.title) + '</span></a>').join('') +
    '</div>\n<p><a href="/articles/">All guides &rarr;</a></p>\n</section>\n' +
    '<section class="section">\n<h2>Latest updates</h2>\n' + (playerUpdates.length
      ? '<ul class="updates">' + playerUpdates.slice(0, 6).map((u) => '<li><span class="when">' + esc(u.date) + '</span> <a href="' + esc(u.url) + '">' + esc(u.title) + '</a> <span class="dim small">' + esc(u.kind ?? '') + '</span></li>').join('') + '</ul>'
      : '<p class="dim">No update notes yet.</p>') +
    '\n<p><a href="/updates.html">All updates &rarr;</a></p>\n</section>\n' +
    '<section class="section">\n<h2>Where the pictures and facts come from</h2>\n' +
    '<p>Pictures are taken from a local copy of the game itself, each one recorded with the asset it came from; a diagram drawn for this site is always labelled as a diagram and is never passed off as a screenshot. Facts are read from the game\'s own files, not from a wiki or a forum. The build this site documents is <strong>' + esc(inv.version ?? 'unknown') + '</strong>.</p>\n' +
    '<p class="dim small">The raw identifiers, tables and extraction notes are kept in a technical reference, reachable from the footer of every page and kept out of search engines on purpose.</p>\n</section>\n');

  // ---- game guide ------------------------------------------------------------------------------
  indexable('guide.html', 'Game guide', 'How a shop day works in TCG Card Shop Simulator, and what to do first.',
    '<h1>Game guide</h1><p class="lead">A short path through a shop day, with a link to the entries behind each step.</p>\n' +
    '<h2>1. Open and price your first product</h2><p>Sealed packs, what is inside them and what it is worth: <a href="/entities/packs.html">packs</a> and <a href="/entities/pricing.html">pricing</a>.</p>\n' +
    '<h2>2. Get cards onto the shelves</h2><p>Fittings, displays and the back room: <a href="/entities/shop.html">shop and shelves</a> and <a href="/entities/storage.html">storage</a>.</p>\n' +
    '<h2>3. Serve the people who come in</h2><p>Who comes, what they want and how a trade works: <a href="/entities/customers.html">customers and trading</a>.</p>\n' +
    '<h2>4. Read what you pulled</h2><p>Rarity, grading and a collection that holds value: <a href="/entities/cards.html">cards and rarity</a>.</p>\n' +
    '<h2>5. Play the game yourself</h2><p>Decks, the table and tournaments: <a href="/entities/decks.html">decks and the card game</a> and <a href="/entities/events.html">events</a>.</p>\n' +
    '<h2>How to use this site</h2><p>Use the search box, browse <a href="/entities/">entities by part of the run</a>, or read a <a href="/articles/">guide</a> that walks through one job from start to finish. Pictures come from the game; a diagram is always labelled as a diagram.</p>');

  // ---- entity hub and category pages ------------------------------------------------------------
  indexable('entities/index.html', 'Entities', 'Every part of the run this site documents, with pictures taken from the game.',
    '<h1>Entities</h1><p class="lead">Browse by what you are dealing with in a run. Each entry says what the game itself establishes, and carries a picture taken from the game.</p>\n' +
    '<div class="grid">' + CATEGORIES.map((c) => {
      const list = entities.filter((e) => groupOf(e.category).key === c.key);
      const cover = list.map(imgOf).find(Boolean);
      if (!list.length) return '';
      return '<a class="card" href="/entities/' + c.key + '.html">' +
        (cover ? '<img loading="lazy" src="/' + esc(cover.file) + '" alt="' + esc(cover.alt?.en ?? '') + '" width="480" height="300">' : '') +
        '<strong>' + esc(c.name) + '</strong><span class="dim">' + esc(c.blurb) + '</span>' +
        '<span class="chip">' + list.length + ' entries</span></a>';
    }).join('') + '</div>\n' +
    '<p class="dim small">' + notes.length + ' further subjects exist only as notes so far, because no picture has been confirmed from the game for them. They are listed on their category page and kept out of search engines.</p>');
  for (const c of CATEGORIES) {
    const list = entities.filter((e) => groupOf(e.category).key === c.key);
    const onlyNotes = notes.filter((e) => groupOf(e.category).key === c.key);
    if (!list.length && !onlyNotes.length) continue;
    const cover = list.map(imgOf).find(Boolean);
    indexable('entities/' + c.key + '.html', c.name + ' in ' + SITE.gameName, c.blurb + ' ' + list.map((e) => e.title).join(', ') + '.',
      '<h1>' + esc(c.name) + '</h1><p class="lead">' + esc(c.blurb) + '</p>\n' +
      (cover ? '<figure class="banner"><img src="/' + esc(cover.file) + '" alt="' + esc(cover.alt?.en ?? '') + '" width="900" height="380"><figcaption class="dim small">Picture taken from the game itself.</figcaption></figure>' : '') +
      (list.length ? '<div class="filter"><label for="f">Filter ' + esc(c.name.toLowerCase()) + '</label> <input id="f" type="search" placeholder="Type a word" autocomplete="off"> <span id="count" class="dim small"></span></div>\n' +
      '<div class="grid" id="cards">' + list.map(card).join('') + '</div>\n' : '') +
      (onlyNotes.length ? '<section class="block notes"><h2>Notes without a confirmed picture</h2><p class="dim">These subjects rest on the same verified facts, but no picture from the game has been confirmed for them yet, so they are notes rather than finished entries.</p><ul>' + onlyNotes.map(noteRow).join('') + '</ul></section>' : '') +
      '<p><a href="/entities/">Back to all entities</a></p>\n' +
      '<script>var f=document.getElementById("f");if(f){var cards=Array.prototype.slice.call(document.querySelectorAll("#cards .card")),c=document.getElementById("count");' +
      'var run=function(){var q=f.value.trim().toLowerCase(),n=0;cards.forEach(function(el){var hit=!q||el.textContent.toLowerCase().indexOf(q)>=0;el.style.display=hit?"":"none";if(hit)n++;});c.textContent=n+" shown";};' +
      'f.addEventListener("input",run);run();}</script>');
  }

  // ---- entities and notes ----------------------------------------------------------------------
  for (const e of entities) {
    const img = imgOf(e);
    const related = (e.related ?? []).filter((id) => byId.has(id));
    indexable('entries/' + e.id + '.html', e.title, e.summary,
      '<article class="entry">\n' +
      (img ? '<figure class="heroimg"><img src="/' + esc(img.file) + '" alt="' + esc(img.alt?.en ?? '') + '" title="' + esc(img.alt?.zh ?? '') + '" width="900" height="520"><figcaption class="dim small">Picture taken from the game to identify this item; it remains the property of the developer.</figcaption></figure>' : '') +
      '<p class="kicker">' + esc(groupOf(e.category).name) + ' · ' + esc(SITE.versionBadge) + '</p>\n<h1>' + esc(e.title) + '</h1>\n' +
      '<p class="oneline">' + esc(oneLine(e)) + '</p>\n<p class="lead">' + esc(e.summary) + '</p>\n' +
      '<aside class="facts"><h2>At a glance</h2><dl>' +
      '<dt>Part of the shop</dt><dd><a href="/entities/' + groupOf(e.category).key + '.html">' + esc(groupOf(e.category).name) + '</a></dd>' +
      '<dt>Picture</dt><dd>taken from the game itself</dd>' +
      '<dt>Documented build</dt><dd>' + esc(inv.version ?? 'unknown') + '</dd>' +
      '<dt>Related entries</dt><dd>' + related.length + '</dd>' +
      '</dl></aside>\n' +
      '<h2>What the game establishes</h2><ul class="verified">' + (e.facts ?? []).map((f) => '<li>' + esc(f.claim) + ' <span class="dim small">(checked against the game\'s own files)</span></li>').join('') + '</ul>\n' +
      '<h2>In play</h2>' + (e.body ?? []).map((p) => '<p>' + esc(p) + '</p>').join('') + '\n' +
      (related.length ? '<h2>Related</h2><div class="grid">' + related.map((id) => card(byId.get(id))).join('') + '</div>' : '') +
      '<h2>Version and sources</h2><p class="dim small">' + esc((e.sources ?? []).join(' ')) + ' Documented build: ' + esc(inv.version ?? 'unknown') + '.</p>\n' +
      '</article>');
  }
  indexable('entries/index.html', 'Start here', 'How to use this site, and where to begin with a shop.',
    '<h1>Start here</h1><p class="lead">This site is a player-written reference for ' + esc(SITE.gameName) + '. It does not try to be a full wiki: every entry states what the game itself establishes, and says plainly when something has not been verified.</p>\n' +
    '<h2>The four things you can do</h2><ul>' +
    '<li><strong>Browse <a href="/entities/">entities</a></strong> by the part of the shop you are dealing with.</li>' +
    '<li><strong>Follow the <a href="/guide.html">game guide</a></strong> through a shop day.</li>' +
    '<li><strong>Read a <a href="/articles/">guide</a></strong> that walks through one job from start to finish.</li>' +
    '<li><strong>Search</strong> from the box at the top of any page.</li></ul>\n' +
    '<h2>What the pictures are</h2><p>Where a picture could be taken from the game, it is; each one is labelled on the entry. Where no picture has been confirmed, the subject is kept as a note rather than dressed up as a finished entry.</p>\n' +
    '<h2>What we will never do</h2><p>We do not print a number we could not verify, we do not fill a gap with a guess, and a diagram is always labelled as a diagram.</p>');
  for (const e of notes) {
    const img = imgOf(e);
    reference('reference/notes/' + e.id + '.html', e.title + ' (note)', e.summary,
      '<h1>' + esc(e.title) + '</h1>\n<p class="lead">' + esc(e.summary) + '</p>\n<p class="note"><strong>No confirmed picture from the game yet.</strong> This subject is kept as a note for now: the facts below are verified against the game\'s own files, but no image has been confirmed for it, so it is not published as a finished entry and is kept out of search engines.</p>\n' +
      (img ? '<figure><img src="/' + esc(img.file) + '" alt="' + esc(img.alt?.en ?? '') + '" width="720" height="420"><figcaption class="dim small">' + esc(img.disclaimer ?? 'Original diagram drawn for this site. It is not a screenshot of the game.') + '</figcaption></figure>' : '') +
      '<h2>What the game establishes</h2><ul class="verified">' + (e.facts ?? []).map((f) => '<li>' + esc(f.claim) + '</li>').join('') + '</ul>\n' +
      '<h2>In play</h2>' + (e.body ?? []).map((p) => '<p>' + esc(p) + '</p>').join('') + '\n' +
      '<p><a href="/entities/">Back to the entities</a> · <a href="/reference/">Technical reference</a></p>');
  }
  reference('reference/notes/index.html', 'Notes', 'Subjects waiting for a confirmed picture from the game.',
    '<h1>Notes</h1><p class="lead">These subjects are documented from the game\'s own files, but no picture has been confirmed for them yet, so they are notes rather than finished entries.</p><ul>' +
    notes.map(noteRow).join('') + '</ul><p><a href="/reference/">Technical reference</a></p>');

  // ---- guides ------------------------------------------------------------------------------------
  for (const a of articles) {
    const related = (a.relatedEntities ?? []).filter((id) => byId.has(id));
    indexable('articles/' + a.id + '.html', a.title, a.target,
      '<article class="entry"><p class="kicker">Guide</p>\n<h1>' + esc(a.title) + '</h1>\n<p class="lead">' + esc(a.target) + '</p>\n' +
      '<h2>Applies to</h2><p class="dim">' + esc(a.version ?? SITE.versionBadge) + '</p>\n' +
      '<h2>Before you start</h2><ul>' + (a.prerequisites ?? []).map((p) => '<li>' + esc(p) + '</li>').join('') + '</ul>\n' +
      '<h2>Steps</h2><ol class="steps">' + (a.steps ?? []).map((s) => '<li><strong>' + esc(s.do) + '</strong><br><span class="dim small">' + esc(whyOf(s.because)) + '</span></li>').join('') + '</ol>\n' +
      '<h2>Common mistakes</h2><ul>' + (a.commonMistakes ?? []).map((m) => '<li>' + esc(m) + '</li>').join('') + '</ul>\n' +
      (related.length ? '<h2>Related entries</h2><div class="grid">' + related.map((id) => card(byId.get(id))).join('') + '</div>' : '') +
      '<h2>Sources</h2><p class="dim small">' + esc((a.sources ?? []).join(' ')) + '</p></article>');
  }
  indexable('articles/index.html', 'Guides', 'Step-by-step guides for a run, each grounded in what the game itself establishes.',
    '<h1>Guides</h1><p class="lead">Each guide has a goal, the build it applies to, what you need first, the steps and the mistakes people make. Every step says why it works.</p>\n' +
    '<div class="grid">' + articles.map((a) => '<a class="card qcard" href="/articles/' + esc(a.id) + '.html">' +
      (questions[a.id] ? '<strong>' + esc(questions[a.id]) + '</strong><span>' + esc(a.title) + '</span>' : '<strong>' + esc(a.title) + '</strong>') +
      '<span class="dim">' + esc(a.target) + '</span></a>').join('') + '</div>');

  // ---- tools and updates -------------------------------------------------------------------------
  indexable('tools/index.html', 'Tools', 'Search boxes and checkers for looking something up on this site.',
    '<h1>Tools</h1><p class="lead">The tools here run in your browser; nothing you type is sent anywhere.</p>\n<div class="grid">' +
    '<a class="card" href="/search.html"><strong>Search field names</strong><span class="dim">Search the field names the game writes, by name, type or the class that declares them.</span></a>' +
    '<a class="card" href="/reference/tool.html"><strong>Field lookup</strong><span class="dim">Ask which class declares a field.</span></a>' +
    '<a class="card" href="/articles/"><strong>Guides</strong><span class="dim">Step-by-step write-ups for one job at a time.</span></a>' +
    '</div><p class="dim small">These utilities report what the game\'s files contain. They are not part of the player reference and carry no advice.</p>');
  indexable('updates.html', 'Updates', 'What has been added to this site, newest first.',
    '<h1>Updates</h1><p class="lead">What has been added, newest first. Entries are added only when a fact has been checked against the game or a picture confirmed.</p>\n' +
    (playerUpdates.length ? '<ul class="updates">' + playerUpdates.map((u) => '<li><span class="when">' + esc(u.date) + '</span> <a href="' + esc(u.url) + '">' + esc(u.title) + '</a> <span class="dim small">' + esc(u.kind ?? '') + '</span></li>').join('') + '</ul>' : '<p class="dim">No update notes yet.</p>') +
    '<p class="dim small">Notes for subjects that have no confirmed picture yet are listed in the technical reference, which is reachable from the footer.</p>');

  // ---- evidence layer (unchanged content, footer only) --------------------------------------------
  const classes = (inv.classes ?? []).slice().sort((a, b) => b.written - a.written);
  const used = new Set();
  const slugs = classes.map((c) => { const base = slug(c.name); let s = base, n = 2; while (used.has(s)) s = base + '-' + n++; used.add(s); return s; });
  reference('reference/collection.html', 'All names', 'Every P0 class with the fields the game writes.',
    '<h1>P0 classes <span class="dim">(' + classes.length + ')</span></h1><p class="dim">Reference pages. Each is marked noindex and kept out of the sitemap.</p><table><thead><tr><th>Name</th><th>Base</th><th>Written</th></tr></thead><tbody>' +
    classes.map((c, i) => '<tr><td><a href="/entity/' + slugs[i] + '.html">' + esc(c.name) + '</a></td><td class="mono dim">' + esc(c.base ?? '-') + '</td><td>' + c.written + '</td></tr>').join('') + '</tbody></table>');
  {
    const enemyEnums = (inv.enums ?? []).filter((e) => /card|rarity|state|type/i.test(e.name)).slice(0, 8);
    const enemyClasses = classes.filter((c) => /Card/.test(c.name)).slice(0, 80);
    reference('reference/cards.html', 'Card data - rarities, states and classes', 'The card rarities, states and shop systems the game defines.',
      '<h1>Card data</h1><div class="note">The enum values below are read from the game\'s own assembly, so they are the game\'s own numbers. Per-instance values such as a card price are listed only where this build decoded them; everything else is unknown rather than guessed.</div>' +
      enemyEnums.map((e) => '<h2 class="mono">' + esc(e.name) + ' <span class="dim">(' + e.members.length + ' values)</span></h2><table><tbody>' +
        e.members.map((m) => '<tr><td class="mono">' + esc(m.name) + '</td><td class="mono dim">' + m.value + '</td></tr>').join('') + '</tbody></table>').join('') +
      (enemyClasses.length ? '<h2>Card classes <span class="dim">(' + enemyClasses.length + ')</span></h2><table><thead><tr><th>Name</th><th>Written fields</th></tr></thead><tbody>' +
        enemyClasses.map((c) => '<tr><td class="mono">' + esc(c.name) + '</td><td>' + c.written + '</td></tr>').join('') + '</tbody></table>' : ''));
  }
  for (let ci = 0; ci < classes.length; ci++) {
    const c = classes[ci];
    reference('entity/' + slugs[ci] + '.html', c.name + ' - reference', c.name + ': ' + c.written + ' written fields read from the game assembly.',
      '<h1 class="mono">' + esc(c.name) + '</h1><div class="note">This is a <strong>reference page</strong>, marked noindex: it lists what the class declares and which of it the game writes at runtime. It is material for checking our entries, not a player-facing answer.</div>' +
      '<p class="dim">namespace <span class="mono">' + esc(c.namespace || '-') + '</span> · base <span class="mono">' + esc(c.base || '-') + '</span> · declared ' + c.declared + ' · written ' + c.written + '</p>' +
      '<p class="dim small">Read from <span class="mono">' + esc(inv.source?.assembly ?? '') + '</span> · game version ' + esc(inv.version ?? '') + '</p>' +
      '<h2>Written fields</h2><table><thead><tr><th>Field</th><th>Type</th><th>Kind</th><th>Confidence</th><th>Value</th></tr></thead><tbody>' +
      c.fields.map((f) => '<tr><td class="mono">' + esc(f.name) + '</td><td class="mono dim">' + esc(f.type) + '</td><td class="dim">' + esc(f.kind) + '</td><td class="dim">' + esc(f.confidence ?? '-') + '</td><td class="mono dim">' + esc(f.value === null || f.value === undefined ? 'unknown' : String(f.value)) + '</td></tr>').join('') +
      '</tbody></table>');
  }
  if ((inv.enums ?? []).length) {
    reference('reference/enums.html', 'Enums', 'Enumerations and their values, read from the game assembly.',
      '<h1>Enums <span class="dim">(' + inv.enums.length + ')</span></h1>' + inv.enums.map((e) =>
        '<h2 class="mono">' + esc(e.name) + ' <span class="dim">' + e.members.length + ' members</span></h2><table><tbody>' +
        e.members.map((m) => '<tr><td class="mono">' + esc(m.name) + '</td><td class="mono dim">' + m.value + '</td></tr>').join('') + '</tbody></table>').join(''));
  }
  {
    const instPath = inventoryPath.replace('p0-inventory.json', 'p0-instances.json');
    let inst = null;
    try { inst = JSON.parse(readFileSync(instPath, 'utf8')); } catch (e) { inst = null; }
    const list = (inst && inst.instances) ? inst.instances : [];
    const grouped = {};
    for (const it of list) { if (!grouped[it.class]) grouped[it.class] = []; grouped[it.class].push(it); }
    const names = Object.keys(grouped);
    const rows = names.slice(0, 40).map((cls) => {
      const items = grouped[cls];
      return '<h2 class="mono">' + esc(cls) + ' <span class="dim">(' + items.length + ')</span></h2>' +
        '<table><thead><tr><th>Object</th><th>Decoded fields</th></tr></thead><tbody>' +
        items.slice(0, 20).map((x) => '<tr><td class="mono dim">' + esc(x.pathId) + '</td><td class="mono">' + esc((x.values || []).map((v) => v.name + '=' + String(v.value)).join('  ')) + '</td></tr>').join('') + '</tbody></table>';
    }).join('');
    reference('reference/values.html', 'Decoded values', 'Field values decoded from the game\'s own files, one row per object.',
      '<h1>Decoded values <span class="dim">(' + list.length + ' objects)</span></h1>' +
      '<div class="note">Each row is one object read out of the game\'s own files. Its class was accepted only because the measured layout consumed that object\'s payload exactly, so these are the game\'s values rather than estimates.</div>' +
      (list.length === 0 ? '<p class="dim">No object in this build decoded yet.</p>' : rows + (names.length > 40 ? '<p class="dim">Showing 40 of ' + names.length + ' classes.</p>' : '')));
  }
  indexable('search.html', 'Search', 'Search every field name the game defines, in your browser.',
    '<h1>Search</h1><p class="dim">Client-side over ' + (inv.totals?.fields ?? 0) + ' fields. No network requests.</p>' +
    '<p><input id="q" type="search" placeholder="field or class" autocomplete="off"> <span id="status" class="dim"></span></p><ul id="out"></ul>' +
    '<script>var F=' + JSON.stringify(lookupFields(inv, '', 200)) + ';var q=document.getElementById("q"),o=document.getElementById("out"),s=document.getElementById("status");' +
    'var draw=function(){var v=q.value.trim().toLowerCase();var r=!v?F.slice(0,50):F.filter(function(x){return x.field.toLowerCase().indexOf(v)>=0||x.class.toLowerCase().indexOf(v)>=0||String(x.type).toLowerCase().indexOf(v)>=0});' +
    's.textContent=v?(r.length+" match(es)"):("Showing first 50 of "+F.length+" indexed fields");' +
    'o.innerHTML=r.slice(0,50).map(function(x){return "<li>"+x.class+" <span class=dim>"+x.field+": "+x.type+"</span></li>"}).join("")};' +
    'var pre=new URLSearchParams(location.search).get("q");if(pre)q.value=pre;q.addEventListener("input",draw);draw();</script>');
  reference('reference/tool.html', 'Field lookup', 'Find which class declares a field.',
    '<h1>Field lookup</h1><p>Enter a field or type fragment; the tool searches the extracted field tables only, and never guesses a value.</p>' +
    '<p><input id="q" type="search" placeholder="field or type" autocomplete="off"> <span id="s" class="dim"></span></p><div id="o"></div>' +
    '<script>var F=' + JSON.stringify(lookupFields(inv, '', 200)) + ';var q=document.getElementById("q"),s=document.getElementById("s"),o=document.getElementById("o");' +
    'var draw=function(){var v=q.value.trim().toLowerCase();var rows=!v?F.slice(0,20):F.filter(function(x){return x.field.toLowerCase().indexOf(v)>=0||String(x.type).toLowerCase().indexOf(v)>=0});' +
    's.textContent=v?(rows.length+" match(es)"):"empty query - showing the first 20 indexed fields";' +
    'o.innerHTML=rows.slice(0,50).map(function(x){return "<div><span class=mono>"+x.field+"</span> <span class=dim>"+x.type+" - "+x.class+"</span></div>"}).join("")};q.addEventListener("input",draw);draw();</script>');
  reference('reference/sources.html', 'Sources', 'Where every number came from.',
    '<h1>Sources</h1><div class="note">Every value in this build traces to a file on the Windows machine that produced it. Nothing is community-sourced and nothing is estimated.</div>' +
    '<h2>Assembly</h2><p class="mono">' + esc(inv.source?.assembly ?? '') + '</p><h2>Extractor</h2><p class="mono">' + esc(inv.source?.extractor ?? '') + '</p>' +
    '<h2>Extracted at</h2><p class="mono">' + esc(inv.source?.extractedAt ?? '') + '</p><h2>Game version</h2><p>' + esc(inv.version ?? '') + '</p>' +
    '<h2>Per-field provenance</h2><p>' + esc(inv.provenance?.fields ?? 'source, version, checkedAt, confidence, value') + '</p>' +
    '<h2>Not extracted (unknown)</h2><p>' + esc(inv.provenance?.values ?? 'Per-field values are listed only where the object decoded; everything else is marked unknown.') + '</p>');
  reference('reference/index.html', 'Technical reference', 'Identifiers, tables and provenance for modders. Not indexed.',
    '<h1>Technical reference</h1><p class="lead">For modders and for checking our data. Deliberately kept out of search engines: it lists identifiers read from the game\'s files, which are useful to a modder but are not answers to a player\'s question.</p><ul>' +
    '<li><a href="/reference/collection.html">All names</a></li><li><a href="/reference/cards.html">Card data</a></li><li><a href="/reference/enums.html">Enums</a></li>' +
    '<li><a href="/reference/values.html">Decoded values</a></li><li><a href="/search.html">Search</a></li><li><a href="/reference/tool.html">Field lookup</a></li><li><a href="/reference/sources.html">Sources and method</a></li>' +
    '<li><a href="/reference/notes/">Notes waiting for a confirmed picture</a></li></ul>' +
    '<p><a href="/entities/">Back to the player reference</a></p>');

  // ---- legal ---------------------------------------------------------------------------------------
  indexable('about.html', 'About', 'About this site and how it is built.',
    '<h1>About</h1><p>This site is a player-written reference for ' + esc(SITE.gameName) + '. It is generated by a static build; there is no database behind it.</p>' +
    '<h2>Method</h2><p>No page on this site is hand-written from memory. Everything shown is produced by the build from the files listed on the <a href="/reference/sources.html">sources page</a>. When the build cannot read something, it says so.</p>' +
    '<h2>What is on which layer</h2><p>The player reference — entities, guides, the game guide and the tools — is what the site is for. Identifiers, tables and extraction notes are an evidence layer behind the <a href="/reference/">technical reference</a>, kept out of search engines on purpose.</p>');
  indexable('contact.html', 'Contact', 'How to report a wrong value.',
    '<h1>Contact</h1><p>Corrections are welcome. Report the page, the claim and what the game actually does; corrections that cannot be checked against the game files cannot be used.</p><p>There is no form and no server behind this site.</p>');
  indexable('disclaimer.html', 'Disclaimer', 'No affiliation; game images are used only to identify items.',
    '<h1>Disclaimer</h1><p>Not affiliated with, endorsed by, or sponsored by the game\'s developer or publisher. Game names and marks belong to their owners.</p>' +
    '<p>Some images are taken from the game to identify the item they belong to; those images remain the property of the developer. Diagrams drawn for this site are labelled as diagrams and are not screenshots.</p>');
  indexable('privacy.html', 'Privacy', 'No cookies, no tracking, no third-party requests.',
    '<h1>Privacy</h1><p>This static build sets no cookies, runs no analytics and makes no third-party requests. The search and lookup tools run entirely in your browser over data embedded in the page or fetched from this site.</p>');
  indexable('terms.html', 'Terms', 'Use of this site.',
    '<h1>Terms</h1><p>Provided as-is for personal reference. Data may change as the game patches; each build records the version it was read from.</p>');

  write('404.html', layout('Not found', 'Page not found.', '/404.html', '<h1>Page not found</h1><p>Try the <a href="/entities/">entities</a> or the search box at the top of the page.</p>').replace('content="index, follow"', 'content="noindex, follow"'));

  // ---- machine-readable ------------------------------------------------------------------------------
  // Old top-level addresses keep working: each is a noindex stub that points at the reference page now.
  const stub = (oldRel, newPath, title) => {
    const html = layout(title + ' (moved)', 'This page has moved into the technical reference.', '/' + oldRel,
      '<h1>' + esc(title) + '</h1><p class="note">This page has moved into the <a href="' + newPath + '">technical reference</a>. The address was kept so an old link still lands somewhere useful.</p>')
      .replace('content="index, follow"', 'content="noindex, follow"')
      .replace('<link rel="canonical" href="' + SITE.url + '/' + oldRel + '">', '<link rel="canonical" href="' + SITE.url + newPath + '">')
      .replace('<head>', '<head>\n<meta http-equiv="refresh" content="0; url=' + newPath + '">');
    write(oldRel, html);
  };
  for (const [oldRel, name, title] of [
    ['collection.html', 'collection', 'All names'], ['cards.html', 'cards', 'Card data'], ['enums.html', 'enums', 'Enums'],
    ['values.html', 'values', 'Decoded values'], ['tool.html', 'tool', 'Field lookup'], ['sources.html', 'sources', 'Sources'],
  ]) stub(oldRel, '/reference/' + name + '.html', title);

  write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => '  <loc>' + u + '</loc>\n').join('') + '</urlset>\n');
  write('robots.txt', 'User-agent: *\nAllow: /\nSitemap: ' + SITE.url + '/sitemap.xml\n');
  // ---- the Mac design shell -------------------------------------------------------------------------
  // favicon, brand mark and the whole stylesheet come from the Mac design integration (8c1312f) and its
  // verified in-game homepage imagery (6169d5e). The Windows copy of the shell hard-coded the sibling site's
  // red accent; here the accent is read from SITE so mark, theme and buttons cannot drift apart.
  write('favicon.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="' + SITE.accent + '"/><rect x="18" y="16" width="28" height="34" rx="4" fill="none" stroke="' + SITE.accentInk + '" stroke-width="4"/><path d="M18 28h28" stroke="' + SITE.accentInk + '" stroke-width="4"/></svg>' + String.fromCharCode(10));
  write('brand.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="' + esc(SITE.name) + '"><rect width="64" height="64" rx="14" fill="' + SITE.accent + '"/><rect x="16" y="14" width="32" height="38" rx="5" fill="none" stroke="' + SITE.accentInk + '" stroke-width="4"/><path d="M16 27h32M26 14v38" stroke="' + SITE.accentInk + '" stroke-width="4"/></svg>\n');
  write('style.css', [
    ':root{--bg:#111619;--fg:#f0f6f4;--dim:#a0b2ad;--line:#34504b;--accent:' + SITE.accent + ';--accent-ink:' + SITE.accentInk + ';--panel:#1b2928}',
    '*{box-sizing:border-box}',
    'body{margin:0;background:radial-gradient(circle at 80% 0,#203b39,transparent 30rem),var(--bg);color:var(--fg);font:16px/1.65 system-ui,Segoe UI,Roboto,sans-serif}',
    'a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}',
    '.skip{position:absolute;left:-9999px}',
    'header.top{position:sticky;top:0;z-index:20;background:rgba(17,22,25,.9);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}',
    '.bar{max-width:1180px;margin:auto;padding:14px 24px;display:flex;align-items:center;gap:28px;flex-wrap:wrap}',
    '.brand{color:var(--fg);font-weight:800;display:flex;gap:10px;align-items:center;white-space:nowrap}',
    '.brand:hover{text-decoration:none}',
    '.mark{display:grid;place-items:center;min-width:42px;height:34px;border-radius:9px;background:var(--accent);color:var(--accent-ink);font-size:12px;letter-spacing:.02em}',
    'nav.main{display:flex;gap:18px;flex-wrap:wrap;font-size:14px}',
    'nav.main a{color:var(--dim);padding:2px 0;border-bottom:2px solid transparent}',
    'nav.main a:hover{color:var(--fg);text-decoration:none}',
    'nav.main a.on{color:var(--fg);border-bottom-color:var(--accent)}',
    '.hsearch{display:flex;gap:8px;margin-left:auto}.hsearch input{min-width:14rem}',
    'main{max-width:1180px;margin:auto;padding:0 24px 70px}',
    'h1{font-size:clamp(2.2rem,4vw,3rem);line-height:1.05;letter-spacing:-.02em;margin:22px 0 14px}',
    'h2{font-size:1.5rem;line-height:1.15;margin:36px 0 12px}',
    '.lead{font-size:1.18rem;color:#d6e4df;max-width:38rem}',
    '.dim{color:var(--dim)}.small{font-size:.86rem}',
    '.mono{font-family:ui-monospace,Consolas,monospace}',
    '.eyebrow{color:var(--accent);font-size:12px;letter-spacing:.12em;text-transform:uppercase;margin:0}',
    '.kicker{color:var(--accent);font-size:12px;letter-spacing:.12em;text-transform:uppercase;margin:0 0 4px}',
    '.hero{padding:70px 0 56px;display:grid;grid-template-columns:1.05fr .95fr;gap:46px;align-items:center;border-bottom:1px solid var(--line)}',
    '.hero h1{font-size:clamp(3rem,7vw,5.6rem);line-height:.9;letter-spacing:-.06em;margin:10px 0 22px;max-width:9ch}',
    '.hero-media{min-height:380px;margin:0;position:relative;border:1px solid #386b64;border-radius:22px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.3);transform:rotate(1.2deg);background:var(--panel)}',
    '.hero-media img{display:block;width:100%;height:380px;object-fit:cover}',
    '.hero-media figcaption,.feature-card figcaption{position:absolute;left:0;right:0;bottom:0;padding:12px 16px;background:linear-gradient(transparent,rgba(0,0,0,.8));color:#e8fffa;font-size:12px}',
    '.hero-search{display:flex;gap:8px;margin:28px 0 16px}.hero-search input{flex:1}',
    'input[type=search]{padding:12px 14px;background:var(--panel);border:1px solid var(--line);border-radius:10px;color:var(--fg);font:inherit}',
    'input[type=search]:focus{outline:2px solid var(--accent);outline-offset:1px}',
    'button,.button{padding:12px 16px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--fg);font:inherit;font-weight:700;cursor:pointer}',
    '.button{display:inline-block}.button:hover{text-decoration:none;border-color:var(--accent)}',
    '.primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}',
    '.actions{display:flex;gap:10px;flex-wrap:wrap}',
    '.section{padding:54px 0;border-bottom:1px solid var(--line)}.section h2{margin-top:0}',
    '.split{display:grid;grid-template-columns:.9fr 1.1fr;gap:54px;align-items:center}',
    '.feature-card{position:relative;margin:0;max-width:520px;border:1px solid var(--line);border-radius:22px;overflow:hidden;background:var(--panel);box-shadow:0 24px 70px rgba(0,0,0,.25);transform:rotate(-1.2deg)}',
    '.feature-card img{display:block;width:100%;height:280px;object-fit:cover}',
    '.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(15rem,1fr));gap:14px;margin:14px 0}',
    '.card{display:flex;flex-direction:column;gap:8px;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px;color:var(--fg);transition:transform .2s,border-color .2s}',
    '.card:hover{transform:translateY(-4px);border-color:var(--accent);text-decoration:none}',
    '.card img{width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:9px;background:#0b0f0e}',
    '.card strong{font-size:1rem}.card .dim{font-size:.9rem}',
    '.chip{align-self:flex-start;font-size:11px;color:var(--accent);border:1px solid var(--line);border-radius:999px;padding:2px 10px;letter-spacing:.04em}',
    '.qgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(17rem,1fr));gap:12px;margin:14px 0}',
    '.qcard{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:6px;color:var(--fg);transition:transform .2s,border-color .2s}',
    '.qcard:hover{transform:translateY(-4px);border-color:var(--accent);text-decoration:none}',
    '.filter{display:flex;gap:10px;align-items:center;margin:20px 0;flex-wrap:wrap}',
    '.updates{list-style:none;padding:0;margin:14px 0}.updates li{padding:10px 0;border-bottom:1px solid var(--line)}',
    '.when{color:var(--dim);font-size:13px;margin-right:8px}',
    '.entry{max-width:44rem}',
    '.heroimg{margin:0 0 20px}.banner{margin:0 0 20px}',
    '.heroimg img,.banner img{width:100%;height:auto;display:block;border-radius:14px;border:1px solid var(--line)}',
    '.heroimg figcaption,.banner figcaption{font-size:12px;margin-top:8px}',
    '.oneline{font-size:1.1rem;background:var(--panel);border-left:3px solid var(--accent);border-radius:0 10px 10px 0;padding:14px 18px;max-width:44rem;margin:18px 0}',
    '.facts{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px 18px;max-width:44rem}',
    '.facts h2{font-size:1.1rem;margin:0 0 8px}',
    '.facts dl{display:grid;grid-template-columns:max-content 1fr;gap:6px 18px;margin:0}.facts dt{color:var(--dim)}.facts dd{margin:0}',
    '.verified li,.steps li{margin:8px 0}',
    '.note{border-left:3px solid var(--accent);background:var(--panel);padding:14px 18px;border-radius:0 10px 10px 0;margin:18px 0;max-width:44rem}',
    '.notes ul{padding-left:1.2rem}.notes li{margin:8px 0}',
    'table{border-collapse:collapse;width:100%;font-size:14px}',
    'th,td{border-bottom:1px solid var(--line);text-align:left;padding:9px 8px}',
    'footer.foot{border-top:1px solid var(--line);padding:0 0 40px;margin-top:54px}',
    'footer.foot .wrap{max-width:1180px;margin:auto;padding:24px 24px 0}',
    'footer.foot p{margin:.4rem 0}',
    '@media(max-width:800px){.bar{padding:12px 16px;flex-direction:column;align-items:flex-start;gap:10px}.hsearch{margin-left:0;width:100%}.hsearch input{min-width:0;flex:1}main{padding:0 16px 46px}.hero{grid-template-columns:1fr;padding:50px 0 42px}.hero h1{font-size:clamp(2.4rem,11vw,4rem)}.hero-media{min-height:260px;transform:none}.hero-media img{height:260px}.split{grid-template-columns:1fr;gap:26px}.feature-card{transform:none}footer.foot .wrap{padding:20px 16px 0}}',
    '@media(max-width:520px){.grid,.qgrid{grid-template-columns:1fr}}',
  ].join('\n') + '\n');

  // ---- assets -----------------------------------------------------------------------------------------
  let assetCount = 0;
  const mappedCount = { n: 0 };
  const copyDir = (src, rel) => {
    if (!existsSync(src)) return;
    for (const entry of readdirSync(src, { withFileTypes: true })) {
      const child = join(src, entry.name);
      const childRel = rel ? rel + '/' + entry.name : entry.name;
      if (entry.isDirectory()) { copyDir(child, childRel); continue; }
      if (entry.name === 'README.txt') continue;
      const dest = join(outDir, childRel);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, readFileSync(child));
      assetCount++;
      if (childRel.startsWith('mapped/')) mappedCount.n++;
    }
  };
  // web/assets is the design-owned folder from the Mac design commits (homepage imagery); it is published
  // under /assets/ exactly as that design referenced it. content/assets holds the mapped game pictures and the
  // entry diagrams, published at the root as mapped/... because the content files reference them that way.
  copyDir(join(process.cwd(), 'web/assets'), 'assets');
  copyDir(join(process.cwd(), 'content/assets'), '');
  return { pages: pages.size, urls: urls.length, outDir, schemaPages: [...pages.keys()].filter(isNoindexPage).length, assets: assetCount, mappedImages: mappedCount.n, entities: entities.length, notes: notes.length };
}

if (process.argv[1] && process.argv[1].endsWith('site.mjs')) {
  const inventory = process.env.REPO_INVENTORY || 'data/normalized/p0-inventory.json';
  const out = process.env.REPO_OUT || 'web/dist';
  if (!existsSync(inventory)) { console.error('missing inventory: ' + inventory); process.exit(2); }
  const r = build(inventory, out);
  console.log('[site] pages=' + r.pages + ' indexable=' + r.urls + ' schema(noindex)=' + r.schemaPages + ' out=' + r.outDir);
}