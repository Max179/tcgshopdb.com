# TCG: three real defects found by regenerating the inventory (2026-09-25)

Regenerating the inventory to populate the cards page exposed defects that the site tests then caught, so the commit
was refused by the gate (as designed). The tree was rolled back to the last green commit.

1. **`pipeline/inventory.ts` in tcg-shop is the R.E.P.O. script.** Its P0 regex is repo's
   (`item|valuable|enemy|...|haul`), not a card/shop one, so TCG's own enums (`ECustomerState`,
   `ECardDrawQueueType`, `ERestockSortingType` …) come back as **`enums=0`** — the very set the cards page is
   supposed to show. The 217 "candidate classes" it reports are therefore also selected by the wrong filter.
2. **The per-field provenance pass is not in the pipeline.** Field provenance
   (`source/version/checkedAt/confidence`) was applied once by an ad-hoc script; `inventory.ts` writes bare
   `{name,type,kind}`. Regenerating the inventory therefore *loses* provenance, and the gate fails with
   `every field carries per-field provenance`. It must become a step of the pipeline (or part of `inventory.ts`).
3. **The nav linked `/cards.html` while the generator wrote `enemies.html`** — a dangling link that the route tests
   did not cover (they check the required route list, not every nav target). Fixed in the working tree by writing
   `cards.html`, but the page is only emitted when enums exist, so with defect 1 it is still absent.

## What is needed (in order)
1. Give `tcg-shop/pipeline/inventory.ts` its own P0 regex (card / pack / rarity / customer / shop / upgrade /
   economy / stock / shelf / price) and re-run it → enums return → the cards page materialises.
2. Fold provenance into the pipeline so a regenerated inventory is never provenance-less. Then the gate that caught
   this stays meaningful instead of forcing a manual repair.
3. Add a **nav-links-are-built** test: every `href` in NAV must exist in the emitted pages. That is the check that
   would have caught defect 3 without a human noticing the missing page.

Current state: tcg-shop is back at its last green commit, 234 pages, 20/20 tests, tsc 0.
