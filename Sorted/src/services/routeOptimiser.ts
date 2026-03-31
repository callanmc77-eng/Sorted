import type { Venue } from '@/types/venue'
import type { RouteResult, RouteStop, TransportMode } from '@/types/itinerary'
import { fetchDistanceMatrix } from './distanceMatrix'
import { checkVenueFeasibility } from './feasibility'
import { formatTime } from '@/utils/time'

interface Coord {
  lat: number
  lng: number
}

/**
 * Geocodes an address string to coordinates using the Google Maps Geocoding API.
 * Throws a user-friendly error if the address can't be resolved.
 */
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
 * Builds an optimised route using a nearest-neighbour greedy algorithm on travel
 * duration (not distance), then checks each stop for feasibility against venue hours.
 *
 * @param startCoord  Geocoded coordinates of the starting location
 * @param venues      Venues to visit (in any order — algorithm reorders them)
 * @param startTimeMins  Start time in minutes from midnight (e.g. 09:00 → 540)
 * @param dateStr     "YYYY-MM-DD" — used to check day-of-week opening hours
 * @param transportMode "DRIVING" | "WALKING"
 * @param bufferMins  Extra gap to add after each stop's departure (e.g. for restroom breaks, transfers)
 * @param endTimeMins Tour end cap in minutes from midnight — stops whose departure exceeds this are infeasible
 */
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
): Promise<RouteResult> {
  const n = venues.length

  // Build location list: index 0 = start, indices 1..n = venues
  const locations: Coord[] = [startCoord, ...venues.map((v) => v.coordinates)]

  // Fetch NxN+1 duration matrix
  const matrix = await fetchDistanceMatrix(locations, transportMode)

  // ── Nearest-neighbour TSP ──────────────────────────────────────────────────
  const visited = new Set<number>()
  const order: number[] = []
  let current = 0

  while (order.length < n) {
    let nearest = -1
    let shortestDuration = Infinity

    for (let j = 1; j <= n; j++) {
      if (!visited.has(j)) {
        const dur = matrix.durations[current][j]
        if (dur < shortestDuration) {
          shortestDuration = dur
          nearest = j
        }
      }
    }

    visited.add(nearest)
    order.push(nearest)
    current = nearest
  }
  // ── End TSP ───────────────────────────────────────────────────────────────

  // Walk the ordered route, computing times and feasibility
  const stops: RouteStop[] = []
  let cursor = startTimeMins
  let prevNode = 0
  // lunchAfterStop is 1-based; insert after the Nth venue in the optimised order
  const lunchAfterIndex = includeLunch && lunchAfterStop != null ? lunchAfterStop : -1
  let feasibleCount = 0

  for (let i = 0; i < order.length; i++) {
    const nodeIdx = order[i]
    const venue = venues[nodeIdx - 1] // nodeIdx is 1-based
    const travelSecs = matrix.durations[prevNode][nodeIdx]
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
          reason: `${venue.name} would end at ${formatTime(departMins)}, after your ${formatTime(endTimeMins)} tour end time. Remove it or switch to a full day.`,
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
        feasibleCount++
      }
    }

    prevNode = nodeIdx

    // Insert lunch after the chosen stop index
    if (i + 1 === lunchAfterIndex) {
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
