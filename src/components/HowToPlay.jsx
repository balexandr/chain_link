import styles from './HowToPlay.module.css';

export default function HowToPlay({ onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>How to Play</h2>
        <p className={styles.intro}>Draw a path from START to END where every step forms a compound word.</p>

        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepIcon}>👆</span>
            <div>
              <p className={styles.stepTitle}>Press and drag</p>
              <p className={styles.stepDesc}>Hold down on the <strong style={{ color: 'var(--start)' }}>green START</strong> cell and drag through the grid. Release on <strong style={{ color: 'var(--end)' }}>red END</strong> to submit.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepIcon}>🔗</span>
            <div>
              <p className={styles.stepTitle}>Chain compound words</p>
              <p className={styles.stepDesc}>Each adjacent pair in your path must form a real compound word — e.g. FIRE→PLACE (FIREPLACE) or PLACE→MAT (PLACEMAT).</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepIcon}>↔️</span>
            <div>
              <p className={styles.stepTitle}>4-directional moves only</p>
              <p className={styles.stepDesc}>Move up, down, left, or right — no diagonals. Lift your finger mid-path and it resets.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepIcon}>♾️</span>
            <div>
              <p className={styles.stepTitle}>Unlimited attempts</p>
              <p className={styles.stepDesc}>Wrong path? Try again — your time keeps running and fewer attempts means higher accuracy on the share card.</p>
            </div>
          </div>
        </div>

        <div className={styles.example}>
          <p className={styles.exampleLabel}>Example path</p>
          <div className={styles.exampleGrid}>
            <div className={styles.exRow}>
              <span className={`${styles.exCell} ${styles.exStart}`}>FIRE</span>
              <span className={`${styles.exCell} ${styles.exPath}`}>PLACE</span>
              <span className={styles.exCell}>DESK</span>
              <span className={styles.exCell}>LAMP</span>
            </div>
            <div className={styles.exRow}>
              <span className={styles.exCell}>RING</span>
              <span className={`${styles.exCell} ${styles.exPath}`}>MAT</span>
              <span className={styles.exCell}>WORK</span>
              <span className={styles.exCell}>LIGHT</span>
            </div>
            <div className={styles.exRow}>
              <span className={styles.exCell}>BELL</span>
              <span className={`${styles.exCell} ${styles.exPath}`}>DOOR</span>
              <span className={`${styles.exCell} ${styles.exPath}`}>BELL</span>
              <span className={styles.exCell}>TOWER</span>
            </div>
            <div className={styles.exRow}>
              <span className={styles.exCell}>BOOK</span>
              <span className={styles.exCell}>SHELF</span>
              <span className={`${styles.exCell} ${styles.exPath}`}>BOY</span>
              <span className={`${styles.exCell} ${styles.exEnd}`}>SCOUT</span>
            </div>
          </div>
          <p className={styles.exampleCaption}>FIREPLACE → PLACEMAT → DOORMAT → DOORBELL → BELLBOY → BOYSCOUT</p>
        </div>

        <button className={styles.playButton} onClick={onClose}>
          Start playing
        </button>
      </div>
    </div>
  );
}
