import { useRef, useCallback, useEffect } from 'react';
import styles from './Grid.module.css';

function isAdjacent([r1, c1], [r2, c2]) {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

function cellKey([r, c]) {
  return `${r},${c}`;
}

export default function Grid({ puzzle, path, gameStatus, onPathChange, onSubmit, onReset }) {
  const { grid, start, end, connections } = puzzle;
  const [sr, sc] = start;
  const [er, ec] = end;

  const drawingRef = useRef(false);
  const gridRef = useRef(null);
  const cellRefs = useRef({});

  const pathSet = new Set(path.map(cellKey));
  const won = gameStatus === 'won';

  const cellFromPoint = useCallback((x, y) => {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const cell = el.closest('[data-row]');
    if (!cell) return null;
    return [parseInt(cell.dataset.row), parseInt(cell.dataset.col)];
  }, []);

  const handlePointerDown = useCallback((e, r, c) => {
    if (won) return;
    if (r !== sr || c !== sc) return;
    e.preventDefault();
    drawingRef.current = true;
    onPathChange([[r, c]]);
  }, [won, sr, sc, onPathChange]);

  const handlePointerMove = useCallback((e) => {
    if (!drawingRef.current || won) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const pos = cellFromPoint(clientX, clientY);
    if (!pos) return;
    const [r, c] = pos;
    onPathChange((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last[0] === r && last[1] === c) return prev;
      if (prev.length >= 2) {
        const secondLast = prev[prev.length - 2];
        if (secondLast[0] === r && secondLast[1] === c) return prev.slice(0, -1);
      }
      if (!isAdjacent(last, [r, c])) return prev;
      const prevSet = new Set(prev.map(cellKey));
      if (prevSet.has(cellKey([r, c]))) return prev;
      return [...prev, [r, c]];
    });
  }, [won, cellFromPoint]);

  const handlePointerUp = useCallback((e) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    e.preventDefault();
    onPathChange((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last[0] === er && last[1] === ec) {
        onSubmit(prev);
      } else {
        onReset();
        return [];
      }
      return prev;
    });
  }, [er, ec, onSubmit, onReset]);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    el.addEventListener('touchmove', handlePointerMove, { passive: false });
    el.addEventListener('touchend', handlePointerUp, { passive: false });
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    return () => {
      el.removeEventListener('touchmove', handlePointerMove);
      el.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const pathIndex = {};
  path.forEach((pos, i) => { pathIndex[cellKey(pos)] = i; });

  return (
    <div className={styles.boardFrame}>
      {/* Corner rune decorations */}
      <span className={`${styles.corner} ${styles.tl}`} aria-hidden="true">◈</span>
      <span className={`${styles.corner} ${styles.tr}`} aria-hidden="true">◈</span>
      <span className={`${styles.corner} ${styles.bl}`} aria-hidden="true">◈</span>
      <span className={`${styles.corner} ${styles.br}`} aria-hidden="true">◈</span>

      <div
        className={styles.gridWrap}
        ref={gridRef}
        onMouseDown={(e) => {
          const cell = e.target.closest('[data-row]');
          if (cell) handlePointerDown(e, parseInt(cell.dataset.row), parseInt(cell.dataset.col));
        }}
        onTouchStart={(e) => {
          const cell = e.target.closest('[data-row]');
          if (cell) handlePointerDown(e, parseInt(cell.dataset.row), parseInt(cell.dataset.col));
        }}
      >
        <svg className={styles.pathSvg} aria-hidden="true">
          {path.map((pos, i) => {
            if (i === 0) return null;
            const prev = path[i - 1];
            const [r1, c1] = prev;
            const [r2, c2] = pos;
            const cellSize = 100 / 4;
            const x1 = (c1 + 0.5) * cellSize;
            const y1 = (r1 + 0.5) * cellSize;
            const x2 = (c2 + 0.5) * cellSize;
            const y2 = (r2 + 0.5) * cellSize;
            return (
              <line
                key={`${i}`}
                x1={`${x1}%`} y1={`${y1}%`}
                x2={`${x2}%`} y2={`${y2}%`}
                className={`${styles.pathLine} ${won ? styles.pathLineWon : ''}`}
              />
            );
          })}
        </svg>

        <div className={styles.grid}>
          {grid.map((row, r) =>
            row.map((word, c) => {
              const isStart = r === sr && c === sc;
              const isEnd = r === er && c === ec;
              const inPath = pathSet.has(cellKey([r, c]));
              const idx = pathIndex[cellKey([r, c])];

              let cellClass = styles.cell;
              if (isStart) cellClass += ` ${styles.cellStart}`;
              else if (isEnd) cellClass += ` ${styles.cellEnd}`;
              if (inPath && !isStart && !isEnd) cellClass += ` ${styles.cellPath}`;
              if (inPath && won) cellClass += ` ${styles.cellWon}`;

              return (
                <div
                  key={`${r}-${c}`}
                  className={cellClass}
                  data-row={r}
                  data-col={c}
                  style={inPath && !won ? { animationDelay: `${idx * 30}ms` } : undefined}
                  ref={(el) => { cellRefs.current[cellKey([r, c])] = el; }}
                >
                  <span className={styles.cellWord}>{word}</span>
                  {isStart && <span className={styles.cellBadge} style={{ color: 'var(--start)' }}>START</span>}
                  {isEnd && <span className={styles.cellBadge} style={{ color: 'var(--end)' }}>END</span>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
