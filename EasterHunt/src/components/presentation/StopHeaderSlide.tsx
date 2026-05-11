import { motion } from 'framer-motion';
import styles from './StopHeaderSlide.module.css';

interface Props {
  pubIndex: number;
  pubName: string;
  totalTeams: number;
}

export default function StopHeaderSlide({ pubIndex, pubName, totalTeams }: Props) {
  return (
    <div className={styles.slide}>
      <div className={styles.stopNumber}>{pubIndex + 1}</div>

      <motion.p
        className={styles.stopLabel}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        Stop {pubIndex + 1}
      </motion.p>

      <motion.h2
        className={styles.pubName}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
      >
        {pubName}
      </motion.h2>

      <motion.div
        className={styles.badge}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55, duration: 0.45 }}
      >
        🍺 {totalTeams} team{totalTeams !== 1 ? 's' : ''} checked in
      </motion.div>
    </div>
  );
}
