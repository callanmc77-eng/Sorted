import type { RouteResult, ScheduledStop } from '@/types/itinerary'
import { buildBookingUrl } from '@/services/bookingUrls'
import { useBookingStore } from '@/store/bookingStore'

interface Props {
  result: RouteResult
}

export function OpenBookingsButton({ result }: Props) {
  const { date, adults, children } = useBookingStore()
  const pax = adults + children

  const feasibleStops = result.stops.filter(
    (s): s is ScheduledStop => s.feasible && !('isLunch' in s),
  )

  if (feasibleStops.length === 0) {
    return (
      <p className="text-xs text-navy-muted text-center py-4">
        No bookable attractions in this itinerary.
      </p>
    )
  }

  const dateFormatted = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })
    : 'your date'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-navy-muted uppercase tracking-wider">Booking links</h3>
        <span className="text-xs text-slate-400">
          {adults > 0 && `${adults}A`}{adults > 0 && children > 0 && ' · '}{children > 0 && `${children}C`} · {dateFormatted}
        </span>
      </div>

      <p className="text-xs text-slate-400 -mt-1">
        Click each link to open the booking page. Enter {pax} guest{pax !== 1 ? 's' : ''} and {dateFormatted} on each site.
      </p>

      <div className="flex flex-col gap-2">
        {feasibleStops.map((stop) => (
          <a
            key={stop.venue.id}
            href={buildBookingUrl(stop.venue, date, pax)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200
                       bg-white hover:border-navy/40 hover:shadow-sm transition-all group"
          >
            <div>
              <p className="text-sm font-semibold text-navy">{stop.venue.name}</p>
              <p className="text-xs text-navy-muted mt-0.5">{stop.entryTime ?? stop.arrivalTime} → {stop.departureTime}</p>
            </div>
            <svg className="w-4 h-4 text-slate-300 group-hover:text-navy-muted transition-colors shrink-0 ml-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        ))}
      </div>
    </div>
  )
}
