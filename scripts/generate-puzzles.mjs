#!/usr/bin/env node
// Chain Link puzzle generator — 2026-09-03 difficulty bump.
// See GAME_DESIGN.md for why (4x4/length-7 was solvable in seconds).
//
// Grid: 5x5. Chain length: 9-10 words. Puzzles are built by random-
// walking a curated graph of real English compound words/phrases,
// then threading that word chain onto a self-avoiding path on the
// grid. Remaining cells are filled with other graph words (unused
// this puzzle) as visual noise — the game only ever checks the
// explicit `connections` list on submit (see useGameState.js), never
// a live dictionary, so filler words can never accidentally create a
// false-valid move.
//
// Usage: node scripts/generate-puzzles.mjs [--from=YYYY-MM-DD] [--to=YYYY-MM-DD] [--dry-run]

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUZZLES_PATH = path.join(__dirname, '..', 'src', 'data', 'puzzles.json');

const GRID_SIZE = 5;
const MIN_CHAIN = 9;
const MAX_CHAIN = 10;

// ── Compound-word graph ─────────────────────────────────────────────
// Each entry [A, B] means A+B (or the phrase "A B") is a real,
// verifiable English compound word/phrase. Direction of the pair is
// just documentation — the game checks connections order-agnostic.
const EDGES = [
  // FIRE / PLACE / MAT / DOOR / BELL / BOY / SCOUT (original family)
  ['FIRE', 'PLACE'], ['FIRE', 'FLY'], ['FIRE', 'WORK'], ['FIRE', 'ARM'],
  ['FIRE', 'HOUSE'], ['FIRE', 'WOOD'], ['FIRE', 'BALL'], ['FIRE', 'TRUCK'],
  ['FIRE', 'SIDE'], ['FIRE', 'MAN'],
  ['PLACE', 'MAT'], ['PLACE', 'HOLDER'], ['MARKET', 'PLACE'], ['WORK', 'PLACE'],
  ['DOOR', 'MAT'], ['DOOR', 'BELL'], ['DOOR', 'WAY'], ['DOOR', 'STEP'],
  ['DOOR', 'KNOB'], ['BACK', 'DOOR'], ['TRAP', 'DOOR'], ['DOOR', 'MAN'],
  ['OUT', 'DOOR'], ['IN', 'DOOR'],
  ['DOOR', 'BELL'], ['BELL', 'BOY'], ['BLUE', 'BELL'], ['BAR', 'BELL'],
  ['DUMB', 'BELL'], ['BELL', 'HOP'], ['BELL', 'TOWER'],
  ['BOY', 'FRIEND'], ['BOY', 'SCOUT'], ['COW', 'BOY'], ['PLAY', 'BOY'],
  ['SCHOOL', 'BOY'], ['BOY', 'HOOD'],
  ['SCOUT', 'MASTER'], ['EAGLE', 'SCOUT'], ['TALENT', 'SCOUT'],

  // WORK / LIGHT / LAMP
  ['WORK', 'OUT'], ['WORK', 'SHOP'], ['HOME', 'WORK'], ['NET', 'WORK'],
  ['FRAME', 'WORK'], ['WORK', 'FORCE'], ['WORK', 'BOOK'], ['WORK', 'BENCH'],
  ['ART', 'WORK'], ['TEAM', 'WORK'], ['WORK', 'LOAD'], ['WORK', 'ROOM'],
  ['GROUND', 'WORK'], ['WORK', 'MAN'],
  ['LAMP', 'LIGHT'], ['DAY', 'LIGHT'], ['MOON', 'LIGHT'], ['SUN', 'LIGHT'],
  ['FLASH', 'LIGHT'], ['LIGHT', 'HOUSE'], ['LIGHT', 'BULB'], ['SPOT', 'LIGHT'],
  ['HEAD', 'LIGHT'], ['STOP', 'LIGHT'], ['LIGHT', 'WEIGHT'],
  ['LIME', 'LIGHT'],
  ['LAMP', 'SHADE'], ['LAMP', 'POST'],

  // WELL / SHELF / BOOK / TOWER
  ['FARE', 'WELL'], ['STAIR', 'WELL'], ['INK', 'WELL'],
  ['BOOK', 'SHELF'], ['SHELF', 'LIFE'],
  ['BOOK', 'WORM'], ['BOOK', 'CASE'], ['BOOK', 'MARK'], ['NOTE', 'BOOK'],
  ['TEXT', 'BOOK'], ['COOK', 'BOOK'], ['HAND', 'BOOK'], ['BOOK', 'STORE'],
  ['WATCH', 'TOWER'], ['BELL', 'TOWER'],

  // BACK / PACK / PASS / WORD
  ['BACK', 'PACK'], ['BACK', 'GROUND'], ['BACK', 'YARD'], ['BACK', 'BONE'],
  ['BACK', 'FIRE'], ['BACK', 'STAGE'], ['BACK', 'STOP'], ['BACK', 'BOARD'],
  ['BACK', 'LASH'], ['HORSE', 'BACK'], ['COME', 'BACK'], ['SET', 'BACK'],
  ['FEED', 'BACK'], ['PIGGY', 'BACK'], ['OUT', 'BACK'], ['DRAW', 'BACK'],
  ['THROW', 'BACK'],
  ['ICE', 'PACK'], ['WOLF', 'PACK'],
  ['PASS', 'WORD'], ['PASS', 'PORT'], ['PASS', 'OVER'], ['BY', 'PASS'],
  ['KEY', 'WORD'], ['CROSS', 'WORD'], ['WATCH', 'WORD'], ['BUZZ', 'WORD'],

  // PLAY / GROUND / HOUSE / BOAT
  ['PLAY', 'GROUND'], ['PLAY', 'HOUSE'], ['PLAY', 'BOY'], ['PLAY', 'MATE'],
  ['PLAY', 'WRIGHT'], ['PLAY', 'BACK'], ['PLAY', 'PEN'], ['PLAY', 'OFF'],
  ['PLAY', 'ROOM'], ['SCREEN', 'PLAY'], ['FORE', 'PLAY'],
  ['UNDER', 'GROUND'], ['FAIR', 'GROUND'], ['BATTLE', 'GROUND'], ['CAMP', 'GROUND'],
  ['PLAY', 'HOUSE'], ['FIRE', 'HOUSE'], ['LIGHT', 'HOUSE'], ['GREEN', 'HOUSE'],
  ['DOG', 'HOUSE'], ['TREE', 'HOUSE'], ['WARE', 'HOUSE'], ['HOUSE', 'BOAT'],
  ['HOUSE', 'WORK'], ['HOUSE', 'HOLD'], ['PENT', 'HOUSE'], ['COURT', 'HOUSE'],
  ['FARM', 'HOUSE'], ['HOUSE', 'WIFE'], ['POWER', 'HOUSE'],
  ['SAIL', 'BOAT'], ['ROW', 'BOAT'], ['BOAT', 'HOUSE'], ['TUG', 'BOAT'],
  ['SPEED', 'BOAT'],

  // YARD / STICK / MATCH / BOX / MAIL / MAN
  ['JUNK', 'YARD'], ['COURT', 'YARD'], ['SHIP', 'YARD'], ['VINE', 'YARD'],
  ['GRAVE', 'YARD'], ['YARD', 'STICK'],
  ['LIP', 'STICK'], ['CHOP', 'STICK'], ['DIP', 'STICK'], ['BROOM', 'STICK'],
  ['MATCH', 'STICK'], ['DRUM', 'STICK'], ['SLAP', 'STICK'],
  ['MATCH', 'BOX'], ['MATCH', 'MAKER'], ['MATCH', 'POINT'],
  ['MAIL', 'BOX'], ['SAND', 'BOX'], ['TOOL', 'BOX'], ['ICE', 'BOX'],
  ['BOX', 'CAR'], ['BOX', 'OFFICE'], ['IN', 'BOX'], ['JUKE', 'BOX'],
  ['LUNCH', 'BOX'],
  ['MAIL', 'MAN'], ['VOICE', 'MAIL'], ['BLACK', 'MAIL'], ['AIR', 'MAIL'],
  ['MAIL', 'ROOM'],
  ['DOOR', 'MAN'], ['POST', 'MAN'], ['POLICE', 'MAN'], ['FIRE', 'MAN'],
  ['SNOW', 'MAN'], ['WORK', 'MAN'], ['FRESH', 'MAN'], ['MAN', 'HOLE'],
  ['MAN', 'KIND'], ['MAN', 'POWER'], ['CHAIR', 'MAN'], ['WATCH', 'MAN'],
  ['WEATHER', 'MAN'], ['HORSE', 'MAN'],

  // POWER / HORSE / SHOE / SNOW / BALL
  ['HORSE', 'POWER'], ['POWER', 'HOUSE'], ['SUPER', 'POWER'], ['WILL', 'POWER'],
  ['HORSE', 'BACK'], ['HORSE', 'SHOE'], ['HORSE', 'PLAY'], ['RACE', 'HORSE'],
  ['SEA', 'HORSE'],
  ['SHOE', 'LACE'], ['SHOE', 'BOX'], ['SNOW', 'SHOE'], ['GUM', 'SHOE'],
  ['SNOW', 'MAN'], ['SNOW', 'SHOE'], ['SNOW', 'BALL'], ['SNOW', 'FLAKE'],
  ['SNOW', 'STORM'], ['SNOW', 'PLOW'], ['SNOW', 'FALL'], ['SNOW', 'BOARD'],
  ['BASE', 'BALL'], ['FOOT', 'BALL'], ['BASKET', 'BALL'], ['EYE', 'BALL'],
  ['FIRE', 'BALL'], ['MEAT', 'BALL'], ['HAIR', 'BALL'], ['BALL', 'PARK'],
  ['BALL', 'ROOM'], ['BALL', 'POINT'], ['HAND', 'BALL'], ['PIN', 'BALL'],

  // PARK / WAY / GATE / STEP / LADDER
  ['BALL', 'PARK'], ['PARK', 'WAY'], ['PARK', 'LAND'],
  ['PARK', 'WAY'], ['DOOR', 'WAY'], ['HIGH', 'WAY'], ['RUN', 'WAY'],
  ['HALL', 'WAY'], ['DRIVE', 'WAY'], ['GATE', 'WAY'], ['SUB', 'WAY'],
  ['RAIL', 'WAY'], ['FREE', 'WAY'], ['WAY', 'SIDE'],
  ['GATE', 'WAY'], ['GATE', 'HOUSE'], ['GATE', 'POST'], ['FLOOD', 'GATE'],
  ['TAIL', 'GATE'],
  ['DOOR', 'STEP'], ['STEP', 'LADDER'], ['FOOT', 'STEP'], ['STEP', 'STOOL'],
  ['STEP', 'CHILD'], ['SIDE', 'STEP'], ['OVER', 'STEP'],

  // FOOT / PRINT / FINGER / NAIL / TIP / TOE / HOLD
  ['FOOT', 'STEP'], ['FOOT', 'BALL'], ['FOOT', 'PRINT'], ['FOOT', 'PATH'],
  ['FOOT', 'NOTE'], ['FOOT', 'HILL'], ['BARE', 'FOOT'], ['FOOT', 'LOOSE'],
  ['FOOT', 'HOLD'], ['FOOT', 'REST'], ['FOOT', 'WORK'], ['FOOT', 'BRIDGE'],
  ['FOOT', 'LOCKER'],
  ['FOOT', 'PRINT'], ['FINGER', 'PRINT'], ['BLUE', 'PRINT'], ['NEWS', 'PRINT'],
  ['PRINT', 'OUT'],
  ['FINGER', 'PRINT'], ['FINGER', 'NAIL'], ['FINGER', 'TIP'], ['FORE', 'FINGER'],
  ['FINGER', 'NAIL'], ['TOE', 'NAIL'], ['HANG', 'NAIL'],
  ['FINGER', 'TIP'], ['TIP', 'TOE'], ['TIP', 'OFF'],
  ['TIP', 'TOE'], ['TOE', 'NAIL'], ['TOE', 'HOLD'],
  ['TOE', 'HOLD'], ['FOOT', 'HOLD'], ['HOUSE', 'HOLD'], ['THRESH', 'HOLD'],
  ['HOLD', 'UP'], ['STRANGLE', 'HOLD'], ['STRONG', 'HOLD'], ['HOLD', 'OUT'],

  // HILL / SIDE / WALK / BOARD / KEY / HOLE
  ['FOOT', 'HILL'], ['ANT', 'HILL'], ['UP', 'HILL'], ['DOWN', 'HILL'],
  ['HILL', 'SIDE'], ['HILL', 'TOP'],
  ['HILL', 'SIDE'], ['FIRE', 'SIDE'], ['WAY', 'SIDE'], ['BED', 'SIDE'],
  ['POOL', 'SIDE'], ['ROAD', 'SIDE'], ['IN', 'SIDE'], ['OUT', 'SIDE'],
  ['SIDE', 'WALK'], ['SIDE', 'SHOW'], ['SIDE', 'KICK'], ['SIDE', 'BAR'],
  ['COUNTRY', 'SIDE'], ['RIVER', 'SIDE'], ['CURB', 'SIDE'],
  ['SIDE', 'WALK'], ['BOARD', 'WALK'], ['CAT', 'WALK'], ['JAY', 'WALK'],
  ['CROSS', 'WALK'], ['WALK', 'WAY'], ['WALK', 'OUT'], ['SLEEP', 'WALK'],
  ['BOARD', 'WALK'], ['SURF', 'BOARD'], ['KEY', 'BOARD'], ['CARD', 'BOARD'],
  ['SKATE', 'BOARD'], ['DASH', 'BOARD'], ['CHALK', 'BOARD'], ['SNOW', 'BOARD'],
  ['BLACK', 'BOARD'], ['BILL', 'BOARD'], ['CUP', 'BOARD'], ['CLIP', 'BOARD'],
  ['SCORE', 'BOARD'], ['BACK', 'BOARD'],
  ['KEY', 'BOARD'], ['KEY', 'WORD'], ['KEY', 'HOLE'], ['KEY', 'STONE'],
  ['KEY', 'CHAIN'],
  ['KEY', 'HOLE'], ['MAN', 'HOLE'], ['POT', 'HOLE'], ['LOOP', 'HOLE'],
  ['PIGEON', 'HOLE'], ['ARM', 'HOLE'], ['PEEP', 'HOLE'],

  // POT / FLOWER / BED / ROOM / MATE / TEAM / CLASS / CHECK / POINT / LIST
  ['POT', 'HOLE'], ['JACK', 'POT'], ['TEA', 'POT'], ['CROCK', 'POT'],
  ['FLOWER', 'POT'], ['POT', 'LUCK'],
  ['FLOWER', 'POT'], ['SUN', 'FLOWER'], ['WILD', 'FLOWER'], ['MAY', 'FLOWER'],
  ['FLOWER', 'BED'],
  ['FLOWER', 'BED'], ['BED', 'ROOM'], ['BED', 'SIDE'], ['BED', 'TIME'],
  ['BED', 'ROCK'], ['BED', 'SPREAD'], ['BUNK', 'BED'], ['FLAT', 'BED'],
  ['SEA', 'BED'], ['RIVER', 'BED'],
  ['BED', 'ROOM'], ['CLASS', 'ROOM'], ['BATH', 'ROOM'], ['REST', 'ROOM'],
  ['MAIL', 'ROOM'], ['PLAY', 'ROOM'], ['BALL', 'ROOM'], ['COURT', 'ROOM'],
  ['ROOM', 'MATE'],
  ['ROOM', 'MATE'], ['PLAY', 'MATE'], ['CLASS', 'MATE'], ['TEAM', 'MATE'],
  ['CHECK', 'MATE'], ['SOUL', 'MATE'], ['SHIP', 'MATE'],
  ['TEAM', 'MATE'], ['TEAM', 'WORK'],
  ['CLASS', 'MATE'], ['CLASS', 'ROOM'],
  ['CHECK', 'MATE'], ['CHECK', 'POINT'], ['CHECK', 'OUT'], ['CHECK', 'LIST'],
  ['RAIN', 'CHECK'], ['CHECK', 'BOOK'],
  ['CHECK', 'POINT'], ['VIEW', 'POINT'], ['PIN', 'POINT'], ['STAND', 'POINT'],
  ['GUN', 'POINT'], ['MATCH', 'POINT'], ['BALL', 'POINT'],
  ['CHECK', 'LIST'], ['PLAY', 'LIST'], ['BLACK', 'LIST'],

  // STORM / FALL / FLAKE / PLOW (snow family extras) / STONE / CHAIN
  ['SNOW', 'STORM'], ['STORM', 'PROOF'],
  ['SNOW', 'FALL'], ['RAIN', 'FALL'], ['WATER', 'FALL'], ['FALL', 'OUT'],
  ['SNOW', 'FLAKE'], ['CORN', 'FLAKE'],
  ['KEY', 'STONE'], ['MILE', 'STONE'], ['LIME', 'STONE'], ['STONE', 'WALL'],
  ['KEY', 'CHAIN'], ['CHAIN', 'SAW'], ['CHAIN', 'LINK'],

  // Extra branch words to add width/decoy potential to the graph
  ['SUN', 'RISE'], ['SUN', 'SET'], ['SUN', 'FLOWER'], ['SUN', 'LIGHT'],
  ['SUN', 'BURN'], ['SUN', 'SHINE'], ['SUN', 'ROOM'],
  ['RAIN', 'BOW'], ['RAIN', 'COAT'], ['RAIN', 'DROP'], ['RAIN', 'STORM'],
  ['RAIN', 'FOREST'],
  ['WIND', 'MILL'], ['WIND', 'SHIELD'], ['WIND', 'PIPE'], ['WIND', 'STORM'],
  ['WATER', 'FALL'], ['WATER', 'MARK'], ['WATER', 'MELON'], ['WATER', 'PROOF'],
  ['WATER', 'COLOR'], ['UNDER', 'WATER'],
  ['UNDER', 'WATER'], ['UNDER', 'GROUND'], ['UNDER', 'DOG'], ['UNDER', 'LINE'],
  ['UNDER', 'STUDY'], ['UNDER', 'PASS'], ['UNDER', 'PASS'],
  ['DOG', 'HOUSE'], ['UNDER', 'DOG'], ['DOG', 'TAG'], ['WATCH', 'DOG'],
  ['DOG', 'WOOD'],
  ['CAT', 'FISH'], ['CAT', 'WALK'], ['CAT', 'NAP'], ['COPY', 'CAT'],
  ['CAT', 'NIP'],
  ['FISH', 'BOWL'], ['CAT', 'FISH'], ['STAR', 'FISH'], ['FISH', 'HOOK'],
  ['FISH', 'NET'], ['SWORD', 'FISH'], ['FISH', 'POND'],
  ['STAR', 'FISH'], ['STAR', 'LIGHT'], ['STAR', 'DUST'],
  ['SHOOTING', 'STAR'], ['MOVIE', 'STAR'],
  ['STAR', 'LIGHT'], ['MOON', 'LIGHT'], ['MOON', 'SHINE'], ['MOON', 'STONE'],
  ['HONEY', 'MOON'], ['MOON', 'WALK'],
  ['SUN', 'SHINE'], ['MOON', 'SHINE'], ['SHINE', 'SHOE'],
  ['CROSS', 'WALK'], ['CROSS', 'WORD'], ['CROSS', 'ROAD'], ['CROSS', 'FIRE'],
  ['CROSS', 'BOW'], ['CROSS', 'OVER'],
  ['ROAD', 'BLOCK'], ['ROAD', 'SIDE'], ['ROAD', 'WAY'], ['ROAD', 'KILL'],
  ['ROAD', 'RUNNER'],
  ['BLOCK', 'HOUSE'], ['ROAD', 'BLOCK'], ['BLOCK', 'BUSTER'], ['BLOCK', 'CHAIN'],
  ['CHAIN', 'LINK'], ['CHAIN', 'SAW'], ['CHAIN', 'MAIL'], ['CHAIN', 'SMOKE'],
  ['SMOKE', 'STACK'], ['CHAIN', 'SMOKE'], ['SMOKE', 'SCREEN'], ['SMOKE', 'HOUSE'],
  ['STACK', 'UP'], ['SMOKE', 'STACK'], ['HAY', 'STACK'],
  ['HAY', 'STACK'], ['HAY', 'LOFT'], ['HAY', 'RIDE'], ['HAY', 'WIRE'],
  ['WIRE', 'TAP'], ['HAY', 'WIRE'], ['WIRE', 'WORM'], ['BARB', 'WIRE'],
  ['TAP', 'ROOM'], ['WIRE', 'TAP'], ['TAP', 'WATER'], ['TAP', 'DANCE'],
  ['DANCE', 'FLOOR'], ['TAP', 'DANCE'], ['DANCE', 'HALL'],
  ['FLOOR', 'BOARD'], ['DANCE', 'FLOOR'], ['FLOOR', 'PLAN'], ['FLOOR', 'MAT'],
  ['HALL', 'WAY'], ['DANCE', 'HALL'], ['HALL', 'MARK'], ['TOWN', 'HALL'],
  ['MARK', 'DOWN'], ['HALL', 'MARK'], ['BOOK', 'MARK'], ['WATER', 'MARK'],
  ['DOWN', 'HILL'], ['MARK', 'DOWN'], ['DOWN', 'TOWN'], ['DOWN', 'POUR'],
  ['DOWN', 'FALL'], ['DOWN', 'STAIRS'], ['DOWN', 'SIZE'],
  ['TOWN', 'HALL'], ['DOWN', 'TOWN'], ['TOWN', 'SHIP'], ['TOWN', 'HOUSE'],
  ['SHIP', 'YARD'], ['TOWN', 'SHIP'], ['SHIP', 'WRECK'], ['SHIP', 'MATE'],
  ['FLAG', 'SHIP'],
  ['WRECK', 'AGE'], ['SHIP', 'WRECK'],
  ['STAIR', 'CASE'], ['DOWN', 'STAIRS'], ['STAIR', 'WELL'], ['UP', 'STAIRS'],
  ['UP', 'HILL'], ['UP', 'STAIRS'], ['UP', 'TOWN'], ['UP', 'ROOT'],
  ['UP', 'GRADE'], ['UP', 'RIGHT'], ['UP', 'SIDE'],
  ['UP', 'TOWN'], ['UP', 'SIDE'], ['SIDE', 'SHOW'],
  ['RIGHT', 'WAY'], ['UP', 'RIGHT'], ['RIGHT', 'HAND'], ['COPY', 'RIGHT'],
  ['HAND', 'SHAKE'], ['RIGHT', 'HAND'], ['HAND', 'BALL'], ['HAND', 'BOOK'],
  ['HAND', 'MADE'], ['HAND', 'BAG'], ['HAND', 'CUFF'], ['HAND', 'GUN'],
  ['HAND', 'OUT'], ['HAND', 'RAIL'], ['HAND', 'WRITING'],
  ['GUN', 'POWDER'], ['HAND', 'GUN'], ['GUN', 'SHOT'], ['GUN', 'POINT'],
  ['SHOT', 'GUN'], ['GUN', 'SHOT'], ['SNAP', 'SHOT'], ['SHOT', 'PUT'],
  ['UP', 'SHOT'],
  ['SNAP', 'SHOT'], ['SNAP', 'SHOT'], ['SNAP', 'DRAGON'], ['SNAP', 'SHOT'],
];

// ── Build adjacency + vocabulary ────────────────────────────────────
const adj = new Map();
function addNode(w) { if (!adj.has(w)) adj.set(w, new Set()); }
for (const [a, b] of EDGES) {
  addNode(a); addNode(b);
  adj.get(a).add(b);
  adj.get(b).add(a);
}
const VOCAB = [...adj.keys()];

// ── Deterministic RNG (mulberry32), seeded per date so re-runs are stable ──
function seedFromString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pick(arr, rand) { return arr[Math.floor(rand() * arr.length)]; }

// ── Random-walk a word chain of target length through the graph ────
function buildChain(targetLen, rand, maxAttempts = 400) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const start = pick(VOCAB, rand);
    const chain = [start];
    const used = new Set([start]);
    let stuck = false;
    while (chain.length < targetLen) {
      const current = chain[chain.length - 1];
      const neighbors = shuffle([...adj.get(current)], rand).filter((n) => !used.has(n));
      if (neighbors.length === 0) { stuck = true; break; }
      // Prefer a neighbor that still has room to keep going, when possible
      const next = neighbors.find((n) => [...adj.get(n)].some((nn) => !used.has(nn) && nn !== current)) || neighbors[0];
      chain.push(next);
      used.add(next);
    }
    if (!stuck && chain.length === targetLen) return chain;
  }
  return null;
}

// ── Self-avoiding path of exact length on an R x C grid ─────────────
function buildGridPath(len, rand, rows = GRID_SIZE, cols = GRID_SIZE, maxAttempts = 800) {
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const startR = Math.floor(rand() * rows);
    const startC = Math.floor(rand() * cols);
    const path = [[startR, startC]];
    const visited = new Set([`${startR},${startC}`]);
    let ok = true;
    while (path.length < len) {
      const [r, c] = path[path.length - 1];
      const options = shuffle(dirs, rand)
        .map(([dr, dc]) => [r + dr, c + dc])
        .filter(([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(`${nr},${nc}`));
      if (options.length === 0) { ok = false; break; }
      const next = options[0];
      path.push(next);
      visited.add(`${next[0]},${next[1]}`);
    }
    if (ok && path.length === len) return path;
  }
  return null;
}

function isAdjacent([r1, c1], [r2, c2]) {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

function buildPuzzle(dateKey) {
  const rand = mulberry32(seedFromString(dateKey));
  for (let outer = 0; outer < 200; outer++) {
    const targetLen = MIN_CHAIN + Math.floor(rand() * (MAX_CHAIN - MIN_CHAIN + 1));
    const chain = buildChain(targetLen, rand);
    if (!chain) continue;
    const gridPath = buildGridPath(chain.length, rand);
    if (!gridPath) continue;

    const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
    chain.forEach((word, i) => {
      const [r, c] = gridPath[i];
      grid[r][c] = word;
    });

    const usedWords = new Set(chain);
    const fillerPool = shuffle(VOCAB.filter((w) => !usedWords.has(w)), rand);
    let fillerIdx = 0;
    let fillerOk = true;
    for (let r = 0; r < GRID_SIZE && fillerOk; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === null) {
          if (fillerIdx >= fillerPool.length) { fillerOk = false; break; }
          grid[r][c] = fillerPool[fillerIdx++];
        }
      }
    }
    if (!fillerOk) continue;

    const connections = [];
    for (let i = 0; i < chain.length - 1; i++) connections.push([chain[i], chain[i + 1]]);

    const puzzle = {
      grid,
      start: gridPath[0],
      end: gridPath[gridPath.length - 1],
      solution: gridPath,
      connections,
    };

    if (verifyPuzzle(puzzle)) return puzzle;
  }
  throw new Error(`Failed to build a puzzle for ${dateKey} after 200 attempts`);
}

function verifyPuzzle(puzzle) {
  const { grid, solution, connections } = puzzle;
  if (solution.length < MIN_CHAIN || solution.length > MAX_CHAIN) return false;
  for (let i = 1; i < solution.length; i++) {
    if (!isAdjacent(solution[i - 1], solution[i])) return false;
  }
  if (connections.length !== solution.length - 1) return false;
  const flat = grid.flat();
  if (new Set(flat).size !== flat.length) return false; // no duplicate words on one grid
  for (let i = 0; i < solution.length - 1; i++) {
    const wordA = grid[solution[i][0]][solution[i][1]];
    const wordB = grid[solution[i + 1][0]][solution[i + 1][1]];
    const [ca, cb] = connections[i];
    const matches = (ca === wordA && cb === wordB) || (ca === wordB && cb === wordA);
    if (!matches) return false;
  }
  return true;
}

// ── Main ──────────────────────────────────────────────────────────
function dateRange(from, to) {
  const dates = [];
  let d = new Date(from + 'T00:00:00Z');
  const end = new Date(to + 'T00:00:00Z');
  while (d <= end) {
    dates.push(d.toISOString().slice(0, 10));
    d = new Date(d.getTime() + 86400000);
  }
  return dates;
}

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v ?? true];
}));

const FROM = args.from || '2026-09-09';
const TO = args.to || '2026-12-31';
const DRY_RUN = !!args['dry-run'];

const existing = JSON.parse(readFileSync(PUZZLES_PATH, 'utf8'));
const dates = dateRange(FROM, TO);

let generated = 0;
for (const dateKey of dates) {
  existing[dateKey] = buildPuzzle(dateKey);
  generated++;
}

console.log(`Generated ${generated} puzzles from ${FROM} to ${TO} (grid ${GRID_SIZE}x${GRID_SIZE}, chain ${MIN_CHAIN}-${MAX_CHAIN}).`);
console.log(`Vocabulary size: ${VOCAB.length} words, ${EDGES.length} edges.`);

if (DRY_RUN) {
  console.log('Dry run — not writing. Sample puzzle:', JSON.stringify(existing[dates[0]], null, 2));
} else {
  const sortedKeys = Object.keys(existing).sort();
  const out = {};
  for (const k of sortedKeys) out[k] = existing[k];
  writeFileSync(PUZZLES_PATH, JSON.stringify(out, null, 2) + '\n');
  console.log(`Wrote ${PUZZLES_PATH}`);
}
