// P0 instance extraction: read MonoBehaviour values out of the game's own SerializedFiles.
// Method reused from the reference pipeline (assembly field layouts + measured MonoBehaviour layout + the rule
// that a decode is only accepted when it consumes the object's bytes exactly). No other game's data is used.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { readSerializedFile } from './serialized.ts';
import { parseAssembly, monoBehaviourClass, unitySerializedFields, fieldTypeName, decodeFieldSignature } from './dotnet-metadata.ts';
import { readMonoBehaviourHeader, decodePrimitiveFields, PRIMITIVE_FIELD_SIZES } from './mono-layout.ts';

const DATA = 'C:/uTorria/Downloads/TCG Card Shop Simulator/Card Shop Simulator_Data';
const DLL = DATA + '/Managed/Assembly-CSharp.dll';
const OUT = 'C:/Users/CHEN/Desktop/tcg-shop/data/normalized/p0-instances.json';
const MONO_BEHAVIOUR = 114, MONO_SCRIPT = 115;
const FILES = ['level1', 'resources.assets', 'sharedassets0.assets', 'sharedassets1.assets'];
const RE = /card|pack|price|shop|upgrade|customer|econom|inventory|stock|product|booster|rarity|expansion|market|shelf|checkout|order|money|cost/i;
const PER_CLASS_CAP = 60;

if (!existsSync(DLL)) { console.error('assembly missing'); process.exit(2); }
const asm = parseAssembly(DLL);
for (const t of asm.types) void t;
const enums: { name: string; members: { name: string; value: number }[] }[] = [];
for (const t of asm.types) {
  if (t.baseType !== 'Enum') continue;
  const members = t.fields.filter((f) => f.name !== 'value__' && f.constant !== undefined).map((f) => ({ name: f.name, value: f.constant as number }));
  if (members.length >= 2 && RE.test(t.name)) enums.push({ name: t.name, members });
}

const instances: Record<string, unknown[]> = {};
const stats: Record<string, { decoded: number; refused: number; reasons: Record<string, number> }> = {};
const seen: Record<string, number> = {};
const sources: string[] = [];
for (const name of FILES) {
  const path = DATA + '/' + name;
  if (!existsSync(path)) continue;
  let sf;
  try { sf = readSerializedFile(path); } catch (e) { console.error('skip ' + name + ': ' + (e as Error).message.slice(0, 60)); continue; }
  sources.push(name);
  const byPath = new Map<string, { classId: number; fileOffset: number; byteSize: number }>();
  for (const o of sf.objects) byPath.set(String(o.pathId), o);
  const buf = require('node:fs').readFileSync(path);
  const cls = (o: { fileOffset: number; byteSize: number }): string => {
    let p = o.fileOffset; const end = o.fileOffset + o.byteSize;
    if (p + 4 > end) return '';
    const len = buf.readInt32LE(p);
    if (len <= 0 || len > 512 || p + 4 + len > end) return '';
    return buf.subarray(p + 4, p + 4 + len).toString('utf8');
  };
  for (const o of sf.objects) {
    if (o.classId !== MONO_BEHAVIOUR) continue;
    const payload = buf.subarray(o.fileOffset, o.fileOffset + o.byteSize);
    const h = readMonoBehaviourHeader(payload);
    if (!h) continue;
    const script = byPath.get(String(h.scriptPathId));
    if (!script || script.classId !== MONO_SCRIPT) continue;
    const className = cls(script);
    if (!className || !RE.test(className)) continue;
    if (!monoBehaviourClass(asm, className)) continue;
    const s = stats[className] ?? (stats[className] = { decoded: 0, refused: 0, reasons: {} });
    const body = payload.subarray(h.bytes);
    const r = decodePrimitiveFields(asm, className, body);
    if (!r) { s.refused++; s.reasons['layout-not-measured-or-size-mismatch'] = (s.reasons['layout-not-measured-or-size-mismatch'] ?? 0) + 1; continue; }
    s.decoded++;
    const n = seen[className] ?? 0;
    if (n >= PER_CLASS_CAP) continue;
    seen[className] = n + 1;
    (instances[className] ??= []).push({
      source: name, pathId: String(o.pathId), enabled: h.enabled, name: h.name,
      values: r.values, confidence: 'extracted',
    });
  }
}
mkdirSync(dirname(OUT), { recursive: true });
const extractedAt = new Date().toISOString();
writeFileSync(OUT, JSON.stringify({
  game: 'TCG Card Shop Simulator', engine: 'unity', scriptBackend: 'mono',
  version: 'OPNeonGames | Card Shop Simulator (app.info)',
  source: { assembly: 'Managed/Assembly-CSharp.dll', files: sources, extractor: 'tcg-p0-instances@0.1.0', extractedAt },
  enums, instances, stats,
}, null, 2), 'utf8');
const decodedClasses = Object.keys(instances).length;
const decodedInstances = Object.values(instances).reduce((n, a) => n + a.length, 0);
console.log('files=' + sources.join(',') + ' classesWithValues=' + decodedClasses + ' instances=' + decodedInstances + ' enums=' + enums.length);
const top = Object.entries(stats).sort((a, b) => b[1].decoded - a[1].decoded).slice(0, 12);
for (const [k, v] of top) console.log('  ' + k.padEnd(30) + ' decoded=' + String(v.decoded).padStart(4) + ' refused=' + String(v.refused).padStart(4) + '  ' + JSON.stringify((instances[k] ?? [])[0]?.values ?? []).slice(0, 120));
for (const e of enums.slice(0, 6)) console.log('  enum ' + e.name + ' members=' + e.members.length + ' e.g. ' + e.members.slice(0, 4).map((m) => m.name + '=' + m.value).join(','));