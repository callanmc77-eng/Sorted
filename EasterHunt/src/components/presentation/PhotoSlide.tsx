import { motion } from 'framer-motion';
import styles from './PhotoSlide.module.css';

interface Props {
  teamName: string;
  rank: number;
  photoUrl: string | null;
  pubName: string;
  pubIndex: number;
  checkedInAt?: string;
}

const MEDALS = ['🥇', '🥈', '🥉'];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' });
}

function rankLabel(rank: number) {
  if (rank === 1) return '1st Place';
  if (rank === 2) return '2nd Place';
  if (rank === 3) return '3rd Place';
  return `${rank}th Place`;
}

export default function PhotoSlide({ teamName, rank, photoUrl, pubName, pubIndex, checkedInAt }: Props) {
  return (
    <div className={`${styles.slide} ${!photoUrl ? styles.dnc : ''}`}>
      <motion.div
        className={styles.photoWrap}
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {photoUrl ? (
          <>
            <img src={photoUrl} alt={`${teamName} at ${pubName}`} className={styles.photo} />
            <div className={styles.photoOverlay} />
            {rank <= 3 && (
              <motion.div
                className={styles.medalBadge}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 18 }}
              >
                {MEDALS[rank - 1]}
              </motion.div>
            )}
          </>
        ) : (
          <div className={styles.missingPhoto}>
            <span className={styles.missingIcon}>📷</span>
            <span className={styles.missingLabel}>Did not check in</span>
          </div>
        )}
      </motion.div>

      <motion.div
        className={styles.info}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className={styles.left}>
          <span className={styles.rank}>{rankLabel(rank)}</span>
          <span className={styles.teamName}>{teamName}</span>
        </div>
        <div className={styles.right}>
          <span className={styles.stopBadge}>Stop {pubIndex + 1} · {pubName}</span>
          {checkedInAt && (
            <span className={styles.checkinTime}>Checked in {formatTime(checkedInAt)}</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
