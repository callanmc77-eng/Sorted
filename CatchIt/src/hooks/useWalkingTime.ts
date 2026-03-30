import { useQuery } from '@tanstack/react-query';
import { getWalkingTime } from '../services/distanceMatrix';

interface UseWalkingTimeParams {
  originLat: number | null;
  originLng: number | null;
  destLat: number | null;
  destLng: number | null;
}

export function useWalkingTime({ originLat, originLng, destLat, destLng }: UseWalkingTimeParams) {
  const enabled =
    originLat !== null && originLng !== null &&
    destLat !== null && destLng !== null;

  return useQuery({
    queryKey: ['walking-time', originLat, originLng, destLat, destLng],
    queryFn: () => getWalkingTime(originLat!, originLng!, destLat!, destLng!),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}
