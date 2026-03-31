import type { TransportMode } from '@/types/itinerary'

export interface DistanceMatrix {
  /** durations[i][j] = seconds from location i to location j */
  durations: number[][]
  /** distances[i][j] = metres from location i to location j */
  distances: number[][]
}

// Maps our internal transport mode to the Routes API RouteTravelMode values
const ROUTE_TRAVEL_MODE: Record<TransportMode, string> = {
  DRIVING: 'DRIVE',
  WALKING: 'WALK',
}

export async function fetchDistanceMatrix(
  locations: { lat: number; lng: number }[],
  mode: TransportMode,
): Promise<DistanceMatrix> {
  const n = locations.length
  const durations: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
  const distances: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))

  // Build origins/destinations for RouteMatrix
  const waypoints = locations.map((loc) => ({
    waypoint: { location: { latLng: { latitude: loc.lat, longitude: loc.lng } } },
  }))

  const requestBody = {
    origins: waypoints,
    destinations: waypoints,
    travelMode: ROUTE_TRAVEL_MODE[mode],
    routingPreference: mode === 'DRIVING' ? 'TRAFFIC_UNAWARE' : undefined,
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const response = await fetch(
    'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,status',
      },
      body: JSON.stringify(requestBody),
    },
  )

  if (!response.ok) {
    throw new Error(`Routes API error: ${response.status} ${response.statusText}`)
  }

  // Routes API returns a newline-delimited JSON stream (array of elements)
  const elements: Array<{
    originIndex: number
    destinationIndex: number
    duration?: string    // e.g. "300s"
    distanceMeters?: number
    status?: { code: number }
  }> = await response.json()

  for (const el of elements) {
    const i = el.originIndex ?? 0
    const j = el.destinationIndex ?? 0
    // status code 0 = OK
    if (!el.status || el.status.code === 0) {
      // duration is a string like "300s"
      const secs = el.duration ? parseInt(el.duration.replace('s', ''), 10) : 9_999_999
      durations[i][j] = isNaN(secs) ? 9_999_999 : secs
      distances[i][j] = el.distanceMeters ?? 9_999_999
    } else {
      durations[i][j] = 9_999_999
      distances[i][j] = 9_999_999
    }
  }

  return { durations, distances }
}
