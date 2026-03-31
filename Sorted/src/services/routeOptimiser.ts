import type { Venue } from '@/types/venue'
import type { RouteResult, RouteStop, TransportMode } from '@/types/itinerary'
import { fetchDistanceMatrix } from './distanceMatrix'
import { checkVenueFeasibility } from './feasibility'
import { formatTime } from '@/utils/time'

interface Coord {
  lat: number
  lng: number
}

export async function geocodeAddress(address: string): Promise<Coord> {
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        resolve({
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        })
      } else {
        reject(
          new Error(
            `Could not find "${address}". Try adding the city name, e.g. "${address}, Dublin".`,
          ),
        )
      }
    })
  })
}

/**
 * Runs the scheduling pass on an ordered list of venues using pre-fetched travel times.
 * Used both by the initial build and by drag-reorder (no extra API call needed).
 */
export function scheduleVenues(
  venues: Venue[],           // in display order
  travelFromStart: number[], // seconds from start to venues[i]
  travelBetween: number[][],  // seconds from venues[i] to venues[j]
  startTimeMins: number,
  dateStr: string,
  bufferMins: number,
  endTimeMins: number,
  includeLunch: boolean,
  lunchDurationMins: number,
  lunchAfterStop: number | null,
): Omit<RouteResult, 'venueOrder' | 'travelFromStart' | 'travelBetween' | 'startTimeMins' | 'dateStr' | 'bufferMins' | 'endTimeMins' | 'includeLunch' | 'lunchDurationMins' | 'lunchAfterStop'> {
  const stops: RouteStop[] = []
  let cursor = startTimeMins

  for (let i = 0; i < venues.length; i++) {
    const venue = venues[i]
    const travelSecs = i === 0 ? travelFromStart[i] : travelBetween[i - 1][i]
    const travelMins = Math.ceil(travelSecs / 60)

    cursor += travelMins
    const arrivalMins = cursor

    const check = checkVenueFeasibility(venue, arrivalMins, dateStr)

    if (!check.feasible) {
      stops.push({ venue, reason: check.reason!, feasible: false })
      cursor += venue.avgVisitDurationMins + bufferMins
    } else {
      const entryMins = check.entryMins!
      const departMins = entryMins + venue.avgVisitDurationMins

      if (departMins > endTimeMins) {
        stops.push({
          venue,
          feasible: false,
          reason: `${venue.name} would end at ${formatTime(departMins)}, after your ${formatTime(endTimeMins)} tour end time.`,
        })
        cursor = departMins + bufferMins
      } else {
        stops.push({
          venue,
          arrivalTime: formatTime(arrivalMins),
          entryTime: arrivalMins < entryMins ? formatTime(entryMins) : undefined,
          departureTime: formatTime(departMins),
          travelFromPrev: travelMins,
          waitMins: entryMins - arrivalMins,
          bufferMins,
          feasible: true,
        })
        cursor = departMins + bufferMins
      }
    }

    // Insert lunch after the chosen stop (1-based)
    if (includeLunch && lunchAfterStop != null && i + 1 === lunchAfterStop) {
      stops.push({
        isLunch: true,
        arrivalTime: formatTime(cursor),
        departureTime: formatTime(cursor + lunchDurationMins),
        travelFromPrev: 0,
        durationMins: lunchDurationMins,
        bufferMins: 0,
        feasible: true,
      })
      cursor += lunchDurationMins
    }
  }

  const feasibleStops = stops.filter((s): s is Extract<RouteStop, { feasible: true }> => s.feasible)
  const endTime =
    feasibleStops.length > 0
      ? feasibleStops[feasibleStops.length - 1].departureTime
      : formatTime(startTimeMins)

  return {
    stops,
    totalDurationMins: cursor - startTimeMins,
    endTime,
    hasInfeasible: stops.some((s) => !s.feasible),
  }
}

export async function buildOptimalRoute(
  startCoord: Coord,
  venues: Venue[],
  startTimeMins: number,
  dateStr: string,
  transportMode: TransportMode,
  bufferMins = 0,
  endTimeMins = 18 * 60,
  includeLunch = false,
  lunchDurationMins = 60,
  lunchAfterStop: number | null = null,
  pinnedLastId: string | null = null,
): Promise<RouteResult> {
  const n = venues.length
  const locations: Coord[] = [startCoord, ...venues.map((v) => v.coordinates)]
  const matrix = await fetchDistanceMatrix(locations, transportMode)

  // Nearest-neighbour TSP — exclude pinned venue from normal ordering
  const pinnedIdx = pinnedLastId ? venues.findIndex((v) => v.id === pinnedLastId) : -1
  const visited = new Set<number>()
  if (pinnedIdx >= 0) visited.add(pinnedIdx + 1) // reserve it

  const order: number[] = []
  let current = 0

  while (order.length < (pinnedIdx >= 0 ? n - 1 : n)) {
    let nearest = -1
    let shortestDuration = Infinity
    for (let j = 1; j <= n; j++) {
      if (!visited.has(j)) {
        const dur = matrix.durations[current][j]
        if (dur < shortestDuration) { shortestDuration = dur; nearest = j }
      }
    }
    visited.add(nearest)
    order.push(nearest)
    current = nearest
  }

  // Append pinned venue last
  if (pinnedIdx >= 0) order.push(pinnedIdx + 1)

  // Build per-venue travel lookup arrays (0-indexed into orderedVenues)
  const orderedVenues = order.map((nodeIdx) => venues[nodeIdx - 1])
  const travelFromStart = order.map((nodeIdx) => matrix.durations[0][nodeIdx])
  const travelBetween: number[][] = order.map((fromNode) =>
    order.map((toNode) => matrix.durations[fromNode][toNode])
  )

  const scheduled = scheduleVenues(
    orderedVenues,
    travelFromStart,
    travelBetween,
    startTimeMins,
    dateStr,
    bufferMins,
    endTimeMins,
    includeLunch,
    lunchDurationMins,
    lunchAfterStop,
  )

  return {
    ...scheduled,
    venueOrder: orderedVenues.map((v) => v.id),
    travelFromStart,
    travelBetween,
    startTimeMins,
    dateStr,
    bufferMins,
    endTimeMins,
    includeLunch,
    lunchDurationMins,
    lunchAfterStop,
  }
}
