import { useState, useEffect } from 'react';
import styles from './WinScreen.module.css';

function getTimeToMidnight() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const diff = tomorrow - now;
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function pad(n) { return String(n).padStart(2, '0'); }

function formatTime(s) {
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}

function getRating(attempts, seconds) {
  if (attempts === 1 && seconds < 60) return { emoji: '🏆', label: 'Flawless' };
  if (attempts === 1 && seconds < 180) return { emoji: '⚡', label: 'Speedy' };
  if (attempts === 1) return { emoji: '🎯', label: 'First Try' };
  if (attempts <= 3 && seconds < 120) return { emoji: '🔥', label: 'Sharp' };
  if (attempts <= 3) return { emoji: '✅', label: 'Solid' };
  if (attempts <= 6) return { emoji: '💡', label: 'Got There' };
  return { emoji: '💪', label: 'Determined' };
}

export default function WinScreen({ puzzle, path, attempts, elapsedSeconds, puzzleNumber, generateShareText, stats, winPct, onDismiss }) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(getTimeToMidnight());
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getTimeToMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);

  const rating = getRating(attempts, elapsedSeconds);
  const accuracy = attempts > 0 ? Math.round((1 / attempts) * 100) : 100;

  const handleShare = async () => {
    const text = generateShareText();
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`${styles.overlay} ${showContent ? styles.visible : ''}`}>
      <div className={styles.modal}>
        <div className={styles.starsContainer} aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className={styles.star} style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1.5 + Math.random() * 2}s`,
              '--size': `${3 + Math.random() * 5}px`,
            }} />
          ))}
        </div>

        <div className={styles.resultHeader}>
          <button className={styles.dismissBtn} onClick={onDismiss} aria-label="Close">✕</button>
          <span className={styles.ratingEmoji}>{rating.emoji}</span>
          <h2 className={styles.title}>{rating.label}!</h2>
          <p className={styles.subtitle}>Chain Link #{puzzleNumber} — chain complete</p>
        </div>

        <div className={styles.metricsRow}>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{formatTime(elapsedSeconds)}</span>
            <span className={styles.metricLabel}>Time</span>
          </div>
          <div className={styles.metricDivider} />
          <div className={styles.metric}>
            <span className={styles.metricValue}>{attempts}</span>
            <span className={styles.metricLabel}>{attempts === 1 ? 'Attempt' : 'Attempts'}</span>
          </div>
          <div className={styles.metricDivider} />
          <div className={styles.metric}>
            <span className={styles.metricValue}>{accuracy}%</span>
            <span className={styles.metricLabel}>Accuracy</span>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.gamesPlayed}</span>
            <span className={styles.statLabel}>Played</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{winPct}%</span>
            <span className={styles.statLabel}>Win %</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.currentStreak}</span>
            <span className={styles.statLabel}>Streak</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.maxStreak}</span>
            <span className={styles.statLabel}>Best</span>
          </div>
        </div>

        <div className={styles.sharePreview}>
          <p className={styles.sharePreviewLabel}>Share text</p>
          <div className={styles.sharePreviewBox}>
            <span className={styles.sharePreviewLine}>Chain Link #{puzzleNumber} 🔗</span>
            <span className={styles.sharePreviewLine}>
              ⏱ {formatTime(elapsedSeconds)}  •  {attempts} {attempts === 1 ? 'attempt' : 'attempts'}  •  🎯 {accuracy}%
            </span>
          </div>
        </div>

        <button
          className={`${styles.shareButton} ${copied ? styles.copied : ''}`}
          onClick={handleShare}
        >
          {copied ? '✓ Copied to clipboard' : '⬆ Share your result'}
        </button>

        <div className={styles.countdown}>
          <span className={styles.countdownLabel}>Next puzzle in</span>
          <span className={styles.countdownTime}>
            {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}
          </span>
        </div>
      </div>
    </div>
  );
}
