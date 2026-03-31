import type { Venue } from '@/types/venue'
import { useBookingStore } from '@/store/bookingStore'
import { AttractionCard } from './AttractionCard'

interface Props {
  venues: Venue[]
}

export function AttractionGrid({ venues }: Props) {
  const { selectedVenueIds, toggleVenue } = useBookingStore()

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-navy">Select attractions</h2>
        {selectedVenueIds.length > 0 && (
          <span className="text-xs text-navy-muted">{selectedVenueIds.length} selected</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {venues.map((venue) => (
          <AttractionCard
            key={venue.id}
            venue={venue}
            selected={selectedVenueIds.includes(venue.id)}
            onToggle={() => toggleVenue(venue.id)}
          />
        ))}
      </div>
    </div>
  )
}
