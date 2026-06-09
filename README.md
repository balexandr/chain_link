# Chain Link — Daily Word Path Puzzle

A daily puzzle game where you draw a path through a 4×4 word grid. Every step in your path must form a compound word with the next. One valid solution per day.

Part of the [NoodleGames](https://noodlegames.co) family alongside **Sequence** and **Odd One Out**.

---

## How to play

A **START** cell (green) and an **END** cell (red) are marked on the grid. Draw a continuous path from START to END where every adjacent pair of words forms a valid compound word.

- Movement is 4-directional — up, down, left, right. No diagonals.
- Press and hold on START, drag through the grid, release on END to submit.
- Releasing before reaching END resets your path.
- **Unlimited attempts** — but your time keeps running and accuracy drops with each wrong try.
- Resets daily at **midnight EST**.

---

## Scoring

| | |
|---|---|
| **Time** | How long from page load to solving |
| **Attempts** | How many paths you submitted |
| **Accuracy** | First try = 100%, drops with each attempt |

---

## Stack

React + Vite · CSS Modules · localStorage · GitHub Pages

---

## Puzzles

Puzzles run from **June 3, 2026** onward. Each puzzle is keyed by date in `src/data/puzzles.json` and includes the grid, start/end positions, valid path, and accepted word connections. New dates can be added to the JSON without a code change.
