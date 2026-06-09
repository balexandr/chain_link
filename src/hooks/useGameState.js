import { useState, useCallback, useEffect, useRef } from 'react';
import puzzles from '../data/puzzles.json';

const STORAGE_KEY = 'chain-link-game-state';
const EPOCH = '2026-06-03';

function getTodayKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
}

function loadState(dateKey) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (saved.dateKey !== dateKey) return null;
    return saved;
  } catch { return null; }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

// Check if two [row,col] positions are 4-directionally adjacent
function isAdjacent([r1, c1], [r2, c2]) {
  return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
}

// Validate that every consecutive pair in path appears in connections (either order)
function validatePath(path, grid, connections) {
  for (let i = 0; i < path.length - 1; i++) {
    const wordA = grid[path[i][0]][path[i][1]];
    const wordB = grid[path[i + 1][0]][path[i + 1][1]];
    const valid = connections.some(([a, b]) =>
      (a === wordA && b === wordB) || (a === wordB && b === wordA)
    );
    if (!valid) return false;
  }
  return true;
}

export function useGameState() {
  const dateKey = getTodayKey();
  const puzzle = puzzles[dateKey] || null;
  const puzzleNumber = Math.floor((new Date(dateKey) - new Date(EPOCH)) / 86400000) + 1;

  const [path, setPathState] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing');
  const [attempts, setAttempts] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [winPath, setWinPath] = useState(null);

  const timerRef = useRef(null);
  const elapsedRef = useRef(0);

  // Timer tick
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsedSeconds(elapsedRef.current);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  // Init
  useEffect(() => {
    if (!puzzle) { setInitialized(true); return; }

    const saved = loadState(dateKey);
    if (saved) {
      setAttempts(saved.attempts);
      setGameStatus(saved.gameStatus);
      elapsedRef.current = saved.elapsedSeconds;
      setElapsedSeconds(saved.elapsedSeconds);
      if (saved.winPath) {
        setWinPath(saved.winPath);
        setPathState(saved.winPath);
      }
      // Don't restart timer if game is over
      if (saved.gameStatus === 'playing') setTimerRunning(true);
    } else {
      setTimerRunning(true);
    }
    setInitialized(true);
  }, [dateKey]);

  // Persist
  useEffect(() => {
    if (!initialized || !puzzle) return;
    saveState({ dateKey, attempts, gameStatus, elapsedSeconds, winPath });
  }, [attempts, gameStatus, elapsedSeconds, winPath, initialized]);

  const setPath = useCallback((newPath) => {
    if (gameStatus !== 'playing') return;
    setPathState(newPath);
  }, [gameStatus]);

  const resetPath = useCallback(() => {
    if (gameStatus !== 'playing') return;
    setPathState([]);
  }, [gameStatus]);

  const submitPath = useCallback((currentPath) => {
    if (!puzzle || gameStatus !== 'playing') return;

    const [er, ec] = puzzle.end;
    const last = currentPath[currentPath.length - 1];
    if (!last || last[0] !== er || last[1] !== ec) return;

    const valid = validatePath(currentPath, puzzle.grid, puzzle.connections);
    setAttempts((a) => a + 1);

    if (valid) {
      setTimerRunning(false);
      setGameStatus('won');
      setWinPath(currentPath);
      setPathState(currentPath);
    } else {
      // Invalid path — shake and reset after short delay
      setTimeout(() => setPathState([]), 600);
    }
  }, [puzzle, gameStatus]);

  const generateShareText = useCallback(() => {
    if (!puzzle || !winPath) return '';
    const mm = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const ss = String(elapsedSeconds % 60).padStart(2, '0');
    const accuracy = attempts > 0 ? Math.round((1 / attempts) * 100) : 100;
    return `Chain Link #${puzzleNumber} 🔗\n⏱ ${mm}:${ss}  •  ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}  •  🎯 ${accuracy}%`;
  }, [puzzle, winPath, elapsedSeconds, attempts, puzzleNumber]);

  return {
    puzzle,
    gameStatus,
    path: winPath && gameStatus === 'won' ? winPath : path,
    attempts,
    initialized,
    dateKey,
    puzzleNumber,
    elapsedSeconds,
    timerRunning,
    submitPath,
    resetPath,
    setPath,
    generateShareText,
  };
}
