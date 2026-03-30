import type { GtfsRoute, GtfsStop, GtfsStopTime, GtfsTrip } from '../types/gtfs';

let routesCache: GtfsRoute[] | null = null;
let stopsCache: GtfsStop[] | null = null;
let stopTimesCache: GtfsStopTime[] | null = null;
let tripsCache: GtfsTrip[] | null = null;

async function loadJson<T>(path: string): Promise<T> {
  const resp = await fetch(path);
  if (!resp.ok) throw new Error(`Failed to load ${path}: ${resp.status}`);
  return resp.json() as Promise<T>;
}

export async function getRoutes(): Promise<GtfsRoute[]> {
  if (!routesCache) routesCache = await loadJson<GtfsRoute[]>('/gtfs-static/galway_routes.json');
  return routesCache;
}

export async function getStops(): Promise<GtfsStop[]> {
  if (!stopsCache) stopsCache = await loadJson<GtfsStop[]>('/gtfs-static/galway_stops.json');
  return stopsCache;
}

export async function getStopTimes(): Promise<GtfsStopTime[]> {
  if (!stopTimesCache) stopTimesCache = await loadJson<GtfsStopTime[]>('/gtfs-static/galway_stop_times.json');
  return stopTimesCache;
}

export async function getTrips(): Promise<GtfsTrip[]> {
  if (!tripsCache) tripsCache = await loadJson<GtfsTrip[]>('/gtfs-static/galway_trips.json');
  return tripsCache;
}

export async function getStopsForRoute(routeId: string): Promise<GtfsStop[]> {
  const [trips, stopTimes, stops] = await Promise.all([getTrips(), getStopTimes(), getStops()]);
  const tripIds = new Set(trips.filter(t => t.route_id === routeId).map(t => t.trip_id));
  const stopIds = new Set(stopTimes.filter(st => tripIds.has(st.trip_id)).map(st => st.stop_id));
  const stopMap = new Map(stops.map(s => [s.stop_id, s]));
  return [...stopIds].map(id => stopMap.get(id)!).filter(Boolean);
}

export async function getStopById(stopId: string): Promise<GtfsStop | undefined> {
  const stops = await getStops();
  return stops.find(s => s.stop_id === stopId);
}

/** Parse HH:MM:SS (may be >23:xx for overnight services) into minutes since midnight */
export function parseTimeToMinutes(time: string): number {
  const parts = time.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

/** Convert HH:MM:SS GTFS time to today's Date object */
export function gtfsTimeToDate(time: string, referenceDate: Date = new Date()): Date {
  const [h, m, s] = time.split(':').map(Number);
  const d = new Date(referenceDate);
  d.setHours(h, m, s, 0);
  return d;
}
