import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/settingsStore';
import styles from './SettingsPage.module.css';

const BUFFER_OPTIONS = [0, 2, 3, 5, 7, 10, 15, 20];

export function SettingsPage() {
  const { defaultBufferMinutes, setDefaultBufferMinutes } = useSettingsStore();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Default buffer time</h2>
            <p className={styles.sectionDesc}>
              Added on top of your walking time for every alert — so you leave a little earlier than strictly necessary.
            </p>
          </div>

          <div className={styles.bufferGrid}>
            {BUFFER_OPTIONS.map(mins => (
              <motion.button
                key={mins}
                className={`${styles.bufferBtn} ${defaultBufferMinutes === mins ? styles.active : ''}`}
                onClick={() => setDefaultBufferMinutes(mins)}
                whileTap={{ scale: 0.94 }}
              >
                <span className={styles.bufferMins}>{mins}</span>
                <span className={styles.bufferUnit}>min</span>
              </motion.button>
            ))}
          </div>

          <div className={styles.customRow}>
            <span className={styles.customLabel}>Custom</span>
            <div className={styles.stepper}>
              <button
                className={styles.stepBtn}
                onClick={() => setDefaultBufferMinutes(Math.max(0, defaultBufferMinutes - 1))}
                disabled={defaultBufferMinutes === 0}
              >−</button>
              <span className={styles.stepValue}>{defaultBufferMinutes} min</span>
              <button
                className={styles.stepBtn}
                onClick={() => setDefaultBufferMinutes(Math.min(60, defaultBufferMinutes + 1))}
                disabled={defaultBufferMinutes === 60}
              >+</button>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.previewCard}>
            <div className={styles.previewIcon}>🚶</div>
            <div className={styles.previewText}>
              <div className={styles.previewTitle}>How it works</div>
              <div className={styles.previewDesc}>
                If a bus is at <strong>09:30</strong>, your walk is <strong>8 min</strong>, and your buffer is <strong>{defaultBufferMinutes} min</strong> — you'll be told to leave by <strong>{formatLeaveBy(9 * 60 + 30, 8, defaultBufferMinutes)}</strong>.
              </div>
            </div>
          </div>
          <p className={styles.overrideNote}>
            You can always override the buffer for individual buses on the departures screen.
          </p>
        </section>
      </div>
    </div>
  );
}

function formatLeaveBy(busMinutes: number, walkMins: number, bufferMins: number): string {
  const leaveMinutes = busMinutes - walkMins - bufferMins;
  const h = Math.floor(leaveMinutes / 60);
  const m = leaveMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
