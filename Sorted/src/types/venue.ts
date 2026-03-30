export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface DayHours {
  open: string    // "09:00" 24h
  close: string   // "17:00"
  closed?: boolean
}

export type WeeklyHours = Record<DayOfWeek, DayHours>

export type BookingSystem = 'fareharbor' | 'tock' | 'ticketsolve' | 'direct' | 'manual'

/**
 * How entry slots work at this venue:
 *
 * "continuous"  — walk-in anytime between open and last entry (e.g. Guinness Storehouse).
 *                 Arrival snaps to no particular slot.
 *
 * "interval"    — timed entry every N minutes from opening (e.g. every 15 min, every 30 min).
 *                 slotIntervalMins must be set.
 *                 Arrival is rounded up to the next slot boundary.
 *
 * "fixed"       — specific named time slots only (e.g. hourly guided tours at 10:00, 11:00…).
 *                 fixedSlots must be set as an array of "HH:MM" strings.
 *                 Arrival is rounded up to the next slot in the list.
 */
export type SlotType = 'continuous' | 'interval' | 'fixed'

export interface Venue {
  id: string
  name: string
  address: string
  coordinates: { lat: number; lng: number }
  openingHours: WeeklyHours
  lastEntry: string            // "16:00" latest you can enter
  avgVisitDurationMins: number
  bookingUrl: string
  bookingSystem: BookingSystem
  notes: string
  cityId: string

  // Slot scheduling
  slotType: SlotType
  slotIntervalMins?: number    // used when slotType === "interval"
  fixedSlots?: string[]        // used when slotType === "fixed", e.g. ["10:00","11:00","12:00"]
}

export interface City {
  id: string
  name: string
  defaultLat: number
  defaultLng: number
}
