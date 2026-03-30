import type { Venue } from '@/types/venue'
import { useBookingStore } from '@/store/bookingStore'
import { AttractionCard } from './AttractionCard'

interface Props {
  venues: Venue[]
}

export function AttractionGrid({ venues }: Props) {
  const { selectedVenueIds, toggleVenue, includeLunch, setIncludeLunch } = useBookingStore()

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

        {/* Lunch card */}
        <button
          type="button"
          onClick={() => setIncludeLunch(!includeLunch)}
          className={`rounded-xl border p-4 text-left transition-all
            ${includeLunch
              ? 'bg-amber-50 border-amber-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-navy">Lunch break</p>
              <p className="text-xs text-navy-muted mt-0.5">1 hour · at last stop</p>
            </div>
            <span className="text-lg leading-none mt-0.5">🍽</span>
          </div>
          {includeLunch && (
            <span className="mt-2 inline-block text-xs font-medium text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
              Included
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
