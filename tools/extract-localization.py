#!/usr/bin/env python3
"""Extract TCG Card Shop Simulator's embedded I2 Localization tables.

The build ships no addressable localization bundles; instead resources.assets holds one
I2Languages MonoBehaviour (about 1 MB) whose term records are:

    Term:       int32 length + UTF-8 bytes + padding to 4
    <4-byte field>
    Languages:  int32 count + that many (int32 length + UTF-8 bytes + padding to 4)

Its type tree does not resolve (TypeTreeGeneratorAPI fails on the class), so the records are
read straight from the object's bytes: a record is accepted only when the term decodes, the
language count matches the asset's own language list, and every value decodes as UTF-8. The
slot -> language mapping is then checked against the script each slot actually uses, so a
wrong order cannot pass unnoticed.

    python tools/extract-localization.py "<game-data-dir>" "<out-dir>"
"""
import hashlib, json, os, re, struct, sys
import UnityPy

LANGS = 10
KANA = re.compile(r"[\u3040-\u30ff]")
HANGUL = re.compile(r"[\uac00-\ud7af]")
CJK = re.compile(r"[\u4e00-\u9fff]")


def sha256(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main():
    data_dir, out_dir = sys.argv[1], sys.argv[2]
    assets = os.path.join(data_dir, "resources.assets")
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    env = UnityPy.load(assets)
    target = None
    for obj in env.objects:
        if obj.type.name != "MonoBehaviour":
            continue
        try:
            if obj.parse_monobehaviour_head().m_Name == "I2Languages":
                target = obj
                break
        except Exception:
            continue
    if target is None:
        raise SystemExit("I2Languages not found in " + assets)
    raw = target.get_raw_data()
    print("I2Languages: %d bytes (path_id %d)" % (len(raw), target.path_id))

    def read_string(pos, limit=4096):
        if pos + 4 > len(raw):
            return None, None
        length = struct.unpack_from("<i", raw, pos)[0]
        if length < 0 or length > limit or pos + 4 + length > len(raw):
            return None, None
        try:
            text = raw[pos + 4:pos + 4 + length].decode("utf-8")
        except UnicodeDecodeError:
            return None, None
        return text, (pos + 4 + length + 3) & ~3

    # 1. language list: consecutive (Name, Code) pairs whose code is a short locale tag
    candidate = []
    languages = []
    pos = 0
    while pos < len(raw) - 8:
        name, after = read_string(pos, 120)
        if name is None or not name.strip():
            pos += 1
            continue
        code, after2 = read_string(after, 24)
        if code and re.fullmatch(r"[a-z]{2}(-[A-Za-z]{2,4})?", code):
            candidate.append((name, code))
            pos = after2
        else:
            pos += 1
    # Keep the contiguous run that starts at the source language: a stray pair earlier in the
    # object ("~ 전에"/"fa") is not part of the language list.
    start = next((i for i, (_n, c) in enumerate(candidate) if c == "en"), None)
    languages = candidate[start:start + LANGS] if start is not None else candidate
    print("languages found:", languages)

    # 2. term records
    def read_record(pos):
        term, after = read_string(pos, 512)
        if term is None or not term.strip():
            return None
        for skip in (0, 4, 8, 12):
            count_pos = after + skip
            if count_pos + 4 > len(raw) or struct.unpack_from("<i", raw, count_pos)[0] != LANGS:
                continue
            cursor, values, ok = count_pos + 4, [], True
            for _ in range(LANGS):
                value, cursor = read_string(cursor, 4096)
                if value is None:
                    ok = False
                    break
                values.append(value)
            if ok and any(values):
                return {"term": term, "values": values, "end": cursor}
        return None

    records, seen, pos = [], set(), 0
    while pos < len(raw) - 12:
        found = read_record(pos)
        if not found or found["term"] in seen:
            pos += 1
            continue
        seen.add(found["term"])
        records.append(found)
        pos = found["end"]
    print("terms parsed:", len(records))

    # 3. slot -> language: compare the language list with the script each slot uses
    profile = []
    for slot in range(LANGS):
        values = [r["values"][slot] for r in records if r["values"][slot]]
        profile.append({
            "slot": slot,
            "nonEmpty": len(values),
            "kana": sum(1 for v in values if KANA.search(v)),
            "hangul": sum(1 for v in values if HANGUL.search(v)),
            "cjk": sum(1 for v in values if CJK.search(v)),
        })
    for row in profile:
        print("  slot %d: values=%-5d kana=%-4d hangul=%-4d cjk=%d" % (row["slot"], row["nonEmpty"], row["kana"], row["hangul"], row["cjk"]))

    codes = [code for _name, code in languages] if len(languages) == LANGS else ["slot%d" % i for i in range(LANGS)]
    if len(languages) != LANGS:
        print("WARNING: the asset names %d languages, slots labelled by index" % len(languages))
    os.makedirs(out_dir, exist_ok=True)
    written = 0
    for slot, code in enumerate(codes):
        entries = {r["term"]: r["values"][slot] for r in records if r["values"][slot]}
        payload = {
            "schemaVersion": "i2-localization@1.0.0",
            "source": {
                "file": "Card Shop Simulator_Data/resources.assets",
                "sha256": sha256(assets),
                "bytes": os.path.getsize(assets),
                "object": "I2Languages",
                "pathId": target.path_id,
                "objectBytes": len(raw),
                "extractor": "tools/extract-localization.py@1.0.0",
                "engine": "I2 Localization (LanguageSourceData embedded in resources.assets)",
                "rightsStatus": "unknown",
            },
            "locale": code,
            "slot": slot,
            "languageName": languages[slot][0] if len(languages) == LANGS else None,
            "count": len(entries),
            "terms": entries,
        }
        out_name = "localization-%s.json" % re.sub(r"[^a-z0-9]+", "-", code.lower()).strip("-")
        with open(os.path.join(out_dir, out_name), "w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=1)
        written += 1
        print("locale %-6s terms=%-5d -> %s" % (code, len(entries), out_name))
    print("locales written:", written)


if __name__ == "__main__":
    main()
