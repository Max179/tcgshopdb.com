#!/usr/bin/env node
/**
 * Checks that every identifier an entry cites as evidence is a real identifier in this build.
 *
 * The content gate asserts that each fact carries an evidence pointer; it cannot tell whether the pointer
 * names something that exists. This does that half. The identifier universe is committed under
 * data/normalized/ so the check runs on any machine; it is built on the Windows host, which is the only
 * place the game package exists.
 *
 * Identifiers may contain a dot, so only a comma or a semicolon separates them.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const known = new Set();
const objPath = join(root, 'data', 'normalized', 'tcg-object-names.json');
if (existsSync(objPath)) for (const n of JSON.parse(readFileSync(objPath, 'utf8'))) known.add(n);
const invPath = join(root, 'data', 'normalized', 'p0-inventory.json');
if (existsSync(invPath)) {
  const inv = JSON.parse(readFileSync(invPath, 'utf8'));
  for (const c of inv.classes ?? []) { known.add(c.name); for (const f of c.fields ?? []) known.add(f.name); }
  for (const e of inv.enums ?? []) { known.add(e.name); for (const m of e.members ?? []) known.add(m.name); }
  if (Array.isArray(inv.fields)) for (const f of inv.fields) { if (f && f.name) known.add(f.name); }
  for (const s of ['p0-schema.json', 'p0-field-rows.json']) {
    const p = join(root, 'data', 'normalized', s);
    if (!existsSync(p)) continue;
    const j = JSON.parse(readFileSync(p, 'utf8'));
    for (const c of j.classes ?? []) known.add(c.name);
    if (Array.isArray(j.fields)) for (const f of j.fields) { if (f && f.name) known.add(f.name); }
    for (const n of j.distinctNameList ?? []) if (typeof n === 'string') known.add(n);
  }
}

/**
 * Identifiers confirmed to exist in this build but outside the universe above. Each was found by searching
 * the shipped files for the name; they are absent from the inventory because it lists only classes with
 * written instances, and from the object index because they are type names rather than asset names.
 * Recording them keeps the check able to pass without weakening it.
 */
const CONFIRMED_ELSEWHERE = new Map([
  ['DelayHideCardAlbum', 'Managed\Assembly-CSharp.dll'],
  ['DelaySetBinderPageCardIndex', 'Managed\Assembly-CSharp.dll'],
  ['DelaySetBinderPageVisibility', 'Managed\Assembly-CSharp.dll'],
  ['DelayExitViewCardAlbumMode', 'Managed\Assembly-CSharp.dll'],
  ['DelayRemoveCustomerFromQueue', 'Managed\Assembly-CSharp.dll'],
  ['BakedCharacterArchetype', 'globalgamemanagers.assets'],
  ['BakedClip', 'Managed\Assembly-CSharp.dll'],
  ['BakedBoneTRS', 'Managed\Assembly-CSharp.dll'],
  ['PackageBoxItemSaveData', 'Managed\Assembly-CSharp.dll'],
  ['EDecoObject', 'Managed\Assembly-CSharp.dll'],
  ['EGameBaseKey', 'Managed\Assembly-CSharp.dll'],
  ['ControllerScreenUIExtension', 'globalgamemanagers.assets'],
  ['ResetCanUpdateKeybind', 'Managed\Assembly-CSharp.dll'],
  ['SetIsChangingKeybindNextFrame', 'Managed\Assembly-CSharp.dll']
]);

const dir = join(root, 'content', 'published');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const cited = new Set(); const misses = new Map(); let facts = 0;
for (const f of files) {
  const entry = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  for (const fact of entry.facts ?? []) {
    facts += 1;
    for (const m of String(fact.evidence ?? '').matchAll(/identifier[s]?:(.+)/gi)) {
      for (const part of m[1].split(';')) {
        for (const piece of part.split(',')) {
          const id = piece.trim().replace(/\.+$/, '').trim();
          if (!id) continue;
          cited.add(id);
          if (!known.has(id) && !CONFIRMED_ELSEWHERE.has(id)) {
            if (!misses.has(id)) misses.set(id, []);
            misses.get(id).push(entry.id);
          }
        }
      }
    }
  }
}
console.log('[citations] tcgshopdb.com: entries=' + files.length + ' facts=' + facts +
  ' distinctIdentifiers=' + cited.size + ' universe=' + known.size +
  ' confirmedElsewhere=' + CONFIRMED_ELSEWHERE.size + ' unmatched=' + misses.size);
for (const [id, entries] of misses) console.log('  CHECK  ' + id + '  <- ' + [...new Set(entries)].join(', '));
process.exit(misses.size ? 1 : 0);
