import { useMemo } from 'react';
import { useStopTimes, useTrips } from '../../hooks/useGtfsStatic';
import { useTripUpdates } from '../../hooks/useTripUpdates';
import { useWalkingTime } from '../../hooks/useWalkingTime';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useSettingsStore } from '../../store/settingsStore';
import { getDelayForTripStop, getLiveTimeForTripStop } from '../../services/gtfsRealtime';
import { gtfsTimeToDate } from '../../services/gtfsStatic';
import { DepartureCard } from './DepartureCard';
import type { DepartureData } from './DepartureCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import type { GtfsRoute, GtfsStop } from '../../types/gtfs';
import styles from './DepartureResults.module.css';

interface DepartureResultsProps {
  route: GtfsRoute;
  stop: GtfsStop;
  hour: number;
  onSelectDeparture: (departure: DepartureData, walkingSeconds: number, walkingText: string) => void;
}

export function DepartureResults({ route, stop, hour, onSelectDeparture }: DepartureResultsProps) {
  const { data: stopTimes, isLoading: stLoading } = useStopTimes();
  const { data: trips, isLoading: tripsLoading } = useTrips();
  const { data: realtimeEntities = [] } = useTripUpdates();
  const { lat, lng } = useGeolocation();
  const bufferMinutes = useSettingsStore(s => s.defaultBufferMinutes);

  const { data: walkingData } = useWalkingTime({
    originLat: lat,
    originLng: lng,
    destLat: stop.stop_lat,
    destLng: stop.stop_lon,
  });

  const walkingSeconds = walkingData?.durationSeconds ?? 5 * 60;
  const walkingText = walkingData?.durationText ?? '~5 min walk';

  const departures = useMemo(() => {
    if (!stopTimes || !trips) return [];

    const routeTrips = new Map(trips.filter(t => t.route_id === route.route_id).map(t => [t.trip_id, t]));
    const relevant = stopTimes.filter(st => st.stop_id === stop.stop_id && routeTrips.has(st.trip_id));

    const now = new Date();
    const windowStartMs = new Date(now).setHours(hour, 0, 0, 0);
    const windowEndMs = new Date(now).setHours(hour + 2, 59, 59, 0);

    return relevant
      .map(st => {
        const scheduledDate = gtfsTimeToDate(st.arrival_time, now);
        const scheduledMs = scheduledDate.getTime();
        if (scheduledMs < windowStartMs || scheduledMs > windowEndMs) return null;
        const delay = getDelayForTripStop(realtimeEntities, st.trip_id, stop.stop_id) ?? 0;
        const liveMs = getLiveTimeForTripStop(realtimeEntities, st.trip_id, stop.stop_id) ?? (scheduledMs + delay * 1000);
        return { tripId: st.trip_id, scheduledMs, liveMs, delaySeconds: delay };
      })
      .filter(Boolean)
      .sort((a, b) => a!.liveMs - b!.liveMs)
      .slice(0, 10) as DepartureData[];
  }, [stopTimes, trips, realtimeEntities, route.route_id, stop.stop_id, hour]);

  if (stLoading || tripsLoading) return <LoadingSpinner text="Finding buses..." />;
  if (departures.length === 0) {
    return (
      <EmptyState
        icon="🚌"
        title="No buses found"
        subtitle={`No buses for route ${route.route_short_name} at ${stop.stop_name} around ${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'pm' : 'am'}.`}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.stopHeader}>
        <div className={styles.stopInfo}>
          <span className={styles.stopPin}>📍</span>
          <div>
            <div className={styles.stopName}>{stop.stop_name}</div>
            <div className={styles.routeLabel}>Route {route.route_short_name} · tap a bus to set a notification</div>
          </div>
        </div>
        {walkingData && (
          <div className={styles.walkingInfo}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1"/><path d="M9 20l2-6 3 3 2-4"/>
            </svg>
            {walkingData.durationText}
          </div>
        )}
      </div>

      <div className={styles.list}>
        {departures.map(d => (
          <DepartureCard
            key={d.tripId}
            departure={d}
            route={route}
            stop={stop}
            walkingSeconds={walkingSeconds}
            walkingText={walkingText}
            bufferMinutes={bufferMinutes}
            onTap={(dep) => onSelectDeparture(dep, walkingSeconds, walkingText)}
          />
        ))}
      </div>
    </div>
  );
}
