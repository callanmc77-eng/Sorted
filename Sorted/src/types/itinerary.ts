import type { Venue } from './venue'

export type TransportMode = 'DRIVING' | 'WALKING'

/** Half day ends ~13:00, full day ends ~18:00, custom lets the consultant set endTime manually */
export type TourDuration = 'half' | 'full' | 'custom'

export const TOUR_END_TIMES: Record<Exclude<TourDuration, 'custom'>, string> = {
  half: '13:00',
  full: '18:00',
}

export interface BookingInputs {
  cityId: string
  date: string          // "YYYY-MM-DD"
  adults: number
  children: number
  startTime: string     // "10:00"
  startLocation: string
  transportMode: TransportMode
  selectedVenueIds: string[]
}

export interface ScheduledStop {
  venue: Venue
  arrivalTime: string
  entryTime?: string
  departureTime: string
  travelFromPrev: number
  waitMins: number
  bufferMins: number
  feasible: true
  isLunch?: false
  lateWarning?: string   // set when stop runs past the tour end time — shown as soft amber note
}

export interface LunchStop {
  isLunch: true
  arrivalTime: string
  departureTime: string
  travelFromPrev: number
  durationMins: number
  bufferMins: number
  feasible: true
}

export interface InfeasibleStop {
  venue: Venue
  reason: string
  feasible: false
}

export type RouteStop = ScheduledStop | LunchStop | InfeasibleStop

export interface RouteResult {
  stops: RouteStop[]
  totalDurationMins: number
  endTime: string
  hasInfeasible: boolean
  // Stored so drag-reorder can reschedule without a new API call
  // venueOrder[i] = venue id at position i in the optimised order
  venueOrder: string[]
  // travelSeconds[i][j] = travel seconds from venue i to venue j (0-indexed into venueOrder)
  // index -1 conceptually = start location
  travelFromStart: number[]   // travelFromStart[i] = seconds from start to venueOrder[i]
  travelBetween: number[][]   // travelBetween[i][j] = seconds from venueOrder[i] to venueOrder[j]
  // Scheduling params — stored so reorder can replay without re-reading store
  startTimeMins: number
  dateStr: string
  bufferMins: number
  endTimeMins: number
  includeLunch: boolean
  lunchDurationMins: number
  lunchAfterStop: number | null
}
