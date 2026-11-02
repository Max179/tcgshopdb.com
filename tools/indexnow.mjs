#!/usr/bin/env node
/**
 * Submit the built sitemap to IndexNow (Bing/Yandex and other participating engines).
 * The key file is served at /<key>.txt; this is a public ownership marker, not a secret.
 * This is a manual publish step: it is NOT run by the build, the tests or the deploy workflow.
 */
import { readFileSync } from 'node:fs';

const base = process.argv[2] || 'https://tcgshopdb.com';
const key = readFileSync(new URL('../web/indexnow-key.txt', import.meta.url), 'utf8').trim();
const sitemap = readFileSync(new URL('../web/dist/sitemap.xml', import.meta.url), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const host = new URL(base).host;
const body = { host, key, keyLocation: base.replace(/\/$/, '') + '/' + key + '.txt', urlList: urls };
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});
console.log('[indexnow] ' + res.status + ' ' + res.statusText + ' | ' + urls.length + ' urls | key file ' + body.keyLocation);
if (![200, 202].includes(res.status)) process.exit(1);
