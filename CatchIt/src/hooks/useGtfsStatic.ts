import { useQuery } from '@tanstack/react-query';
import { getRoutes, getStops, getStopTimes, getTrips, getStopsForRoute } from '../services/gtfsStatic';

export function useRoutes() {
  return useQuery({
    queryKey: ['gtfs', 'routes'],
    queryFn: getRoutes,
    staleTime: Infinity,
  });
}

export function useStops() {
  return useQuery({
    queryKey: ['gtfs', 'stops'],
    queryFn: getStops,
    staleTime: Infinity,
  });
}

export function useStopTimes() {
  return useQuery({
    queryKey: ['gtfs', 'stop-times'],
    queryFn: getStopTimes,
    staleTime: Infinity,
  });
}

export function useTrips() {
  return useQuery({
    queryKey: ['gtfs', 'trips'],
    queryFn: getTrips,
    staleTime: Infinity,
  });
}

export function useStopsForRoute(routeId: string | null) {
  return useQuery({
    queryKey: ['gtfs', 'stops-for-route', routeId],
    queryFn: () => getStopsForRoute(routeId!),
    enabled: !!routeId,
    staleTime: Infinity,
  });
}
