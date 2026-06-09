import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { useStats } from './hooks/useStats';
import Grid from './components/Grid';
import WinScreen from './components/WinScreen';
import HowToPlay from './components/HowToPlay';
import StatsScreen from './components/StatsScreen';
import styles from './App.module.css';

const HOW_TO_PLAY_KEY = 'chain-link-how-to-play-seen';

export default function App() {
  const {
    puzzle,
    gameStatus,
    path,
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
  } = useGameState();

  const { stats, winPct, recordGame } = useStats();

  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [winDismissed, setWinDismissed] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    try {
      if (!localStorage.getItem(HOW_TO_PLAY_KEY)) setShowHowToPlay(true);
    } catch {}
  }, []);

  const dismissHowToPlay = () => {
    setShowHowToPlay(false);
    try { localStorage.setItem(HOW_TO_PLAY_KEY, '1'); } catch {}
  };

  useEffect(() => {
    if (gameStatus === 'won') recordGame(dateKey, attempts, elapsedSeconds);
  }, [gameStatus]);

  const footer = (
    <footer className={styles.footer}>
      <span>© {currentYear} NoodleGames.co</span>
      <span className={styles.footerDot}>•</span>
      <a href="https://noodlegames.co" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
        noodlegames.co
      </a>
    </footer>
  );

  const Logo = () => (
    <h1 className={styles.logo}>
      <span className={styles.logoChain}>Chain</span>
      <span className={styles.logoEmoji}>🔗</span>
      <span className={styles.logoLink}>Link</span>
    </h1>
  );

  if (!initialized) return null;

  if (!puzzle) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerLeft}><Logo /></div>
        </header>
        <div className={styles.noPuzzle}>
          <span className={styles.noPuzzleEmoji}>🔗</span>
          <p>No puzzle for today yet.</p>
          <p className={styles.muted}>Check back tomorrow!</p>
        </div>
        {footer}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Logo />
          {puzzleNumber && <span className={styles.puzzleNumber}>#{puzzleNumber}</span>}
        </div>
        <div className={styles.headerRight}>
          <button className={styles.iconButton} onClick={() => setShowStats(true)} aria-label="Statistics">
            <svg className={styles.statsIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M4 20H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="6" y="11" width="2.8" height="7" rx="1" fill="currentColor" />
              <rect x="10.6" y="7" width="2.8" height="11" rx="1" fill="currentColor" opacity="0.9" />
              <rect x="15.2" y="4" width="2.8" height="14" rx="1" fill="currentColor" opacity="0.8" />
            </svg>
          </button>
          <button className={styles.iconButton} onClick={() => setShowHowToPlay(true)} aria-label="How to play">?</button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.statusBar}>
          <div className={styles.timerBlock}>
            <span className={styles.timerLabel}>Time</span>
            <span className={`${styles.timerValue} ${!timerRunning && gameStatus === 'playing' ? styles.timerPaused : ''}`}>
              {formatTime(elapsedSeconds)}
            </span>
          </div>
          <div className={styles.tryBlock}>
            <span className={styles.tryLabel}>Try</span>
            <span className={styles.tryValue}>#{attempts + (gameStatus === 'playing' ? 1 : 0)}</span>
          </div>
          <div className={styles.attemptDots}>
            {Array.from({ length: Math.max(attempts, 0) }).map((_, i) => (
              <span key={i} className={styles.attemptDot} />
            ))}
          </div>
        </div>

        <Grid
          puzzle={puzzle}
          path={path}
          gameStatus={gameStatus}
          onPathChange={setPath}
          onSubmit={submitPath}
          onReset={resetPath}
        />

        {gameStatus === 'playing' && (
          <p className={styles.hint}>
            Drag from <span className={styles.hintStart}>START</span> to <span className={styles.hintEnd}>END</span> — each step makes a compound word
          </p>
        )}
      </main>

      {gameStatus === 'won' && !winDismissed && (
        <WinScreen
          puzzle={puzzle}
          path={path}
          attempts={attempts}
          elapsedSeconds={elapsedSeconds}
          puzzleNumber={puzzleNumber}
          generateShareText={generateShareText}
          stats={stats}
          winPct={winPct}
          onDismiss={() => setWinDismissed(true)}
        />
      )}

      {showHowToPlay && <HowToPlay onClose={dismissHowToPlay} />}
      {showStats && <StatsScreen stats={stats} winPct={winPct} onClose={() => setShowStats(false)} />}

      {footer}
    </div>
  );
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
