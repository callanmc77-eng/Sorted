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
  pax: number
  startTime: string     // "09:00"
  startLocation: string
  transportMode: TransportMode
  selectedVenueIds: string[]
}

export interface ScheduledStop {
  venue: Venue
  arrivalTime: string      // "10:18" — when group physically arrives
  entryTime?: string       // "10:30" — actual slot entry (only set when different from arrivalTime)
  departureTime: string    // "12:00"
  travelFromPrev: number   // minutes of travel (0 for first stop)
  waitMins: number         // minutes waiting for slot (0 for continuous venues)
  bufferMins: number       // buffer applied after this stop
  feasible: true
  isLunch?: false
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
}
