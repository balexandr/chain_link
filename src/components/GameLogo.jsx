export function GameLogo() {
  const grid = [
    [6,6],[24,6],[42,6],
    [6,24],[24,24],[42,24],
    [6,42],[24,42],[42,42],
  ];
  const path = [[6,6],[24,6],[42,6],[42,24],[42,42],[24,42]];
  const inPath = new Set(path.map(([x,y]) => `${x},${y}`));

  return (
    <svg viewBox="0 0 48 48" width="24" height="24" aria-hidden="true" style={{ flexShrink: 0 }}>
      {path.slice(0, -1).map(([x1,y1], i) => {
        const [x2,y2] = path[i + 1];
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
        );
      })}
      {grid.map(([cx,cy]) => (
        <circle key={`${cx},${cy}`} cx={cx} cy={cy}
          r={inPath.has(`${cx},${cy}`) ? 5 : 3.5}
          fill={inPath.has(`${cx},${cy}`) ? '#a855f7' : 'rgba(168,85,247,0.25)'} />
      ))}
    </svg>
  );
}
