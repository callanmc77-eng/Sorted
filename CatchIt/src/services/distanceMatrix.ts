import env from '../env';

export interface WalkingResult {
  durationSeconds: number;
  durationText: string;
  distanceText: string;
}

export async function getWalkingTime(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<WalkingResult> {
  const params = new URLSearchParams({
    origins: `${originLat},${originLng}`,
    destinations: `${destLat},${destLng}`,
    mode: 'walking',
    key: env.GOOGLE_MAPS_API_KEY,
  });

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Maps API error: ${resp.status}`);

  const data = await resp.json() as {
    status: string;
    rows: Array<{
      elements: Array<{
        status: string;
        duration: { value: number; text: string };
        distance: { value: number; text: string };
      }>;
    }>;
  };

  if (data.status !== 'OK') throw new Error(`Maps API status: ${data.status}`);
  const element = data.rows[0]?.elements[0];
  if (!element || element.status !== 'OK') throw new Error('No route found');

  return {
    durationSeconds: element.duration.value,
    durationText: element.duration.text,
    distanceText: element.distance.text,
  };
}
