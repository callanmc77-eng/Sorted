import { motion } from 'framer-motion';
import type { GtfsRoute } from '../../types/gtfs';
import { StarButton } from '../common/StarButton';
import { useFavouritesStore } from '../../store/favouritesStore';
import styles from './RouteCard.module.css';

interface RouteCardProps {
  route: GtfsRoute;
  onClick: () => void;
}

export function RouteCard({ route, onClick }: RouteCardProps) {
  const isFav = useFavouritesStore(s => s.isFavouriteRoute(route.route_id));
  const toggle = useFavouritesStore(s => s.toggleRoute);

  function handleLongPress() {
    toggle(route.route_id);
  }

  const longPressTimer = { current: 0 };

  return (
    <motion.div
      className={styles.card}
      onClick={onClick}
      onPointerDown={() => {
        longPressTimer.current = window.setTimeout(() => toggle(route.route_id), 500);
      }}
      onPointerUp={() => clearTimeout(longPressTimer.current)}
      onPointerCancel={() => clearTimeout(longPressTimer.current)}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className={styles.badge}>
        <span className={styles.routeNumber}>{route.route_short_name}</span>
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{route.route_long_name}</div>
        <div className={styles.meta}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9,18 15,12 9,6" />
          </svg>
          <span>Tap to see stops</span>
        </div>
      </div>
      <StarButton
        active={isFav}
        onToggle={(e) => { e.stopPropagation(); toggle(route.route_id); }}
      />
    </motion.div>
  );
}
