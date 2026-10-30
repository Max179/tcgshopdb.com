# Content model — three tiers

Every page on the site comes from this folder. The build refuses to emit a tier it cannot justify.

| Tier | Folder | In sitemap | Indexable | What may be in it |
| --- | --- | --- | --- | --- |
| published | `content/published/` | yes | yes | Player-facing entries with a verified factual core: what it is, where you find it, how you get it, what it is for, prerequisites or numbers. Needs images and evidence. |
| reference | `content/reference/` | no | no (noindex) | Technical material for modders: identifiers read from the game's files. Linked from published entries, never advertised as content. |
| draft | `content/draft/` | no | not built | Work in progress. Never emitted, never linked. |

## Rules the gate enforces (`tools/content-gate.mjs`)

1. A published entry needs: a real player title (not a bare identifier), a factual summary of at least 80 characters that answers a question, at least two body paragraphs, at least one fact with an evidence pointer, at least one image, at least one related entry, a version/source note, English **and** Chinese alt text for every image.
2. Prose in published entries may not contain internal implementation terms (the gate holds a banned-word list: IL2CPP, SerializedFile, PPtr, schema, metadata, payload, MonoBehaviour, ScriptableObject, parser, hash, and the words class / field / namespace used as nouns).
3. Pictures must exist on disk, be a supported format, be larger than 1 KB, and be declared as either an in-game picture (`kind: "game"`, which requires a record in `content/images-manifest.json` naming its source page and rights review) or an original diagram (`kind: "diagram"`, which must say so in the entry and must never be presented as a screenshot).
4. A published entry without an image is not published: it belongs in draft or reference.
5. No placeholder text: title/summary pairs must be unique, and a summary may not be the title reworded.

## Pictures: in-game picture or labelled diagram

6. **Every published entry declares its picture tier** in `imageTier`:
   - `"game-image"` — the entry carries at least one in-game picture: an official Steam store screenshot or a file from the
     game's community wiki. The gate checks the file against `content/images-manifest.json` (source name, source page,
     original URL, licence, rights review, retrieval date, width, height, bytes, sha256), so the origin is re-checkable, and
     the sources page lists every record with a link to its source page.
   - `"diagram-only"` — no in-game picture was mapped to this entity yet. The entry must carry an original diagram whose
     disclaimer says it is not a screenshot, its page says so in a notice at the top, and it is listed apart from the featured
     entries instead of being mixed in with them.
7. **A diagram never stands in for a screenshot.** No entry may present an original illustration as a picture of the game, and
   an entity with no mapped image is not given a filler picture to make it look complete.
8. `node tools/image-coverage.mjs` writes `reports/image-coverage.md`, which lists every published entry with its tier and,
   for pictured entries, the recorded source of the picture. It exits non-zero if a used picture has no manifest record or if
   the manifest holds a record no entry uses.