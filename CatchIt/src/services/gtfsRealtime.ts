import env from '../env';
import type { FeedMessage, FeedEntity } from '../types/realtime';

const BASE_URL = 'https://api.nationaltransport.ie/gtfsr/v2';

export async function fetchTripUpdates(): Promise<FeedEntity[]> {
  const url = `${BASE_URL}/TripUpdates?format=json`;
  const resp = await fetch(url, {
    headers: {
      'x-api-key': env.TFI_API_KEY,
      'Cache-Control': 'no-cache',
    },
  });
  if (!resp.ok) {
    throw new Error(`TFI API error: ${resp.status} ${resp.statusText}`);
  }
  const feed = await resp.json() as FeedMessage;
  return feed.entity || [];
}

/**
 * Get the delay in seconds for a specific trip + stop combination.
 * Returns null if no live data is available.
 */
export function getDelayForTripStop(
  entities: FeedEntity[],
  tripId: string,
  stopId: string
): number | null {
  const entity = entities.find(e => e.trip_update?.trip?.trip_id === tripId);
  if (!entity?.trip_update) return null;

  const updates = entity.trip_update.stop_time_update || [];
  const update = updates.find(u => u.stop_id === stopId);
  if (!update) {
    return entity.trip_update.delay ?? null;
  }
  return update.arrival?.delay ?? update.departure?.delay ?? null;
}

/**
 * Get the live arrival time (unix ms) for a trip+stop.
 * Returns null if no live data.
 */
export function getLiveTimeForTripStop(
  entities: FeedEntity[],
  tripId: string,
  stopId: string
): number | null {
  const entity = entities.find(e => e.trip_update?.trip?.trip_id === tripId);
  if (!entity?.trip_update) return null;

  const updates = entity.trip_update.stop_time_update || [];
  const update = updates.find(u => u.stop_id === stopId);
  if (update?.arrival?.time) return update.arrival.time * 1000;
  if (update?.departure?.time) return update.departure.time * 1000;
  return null;
}
