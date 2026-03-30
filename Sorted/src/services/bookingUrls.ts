import type { Venue } from '@/types/venue'

/**
 * Returns the booking URL for a venue.
 *
 * Research confirmed that none of the current Dublin venues expose public URL
 * parameters for pre-filling date or guest count. All links open the venue's
 * booking page directly; the consultant fills in the details on arrival.
 *
 * If a venue's booking system is updated to support deep-linking in future,
 * add a case here and update the venue's bookingSystem field in venues.json.
 */
export function buildBookingUrl(venue: Venue, _date: string, _pax: number): string {
  return venue.bookingUrl
}
