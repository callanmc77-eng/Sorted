import { AlertList } from '../components/alerts/AlertList';
import styles from './AlertsPage.module.css';

export function AlertsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Alerts</h1>
        <p className={styles.subtitle}>Swipe left on any alert to delete it</p>
      </div>
      <div className={styles.content}>
        <AlertList />
      </div>
    </div>
  );
}
