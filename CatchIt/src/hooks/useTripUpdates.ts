import { useQuery } from '@tanstack/react-query';
import { fetchTripUpdates } from '../services/gtfsRealtime';
import type { FeedEntity } from '../types/realtime';

export function useTripUpdates() {
  return useQuery<FeedEntity[]>({
    queryKey: ['gtfs', 'trip-updates'],
    queryFn: fetchTripUpdates,
    refetchInterval: 30_000,
    staleTime: 25_000,
    retry: 2,
    // Return empty array on error so UI can still show scheduled times
    placeholderData: [],
  });
}
