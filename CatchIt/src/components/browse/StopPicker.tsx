import { motion } from 'framer-motion';
import { useStopsForRoute } from '../../hooks/useGtfsStatic';
import { useFavouritesStore } from '../../store/favouritesStore';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import type { GtfsRoute, GtfsStop } from '../../types/gtfs';
import { StarButton } from '../common/StarButton';
import styles from './StopPicker.module.css';

interface StopPickerProps {
  route: GtfsRoute;
  onSelectStop: (stop: GtfsStop) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
};

export function StopPicker({ route, onSelectStop }: StopPickerProps) {
  const { data: stops, isLoading } = useStopsForRoute(route.route_id);
  const favouriteStops = useFavouritesStore(s => s.stops);
  const toggleStop = useFavouritesStore(s => s.toggleStop);

  if (isLoading) return <LoadingSpinner text="Loading stops..." />;
  if (!stops?.length) return <EmptyState icon="🚏" title="No stops found" />;

  const seen = new Set<string>();
  const unique = stops.filter(s => {
    if (seen.has(s.stop_name)) return false;
    seen.add(s.stop_name);
    return true;
  });

  const sorted = [...unique].sort((a, b) => {
    const aFav = favouriteStops.includes(a.stop_id);
    const bFav = favouriteStops.includes(b.stop_id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return a.stop_name.localeCompare(b.stop_name);
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.routeBadge}>{route.route_short_name}</div>
        <span className={styles.headerText}>Choose your stop</span>
      </div>
      <motion.div
        className={styles.list}
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
      >
        {sorted.map(stop => {
          const isFav = favouriteStops.includes(stop.stop_id);
          return (
            <motion.div key={stop.stop_id} variants={itemVariants} className={styles.stopRow}>
              <button className={styles.stopBtn} onClick={() => onSelectStop(stop)}>
                <div className={styles.stopDot} />
                <span className={styles.stopName}>{stop.stop_name}</span>
              </button>
              <StarButton
                active={isFav}
                onToggle={e => { e.stopPropagation(); toggleStop(stop.stop_id); }}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
