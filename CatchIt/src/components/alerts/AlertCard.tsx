import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useAlertsStore } from '../../store/alertsStore';
import { cancelAlert } from '../../services/pushApi';
import { SwipeToDelete } from '../common/SwipeToDelete';
import { CountdownBadge } from '../common/CountdownBadge';
import type { UserAlert } from '../../types/alert';
import styles from './AlertCard.module.css';

interface AlertCardProps {
  alert: UserAlert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const removeAlert = useAlertsStore(s => s.removeAlert);
  const toggleAlert = useAlertsStore(s => s.toggleAlert);

  async function handleDelete() {
    await cancelAlert(alert.alertId);
    removeAlert(alert.alertId);
  }

  const isPast = alert.leaveByTime < Date.now();

  return (
    <SwipeToDelete onDelete={handleDelete}>
      <motion.div
        className={`${styles.card} ${!alert.active ? styles.inactive : ''} ${isPast ? styles.past : ''}`}
        layout
      >
        <div className={styles.topRow}>
          <div className={styles.routeBadge}>{alert.routeShortName}</div>
          <div className={styles.stopName}>{alert.stopName}</div>
          <button
            className={`${styles.toggle} ${alert.active ? styles.toggleOn : ''}`}
            onClick={() => toggleAlert(alert.alertId)}
            aria-label={alert.active ? 'Pause alert' : 'Resume alert'}
          >
            <span className={styles.toggleThumb} />
          </button>
        </div>

        <div className={styles.timesRow}>
          <div className={styles.busTime}>
            <span className={styles.timeLabel}>Bus at</span>
            <span className={styles.timeValue}>{format(alert.scheduledTime, 'HH:mm')}</span>
          </div>
          <div className={styles.arrow}>→</div>
          <div className={styles.leaveTime}>
            <span className={styles.timeLabel}>Leave by</span>
            <span className={`${styles.timeValue} ${styles.accent}`}>{format(alert.leaveByTime, 'HH:mm')}</span>
            {alert.bufferMinutes > 0 && (
              <span className={styles.bufferChip}>+{alert.bufferMinutes}m buffer</span>
            )}
          </div>
          <div className={styles.countdown}>
            {!isPast && alert.active && <CountdownBadge targetMs={alert.leaveByTime} size="md" />}
            {isPast && <span className={styles.pastLabel}>Passed</span>}
          </div>
        </div>

        {alert.delaySeconds > 0 && (
          <div className={styles.delayNote}>
            <span className={styles.delayDot} />
            Running +{Math.round(alert.delaySeconds / 60)} min late when set
          </div>
        )}
      </motion.div>
    </SwipeToDelete>
  );
}
