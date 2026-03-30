import { motion } from 'framer-motion';
import { format } from 'date-fns';
import type { GtfsRoute, GtfsStop } from '../../types/gtfs';
import styles from './DepartureCard.module.css';

export interface DepartureData {
  tripId: string;
  scheduledMs: number;
  liveMs: number;
  delaySeconds: number;
}

interface DepartureCardProps {
  departure: DepartureData;
  route: GtfsRoute;
  stop: GtfsStop;
  walkingSeconds: number;
  walkingText: string;
  bufferMinutes: number;
  onTap: (departure: DepartureData) => void;
}

export function DepartureCard({
  departure, walkingSeconds, walkingText, bufferMinutes, onTap,
}: DepartureCardProps) {
  const { scheduledMs, delaySeconds, liveMs } = departure;
  const leaveByMs = liveMs - (walkingSeconds + bufferMinutes * 60) * 1000;
  const now = Date.now();
  const isPast = leaveByMs < now;
  const minutesUntilLeave = Math.floor((leaveByMs - now) / 60000);
  const isSoon = minutesUntilLeave <= 5 && !isPast;

  return (
    <motion.button
      className={`${styles.card} ${isPast ? styles.past : ''} ${isSoon ? styles.soon : ''}`}
      onClick={() => !isPast && onTap(departure)}
      whileTap={!isPast ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className={styles.left}>
        <div className={styles.time}>{format(scheduledMs, 'HH:mm')}</div>
        <div className={styles.leaveBy}>
          {isPast
            ? 'Passed'
            : `Leave by ${format(leaveByMs, 'HH:mm')}`}
        </div>
      </div>

      <div className={styles.right}>
        {delaySeconds === 0 ? (
          <span className={styles.onTime}>On time</span>
        ) : (
          <span className={`${styles.delay} ${delaySeconds > 0 ? styles.late : styles.early}`}>
            {delaySeconds > 0 ? '+' : ''}{Math.round(delaySeconds / 60)} min
          </span>
        )}
        {!isPast && (
          <div className={styles.walkNote}>
            {walkingText || `${Math.ceil(walkingSeconds / 60)} min walk`}
            {bufferMinutes > 0 && ` +${bufferMinutes}m`}
          </div>
        )}
      </div>

      {!isPast && (
        <div className={styles.chevron}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </div>
      )}
    </motion.button>
  );
}
