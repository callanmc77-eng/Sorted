import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './TimePicker.module.css';

interface TimePickerProps {
  onSelectTime: (hour: number) => void;
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6am–11pm

function formatHour(h: number) {
  if (h === 0) return '12am';
  if (h < 12) return `${h}am`;
  if (h === 12) return '12pm';
  return `${h - 12}pm`;
}

export function TimePicker({ onSelectTime }: TimePickerProps) {
  const now = new Date();
  const currentHour = now.getHours();
  const defaultHour = HOURS.includes(currentHour) ? currentHour : HOURS[0];
  const [selected, setSelected] = useState(defaultHour);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>When do you want to travel?</h2>
        <p className={styles.subtitle}>We'll show buses around this time</p>
      </div>

      <div className={styles.timeGrid}>
        {HOURS.map(h => (
          <motion.button
            key={h}
            className={`${styles.hourBtn} ${selected === h ? styles.active : ''}`}
            onClick={() => setSelected(h)}
            whileTap={{ scale: 0.94 }}
          >
            {formatHour(h)}
          </motion.button>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.selectedDisplay}>
          Around <strong>{formatHour(selected)}</strong>
        </div>
        <motion.button
          className={styles.confirmBtn}
          onClick={() => onSelectTime(selected)}
          whileTap={{ scale: 0.97 }}
        >
          Show buses
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
