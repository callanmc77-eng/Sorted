import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRoutes } from '../../hooks/useGtfsStatic';
import { useFavouritesStore } from '../../store/favouritesStore';
import { RouteCard } from './RouteCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import type { GtfsRoute } from '../../types/gtfs';
import styles from './RouteList.module.css';

interface RouteListProps {
  onSelectRoute: (route: GtfsRoute) => void;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
};

export function RouteList({ onSelectRoute }: RouteListProps) {
  const { data: routes, isLoading, error } = useRoutes();
  const favouriteRoutes = useFavouritesStore(s => s.routes);
  const [search, setSearch] = useState('');

  if (isLoading) return <LoadingSpinner text="Loading routes..." />;
  if (error) return <EmptyState icon="⚠️" title="Couldn't load routes" subtitle="Check your connection and try again." />;
  if (!routes?.length) return <EmptyState icon="🚌" title="No routes found" />;

  const filtered = routes.filter(r =>
    search === '' ||
    r.route_short_name.toLowerCase().includes(search.toLowerCase()) ||
    r.route_long_name.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const aFav = favouriteRoutes.includes(a.route_id);
    const bFav = favouriteRoutes.includes(b.route_id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return parseInt(a.route_short_name) - parseInt(b.route_short_name);
  });

  const hasFavs = sorted.some(r => favouriteRoutes.includes(r.route_id));

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search routes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className={styles.clearBtn} onClick={() => setSearch('')} aria-label="Clear search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {hasFavs && (
        <div className={styles.sectionLabel}>
          <span>★ Favourites</span>
        </div>
      )}

      <motion.div
        className={styles.list}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={search}
      >
        {sorted.map((route, idx) => {
          const isFav = favouriteRoutes.includes(route.route_id);
          const prevFav = idx > 0 && favouriteRoutes.includes(sorted[idx - 1].route_id);
          const showDivider = !isFav && prevFav;
          return (
            <motion.div key={route.route_id} variants={itemVariants}>
              {showDivider && <div className={styles.divider} />}
              <RouteCard route={route} onClick={() => onSelectRoute(route)} />
            </motion.div>
          );
        })}
      </motion.div>

      {sorted.length === 0 && (
        <EmptyState icon="🔍" title="No routes match" subtitle={`No routes found for "${search}"`} />
      )}
    </div>
  );
}
