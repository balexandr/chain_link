# Chain Link — Design Notes

## 2026-09-03: Difficulty bump (grid 4x4 → 5x5, chain 7 → 9-10)

**Report:** user's friends solve it in 4-6 seconds once they've seen the
pattern a couple times.

**Root cause, confirmed in code before touching anything:**
- Every single shipped puzzle (all 212, `src/data/puzzles.json`) has a
  solution path of **exactly 7 cells** on a **fixed 4x4 grid**. No
  variation ever. Once a player's seen a few days, the shape of the
  problem (16 cells, 6 moves, corner-ish start/end) is fully known —
  there's nothing left to figure out except which of ~2-3 neighbors is
  the real link, and with only 16 words on screen at once that's a
  glance, not a puzzle.
- `connections` in each puzzle only encodes the intended solution edges
  (see `validatePath` in `src/hooks/useGameState.js`) — there are no
  decoy/dead-end branches. The drag UI (`src/components/Grid.jsx`)
  doesn't validate per-step either, only on submit. So a sharp player
  is really just doing rapid word-association against a tiny, fully-
  visible board with no wrong turns to filter out.

**Fix (user-selected, from 3 options presented):**
- Grid: 4x4 (16 cells) → **5x5 (25 cells)**.
- Chain length: fixed 7 → **9-10 cells** (randomized per puzzle).
- Flat harder every day (not a weekday ramp like Mirror/Pathways —
  the complaint was "always too easy," not "easy days only").
- Scope: **2026-09-04 through 2026-12-31 regenerated** (119 days).
  2026-09-03 (today) left untouched — friends already played it,
  same rule Mirror's GAME_DESIGN.md lesson establishes: never mutate
  a puzzle someone may have already solved.
- Decoy connections (fake branches that dead-end) were considered but
  not built this round — grid+length alone removes the "glance and
  solve" problem; adding real, verified decoy compound-words on top is
  a bigger content lift. Revisit if 5x5/length-9 still gets solved in
  single-digit seconds.

**Implementation:**
- `src/components/Grid.jsx` / `Grid.module.css`: grid dimensions were
  hardcoded to 4 (both the CSS `repeat(4, 1fr)` and the SVG path math's
  `100/4` cell size). Made dynamic off `puzzle.grid.length` so any
  future size works without another code change.
- `scripts/generate-puzzles.mjs` (new): a curated compound-word graph
  (~150 nodes, real verified English compounds/phrases, same style as
  the original FIRE→PLACE→MAT chain) + random-walk puzzle generator.
  For each date: walks the graph for a 9-10 word unique chain, threads
  a self-avoiding path of that length onto the 5x5 grid, fills the
  remaining 15-16 cells with other graph words (unused ones from the
  same pool, not required to connect to anything — the game only ever
  checks the explicit `connections` list, never a live dictionary, so
  filler words can't accidentally create a false-valid move; they're
  just visual noise). Verifies every generated puzzle before writing:
  adjacency holds along the whole solution, no duplicate words on one
  grid, `connections` has an entry for every solution edge.
- Old 4x4/length-7 puzzles (2026-06-03 through 2026-09-03) are left
  as-is in `puzzles.json` — already played, not touched, per the
  Mirror lesson above.
