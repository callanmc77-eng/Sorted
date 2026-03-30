import type { Venue, DayOfWeek } from '@/types/venue'
import { parseTime, formatTime } from '@/utils/time'

const DAY_KEYS: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export interface FeasibilityResult {
  feasible: boolean
  /** The actual entry time in minutes from midnight (may be later than arrivalMins due to slot snapping) */
  entryMins?: number
  reason?: string
}

/**
 * Finds the next available entry slot at or after arrivalMins.
 * Returns null if no valid slot exists before lastEntryMins.
 */
function nextSlot(venue: Venue, arrivalMins: number, openMins: number, lastEntryMins: number): number | null {
  if (venue.slotType === 'continuous') {
    // Any time between open and last entry is fine
    return arrivalMins >= openMins && arrivalMins <= lastEntryMins ? arrivalMins : null
  }

  if (venue.slotType === 'interval' && venue.slotIntervalMins) {
    const interval = venue.slotIntervalMins
    // Slots start at openMins and repeat every interval minutes
    // Find first slot >= arrivalMins
    const offsetFromOpen = arrivalMins - openMins
    const slotsElapsed = offsetFromOpen <= 0 ? 0 : Math.ceil(offsetFromOpen / interval)
    const candidateMins = openMins + slotsElapsed * interval
    return candidateMins <= lastEntryMins ? candidateMins : null
  }

  if (venue.slotType === 'fixed' && venue.fixedSlots) {
    for (const slot of venue.fixedSlots) {
      const slotMins = parseTime(slot)
      if (slotMins >= arrivalMins && slotMins <= lastEntryMins) {
        return slotMins
      }
    }
    return null
  }

  // Fallback: treat as continuous
  return arrivalMins <= lastEntryMins ? arrivalMins : null
}

export function checkVenueFeasibility(
  venue: Venue,
  arrivalMins: number, // minutes from midnight — when the group physically arrives
  dateStr: string,     // "YYYY-MM-DD"
): FeasibilityResult {
  const date = new Date(dateStr + 'T12:00:00') // noon avoids DST edge cases
  const dayKey = DAY_KEYS[date.getDay()]
  const hours = venue.openingHours[dayKey]

  if (hours.closed) {
    return {
      feasible: false,
      reason: `${venue.name} is closed on ${dayKey.charAt(0).toUpperCase() + dayKey.slice(1)}s.`,
    }
  }

  const openMins = parseTime(hours.open)
  const closeMins = parseTime(hours.close)
  const lastEntryMins = parseTime(venue.lastEntry)

  // Find the next valid entry slot at or after arrival
  const slot = nextSlot(venue, arrivalMins, openMins, lastEntryMins)

  if (slot === null) {
    // Determine which limit was hit for a clear message
    if (arrivalMins > lastEntryMins) {
      return {
        feasible: false,
        reason: `${venue.name}'s last entry is ${venue.lastEntry} but you'd arrive at ${formatTime(arrivalMins)}.`,
      }
    }
    // No slot available before last entry
    const slotDesc = venue.slotType === 'fixed'
      ? `last tour slot is ${venue.fixedSlots![venue.fixedSlots!.length - 1]}`
      : `last entry is ${venue.lastEntry}`
    return {
      feasible: false,
      reason: `${venue.name}: no available entry slot after arriving at ${formatTime(arrivalMins)} — ${slotDesc}.`,
    }
  }

  if (arrivalMins < openMins && slot > arrivalMins) {
    // Group arrives before opening — they wait, which is fine as long as the slot fits
  }

  const waitMins = slot - arrivalMins
  const departMins = slot + venue.avgVisitDurationMins

  if (departMins > closeMins) {
    return {
      feasible: false,
      reason: `${venue.name} closes at ${hours.close} but the ${formatTime(slot)} entry would end at ${formatTime(departMins)}.`,
    }
  }

  return {
    feasible: true,
    entryMins: slot,
    // Expose wait time in reason for display — not an error, just informational
    reason: waitMins > 0
      ? `${waitMins} min wait for ${formatTime(slot)} slot`
      : undefined,
  }
}
