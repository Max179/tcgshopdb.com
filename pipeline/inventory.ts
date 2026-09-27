// P0 inventory: which classes in the game's own assembly carry card / shop / economy state,
// and what fields they declare. Architecture and test method reused from the reference pipeline;
// no other game's data is used.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseAssembly, unitySerializedFields, fieldTypeName, decodeFieldSignature } from './dotnet-metadata.ts';

const DLL = 'C:/uTorria/Downloads/TCG Card Shop Simulator/Card Shop Simulator_Data/Managed/Assembly-CSharp.dll';
const OUT = 'C:/Users/CHEN/Desktop/tcg-shop/data/normalized/p0-inventory.json';

if (!existsSync(DLL)) { console.error('assembly not found: ' + DLL); process.exit(2); }
const asm = parseAssembly(DLL);
const RE = /card|pack|price|shop|upgrade|customer|econom|inventory|stock|product|booster|rarity|expansion|set|market|shelf|checkout|order|money|cost|value|grade/i;
const extractedAt = new Date().toISOString();
const candidates = asm.types
  .filter((t) => RE.test(t.name))
  .map((t) => {
    const written = unitySerializedFields(asm, t);
    return {
      name: t.name, namespace: t.namespace, base: t.baseType, declared: t.fields.length, written: written.length,
      fields: written.map((f) => ({
        name: f.name, type: fieldTypeName(asm, f.signature), kind: decodeFieldSignature(f.signature).kind,
        source: DLL, version: 'OPNeonGames | Card Shop Simulator (app.info)', checkedAt: extractedAt,
        confidence: 'verified-schema', value: null,
      })),
    };
  })
  .filter((c) => c.written > 0)
  .sort((a, b) => b.written - a.written);
// Enums are FOUND, not guessed: this used to be a hardcoded list of eight plausible names (CardRarity, ShopLevel,
// ...), none of which exist in this assembly, which is why the inventory reported enums=0 and the cards page was
// never emitted. value__ is the backing field, not a member.
const enums = asm.types
  .filter((t) => t.baseType === 'Enum')
  .map((t) => ({
    name: t.name,
    members: t.fields.filter((x) => x.name !== 'value__' && x.constant !== undefined).map((x) => ({ name: x.name, value: x.constant })),
  }))
  .filter((e) => e.members.length >= 2 && RE.test(e.name))
  .sort((a, b) => b.members.length - a.members.length);
mkdirSync(dirname(OUT), { recursive: true });
const payload = {
  game: 'TCG Card Shop Simulator',
  version: 'OPNeonGames | Card Shop Simulator (app.info)',
  engine: 'unity',
  scriptBackend: 'mono',
  source: { assembly: DLL, extractor: 'tcg-p0-inventory@0.2.0', extractedAt },
  totals: { types: asm.typeCount, fields: asm.fieldCount, candidateClasses: candidates.length },
  enums, classes: candidates,
};
writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');
console.log('types=' + asm.typeCount + ' fields=' + asm.fieldCount + ' candidateClasses=' + candidates.length + ' enums=' + enums.length);
console.log('top classes by written fields:');
for (const c of candidates.slice(0, 22)) console.log('  ' + c.name.padEnd(34) + ' written=' + String(c.written).padStart(3) + '  ' + c.fields.slice(0, 4).map((f) => f.name + ':' + f.type).join(', '));
for (const e of enums) console.log('  enum ' + e.name + ' members=' + e.members.length + ' e.g. ' + e.members.slice(0, 5).map((m) => m.name + '=' + m.value).join(', '));