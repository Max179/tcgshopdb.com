

---

## Correction (round 63, same session)

**Defect 1 above was mis-diagnosed.** `tcg-shop/pipeline/inventory.ts` *does* carry a TCG-specific P0 regex
(`card|pack|price|shop|upgrade|customer|econom|...`); it is not the R.E.P.O. script. The real cause of `enums=0` was
line 25 of that file: enums were looked up through a **hardcoded list of eight guessed names**
(`CardRarity`, `CardExpansion`, `CardType`, `ItemType`, `ShopLevel`, `Rarity`, `CardGrade`, `PriceRange`) — none of
which exist in this assembly. The fix searches the assembly instead (`baseType === 'Enum'`, `value__` excluded) and
reports **18 enums**, which is what the cards page needed.

Status of the three defects after round 63 (all committed as `5a685f7`):
| defect | state |
|---|---|
| enums found by guessing names | **fixed** — searched in the assembly, 18 found |
| provenance not in the pipeline | **fixed** — written by `inventory.ts` itself, so regeneration is non-destructive |
| dangling `/cards.html` nav link | **fixed** — the page is emitted (24,105 B, in the sitemap) and a new gate fails the build whenever a nav target is missing |

tcg-shop now builds **235 pages (14 indexable / 218 noindex)** with **21/21 tests** and `tsc 0`.
