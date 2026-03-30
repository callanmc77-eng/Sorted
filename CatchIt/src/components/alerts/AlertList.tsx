import { motion, AnimatePresence } from 'framer-motion';
import { useAlertsStore } from '../../store/alertsStore';
import { AlertCard } from './AlertCard';
import { EmptyState } from '../common/EmptyState';
import styles from './AlertList.module.css';

export function AlertList() {
  const alerts = useAlertsStore(s => s.alerts);

  const active = alerts.filter(a => a.leaveByTime > Date.now() - 60000);
  const past = alerts.filter(a => a.leaveByTime <= Date.now() - 60000);

  if (alerts.length === 0) {
    return (
      <EmptyState
        icon="🔔"
        title="No alerts set"
        subtitle="Browse routes and tap 'Set Notification' to get a push notification when it's time to leave."
      />
    );
  }

  return (
    <div className={styles.container}>
      {active.length > 0 && (
        <section>
          <div className={styles.sectionLabel}>Active</div>
          <motion.div
            className={styles.list}
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            <AnimatePresence>
              {active.map(alert => (
                <motion.div
                  key={alert.alertId}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
                  }}
                  exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                  layout
                >
                  <AlertCard alert={alert} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <div className={styles.sectionLabel}>Past</div>
          <div className={styles.list}>
            {past.map(alert => (
              <AlertCard key={alert.alertId} alert={alert} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
