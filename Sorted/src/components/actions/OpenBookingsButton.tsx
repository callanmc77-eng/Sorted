import type { RouteResult, ScheduledStop } from '@/types/itinerary'
import { buildBookingUrl } from '@/services/bookingUrls'
import { useBookingStore } from '@/store/bookingStore'

interface Props {
  result: RouteResult
}

export function OpenBookingsButton({ result }: Props) {
  const { date, pax } = useBookingStore()

  const feasibleStops = result.stops.filter(
    (s): s is ScheduledStop => s.feasible,
  )

  if (feasibleStops.length === 0) {
    return (
      <p className="text-xs text-navy-muted text-center py-4">
        No bookable attractions in this itinerary.
      </p>
    )
  }

  const urls = feasibleStops.map((s) => buildBookingUrl(s.venue, date, pax))

  function openAll() {
    urls.forEach((url) => window.open(url, '_blank', 'noopener,noreferrer'))
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Primary: open all at once */}
      <button
        type="button"
        onClick={openAll}
        className="w-full py-3 px-4 bg-navy text-white rounded-xl font-semibold text-sm
                   hover:bg-navy/90 transition-colors flex items-center justify-center gap-2"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        Open all {feasibleStops.length} booking pages
      </button>

      {/* Note about pre-filling */}
      <p className="text-xs text-slate-400 text-center -mt-1">
        Pages open without pre-filled dates — enter {pax} guest{pax !== 1 ? 's' : ''} and{' '}
        {date ? new Date(date + 'T12:00:00').toLocaleDateString('en-IE', { day: 'numeric', month: 'short' }) : 'your date'} on each site
      </p>

      {/* Secondary: individual links */}
      <div className="flex flex-col gap-1.5 pt-1">
        {feasibleStops.map((stop) => (
          <a
            key={stop.venue.id}
            href={buildBookingUrl(stop.venue, date, pax)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200
                       bg-white hover:border-navy/30 hover:bg-slate-50 transition-colors group"
          >
            <span className="text-xs font-medium text-navy">{stop.venue.name}</span>
            <svg className="w-3 h-3 text-slate-300 group-hover:text-navy-muted transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        ))}
      </div>
    </div>
  )
}
