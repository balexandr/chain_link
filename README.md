# Chain Link — Daily Word Path Puzzle

A daily puzzle game where you draw a path through a 4×4 word grid. Every step in your path must form a compound word with the next. One valid solution per day.

Part of the [NoodleGames](https://noodlegames.co) family alongside **Sequence** and **Odd One Out**.

---

## How it works

The grid contains 16 words. A **START** cell (green) and an **END** cell (red) are marked. Your goal is to draw a continuous path from START to END where every adjacent pair of words in the path forms a valid compound word.

**Example:** `FIRE → PLACE → MAT → DOOR → BELL → BOY → SCOUT`
`FIREPLACE · PLACEMAT · DOORMAT · DOORBELL · BELLBOY · BOYSCOUT`

### Rules
- Movement is **4-directional** — up, down, left, right. No diagonals.
- Every consecutive pair in your path must form a real compound word (in either order).
- Validation checks only against the puzzle's defined connections — not a global dictionary.
- **Unlimited attempts.** Your timer keeps running and your accuracy score reflects how many tries it took.
- One puzzle per day, resetting at **midnight EST**.

### Controls
- **Desktop:** Click and hold on START, drag through cells, release on END to submit.
- **Mobile:** Touch and drag from START to END.
- Lifting your finger or releasing the mouse before reaching END resets the current path.

---

## Scoring & sharing

When you complete the puzzle, you'll see:

| Metric | What it means |
|---|---|
| **Time** | How long from page load to solving |
| **Attempts** | How many paths you drew that reached END |
| **Accuracy** | `1 / attempts × 100%` — first try = 100% |

Share text (no spoilers — the path is never shown):
```
Chain Link #7 🔗
⏱ 01:23  •  1 attempt  •  🎯 100%
```

---

## Tech stack

| | |
|---|---|
| Framework | React 19 + Vite 6 |
| Styling | CSS Modules |
| State | `useState` / `useCallback` hooks + `localStorage` |
| Fonts | Inter (UI), Google Fonts |
| Deploy | GitHub Pages (`/chain_link/` base path) |
| No backend | All puzzle data is bundled at build time |

---

## Project structure

```
chain_link/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Grid.jsx / Grid.module.css       # 4×4 board, drag interaction
│   │   ├── WinScreen.jsx / *.module.css     # Result modal + share
│   │   ├── HowToPlay.jsx / *.module.css     # First-visit tutorial
│   │   └── StatsScreen.jsx / *.module.css   # Lifetime stats
│   ├── data/
│   │   └── puzzles.json                     # All daily puzzles keyed by YYYY-MM-DD
│   ├── hooks/
│   │   ├── useGameState.js                  # Path logic, validation, timer, persistence
│   │   └── useStats.js                      # Lifetime stats (played, streak, best time)
│   ├── App.jsx / App.module.css             # Shell, header, footer
│   ├── index.css                            # Global theme (stone dungeon colour scheme)
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

---

## Puzzle data format

Puzzles live in `src/data/puzzles.json`, keyed by `YYYY-MM-DD`:

```json
{
  "2026-06-03": {
    "grid": [
      ["FIRE", "PLACE", "DESK", "LAMP"],
      ["RING", "MAT",   "WORK", "LIGHT"],
      ["WELL", "DOOR",  "BELL", "TOWER"],
      ["BOOK", "SHELF", "BOY",  "SCOUT"]
    ],
    "start": [0, 0],
    "end":   [3, 3],
    "solution": [[0,0],[0,1],[1,1],[2,1],[2,2],[3,2],[3,3]],
    "connections": [
      ["FIRE","PLACE"],["PLACE","MAT"],["DOOR","MAT"],
      ["DOOR","BELL"],["BELL","BOY"],["BOY","SCOUT"]
    ]
  }
}
```

- **`grid`** — 4×4 array of words (row-major, top-left = `[0][0]`)
- **`start` / `end`** — `[row, col]` of the START and END cells
- **`solution`** — the intended winning path as a sequence of `[row, col]` positions
- **`connections`** — pairs of words that form valid compound words; either order is accepted during validation

> Puzzles run from **2026-06-03** (puzzle #1) through **2026-07-03** (puzzle #31). New dates can be added to the JSON without a code change.

---

## Adding new puzzles

1. Open `src/data/puzzles.json`
2. Add a new entry with the next date as the key
3. Design a 4×4 grid where a valid path exists from `start` to `end`
4. List every consecutive word pair in the solution under `connections`
5. Run the validator below to catch errors before committing

**Quick sanity check (Node):**
```bash
node -e "
const p = JSON.parse(require('fs').readFileSync('src/data/puzzles.json'));
let errors = 0;
Object.entries(p).forEach(([date, {grid, start, end, solution, connections}]) => {
  for (let i = 1; i < solution.length; i++) {
    const [r1,c1] = solution[i-1], [r2,c2] = solution[i];
    if (Math.abs(r1-r2)+Math.abs(c1-c2) !== 1) { console.log(date,'non-adjacent step',i); errors++; }
  }
  const last = solution[solution.length-1];
  if (last[0] !== end[0] || last[1] !== end[1]) { console.log(date,'end mismatch'); errors++; }
  solution.forEach(([r,c],i) => {
    if (!i) return;
    const wA = grid[solution[i-1][0]][solution[i-1][1]], wB = grid[r][c];
    const ok = connections.some(([a,b]) => (a===wA&&b===wB)||(a===wB&&b===wA));
    if (!ok) { console.log(date,'missing connection',wA,'->',wB); errors++; }
  });
});
console.log(errors ? errors+' error(s)' : 'ALL VALID ✓');
"
```

---

## Local development

Requires **Node 18+** (tested on v20).

```bash
# Install
npm install

# Dev server (hot reload)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

The dev server runs on `http://localhost:5173` by default.

---

## localStorage keys

| Key | Contents |
|---|---|
| `chain-link-game-state` | Today's path, attempts, timer, and win state — resets automatically on a new date |
| `chain-link-stats` | Lifetime stats: games played, win count, streak, best time, total time |
| `chain-link-how-to-play-seen` | Flag — set after the tutorial is dismissed for the first time |

---

## Design

- **Theme:** Stone dungeon — dark stone-block page texture, a carved stone frame with pulsing corner runes, 3D-bevelled tile cells, and a glowing violet rune trail for the active path.
- **Accent colour:** Vivid violet `#a855f7`
- **Resets:** Midnight EST (`America/New_York`) via `Intl.DateTimeFormat`
- **Companion games:** [Sequence](../sequence) · [Odd One Out](../odd_one_out)
