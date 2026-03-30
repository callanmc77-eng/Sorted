import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useAlertsStore } from '../../store/alertsStore';
import { useSettingsStore } from '../../store/settingsStore';
import { usePushSubscription } from '../../hooks/usePushSubscription';
import { scheduleAlert } from '../../services/pushApi';
import type { DepartureData } from './DepartureCard';
import type { GtfsRoute, GtfsStop } from '../../types/gtfs';
import type { UserAlert } from '../../types/alert';
import styles from './NotificationSheet.module.css';

interface NotificationSheetProps {
  departure: DepartureData | null;
  route: GtfsRoute;
  stop: GtfsStop;
  walkingSeconds: number;
  walkingText: string;
  onClose: () => void;
}

export function NotificationSheet({
  departure, route, stop, walkingSeconds, walkingText, onClose,
}: NotificationSheetProps) {
  const defaultBuffer = useSettingsStore(s => s.defaultBufferMinutes);
  const [bufferMinutes, setBufferMinutes] = useState(defaultBuffer);
  const [done, setDone] = useState(false);

  const addAlert = useAlertsStore(s => s.addAlert);
  const { subscribe, supported } = usePushSubscription();

  // Recalculate whenever bufferMinutes changes
  const liveTimeMs = departure ? departure.liveMs : 0;
  const leaveByMs = liveTimeMs - (walkingSeconds + bufferMinutes * 60) * 1000;

  async function handleConfirm() {
    if (!departure) return;
    const alert: UserAlert = {
      alertId: uuidv4(),
      routeId: route.route_id,
      routeShortName: route.route_short_name,
      stopId: stop.stop_id,
      stopName: stop.stop_name,
      scheduledTime: departure.scheduledMs,
      leaveByTime: leaveByMs,
      delaySeconds: departure.delaySeconds,
      bufferMinutes,
      active: true,
      tripId: departure.tripId,
      subscription: null,
    };
    addAlert(alert);
    setDone(true);

    if (supported) {
      const sub = await subscribe();
      if (sub) {
        try { await scheduleAlert(alert, sub); } catch { /* in-app only */ }
      }
    }

    setTimeout(onClose, 900);
  }

  // Reset buffer when a new departure is selected
  const isOpen = !!departure;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className={styles.sheet}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
          >
            {/* Drag handle */}
            <div className={styles.handle} />

            {/* Header */}
            <div className={styles.header}>
              <div className={styles.routeBadge}>{route.route_short_name}</div>
              <div className={styles.headerText}>
                <div className={styles.busTime}>
                  {departure && format(departure.scheduledMs, 'HH:mm')}
                  {departure && departure.delaySeconds !== 0 && (
                    <span className={`${styles.delayChip} ${departure.delaySeconds > 0 ? styles.late : styles.early}`}>
                      {departure.delaySeconds > 0 ? '+' : ''}{Math.round(departure.delaySeconds / 60)} min
                    </span>
                  )}
                  {departure && departure.delaySeconds === 0 && (
                    <span className={`${styles.delayChip} ${styles.onTime}`}>On time</span>
                  )}
                </div>
                <div className={styles.stopName}>{stop.stop_name}</div>
              </div>
            </div>

            {/* Buffer picker */}
            <div className={styles.bufferSection}>
              <div className={styles.bufferTitle}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
                </svg>
                Buffer time
                {bufferMinutes !== defaultBuffer && (
                  <button className={styles.resetLink} onClick={() => setBufferMinutes(defaultBuffer)}>
                    Reset to default
                  </button>
                )}
              </div>
              <div className={styles.bufferControls}>
                <button
                  className={styles.stepBtn}
                  onClick={() => setBufferMinutes(m => Math.max(0, m - 1))}
                  disabled={bufferMinutes === 0}
                >−</button>
                <span className={styles.bufferValue}>{bufferMinutes} min</span>
                <button
                  className={styles.stepBtn}
                  onClick={() => setBufferMinutes(m => Math.min(30, m + 1))}
                  disabled={bufferMinutes === 30}
                >+</button>
              </div>
            </div>

            {/* Leave by summary */}
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Walk to stop</span>
                <span className={styles.summaryValue}>{walkingText || `${Math.ceil(walkingSeconds / 60)} min`}</span>
              </div>
              {bufferMinutes > 0 && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Buffer</span>
                  <span className={styles.summaryValue}>+{bufferMinutes} min</span>
                </div>
              )}
              <div className={`${styles.summaryRow} ${styles.leaveByRow}`}>
                <span className={styles.leaveByLabel}>Leave by</span>
                <span className={styles.leaveByValue}>{format(leaveByMs, 'HH:mm')}</span>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              className={`${styles.confirmBtn} ${done ? styles.confirmDone : ''}`}
              onClick={handleConfirm}
              disabled={done}
              whileTap={{ scale: 0.97 }}
            >
              {done ? (
                <>✓ Notification set</>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  Set Notification
                </>
              )}
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
